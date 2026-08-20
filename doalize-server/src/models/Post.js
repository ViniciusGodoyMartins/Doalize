import {
  DataTypes,
} from 'sequelize';

import sequelize from '../config/database.js';

import User from './User.js';

const Post = sequelize.define(
  'Post',
  {
    id: {
      type:
        DataTypes.INTEGER,

      primaryKey:
        true,

      autoIncrement:
        true,
    },

    user_id: {
      type:
        DataTypes.INTEGER,

      allowNull:
        false,
    },

    /*
     * RESUMO CURTO DA PUBLICAÇÃO
     *
     * Será exibido no Feed e na tela
     * Publicados.
     *
     * O campo é opcional no banco para
     * manter compatibilidade com as
     * publicações antigas.
     *
     * Para novas publicações, o resumo
     * será validado como obrigatório
     * pelo PostController.
     */
    summary: {
      type:
        DataTypes.STRING(160),

      allowNull:
        true,

      defaultValue:
        null,
    },

    /*
     * DESCRIÇÃO COMPLETA DA PUBLICAÇÃO
     *
     * Será exibida principalmente na
     * página de Detalhes.
     *
     * Este campo não é a descrição do
     * usuário.
     *
     * A biografia do usuário continua em:
     *
     * user.description
     */
    description: {
      type:
        DataTypes.TEXT,

      allowNull:
        false,
    },

    /*
     * IMAGENS DA PUBLICAÇÃO
     *
     * O campo aceita uma lista de caminhos,
     * permitindo que uma publicação tenha
     * uma ou várias imagens.
     */
    images: {
      type:
        DataTypes.JSON,

      allowNull:
        true,

      defaultValue:
        [],
    },

    /*
     * INDICA SE A PUBLICAÇÃO FOI PROMOVIDA
     */
    promoted: {
      type:
        DataTypes.BOOLEAN,

      allowNull:
        false,

      defaultValue:
        false,
    },
  },
  {
    tableName:
      'posts',

    timestamps:
      true,

    createdAt:
      'created_at',

    updatedAt:
      false,
  }
);

/*
 * RELACIONAMENTO
 *
 * Uma publicação pertence a um usuário.
 */
Post.belongsTo(
  User,
  {
    foreignKey:
      'user_id',

    as:
      'user',

    onDelete:
      'CASCADE',

    onUpdate:
      'CASCADE',
  }
);

export default Post;