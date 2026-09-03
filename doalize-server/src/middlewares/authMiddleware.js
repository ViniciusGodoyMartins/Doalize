import jwt from 'jsonwebtoken';

import dotenv from 'dotenv';

import User from '../models/User.js';

dotenv.config();

/*
 * IDENTIFICAR CONTA ANONIMIZADA
 *
 * O UserController substitui o e-mail
 * original pelo formato:
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
 * MIDDLEWARE DE AUTENTICAÇÃO
 *
 * O middleware:
 *
 * 1. Verifica o cabeçalho Authorization;
 * 2. Confirma o formato Bearer;
 * 3. Valida o JWT;
 * 4. Confirma se o usuário ainda existe;
 * 5. Bloqueia contas anonimizadas;
 * 6. Disponibiliza req.userId.
 */
export default async function authMiddleware(
  req,
  res,
  next
) {
  try {
    /*
     * VERIFICAR CONFIGURAÇÃO
     * DO JWT
     */
    const jwtSecret =
      process.env.JWT_SECRET;

    if (!jwtSecret) {
      console.error(
        'JWT_SECRET NÃO CONFIGURADO.'
      );

      return res
        .status(500)
        .json({
          message:
            'O serviço de autenticação não está configurado.',
        });
    }

    /*
     * OBTER CABEÇALHO
     * DE AUTENTICAÇÃO
     */
    const authHeader =
      req.headers
        .authorization;

    if (!authHeader) {
      return res
        .status(401)
        .json({
          message:
            'Token não informado.',
        });
    }

    /*
     * VALIDAR FORMATO
     *
     * Formato esperado:
     *
     * Bearer TOKEN
     */
    const parts =
      authHeader
        .trim()
        .split(/\s+/);

    if (
      parts.length !== 2
    ) {
      return res
        .status(401)
        .json({
          message:
            'Token inválido.',
        });
    }

    const [
      scheme,
      token,
    ] = parts;

    /*
     * VALIDAR O TIPO BEARER
     */
    if (
      !/^Bearer$/i.test(
        scheme
      )
    ) {
      return res
        .status(401)
        .json({
          message:
            'Token mal formatado.',
        });
    }

    if (!token) {
      return res
        .status(401)
        .json({
          message:
            'Token não informado.',
        });
    }

    /*
     * VERIFICAR E DECODIFICAR
     * O JWT
     */
    let decoded;

    try {
      decoded =
        jwt.verify(
          token,
          jwtSecret
        );
    } catch (tokenError) {
      console.log(
        'TOKEN RECUSADO:',
        {
          name:
            tokenError.name,

          message:
            tokenError.message,
        }
      );

      return res
        .status(401)
        .json({
          message:
            tokenError.name ===
            'TokenExpiredError'
              ? 'Token expirado. Faça login novamente.'
              : 'Token inválido.',
        });
    }

    /*
     * VALIDAR O ID PRESENTE
     * NO TOKEN
     */
    const userId =
      Number(
        decoded?.id
      );

    if (
      !Number.isInteger(
        userId
      ) ||
      userId <= 0
    ) {
      return res
        .status(401)
        .json({
          message:
            'Token inválido.',
        });
    }

    /*
     * BUSCAR O USUÁRIO
     *
     * Essa consulta garante que um token
     * antigo não continue funcionando
     * depois que a conta for anonimizada.
     */
    const user =
      await User.findByPk(
        userId,
        {
          attributes: [
            'id',
            'email',
          ],
        }
      );

    if (!user) {
      return res
        .status(401)
        .json({
          message:
            'Conta não encontrada. Faça login novamente.',
        });
    }

    /*
     * BLOQUEAR CONTA ANONIMIZADA
     *
     * Mesmo que um token anterior ainda
     * não tenha expirado, ele não poderá
     * acessar nenhuma rota protegida.
     */
    if (
      isAnonymousEmail(
        user.email
      )
    ) {
      return res
        .status(401)
        .json({
          message:
            'Esta conta foi anonimizada e não pode mais ser acessada.',
        });
    }

    /*
     * DISPONIBILIZAR DADOS
     * PARA OS CONTROLLERS
     */
    req.userId =
      user.id;

    req.authUser = {
      id:
        user.id,

      email:
        user.email,
    };

    return next();
  } catch (error) {
    console.error(
      'ERRO NA AUTENTICAÇÃO:',
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

        stack:
          error.stack,
      }
    );

    return res
      .status(500)
      .json({
        message:
          'Erro na autenticação.',
      });
  }
}