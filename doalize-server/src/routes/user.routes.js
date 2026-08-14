import {
  Router,
} from 'express';

import UserController from '../controllers/UserController.js';

import authMiddleware from '../middlewares/authMiddleware.js';

const userRoutes = Router();

userRoutes.use(
  authMiddleware
);

userRoutes.get(
  '/profile',
  UserController.profile
);

userRoutes.put(
  '/update',
  UserController.update
);

userRoutes.post(
  '/password/request-code',
  UserController.requestPasswordCode
);

userRoutes.post(
  '/password/confirm',
  UserController.confirmPassword
);

userRoutes.delete(
  '/delete',
  UserController.delete
);

export default userRoutes;