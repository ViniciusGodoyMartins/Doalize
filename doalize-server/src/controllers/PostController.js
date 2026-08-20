import Post from '../models/Post.js';
import User from '../models/User.js';

/*
 * LIMITES DOS TEXTOS
 *
 * summary:
 * resumo curto exibido no Feed.
 *
 * description:
 * descrição completa exibida nos Detalhes.
 */
const SUMMARY_MAX_LENGTH = 160;
const DESCRIPTION_MAX_LENGTH = 2000;

/*
 * NORMALIZAR IMAGENS
 *
 * O campo images pode chegar como:
 *
 * - array;
 * - string JSON;
 * - string com um único caminho;
 * - null;
 * - undefined.
 *
 * Esta função garante que o resultado
 * seja sempre uma lista de strings.
 */
function parseImages(images) {
  if (!images) {
    return [];
  }

  if (Array.isArray(images)) {
    return images
      .filter(
        (image) =>
          typeof image === 'string' &&
          image.trim()
      )
      .map(
        (image) =>
          image.trim()
      );
  }

  if (
    typeof images === 'string'
  ) {
    const value =
      images.trim();

    if (!value) {
      return [];
    }

    try {
      const parsed =
        JSON.parse(value);

      if (Array.isArray(parsed)) {
        return parsed
          .filter(
            (image) =>
              typeof image ===
                'string' &&
              image.trim()
          )
          .map(
            (image) =>
              image.trim()
          );
      }

      if (
        typeof parsed ===
        'string' &&
        parsed.trim()
      ) {
        return [
          parsed.trim(),
        ];
      }

      return [];
    } catch {
      return [value];
    }
  }

  return [];
}

/*
 * NORMALIZAR POST
 *
 * Mantém compatibilidade com publicações
 * antigas que ainda não possuem summary.
 *
 * Para essas publicações, summary receberá
 * temporariamente o início de description
 * apenas na resposta da API.
 *
 * Isso não altera o registro antigo no banco.
 */
function normalizePost(post) {
  if (!post) {
    return null;
  }

  const plainPost =
    typeof post.toJSON ===
    'function'
      ? post.toJSON()
      : post;

  const normalizedDescription =
    typeof plainPost.description ===
    'string'
      ? plainPost.description.trim()
      : '';

  const normalizedSummary =
    typeof plainPost.summary ===
      'string' &&
    plainPost.summary.trim()
      ? plainPost.summary.trim()
      : normalizedDescription
          .slice(
            0,
            SUMMARY_MAX_LENGTH
          );

  return {
    ...plainPost,

    summary:
      normalizedSummary,

    description:
      normalizedDescription,

    images:
      parseImages(
        plainPost.images
      ),
  };
}

/*
 * DADOS DO USUÁRIO ENVIADOS
 * JUNTO COM A PUBLICAÇÃO
 *
 * description:
 * biografia do usuário.
 *
 * location:
 * localização informada pelo usuário.
 *
 * Esses dois dados poderão ser exibidos
 * na página de Detalhes.
 */
const userAssociation = {
  model: User,

  as: 'user',

  attributes: [
    'id',
    'name',
    'photo',
    'description',
    'location',
  ],
};

class PostController {
  /*
   * LISTAR PUBLICAÇÕES
   *
   * GET /posts
   */
  async index(req, res) {
    try {
      const posts =
        await Post.findAll({
          include: [
            userAssociation,
          ],

          order: [
            [
              'promoted',
              'DESC',
            ],

            [
              'created_at',
              'DESC',
            ],
          ],
        });

      const normalizedPosts =
        posts
          .map(
            (post) =>
              normalizePost(post)
          )
          .filter(Boolean);

      return res
        .status(200)
        .json(
          normalizedPosts
        );
    } catch (error) {
      console.error(
        'ERRO AO BUSCAR POSTS:',
        {
          name:
            error.name,

          message:
            error.message,

          sql:
            error.sql,

          original:
            error.original
              ?.message,
        }
      );

      return res
        .status(500)
        .json({
          message:
            'Erro ao buscar posts.',
        });
    }
  }

