import bcrypt from 'bcryptjs';

import jwt from 'jsonwebtoken';

import dotenv from 'dotenv';

import {
  Op,
} from 'sequelize';

import User from '../models/User.js';

dotenv.config();

const MIN_PASSWORD_LENGTH = 6;

const DEFAULT_USER_PHOTO =
  '/uploads/usuarioimage.png';

/*
 * IDENTIFICAR CONTA ANONIMIZADA
 *
 * Quando uma conta é anonimizada,
 * o e-mail passa a utilizar o formato:
 *
 * conta-removida-ID-CODIGO@doalize.invalid
 */
function isAnonymousEmail(
  email
) {
  return (
    typeof email === 'string' &&
    /^conta-removida-\d+-[a-f0-9]+@doalize\.invalid$/i.test(
      email
    )
  );
}

/*
 * CRIAR TOKEN DO USUÁRIO
 */
function createUserToken(
  userId
) {
  const jwtSecret =
    process.env.JWT_SECRET;

  if (!jwtSecret) {
    throw new Error(
      'JWT_SECRET não foi configurado no servidor.'
    );
  }

  return jwt.sign(
    {
      id:
        userId,
    },
    jwtSecret,
    {
      expiresIn:
        '7d',
    }
  );
}

/*
 * FORMATAR DADOS PÚBLICOS
 * DO USUÁRIO
 *
 * A senha nunca é devolvida
 * pela API.
 */
function formatUserResponse(
  user
) {
  return {
    id:
      user.id,

    name:
      user.name,

    email:
      user.email,

    photo:
      user.photo ||
      DEFAULT_USER_PHOTO,

    description:
      user.description,

    location:
      user.location,

    created_at:
      user.created_at,
  };
}

/*
 * VALIDAR FORMATO BÁSICO
 * DO E-MAIL
 */
function isValidEmail(
  email
) {
  const emailPattern =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  return emailPattern.test(
    email
  );
}

class AuthController {
  /*
   * CADASTRAR USUÁRIO
   *
   * POST /auth/register
   */
  async register(
    req,
    res
  ) {
    try {
      const {
        name,
        email,
        password,
      } = req.body;

      const normalizedName =
        typeof name ===
          'string'
          ? name.trim()
          : '';

      const normalizedEmail =
        typeof email ===
          'string'
          ? email
              .trim()
              .toLowerCase()
          : '';

      const normalizedPassword =
        typeof password ===
          'string'
          ? password
          : '';

      /*
       * CAMPOS OBRIGATÓRIOS
       */
      if (
        !normalizedName ||
        !normalizedEmail ||
        !normalizedPassword
      ) {
        return res
          .status(400)
          .json({
            message:
              'Preencha todos os campos.',
          });
      }

      /*
       * TAMANHO DO NOME
       */
      if (
        normalizedName.length <
          2 ||
        normalizedName.length >
          120
      ) {
        return res
          .status(400)
          .json({
            message:
              'O nome deve possuir entre 2 e 120 caracteres.',
          });
      }

      /*
       * FORMATO DO E-MAIL
       */
      if (
        !isValidEmail(
          normalizedEmail
        )
      ) {
        return res
          .status(400)
          .json({
            message:
              'Informe um e-mail válido.',
          });
      }

      /*
       * IMPEDE O USO DO DOMÍNIO INTERNO
       * RESERVADO PARA ANONIMIZAÇÃO.
       */
      if (
        normalizedEmail.endsWith(
          '@doalize.invalid'
        )
      ) {
        return res
          .status(400)
          .json({
            message:
              'Informe um e-mail válido.',
          });
      }

      /*
       * TAMANHO DA SENHA
       */
      if (
        normalizedPassword.length <
        MIN_PASSWORD_LENGTH
      ) {
        return res
          .status(400)
          .json({
            message:
              `A senha deve possuir pelo menos ${MIN_PASSWORD_LENGTH} caracteres.`,
          });
      }

      /*
       * VERIFICAR SE O E-MAIL
       * JÁ ESTÁ CADASTRADO
       */
      const userExists =
        await User.findOne({
          where: {
            email: {
              [Op.eq]:
                normalizedEmail,
            },
          },
        });

      if (userExists) {
        return res
          .status(400)
          .json({
            message:
              'E-mail já cadastrado.',
          });
      }

      /*
       * CRIPTOGRAFAR SENHA
       */
      const hashedPassword =
        await bcrypt.hash(
          normalizedPassword,
          10
        );

      /*
       * CRIAR USUÁRIO
       */
      const user =
        await User.create({
          name:
            normalizedName,

          email:
            normalizedEmail,

          password:
            hashedPassword,

          photo:
            DEFAULT_USER_PHOTO,

          description:
            null,

          location:
            null,
        });

      /*
       * CRIAR TOKEN
       */
      const token =
        createUserToken(
          user.id
        );

      return res
        .status(201)
        .json({
          message:
            'Usuário criado com sucesso.',

          token,

          user:
            formatUserResponse(
              user
            ),
        });
    } catch (error) {
      console.error(
        'ERRO AO CADASTRAR USUÁRIO:',
        {
          name:
            error.name,

          message:
            error.message,

          sql:
            error.sql,

          original:
            error.original
              ?.message,
        }
      );

      /*
       * E-MAIL DUPLICADO
       */
      if (
        error.name ===
        'SequelizeUniqueConstraintError'
      ) {
        return res
          .status(400)
          .json({
            message:
              'E-mail já cadastrado.',
          });
      }

      /*
       * VALIDAÇÕES DO MODELO USER
       */
      if (
        error.name ===
        'SequelizeValidationError'
      ) {
        return res
          .status(400)
          .json({
            message:
              error.errors?.[0]
                ?.message ||
              'Os dados informados são inválidos.',
          });
      }

      return res
        .status(500)
        .json({
          message:
            error.message ===
            'JWT_SECRET não foi configurado no servidor.'
              ? error.message
              : 'Erro interno no servidor.',
        });
    }
  }

