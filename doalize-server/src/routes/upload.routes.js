import { Router } from 'express';
import multer from 'multer';

import UploadController from '../controllers/UploadController.js';

import authMiddleware from '../middlewares/authMiddleware.js';

import upload from '../middlewares/uploadMiddleware.js';

const uploadRoutes = Router();

uploadRoutes.post(
  '/',
  authMiddleware,
  (req, res, next) => {
    upload.single('file')(
      req,
      res,
      (error) => {
        if (
          error instanceof
          multer.MulterError
        ) {
          if (
            error.code ===
            'LIMIT_FILE_SIZE'
          ) {
            return res
              .status(400)
              .json({
                message:
                  'A imagem deve ter no máximo 10 MB.',
              });
          }

          return res
            .status(400)
            .json({
              message:
                error.message,
            });
        }

        if (error) {
          return res
            .status(400)
            .json({
              message:
                error.message,
            });
        }

        next();
      }
    );
  },
  UploadController.upload
);

export default uploadRoutes;