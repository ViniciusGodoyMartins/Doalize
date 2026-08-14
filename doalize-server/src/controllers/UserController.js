import crypto from 'crypto';
import bcrypt from 'bcryptjs';

import sequelize from '../config/database.js';

import User from '../models/User.js';

import PasswordVerification from '../models/PasswordVerification.js';

import {
  sendPasswordCode,
} from '../services/emailService.js';

class UserController {
  async profile(req, res) {
    try {
      const user =
        await User.findByPk(
          req.userId,
          {
            attributes: {
              exclude: [
                'password',
              ],
            },
          }
        );

      if (!user) {
        return res
          .status(404)
          .json({
            message:
              'Usuário não encontrado.',
          });
      }

      return res
        .status(200)
        .json(user);
    } catch (error) {
      console.error(
        'ERRO AO BUSCAR PERFIL:',
        error
      );

      return res
        .status(500)
        .json({
          message:
            'Erro ao buscar perfil.',
        });
    }
  }

  async update(req, res) {
    try {
      const userId =
        req.userId;

      const {
        name,
        email,
        photo,
        description,
        location,
      } = req.body;

      const user =
        await User.findByPk(
          userId
        );

      if (!user) {
        return res
          .status(404)
          .json({
            message:
              'Usuário não encontrado.',
          });
      }

      const normalizedName =
        typeof name === 'string'
          ? name.trim()
          : user.name;

      const normalizedEmail =
        typeof email === 'string'
          ? email
              .trim()
              .toLowerCase()
          : user.email;

      if (!normalizedName) {
        return res
          .status(400)
          .json({
            message:
              'O nome é obrigatório.',
          });
      }

      if (!normalizedEmail) {
        return res
          .status(400)
          .json({
            message:
              'O e-mail é obrigatório.',
          });
      }

      if (
        normalizedEmail !==
        user.email
      ) {
        const emailExists =
          await User.findOne({
            where: {
              email:
                normalizedEmail,
            },
          });

        if (emailExists) {
          return res
            .status(400)
            .json({
              message:
                'E-mail já está em uso.',
            });
        }
      }

      await user.update({
        name: normalizedName,
        email:
          normalizedEmail,

        photo:
          photo !== undefined
            ? photo || null
            : user.photo,

        description:
          description !== undefined
            ? String(
                description
              ).trim() || null
            : user.description,

        location:
          location !== undefined
            ? String(
                location
              ).trim() || null
            : user.location,
      });

      return res
        .status(200)
        .json({
          message:
            'Perfil atualizado com sucesso.',

          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            photo: user.photo,
            description:
              user.description,
            location:
              user.location,
            created_at:
              user.created_at,
          },
        });
    } catch (error) {
      console.error(
        'ERRO AO ATUALIZAR PERFIL:',
        error
      );

      return res
        .status(500)
        .json({
          message:
            'Erro ao atualizar perfil.',
        });
    }
  }

  async requestPasswordCode(
    req,
    res
  ) {
    try {
      const user =
        await User.findByPk(
          req.userId
        );

      if (!user) {
        return res
          .status(404)
          .json({
            message:
              'Usuário não encontrado.',
          });
      }

      const code = String(
        crypto.randomInt(
          100000,
          1000000
        )
      );

      const codeHash =
        await bcrypt.hash(
          code,
          10
        );

      const expiresAt =
        new Date(
          Date.now() +
            10 * 60 * 1000
        );

      await PasswordVerification.destroy({
        where: {
          user_id: user.id,
        },
      });

      const verification =
        await PasswordVerification.create({
          user_id: user.id,
          code_hash:
            codeHash,
          expires_at:
            expiresAt,
          attempts: 0,
          used: false,
        });

      try {
        await sendPasswordCode({
          email: user.email,
          name: user.name,
          code,
        });
      } catch (emailError) {
        await verification.destroy();

        console.error(
          'ERRO AO ENVIAR E-MAIL:',
          emailError
        );

        return res
          .status(500)
          .json({
            message:
              emailError.message ||
              'Não foi possível enviar o código por e-mail.',
          });
      }

      return res
        .status(200)
        .json({
          message:
            'Código enviado para o e-mail cadastrado.',
        });
    } catch (error) {
      console.error(
        'ERRO AO GERAR CÓDIGO:',
        error
      );

      return res
        .status(500)
        .json({
          message:
            'Erro ao solicitar alteração de senha.',
        });
    }
  }

  async confirmPassword(
    req,
    res
  ) {
    const transaction =
      await sequelize.transaction();

    try {
      const {
        code,
        newPassword,
        confirmPassword,
      } = req.body;

      if (
        !code ||
        !newPassword ||
        !confirmPassword
      ) {
        await transaction.rollback();

        return res
          .status(400)
          .json({
            message:
              'Preencha o código e as duas senhas.',
          });
      }

      if (
        String(code).length !==
        6
      ) {
        await transaction.rollback();

        return res
          .status(400)
          .json({
            message:
              'O código deve possuir 6 dígitos.',
          });
      }

      if (
        newPassword.length < 6
      ) {
        await transaction.rollback();

        return res
          .status(400)
          .json({
            message:
              'A senha deve possuir pelo menos 6 caracteres.',
          });
      }

      if (
        newPassword !==
        confirmPassword
      ) {
        await transaction.rollback();

        return res
          .status(400)
          .json({
            message:
              'As senhas não coincidem.',
          });
      }

      const verification =
        await PasswordVerification.findOne({
          where: {
            user_id:
              req.userId,
            used: false,
          },
          order: [
            [
              'created_at',
              'DESC',
            ],
          ],
          transaction,
          lock:
            transaction.LOCK.UPDATE,
        });

      if (!verification) {
        await transaction.rollback();

        return res
          .status(400)
          .json({
            message:
              'Nenhum código válido foi solicitado.',
          });
      }

      if (
        verification.attempts >=
        5
      ) {
        await verification.update(
          {
            used: true,
          },
          {
            transaction,
          }
        );

        await transaction.commit();

        return res
          .status(400)
          .json({
            message:
              'Limite de tentativas atingido. Solicite um novo código.',
          });
      }

      if (
        new Date(
          verification.expires_at
        ).getTime() <
        Date.now()
      ) {
        await verification.update(
          {
            used: true,
          },
          {
            transaction,
          }
        );

        await transaction.commit();

        return res
          .status(400)
          .json({
            message:
              'O código expirou. Solicite um novo código.',
          });
      }

      const codeMatches =
        await bcrypt.compare(
          String(code),
          verification.code_hash
        );

      if (!codeMatches) {
        await verification.update(
          {
            attempts:
              verification.attempts +
              1,
          },
          {
            transaction,
          }
        );

        await transaction.commit();

        return res
          .status(400)
          .json({
            message:
              'Código de verificação incorreto.',
          });
      }

      const user =
        await User.findByPk(
          req.userId,
          {
            transaction,
            lock:
              transaction.LOCK.UPDATE,
          }
        );

      if (!user) {
        await transaction.rollback();

        return res
          .status(404)
          .json({
            message:
              'Usuário não encontrado.',
          });
      }

      const hashedPassword =
        await bcrypt.hash(
          newPassword,
          10
        );

      await user.update(
        {
          password:
            hashedPassword,
        },
        {
          transaction,
        }
      );

      await verification.update(
        {
          used: true,
        },
        {
          transaction,
        }
      );

      await transaction.commit();

      return res
        .status(200)
        .json({
          message:
            'Senha alterada com sucesso.',
        });
    } catch (error) {
      if (
        !transaction.finished
      ) {
        await transaction.rollback();
      }

      console.error(
        'ERRO AO ALTERAR SENHA:',
        error
      );

      return res
        .status(500)
        .json({
          message:
            'Erro ao alterar senha.',
        });
    }
  }

  async delete(req, res) {
    try {
      const user =
        await User.findByPk(
          req.userId
        );

      if (!user) {
        return res
          .status(404)
          .json({
            message:
              'Usuário não encontrado.',
          });
      }

      await PasswordVerification.destroy({
        where: {
          user_id: user.id,
        },
      });

      await user.destroy();

      return res
        .status(200)
        .json({
          message:
            'Conta removida com sucesso.',
        });
    } catch (error) {
      console.error(
        'ERRO AO EXCLUIR CONTA:',
        error
      );

      return res
        .status(500)
        .json({
          message:
            'Erro ao excluir conta. Verifique se existem registros relacionados ao usuário.',
        });
    }
  }
}

export default new UserController();