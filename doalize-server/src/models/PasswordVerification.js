import {
  DataTypes,
} from 'sequelize';

import sequelize from '../config/database.js';

import User from './User.js';

const PasswordVerification =
  sequelize.define(
    'PasswordVerification',
    {
      /*
       * IDENTIFICADOR DO REGISTRO
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
       * USUÁRIO QUE SOLICITOU
       * O CÓDIGO
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

      /*
       * CÓDIGO CRIPTOGRAFADO
       *
       * O código original de seis dígitos
       * nunca é armazenado diretamente.
       */
      code_hash: {
        type:
          DataTypes.STRING(255),

        allowNull:
          false,
      },

      /*
       * DATA DE EXPIRAÇÃO
       *
       * Atualmente, o código expira
       * dez minutos após a solicitação.
       */
      expires_at: {
        type:
          DataTypes.DATE,

        allowNull:
          false,
      },

      /*
       * QUANTIDADE DE TENTATIVAS
       *
       * O UserController limita a
       * utilização a cinco tentativas.
       */
      attempts: {
        type:
          DataTypes.INTEGER,

        allowNull:
          false,

        defaultValue:
          0,

        validate: {
          min:
            0,
        },
      },

      /*
       * INDICA SE O CÓDIGO JÁ FOI
       * UTILIZADO OU INVALIDADO
       */
      used: {
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
        'password_verifications',

      timestamps:
        true,

      createdAt:
        'created_at',

      updatedAt:
        false,

      /*
       * ÍNDICES UTILIZADOS NA BUSCA
       * DOS CÓDIGOS DO USUÁRIO
       */
      indexes: [
        {
          name:
            'password_verifications_user_id_index',

          fields: [
            'user_id',
          ],
        },

        {
          name:
            'password_verifications_user_used_index',

          fields: [
            'user_id',
            'used',
          ],
        },

        {
          name:
            'password_verifications_created_at_index',

          fields: [
            'created_at',
          ],
        },
      ],
    }
  );

/*
 * RELACIONAMENTO
 *
 * Cada código de verificação pertence
 * a um único usuário.
 */
PasswordVerification.belongsTo(
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

export default PasswordVerification;