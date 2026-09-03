import {
  DataTypes,
} from 'sequelize';

import sequelize from '../config/database.js';

import Post from './Post.js';

import User from './User.js';

const PostPromotion =
  sequelize.define(
    'PostPromotion',
    {
      /*
       * IDENTIFICADOR DA PROMOÇÃO
       */
      id: {
        type:
          DataTypes.INTEGER,

        primaryKey:
          true,

        autoIncrement:
          true,
      },

      /*
       * PUBLICAÇÃO PROMOVIDA
       */
      post_id: {
        type:
          DataTypes.INTEGER,

        allowNull:
          false,

        references: {
          model:
            Post,

          key:
            'id',
        },

        /*
         * Se uma publicação for excluída
         * individualmente pelo autor,
         * suas promoções serão removidas.
         */
        onDelete:
          'CASCADE',

        onUpdate:
          'CASCADE',
      },

      /*
       * USUÁRIO QUE PROMOVEU
       *
       * Na anonimização, o usuário não
       * é excluído. Portanto, este ID e
       * a promoção serão preservados.
       */
      user_id: {
        type:
          DataTypes.INTEGER,

        allowNull:
          false,

        references: {
          model:
            User,

          key:
            'id',
        },

        onDelete:
          'CASCADE',

        onUpdate:
          'CASCADE',
      },
    },
    {
      tableName:
        'post_promotions',

      timestamps:
        true,

      createdAt:
        'created_at',

      updatedAt:
        false,

      indexes: [
        /*
         * Impede o mesmo usuário de
         * promover a mesma publicação
         * mais de uma vez.
         */
        {
          name:
            'post_promotions_post_user_unique',

          unique:
            true,

          fields: [
            'post_id',
            'user_id',
          ],
        },

        /*
         * Facilita a contagem de
         * promoções de uma publicação.
         */
        {
          name:
            'post_promotions_post_id_index',

          fields: [
            'post_id',
          ],
        },

        /*
         * Facilita a busca das promoções
         * realizadas por um usuário.
         */
        {
          name:
            'post_promotions_user_id_index',

          fields: [
            'user_id',
          ],
        },
      ],
    }
  );

/*
 * CADA PROMOÇÃO PERTENCE
 * A UMA PUBLICAÇÃO
 */
PostPromotion.belongsTo(
  Post,
  {
    foreignKey:
      'post_id',

    as:
      'post',
  }
);

/*
 * CADA PROMOÇÃO PERTENCE
 * A UM USUÁRIO
 */
PostPromotion.belongsTo(
  User,
  {
    foreignKey:
      'user_id',

    as:
      'user',
  }
);

/*
 * UMA PUBLICAÇÃO PODE TER
 * VÁRIAS PROMOÇÕES
 */
Post.hasMany(
  PostPromotion,
  {
    foreignKey:
      'post_id',

    as:
      'promotions',
  }
);

/*
 * UM USUÁRIO PODE PROMOVER
 * VÁRIAS PUBLICAÇÕES
 *
 * Se a conta for anonimizada, o registro
 * do usuário permanece no banco e esta
 * relação também permanece válida.
 */
User.hasMany(
  PostPromotion,
  {
    foreignKey:
      'user_id',

    as:
      'postPromotions',
  }
);

export default PostPromotion;