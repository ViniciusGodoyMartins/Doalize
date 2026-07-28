import Post from '../models/Post.js';
import User from '../models/User.js';

function parseImages(images) {
  if (!images) {
    return [];
  }

  if (Array.isArray(images)) {
    return images.filter(
      (image) =>
        typeof image === 'string' &&
        image.trim()
    );
  }

  if (typeof images === 'string') {
    const value = images.trim();

    if (!value) {
      return [];
    }

    try {
      const parsed = JSON.parse(value);

      if (Array.isArray(parsed)) {
        return parsed.filter(Boolean);
      }

      if (typeof parsed === 'string') {
        return [parsed];
      }

      return [];
    } catch {
      return [value];
    }
  }

  return [];
}

function normalizePost(post) {
  const plainPost = post.toJSON();

  return {
    ...plainPost,
    images: parseImages(
      plainPost.images
    ),
  };
}

const userAssociation = {
  model: User,
  as: 'user',
  attributes: [
    'id',
    'name',
    'photo',
  ],
};

class PostController {
  async index(req, res) {
    try {
      const posts =
        await Post.findAll({
          include: [
            userAssociation,
          ],
          order: [
            ['promoted', 'DESC'],
            ['created_at', 'DESC'],
          ],
        });

      return res.status(200).json(
        posts.map(normalizePost)
      );
    } catch (error) {
      console.error(
        'ERRO AO BUSCAR POSTS:',
        error
      );

      return res.status(500).json({
        message:
          'Erro ao buscar posts.',
      });
    }
  }

  async store(req, res) {
    try {
      const userId = req.userId;

      const {
        description,
        images,
      } = req.body;

      if (!userId) {
        return res.status(401).json({
          message:
            'Usuário não autenticado.',
        });
      }

      if (!description?.trim()) {
        return res.status(400).json({
          message:
            'Digite uma descrição.',
        });
      }

      const post = await Post.create({
        user_id: userId,
        description:
          description.trim(),
        images: parseImages(images),
        promoted: false,
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
        error
      );

      return res.status(500).json({
        message:
          'Erro ao criar post.',
      });
    }
  }

  async show(req, res) {
    try {
      const { id } = req.params;

      const post =
        await Post.findByPk(id, {
          include: [
            userAssociation,
          ],
        });

      if (!post) {
        return res.status(404).json({
          message:
            'Post não encontrado.',
        });
      }

      return res
        .status(200)
        .json(normalizePost(post));
    } catch (error) {
      console.error(
        'ERRO AO BUSCAR POST:',
        error
      );

      return res.status(500).json({
        message:
          'Erro ao buscar post.',
      });
    }
  }

  async promote(req, res) {
    try {
      const userId = req.userId;
      const { id } = req.params;

      const post =
        await Post.findByPk(id);

      if (!post) {
        return res.status(404).json({
          message:
            'Post não encontrado.',
        });
      }

      if (
        Number(post.user_id) !==
        Number(userId)
      ) {
        return res.status(403).json({
          message:
            'Sem permissão.',
        });
      }

      await post.update({
        promoted:
          !post.promoted,
      });

      return res.status(200).json({
        message: post.promoted
          ? 'Post promovido.'
          : 'Promoção removida.',
        promoted:
          post.promoted,
      });
    } catch (error) {
      console.error(
        'ERRO AO PROMOVER POST:',
        error
      );

      return res.status(500).json({
        message:
          'Erro ao promover post.',
      });
    }
  }

  async delete(req, res) {
    try {
      const userId = req.userId;
      const { id } = req.params;

      const post =
        await Post.findByPk(id);

      if (!post) {
        return res.status(404).json({
          message:
            'Post não encontrado.',
        });
      }

      if (
        Number(post.user_id) !==
        Number(userId)
      ) {
        return res.status(403).json({
          message:
            'Sem permissão.',
        });
      }

      await post.destroy();

      return res.status(200).json({
        message:
          'Post removido.',
      });
    } catch (error) {
      console.error(
        'ERRO AO REMOVER POST:',
        error
      );

      return res.status(500).json({
        message:
          'Erro ao remover post.',
      });
    }
  }
}

export default new PostController();