  /*
   * CRIAR PUBLICAÇÃO
   *
   * POST /posts
   *
   * Recebe:
   *
   * summary:
   * resumo curto para o Feed.
   *
   * description:
   * descrição completa para os Detalhes.
   *
   * images:
   * lista opcional de imagens.
   */
  async store(req, res) {
    try {
      const userId =
        req.userId;

      const {
        summary,
        description,
        images,
      } = req.body;

      if (!userId) {
        return res
          .status(401)
          .json({
            message:
              'Usuário não autenticado.',
          });
      }

      const normalizedSummary =
        typeof summary === 'string'
          ? summary.trim()
          : '';

      const normalizedDescription =
        typeof description ===
        'string'
          ? description.trim()
          : '';

      /*
       * RESUMO OBRIGATÓRIO
       */
      if (!normalizedSummary) {
        return res
          .status(400)
          .json({
            message:
              'Digite um resumo para o Feed.',
          });
      }

      /*
       * LIMITE DO RESUMO
       */
      if (
        normalizedSummary.length >
        SUMMARY_MAX_LENGTH
      ) {
        return res
          .status(400)
          .json({
            message:
              `O resumo deve possuir no máximo ${SUMMARY_MAX_LENGTH} caracteres.`,
          });
      }

      /*
       * DESCRIÇÃO COMPLETA OBRIGATÓRIA
       */
      if (
        !normalizedDescription
      ) {
        return res
          .status(400)
          .json({
            message:
              'Digite a descrição completa da publicação.',
          });
      }

      /*
       * LIMITE DA DESCRIÇÃO COMPLETA
       */
      if (
        normalizedDescription.length >
        DESCRIPTION_MAX_LENGTH
      ) {
        return res
          .status(400)
          .json({
            message:
              `A descrição completa deve possuir no máximo ${DESCRIPTION_MAX_LENGTH} caracteres.`,
          });
      }

      const normalizedImages =
        parseImages(images);

      const post =
        await Post.create({
          user_id:
            userId,

          summary:
            normalizedSummary,

          description:
            normalizedDescription,

          images:
            normalizedImages,

          promoted:
            false,
        });

      /*
       * Busca novamente para devolver
       * também as informações do usuário.
       */
      const createdPost =
        await Post.findByPk(
          post.id,
          {
            include: [
              userAssociation,
            ],
          }
        );

      if (!createdPost) {
        return res
          .status(500)
          .json({
            message:
              'A publicação foi criada, mas não pôde ser carregada.',
          });
      }

      return res
        .status(201)
        .json(
          normalizePost(
            createdPost
          )
        );
    } catch (error) {
      console.error(
        'ERRO AO CRIAR POST:',
        {
          name:
            error.name,

          message:
            error.message,

          sql:
            error.sql,

          original:
            error.original
              ?.message,
        }
      );

      /*
       * Caso o modelo tenha sido alterado,
       * mas a coluna summary ainda não exista
       * no banco, o terminal mostrará o erro
       * SQL completo.
       */
      return res
        .status(500)
        .json({
          message:
            'Erro ao criar post.',
        });
    }
  }

  /*
   * BUSCAR UMA PUBLICAÇÃO
   *
   * GET /posts/:id
   */
  async show(req, res) {
    try {
      const { id } =
        req.params;

      const post =
        await Post.findByPk(
          id,
          {
            include: [
              userAssociation,
            ],
          }
        );

      if (!post) {
        return res
          .status(404)
          .json({
            message:
              'Post não encontrado.',
          });
      }

      return res
        .status(200)
        .json(
          normalizePost(post)
        );
    } catch (error) {
      console.error(
        'ERRO AO BUSCAR POST:',
        {
          postId:
            req.params?.id,

          name:
            error.name,

          message:
            error.message,

          sql:
            error.sql,

          original:
            error.original
              ?.message,
        }
      );

      return res
        .status(500)
        .json({
          message:
            'Erro ao buscar post.',
        });
    }
  }

  /*
   * PROMOVER OU REMOVER PROMOÇÃO
   *
   * Somente o proprietário da publicação
   * pode alterar esse estado.
   */
  async promote(req, res) {
    try {
      const userId =
        req.userId;

      const { id } =
        req.params;

      const post =
        await Post.findByPk(id);

      if (!post) {
        return res
          .status(404)
          .json({
            message:
              'Post não encontrado.',
          });
      }

      if (
        Number(post.user_id) !==
        Number(userId)
      ) {
        return res
          .status(403)
          .json({
            message:
              'Sem permissão para promover esta publicação.',
          });
      }

      const newPromotedState =
        !Boolean(
          post.promoted
        );

      await post.update({
        promoted:
          newPromotedState,
      });

      return res
        .status(200)
        .json({
          message:
            newPromotedState
              ? 'Post promovido.'
              : 'Promoção removida.',

          promoted:
            newPromotedState,
        });
    } catch (error) {
      console.error(
        'ERRO AO PROMOVER POST:',
        {
          postId:
            req.params?.id,

          name:
            error.name,

          message:
            error.message,
        }
      );

      return res
        .status(500)
        .json({
          message:
            'Erro ao promover post.',
        });
    }
  }

  /*
   * EXCLUIR PUBLICAÇÃO
   *
   * Somente o proprietário pode excluir.
   */
  async delete(req, res) {
    try {
      const userId =
        req.userId;

      const { id } =
        req.params;

      const post =
        await Post.findByPk(id);

      if (!post) {
        return res
          .status(404)
          .json({
            message:
              'Post não encontrado.',
          });
      }

      if (
        Number(post.user_id) !==
        Number(userId)
      ) {
        return res
          .status(403)
          .json({
            message:
              'Sem permissão para excluir esta publicação.',
          });
      }

      await post.destroy();

      return res
        .status(200)
        .json({
          message:
            'Post removido.',
        });
    } catch (error) {
      console.error(
        'ERRO AO REMOVER POST:',
        {
          postId:
            req.params?.id,

          name:
            error.name,

          message:
            error.message,

          sql:
            error.sql,

          original:
            error.original
              ?.message,
        }
      );

      return res
        .status(500)
        .json({
          message:
            'Erro ao remover post.',
        });
    }
  }
}

export default new PostController();