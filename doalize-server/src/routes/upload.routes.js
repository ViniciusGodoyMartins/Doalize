import {
  Router,
} from 'express';

import multer from 'multer';

import UploadController from '../controllers/UploadController.js';

import authMiddleware from '../middlewares/authMiddleware.js';

import {
  postUpload,
  userUpload,
} from '../middlewares/uploadMiddleware.js';

const uploadRoutes =
  Router();

function handleUpload(
  uploadMiddleware,
  uploadType
) {
  return (
    req,
    res,
    next
  ) => {
    console.log(
      'REQUISIÇÃO DE UPLOAD RECEBIDA:',
      {
        uploadType,

        method:
          req.method,

        url:
          req.originalUrl,

        contentType:
          req.headers[
            'content-type'
          ],

        contentLength:
          req.headers[
            'content-length'
          ],
      }
    );

    uploadMiddleware.single(
      'file'
    )(
      req,
      res,
      (error) => {
        if (
          error instanceof
          multer.MulterError
        ) {
          console.error(
            'ERRO DO MULTER:',
            {
              code:
                error.code,

              field:
                error.field,

              message:
                error.message,
            }
          );

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

          if (
            error.code ===
            'LIMIT_UNEXPECTED_FILE'
          ) {
            return res
              .status(400)
              .json({
                message:
                  'Campo de arquivo inválido. O campo esperado é "file".',
              });
          }

          return res
            .status(400)
            .json({
              message:
                `Erro no upload: ${error.message}`,
            });
        }

        if (error) {
          console.error(
            'ERRO AO PROCESSAR UPLOAD:',
            error
          );

          return res
            .status(400)
            .json({
              message:
                error.message ||
                'Não foi possível processar a imagem.',
            });
        }

        console.log(
          'MULTER FINALIZADO:',
          {
            uploadType,

            receivedFile:
              Boolean(req.file),

            file:
              req.file
                ? {
                    filename:
                      req.file
                        .filename,

                    mimetype:
                      req.file
                        .mimetype,

                    size:
                      req.file
                        .size,
                  }
                : null,
          }
        );

        next();
      }
    );
  };
}

uploadRoutes.post(
  '/',
  authMiddleware,
  handleUpload(
    postUpload,
    'post'
  ),
  UploadController.uploadPost
);

uploadRoutes.post(
  '/user',
  authMiddleware,
  handleUpload(
    userUpload,
    'user'
  ),
  UploadController.uploadUser
);

export default uploadRoutes;