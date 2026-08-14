import crypto from 'crypto';
import bcrypt from 'bcryptjs';

import {
  Op,
} from 'sequelize';

import fs from 'fs';
import path from 'path';

import {
  fileURLToPath,
} from 'url';

import sequelize from '../config/database.js';

import User from '../models/User.js';
import Post from '../models/Post.js';
import Chat from '../models/Chat.js';
import Message from '../models/Message.js';

import PasswordVerification from '../models/PasswordVerification.js';

import {
  sendPasswordCode,
} from '../services/emailService.js';

/*
 * Permite utilizar __dirname em projetos
 * configurados com "type": "module".
 */
const __filename =
  fileURLToPath(import.meta.url);

const __dirname =
  path.dirname(__filename);

/*
 * Pasta oficial de uploads:
 *
 * doalize-server/uploads
 */
const uploadsDirectory =
  path.resolve(
    __dirname,
    '../../uploads'
  );

/*
 * Garante que o valor de images seja
 * tratado como uma lista.
 */
function parsePostImages(images) {
  if (!images) {
    return [];
  }

  if (Array.isArray(images)) {
    return images.filter(Boolean);
  }

  if (typeof images === 'string') {
    const value = images.trim();

    if (!value) {
      return [];
    }

    try {
      const parsed =
        JSON.parse(value);

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

/*
 * Converte um caminho público em caminho físico.
 *
 * Exemplo:
 *
 * /uploads/users/foto.jpg
 *
 * torna-se:
 *
 * doalize-server/uploads/users/foto.jpg
 *
 * URLs externas não são removidas.
 */
function getPhysicalUploadPath(
  publicPath
) {
  if (
    !publicPath ||
    typeof publicPath !== 'string'
  ) {
    return null;
  }

  let normalizedPath =
    publicPath
      .trim()
      .replace(/\\/g, '/');

  if (!normalizedPath) {
    return null;
  }

  /*
   * Não tenta apagar imagens externas.
   */
  if (
    normalizedPath.startsWith(
      'http://'
    ) ||
    normalizedPath.startsWith(
      'https://'
    ) ||
    normalizedPath.startsWith(
      'file://'
    ) ||
    normalizedPath.startsWith(
      'content://'
    )
  ) {
    return null;
  }

  /*
   * Aceita:
   *
   * /uploads/users/foto.jpg
   * uploads/users/foto.jpg
   */
  normalizedPath =
    normalizedPath.replace(
      /^\/?uploads\//,
      ''
    );

  if (!normalizedPath) {
    return null;
  }

  const physicalPath =
    path.resolve(
      uploadsDirectory,
      normalizedPath
    );

  /*
   * Impede que um caminho malformado
   * saia da pasta uploads.
   */
  const relativePath =
    path.relative(
      uploadsDirectory,
      physicalPath
    );

  if (
    relativePath.startsWith('..') ||
    path.isAbsolute(relativePath)
  ) {
    return null;
  }

  return physicalPath;
}

/*
 * Remove um arquivo sem interromper a exclusão
 * da conta caso o arquivo já não exista.
 */
async function removeUploadFile(
  publicPath
) {
  try {
    const physicalPath =
      getPhysicalUploadPath(
        publicPath
      );

    if (!physicalPath) {
      return;
    }

    await fs.promises.unlink(
      physicalPath
    );

    console.log(
      'ARQUIVO REMOVIDO:',
      physicalPath
    );
  } catch (error) {
    if (
      error.code === 'ENOENT'
    ) {
      console.log(
        'ARQUIVO JÁ NÃO EXISTIA:',
        publicPath
      );

      return;
    }

    console.error(
      'ERRO AO REMOVER ARQUIVO:',
      {
        publicPath,
        message: error.message,
      }
    );
  }
}

/*
 * Remove uma lista de arquivos sem deixar
 * um caminho duplicado ser processado
 * mais de uma vez.
 */
async function removeUploadFiles(
  publicPaths
) {
  const uniquePaths = [
    ...new Set(
      publicPaths.filter(
        (item) =>
          typeof item === 'string' &&
          item.trim()
      )
    ),
  ];

  await Promise.allSettled(
    uniquePaths.map(
      (publicPath) =>
        removeUploadFile(
          publicPath
        )
    )
  );
}

class UserController {
  /*
   * BUSCAR PERFIL
   */
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

  /*
   * ATUALIZAR PERFIL
   */
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

              id: {
                [Op.ne]:
                  user.id,
              },
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

      /*
       * Guarda a foto anterior para removê-la
       * somente depois que o banco confirmar
       * a atualização.
       */
      const previousPhoto =
        user.photo;

      const normalizedPhoto =
        photo !== undefined
          ? photo || null
          : user.photo;

      await user.update({
        name: normalizedName,

        email:
          normalizedEmail,

        photo:
          normalizedPhoto,

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

      /*
       * Se a foto foi realmente substituída,
       * remove o arquivo anterior.
       */
      if (
        previousPhoto &&
        previousPhoto !==
          user.photo
      ) {
        await removeUploadFile(
          previousPhoto
        );
      }

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

  /*
   * SOLICITAR CÓDIGO PARA ALTERAR SENHA
   */
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

      /*
       * Invalida códigos anteriores.
       */
      await PasswordVerification.destroy({
        where: {
          user_id:
            user.id,
        },
      });

      const verification =
        await PasswordVerification.create({
          user_id:
            user.id,

          code_hash:
            codeHash,

          expires_at:
            expiresAt,

          attempts: 0,

          used: false,
        });

      try {
        await sendPasswordCode({
          email:
            user.email,

          name:
            user.name,

          code,
        });
      } catch (emailError) {
        /*
         * Se o envio falhar, o código não deve
         * permanecer válido no banco.
         */
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

  /*
   * CONFIRMAR CÓDIGO E ALTERAR SENHA
   */
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

      const normalizedCode =
        String(code).trim();

      if (
        !/^\d{6}$/.test(
          normalizedCode
        )
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
          normalizedCode,
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

  /*
   * EXCLUIR CONTA
   *
   * Ordem:
   *
   * 1. Busca os arquivos relacionados
   * 2. Exclui códigos de verificação
   * 3. Exclui mensagens
   * 4. Exclui conversas
   * 5. Exclui publicações
   * 6. Exclui o usuário
   * 7. Confirma a transação
   * 8. Remove os arquivos físicos
   */
  async delete(req, res) {
    const transaction =
      await sequelize.transaction();

    let filesToDelete = [];

    try {
      const userId =
        Number(req.userId);

      if (
        !Number.isInteger(
          userId
        )
      ) {
        await transaction.rollback();

        return res
          .status(401)
          .json({
            message:
              'Usuário não autenticado.',
          });
      }

      const user =
        await User.findByPk(
          userId,
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

      /*
       * Guarda a foto do usuário para apagar
       * depois que a transação for confirmada.
       */
      if (user.photo) {
        filesToDelete.push(
          user.photo
        );
      }

      /*
       * Busca as publicações antes da exclusão
       * para recuperar os caminhos das imagens.
       */
      const userPosts =
        await Post.findAll({
          where: {
            user_id:
              userId,
          },

          attributes: [
            'id',
            'images',
          ],

          transaction,
        });

      for (
        const post
        of userPosts
      ) {
        filesToDelete.push(
          ...parsePostImages(
            post.images
          )
        );
      }

      /*
       * Busca mensagens antes da exclusão
       * para recuperar possíveis imagens
       * e áudios associados.
       */
      const userMessages =
        await Message.findAll({
          where: {
            [Op.or]: [
              {
                sender_id:
                  userId,
              },
              {
                receiver_id:
                  userId,
              },
            ],
          },

          attributes: [
            'id',
            'image',
            'audio',
          ],

          transaction,
        });

      for (
        const message
        of userMessages
      ) {
        if (message.image) {
          filesToDelete.push(
            message.image
          );
        }

        if (message.audio) {
          filesToDelete.push(
            message.audio
          );
        }
      }

      console.log(
        'INICIANDO EXCLUSÃO DA CONTA:',
        {
          userId,

          posts:
            userPosts.length,

          messages:
            userMessages.length,
        }
      );

      /*
       * 1. Códigos de verificação.
       */
      const deletedVerifications =
        await PasswordVerification.destroy({
          where: {
            user_id:
              userId,
          },

          transaction,
        });

      /*
       * 2. Mensagens enviadas ou recebidas.
       */
      const deletedMessages =
        await Message.destroy({
          where: {
            [Op.or]: [
              {
                sender_id:
                  userId,
              },
              {
                receiver_id:
                  userId,
              },
            ],
          },

          transaction,
        });

      /*
       * 3. Conversas das quais o usuário participa.
       */
      const deletedChats =
        await Chat.destroy({
          where: {
            [Op.or]: [
              {
                user_one_id:
                  userId,
              },
              {
                user_two_id:
                  userId,
              },
            ],
          },

          transaction,
        });

      /*
       * 4. Publicações do usuário.
       */
      const deletedPosts =
        await Post.destroy({
          where: {
            user_id:
              userId,
          },

          transaction,
        });

      /*
       * 5. Usuário.
       */
      await user.destroy({
        transaction,
      });

      /*
       * Confirma todas as alterações no banco.
       */
      await transaction.commit();

      console.log(
        'CONTA EXCLUÍDA DO BANCO:',
        {
          userId,

          deletedVerifications,

          deletedMessages,

          deletedChats,

          deletedPosts,
        }
      );

      /*
       * Os arquivos só são removidos depois
       * que a alteração no banco foi confirmada.
       *
       * Uma falha ao apagar um arquivo não
       * recria a conta nem invalida a transação.
       */
      await removeUploadFiles(
        filesToDelete
      );

      return res
        .status(200)
        .json({
          message:
            'Conta e dados relacionados removidos com sucesso.',

          deleted: {
            messages:
              deletedMessages,

            chats:
              deletedChats,

            posts:
              deletedPosts,
          },
        });
    } catch (error) {
      if (
        !transaction.finished
      ) {
        await transaction.rollback();
      }

      console.error(
        'ERRO DETALHADO AO EXCLUIR CONTA:',
        {
          name:
            error.name,

          message:
            error.message,

          sql:
            error.sql,

          parent:
            error.parent
              ?.message,

          original:
            error.original
              ?.message,

          stack:
            error.stack,
        }
      );

      return res
        .status(500)
        .json({
          message:
            'Não foi possível excluir a conta e os dados relacionados.',

          error:
            process.env
              .NODE_ENV ===
            'development'
              ? error.message
              : undefined,
        });
    }
  }
}

export default new UserController();