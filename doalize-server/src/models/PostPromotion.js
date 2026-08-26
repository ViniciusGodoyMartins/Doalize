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
      id: {
        type:
          DataTypes.INTEGER,

        primaryKey:
          true,

        autoIncrement:
          true,
      },

      post_id: {
        type:
          DataTypes.INTEGER,

        allowNull:
          false,

        references: {
          model: Post,

          key: 'id',
        },

        onDelete:
          'CASCADE',

        onUpdate:
          'CASCADE',
      },

      user_id: {
        type:
          DataTypes.INTEGER,

        allowNull:
          false,

        references: {
          model: User,

          key: 'id',
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

        {
          name:
            'post_promotions_post_id_index',

          fields: [
            'post_id',
          ],
        },

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
 * RELACIONAMENTOS
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

PostPromotion.belongsTo(
  User,
  {
    foreignKey:
      'user_id',

    as:
      'user',
  }
);

Post.hasMany(
  PostPromotion,
  {
    foreignKey:
      'post_id',

    as:
      'promotions',
  }
);

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