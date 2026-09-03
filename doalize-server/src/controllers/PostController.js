import Post from '../models/Post.js';

import User from '../models/User.js';

import PostPromotion from '../models/PostPromotion.js';

const SUMMARY_MAX_LENGTH =
  160;

const DESCRIPTION_MAX_LENGTH =
  2000;

/*
 * IDENTIFICAR CONTA ANONIMIZADA
 *
 * Contas anonimizadas utilizam um
 * endereço interno no formato:
 *
 * conta-removida-ID-CODIGO@doalize.invalid
 */
function isAnonymousEmail(
  email
) {
  return (
    typeof email === 'string' &&
    /^conta-removida-\d+-[a-f0-9]+@doalize\.invalid$/i.test(
      email
    )
  );
}

/*
 * NORMALIZAR O CAMPO DE IMAGENS
 */
function parseImages(
  images
) {
  if (!images) {
    return [];
  }

  if (
    Array.isArray(
      images
    )
  ) {
    return images
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
    typeof images ===
    'string'
  ) {
    const value =
      images.trim();

    if (!value) {
      return [];
    }

    try {
      const parsed =
        JSON.parse(
          value
        );

      if (
        Array.isArray(
          parsed
        )
      ) {
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
      return [
        value,
      ];
    }
  }

  return [];
}

/*
 * ASSOCIAÇÃO DO USUÁRIO
 *
 * O e-mail é consultado apenas para
 * identificar internamente se a conta
 * foi anonimizada.
 *
 * Antes da resposta, o e-mail é
 * removido pelo normalizePostUser.
 */
const userAssociation = {
  model:
    User,

  as:
    'user',

  attributes: [
    'id',
    'name',
    'email',
    'photo',
    'description',
    'location',
  ],
};

/*
 * NORMALIZAR O AUTOR
 *
 * Usuário ativo:
 * mantém os dados públicos atuais.
 *
 * Usuário anonimizado:
 * mantém apenas o ID necessário para
 * preservar os relacionamentos.
 *
 * O e-mail nunca é enviado ao mobile
 * por esta função.
 */
function normalizePostUser(
  user
) {
  if (!user) {
    return {
      id:
        null,

      name:
        'Usuário removido',

      photo:
        null,

      description:
        null,

      location:
        null,

      anonymized:
        true,
    };
  }

  const plainUser =
    typeof user.toJSON ===
      'function'
      ? user.toJSON()
      : user;

  const accountIsAnonymous =
    isAnonymousEmail(
      plainUser.email
    );

  if (
    accountIsAnonymous
  ) {
    return {
      id:
        plainUser.id,

      name:
        'Usuário removido',

      photo:
        null,

      description:
        null,

      location:
        null,

      anonymized:
        true,
    };
  }

  return {
    id:
      plainUser.id,

    name:
      plainUser.name ||
      'Usuário',

    photo:
      plainUser.photo ||
      null,

    description:
      plainUser.description ||
      null,

    location:
      plainUser.location ||
      null,

    anonymized:
      false,
  };
}

/*
 * NORMALIZAR UMA PUBLICAÇÃO
 *
 * A função também consulta:
 *
 * - quantidade total de promoções;
 * - se o usuário autenticado promoveu;
 * - situação anônima do autor.
 */
async function normalizePost(
  post,
  currentUserId
) {
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
      : normalizedDescription.slice(
          0,
          SUMMARY_MAX_LENGTH
        );

  const promotionCount =
    await PostPromotion.count({
      where: {
        post_id:
          plainPost.id,
      },
    });

  let promotedByMe =
    false;

  if (currentUserId) {
    const myPromotion =
      await PostPromotion.findOne({
        where: {
          post_id:
            plainPost.id,

          user_id:
            currentUserId,
        },

        attributes: [
          'id',
        ],
      });

    promotedByMe =
      Boolean(
        myPromotion
      );
  }

  return {
    ...plainPost,

    /*
     * Substitui o usuário original pela
     * versão segura e normalizada.
     *
     * O e-mail consultado pelo Sequelize
     * não é devolvido ao aplicativo.
     */
    user:
      normalizePostUser(
        plainPost.user
      ),

    summary:
      normalizedSummary,

    description:
      normalizedDescription,

    images:
      parseImages(
        plainPost.images
      ),

    /*
     * Mantém promoted para compatibilidade
     * com componentes antigos.
     */
    promoted:
      promotionCount > 0,

    promotion_count:
      promotionCount,

    promoted_by_me:
      promotedByMe,
  };
}

class PostController {
  /*
   * LISTAR PUBLICAÇÕES
   *
   * GET /posts
   */
  async index(
    req,
    res
  ) {
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
        await Promise.all(
          posts.map(
            (post) =>
              normalizePost(
                post,
                req.userId
              )
          )
        );

      return res
        .status(200)
        .json(
          normalizedPosts.filter(
            Boolean
          )
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
   */
  async store(
    req,
    res
  ) {
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
        typeof summary ===
          'string'
          ? summary.trim()
          : '';

      const normalizedDescription =
        typeof description ===
          'string'
          ? description.trim()
          : '';

      if (
        !normalizedSummary
      ) {
        return res
          .status(400)
          .json({
            message:
              'Digite um resumo para o Feed.',
          });
      }

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

      const post =
        await Post.create({
          user_id:
            userId,

          summary:
            normalizedSummary,

          description:
            normalizedDescription,

          images:
            parseImages(
              images
            ),

          promoted:
            false,
        });

      const createdPost =
        await Post.findByPk(
          post.id,
          {
            include: [
              userAssociation,
            ],
          }
        );

      if (
        !createdPost
      ) {
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
          await normalizePost(
            createdPost,
            userId
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
  async show(
    req,
    res
  ) {
    try {
      const {
        id,
      } = req.params;

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
          await normalizePost(
            post,
            req.userId
          )
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
   * Cada usuário pode promover uma
   * publicação uma única vez.
   *
   * POST /posts/promote/:id
   */
  async promote(
    req,
    res
  ) {
    try {
      const userId =
        Number(
          req.userId
        );

      const postId =
        Number(
          req.params.id
        );

      if (
        !Number.isInteger(
          userId
        )
      ) {
        return res
          .status(401)
          .json({
            message:
              'Usuário não autenticado.',
          });
      }

      if (
        !Number.isInteger(
          postId
        )
      ) {
        return res
          .status(400)
          .json({
            message:
              'Publicação inválida.',
          });
      }

      const post =
        await Post.findByPk(
          postId
        );

      if (!post) {
        return res
          .status(404)
          .json({
            message:
              'Post não encontrado.',
          });
      }

      const existingPromotion =
        await PostPromotion.findOne({
          where: {
            post_id:
              postId,

            user_id:
              userId,
          },
        });

      let promotedByMe;

      if (
        existingPromotion
      ) {
        await existingPromotion.destroy();

        promotedByMe =
          false;
      } else {
        await PostPromotion.create({
          post_id:
            postId,

          user_id:
            userId,
        });

        promotedByMe =
          true;
      }

      const promotionCount =
        await PostPromotion.count({
          where: {
            post_id:
              postId,
          },
        });

      /*
       * Atualiza o campo antigo promoted
       * para manter compatibilidade.
       */
      await post.update({
        promoted:
          promotionCount > 0,
      });

      return res
        .status(200)
        .json({
          message:
            promotedByMe
              ? 'Publicação promovida.'
              : 'Promoção removida.',

          promoted:
            promotionCount > 0,

          promoted_by_me:
            promotedByMe,

          promotion_count:
            promotionCount,
        });
    } catch (error) {
      console.error(
        'ERRO AO PROMOVER POST:',
        {
          postId:
            req.params?.id,

          userId:
            req.userId,

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
            'Erro ao promover publicação.',
        });
    }
  }

  /*
   * EXCLUIR PUBLICAÇÃO
   *
   * DELETE /posts/:id
   *
   * Essa função continua removendo uma
   * publicação quando o próprio autor
   * solicita a exclusão.
   *
   * A anonimização da conta não utiliza
   * esta função e não remove os posts.
   */
  async delete(
    req,
    res
  ) {
    try {
      const userId =
        req.userId;

      const {
        id,
      } = req.params;

      const post =
        await Post.findByPk(
          id
        );

      if (!post) {
        return res
          .status(404)
          .json({
            message:
              'Post não encontrado.',
          });
      }

      if (
        Number(
          post.user_id
        ) !==
        Number(
          userId
        )
      ) {
        return res
          .status(403)
          .json({
            message:
              'Sem permissão para excluir esta publicação.',
          });
      }

      /*
       * As promoções são removidas antes
       * da publicação.
       *
       * A foreign key também utiliza
       * CASCADE como proteção adicional.
       */
      await PostPromotion.destroy({
        where: {
          post_id:
            post.id,
        },
      });

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