  /*
   * REALIZAR LOGIN
   *
   * POST /auth/login
   */
  async login(
    req,
    res
  ) {
    try {
      const {
        email,
        password,
      } = req.body;

      const normalizedEmail =
        typeof email ===
          'string'
          ? email
              .trim()
              .toLowerCase()
          : '';

      const normalizedPassword =
        typeof password ===
          'string'
          ? password
          : '';

      /*
       * CAMPOS OBRIGATÓRIOS
       */
      if (
        !normalizedEmail ||
        !normalizedPassword
      ) {
        return res
          .status(400)
          .json({
            message:
              'Preencha todos os campos.',
          });
      }

      /*
       * FORMATO DO E-MAIL
       */
      if (
        !isValidEmail(
          normalizedEmail
        )
      ) {
        return res
          .status(400)
          .json({
            message:
              'Informe um e-mail válido.',
          });
      }

      /*
       * BUSCAR USUÁRIO
       */
      const user =
        await User.findOne({
          where: {
            email:
              normalizedEmail,
          },
        });

      /*
       * MENSAGEM GENÉRICA
       *
       * Não informa se o endereço
       * realmente possui uma conta.
       */
      if (!user) {
        return res
          .status(401)
          .json({
            message:
              'E-mail ou senha inválidos.',
          });
      }

      /*
       * BLOQUEAR CONTA ANONIMIZADA
       *
       * Uma conta anonimizada não pode
       * gerar novos tokens nem voltar
       * a acessar o aplicativo.
       */
      if (
        isAnonymousEmail(
          user.email
        )
      ) {
        console.log(
          'TENTATIVA DE LOGIN EM CONTA ANONIMIZADA:',
          {
            userId:
              user.id,
          }
        );

        return res
          .status(401)
          .json({
            message:
              'Esta conta foi anonimizada e não pode mais ser acessada.',
          });
      }

      /*
       * VALIDAR SENHA
       *
       * Também funciona com senhas
       * redefinidas pelo fluxo
       * "Esqueci minha senha".
       */
      const passwordMatch =
        await bcrypt.compare(
          normalizedPassword,
          user.password
        );

      if (!passwordMatch) {
        return res
          .status(401)
          .json({
            message:
              'E-mail ou senha inválidos.',
          });
      }

      /*
       * CRIAR TOKEN
       */
      const token =
        createUserToken(
          user.id
        );

      return res
        .status(200)
        .json({
          message:
            'Login realizado com sucesso.',

          token,

          user:
            formatUserResponse(
              user
            ),
        });
    } catch (error) {
      console.error(
        'ERRO AO REALIZAR LOGIN:',
        {
          name:
            error.name,

          message:
            error.message,

          sql:
            error.sql,

          original:
            error.original
              ?.message,
        }
      );

      return res
        .status(500)
        .json({
          message:
            error.message ===
            'JWT_SECRET não foi configurado no servidor.'
              ? error.message
              : 'Erro interno no servidor.',
        });
    }
  }
}

export default new AuthController();