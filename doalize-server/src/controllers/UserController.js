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

const __filename =
  fileURLToPath(import.meta.url);

const __dirname =
  path.dirname(__filename);

const uploadsDirectory =
  path.resolve(
    __dirname,
    '../../uploads'
  );

const MAX_CODE_ATTEMPTS = 5;
const CODE_EXPIRATION_MINUTES = 10;
const MIN_PASSWORD_LENGTH = 6;

function parsePostImages(images) {
  if (!images) {
    return [];
  }

  if (Array.isArray(images)) {
    return images.filter(Boolean);
  }

  if (typeof images === 'string') {
    const value =
      images.trim();

    if (!value) {
      return [];
    }

    try {
      const parsed =
        JSON.parse(value);

      if (Array.isArray(parsed)) {
        return parsed.filter(Boolean);
      }

      if (
        typeof parsed ===
        'string'
      ) {
        return [parsed];
      }

      return [];
    } catch {
      return [value];
    }
  }

  return [];
}

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

  const relativePath =
    path.relative(
      uploadsDirectory,
      physicalPath
    );

  if (
    relativePath.startsWith(
      '..'
    ) ||
    path.isAbsolute(
      relativePath
    )
  ) {
    return null;
  }

  return physicalPath;
}

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
        message:
          error.message,
      }
    );
  }
}

