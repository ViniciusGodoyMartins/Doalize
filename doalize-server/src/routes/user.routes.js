import {
  Router,
} from 'express';

import UserController from '../controllers/UserController.js';

import authMiddleware from '../middlewares/authMiddleware.js';

const userRoutes =
  Router();

/*
 * =========================================
 * ROTAS PÚBLICAS
 * =========================================
 *
 * Estas rotas não exigem autenticação,
 * pois serão utilizadas por usuários que
 * esqueceram a senha e não conseguem
 * acessar a conta.
 */

/*
 * SOLICITAR CÓDIGO DE RECUPERAÇÃO
 *
 * Recebe:
 *
 * {
 *   "email": "usuario@email.com"
 * }
 *
 * POST /users/password/forgot/request-code
 */
userRoutes.post(
  '/password/forgot/request-code',
  UserController.requestForgotPasswordCode
);

/*
 * CONFIRMAR CÓDIGO E REDEFINIR SENHA
 *
 * Recebe:
 *
 * {
 *   "email": "usuario@email.com",
 *   "code": "123456",
 *   "newPassword": "novaSenha",
 *   "confirmPassword": "novaSenha"
 * }
 *
 * POST /users/password/forgot/confirm
 */
userRoutes.post(
  '/password/forgot/confirm',
  UserController.confirmForgotPassword
);

/*
 * =========================================
 * ROTAS PROTEGIDAS
 * =========================================
 *
 * Todas as rotas registradas depois deste
 * middleware exigem um token JWT válido.
 */
userRoutes.use(
  authMiddleware
);

/*
 * BUSCAR PERFIL
 *
 * GET /users/profile
 */
userRoutes.get(
  '/profile',
  UserController.profile
);

/*
 * ATUALIZAR PERFIL
 *
 * PUT /users/update
 */
userRoutes.put(
  '/update',
  UserController.update
);

/*
 * SOLICITAR CÓDIGO PARA ALTERAR A SENHA
 * PELAS CONFIGURAÇÕES
 *
 * Esta rota utiliza req.userId, portanto
 * precisa continuar protegida.
 *
 * POST /users/password/request-code
 */
userRoutes.post(
  '/password/request-code',
  UserController.requestPasswordCode
);

/*
 * CONFIRMAR ALTERAÇÃO DE SENHA
 * PELAS CONFIGURAÇÕES
 *
 * Esta rota utiliza req.userId, portanto
 * precisa continuar protegida.
 *
 * POST /users/password/confirm
 */
userRoutes.post(
  '/password/confirm',
  UserController.confirmPassword
);

/*
 * EXCLUIR CONTA
 *
 * DELETE /users/delete
 */
userRoutes.delete(
  '/delete',
  UserController.delete
);

export default userRoutes;