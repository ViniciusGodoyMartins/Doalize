import {
  DataTypes,
} from 'sequelize';

import sequelize from '../config/database.js';

import User from './User.js';

const PasswordVerification =
  sequelize.define(
    'PasswordVerification',
    {
      id: {
        type:
          DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },

      user_id: {
        type:
          DataTypes.INTEGER,
        allowNull: false,
      },

      code_hash: {
        type:
          DataTypes.STRING,
        allowNull: false,
      },

      expires_at: {
        type:
          DataTypes.DATE,
        allowNull: false,
      },

      attempts: {
        type:
          DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },

      used: {
        type:
          DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
    },
    {
      tableName:
        'password_verifications',

      timestamps: true,

      createdAt:
        'created_at',

      updatedAt: false,
    }
  );

PasswordVerification.belongsTo(
  User,
  {
    foreignKey: 'user_id',
    as: 'user',
    onDelete: 'CASCADE',
  }
);

export default PasswordVerification;