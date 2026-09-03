import {
  DataTypes,
} from 'sequelize';

import sequelize from '../config/database.js';

const User = sequelize.define(
  'User',
  {
    /*
     * IDENTIFICADOR DO USUÁRIO
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
     * NOME DO USUÁRIO
     */
    name: {
      type:
        DataTypes.STRING(120),

      allowNull:
        false,

      validate: {
        notEmpty: {
          msg:
            'O nome é obrigatório.',
        },

        len: {
          args: [
            2,
            120,
          ],

          msg:
            'O nome deve possuir entre 2 e 120 caracteres.',
        },
      },
    },

    /*
     * E-MAIL UTILIZADO PARA:
     *
     * - login;
     * - identificação da conta;
     * - recuperação de senha;
     * - recebimento do código.
     */
    email: {
      type:
        DataTypes.STRING(160),

      allowNull:
        false,

      unique: {
        name:
          'users_email_unique',

        msg:
          'Este e-mail já está cadastrado.',
      },

      validate: {
        notEmpty: {
          msg:
            'O e-mail é obrigatório.',
        },

        isEmail: {
          msg:
            'Informe um e-mail válido.',
        },
      },

      /*
       * Normaliza o e-mail antes de
       * armazená-lo no banco.
       */
      set(value) {
        if (
          typeof value ===
          'string'
        ) {
          this.setDataValue(
            'email',
            value
              .trim()
              .toLowerCase()
          );

          return;
        }

        this.setDataValue(
          'email',
          value
        );
      },
    },

    /*
     * SENHA CRIPTOGRAFADA
     *
     * Este campo armazena somente o hash
     * criado pelos controllers.
     *
     * A senha não é criptografada novamente
     * neste modelo para evitar hash duplo.
     */
    password: {
      type:
        DataTypes.STRING(255),

      allowNull:
        false,

      validate: {
        notEmpty: {
          msg:
            'A senha é obrigatória.',
        },
      },
    },

    /*
     * FOTO DO PERFIL
     *
     * Pode armazenar:
     *
     * - caminho local público;
     * - URL externa;
     * - null.
     */
    photo: {
      type:
        DataTypes.TEXT,

      allowNull:
        true,

      defaultValue:
        null,
    },

    /*
     * BIOGRAFIA DO USUÁRIO
     *
     * Exemplo:
     *
     * "Tenho 18 anos e estudo
     * Desenvolvimento de Sistemas."
     */
    description: {
      type:
        DataTypes.TEXT,

      allowNull:
        true,

      defaultValue:
        null,

      set(value) {
        if (
          value === null ||
          value === undefined
        ) {
          this.setDataValue(
            'description',
            null
          );

          return;
        }

        const normalizedValue =
          String(value).trim();

        this.setDataValue(
          'description',
          normalizedValue ||
            null
        );
      },
    },

    /*
     * LOCALIZAÇÃO DO USUÁRIO
     *
     * Exemplo:
     *
     * "Barra Bonita, SP"
     */
    location: {
      type:
        DataTypes.STRING(160),

      allowNull:
        true,

      defaultValue:
        null,

      set(value) {
        if (
          value === null ||
          value === undefined
        ) {
          this.setDataValue(
            'location',
            null
          );

          return;
        }

        const normalizedValue =
          String(value).trim();

        this.setDataValue(
          'location',
          normalizedValue ||
            null
        );
      },
    },
  },
  {
    tableName:
      'users',

    timestamps:
      true,

    createdAt:
      'created_at',

    updatedAt:
      false,

    indexes: [
      {
        name:
          'users_email_index',

        unique:
          true,

        fields: [
          'email',
        ],
      },
    ],
  }
);

export default User;