async function removeUploadFiles(
  publicPaths
) {
  const uniquePaths = [
    ...new Set(
      publicPaths.filter(
        (item) =>
          typeof item ===
            'string' &&
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

/*
 * Cria e envia um código para
 * determinado usuário.
 */
async function createAndSendPasswordCode(
  user
) {
  const code =
    String(
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
        CODE_EXPIRATION_MINUTES *
          60 *
          1000
    );

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

      attempts:
        0,

      used:
        false,
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
    await verification.destroy();

    throw emailError;
  }
}

/*
 * Validação básica dos campos
 * utilizados na redefinição.
 */
function validatePasswordFields({
  code,
  newPassword,
  confirmPassword,
}) {
  if (
    !code ||
    !newPassword ||
    !confirmPassword
  ) {
    return {
      valid: false,

      message:
        'Preencha o código e as duas senhas.',
    };
  }

  const normalizedCode =
    String(code).trim();

  if (
    !/^\d{6}$/.test(
      normalizedCode
    )
  ) {
    return {
      valid: false,

      message:
        'O código deve possuir 6 dígitos.',
    };
  }

  if (
    newPassword.length <
    MIN_PASSWORD_LENGTH
  ) {
    return {
      valid: false,

      message:
        `A senha deve possuir pelo menos ${MIN_PASSWORD_LENGTH} caracteres.`,
    };
  }

  if (
    newPassword !==
    confirmPassword
  ) {
    return {
      valid: false,

      message:
        'As senhas não coincidem.',
    };
  }

  return {
    valid: true,

    normalizedCode,
  };
}

/*
 * Confirma o código e atualiza
 * a senha do usuário informado.
 */
async function changePasswordWithCode({
  user,
  code,
  newPassword,
  confirmPassword,
  transaction,
}) {
  const validation =
    validatePasswordFields({
      code,
      newPassword,
      confirmPassword,
    });

  if (!validation.valid) {
    return {
      success: false,

      status: 400,

      message:
        validation.message,
    };
  }

  const verification =
    await PasswordVerification.findOne({
      where: {
        user_id:
          user.id,

        used:
          false,
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
    return {
      success: false,

      status: 400,

      message:
        'Nenhum código válido foi solicitado.',
    };
  }

  if (
    verification.attempts >=
    MAX_CODE_ATTEMPTS
  ) {
    await verification.update(
      {
        used:
          true,
      },
      {
        transaction,
      }
    );

    return {
      success: false,

      status: 400,

      commit:
        true,

      message:
        'Limite de tentativas atingido. Solicite um novo código.',
    };
  }

  if (
    new Date(
      verification.expires_at
    ).getTime() <
    Date.now()
  ) {
    await verification.update(
      {
        used:
          true,
      },
      {
        transaction,
      }
    );

    return {
      success: false,

      status: 400,

      commit:
        true,

      message:
        'O código expirou. Solicite um novo código.',
    };
  }

  const codeMatches =
    await bcrypt.compare(
      validation.normalizedCode,
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

    return {
      success: false,

      status: 400,

      commit:
        true,

      message:
        'Código de verificação incorreto.',
    };
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
      used:
        true,
    },
    {
      transaction,
    }
  );

  return {
    success: true,
  };
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
        typeof name ===
          'string'
          ? name.trim()
          : user.name;

      const normalizedEmail =
        typeof email ===
          'string'
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

      const previousPhoto =
        user.photo;

      const normalizedPhoto =
        photo !== undefined
          ? photo || null
          : user.photo;

      await user.update({
        name:
          normalizedName,

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
            id:
              user.id,

            name:
              user.name,

            email:
              user.email,

            photo:
              user.photo,

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
   * SOLICITAR CÓDIGO PELAS
   * CONFIGURAÇÕES DA CONTA
   *
   * Esta função continua usando
   * req.userId e exige autenticação.
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

      try {
        await createAndSendPasswordCode(
          user
        );
      } catch (emailError) {
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
   * CONFIRMAR SENHA PELAS
   * CONFIGURAÇÕES DA CONTA
   *
   * Esta função exige autenticação.
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

      const result =
        await changePasswordWithCode({
          user,
          code,
          newPassword,
          confirmPassword,
          transaction,
        });

      if (!result.success) {
        if (result.commit) {
          await transaction.commit();
        } else {
          await transaction.rollback();
        }

        return res
          .status(
            result.status
          )
          .json({
            message:
              result.message,
          });
      }

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
   * ESQUECI MINHA SENHA
   *
   * Rota pública.
   *
   * Localiza a conta pelo e-mail e
   * envia um código de seis dígitos.
   */
  async requestForgotPasswordCode(
    req,
    res
  ) {
    try {
      const normalizedEmail =
        typeof req.body?.email ===
          'string'
          ? req.body.email
              .trim()
              .toLowerCase()
          : '';

      if (!normalizedEmail) {
        return res
          .status(400)
          .json({
            message:
              'Informe o e-mail da conta.',
          });
      }

      const user =
        await User.findOne({
          where: {
            email:
              normalizedEmail,
          },
        });

      /*
       * Resposta genérica para não
       * confirmar publicamente se um
       * endereço possui conta.
       */
      if (!user) {
        return res
          .status(200)
          .json({
            message:
              'Se o e-mail estiver cadastrado, você receberá um código de verificação.',
          });
      }

      try {
        await createAndSendPasswordCode(
          user
        );
      } catch (emailError) {
        console.error(
          'ERRO AO ENVIAR E-MAIL DE RECUPERAÇÃO:',
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
            'Se o e-mail estiver cadastrado, você receberá um código de verificação.',
        });
    } catch (error) {
      console.error(
        'ERRO AO SOLICITAR RECUPERAÇÃO DE SENHA:',
        error
      );

      return res
        .status(500)
        .json({
          message:
            'Não foi possível solicitar a recuperação da senha.',
        });
    }
  }

  /*
   * CONFIRMAR RECUPERAÇÃO
   * DE SENHA
   *
   * Rota pública.
   *
   * Recebe:
   * - e-mail;
   * - código;
   * - nova senha;
   * - confirmação da senha.
   */
  async confirmForgotPassword(
    req,
    res
  ) {
    const transaction =
      await sequelize.transaction();

    try {
      const {
        email,
        code,
        newPassword,
        confirmPassword,
      } = req.body;

      const normalizedEmail =
        typeof email ===
          'string'
          ? email
              .trim()
              .toLowerCase()
          : '';

      if (!normalizedEmail) {
        await transaction.rollback();

        return res
          .status(400)
          .json({
            message:
              'Informe o e-mail da conta.',
          });
      }

      const user =
        await User.findOne({
          where: {
            email:
              normalizedEmail,
          },

          transaction,

          lock:
            transaction.LOCK.UPDATE,
        });

      if (!user) {
        await transaction.rollback();

        return res
          .status(400)
          .json({
            message:
              'Código, e-mail ou solicitação inválidos.',
          });
      }

      const result =
        await changePasswordWithCode({
          user,
          code,
          newPassword,
          confirmPassword,
          transaction,
        });

      if (!result.success) {
        if (result.commit) {
          await transaction.commit();
        } else {
          await transaction.rollback();
        }

        return res
          .status(
            result.status
          )
          .json({
            message:
              result.message,
          });
      }

      await transaction.commit();

      return res
        .status(200)
        .json({
          message:
            'Senha redefinida com sucesso. Faça login com a nova senha.',
        });
    } catch (error) {
      if (
        !transaction.finished
      ) {
        await transaction.rollback();
      }

      console.error(
        'ERRO AO REDEFINIR SENHA:',
        error
      );

      return res
        .status(500)
        .json({
          message:
            'Não foi possível redefinir a senha.',
        });
    }
  }

  /*
   * EXCLUIR CONTA
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

      if (user.photo) {
        filesToDelete.push(
          user.photo
        );
      }

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
        const post of userPosts
      ) {
        filesToDelete.push(
          ...parsePostImages(
            post.images
          )
        );
      }

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
        const message of
          userMessages
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

      const deletedVerifications =
        await PasswordVerification.destroy({
          where: {
            user_id:
              userId,
          },

          transaction,
        });

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

      const deletedPosts =
        await Post.destroy({
          where: {
            user_id:
              userId,
          },

          transaction,
        });

      await user.destroy({
        transaction,
      });

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