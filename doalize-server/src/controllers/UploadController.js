class UploadController {
  async uploadPost(
    req,
    res
  ) {
    return UploadController
      .sendResponse(
        req,
        res,
        'posts'
      );
  }

  async uploadUser(
    req,
    res
  ) {
    return UploadController
      .sendResponse(
        req,
        res,
        'users'
      );
  }

  static sendResponse(
    req,
    res,
    directory
  ) {
    try {
      if (!req.file) {
        console.log(
          'UPLOAD SEM ARQUIVO:',
          {
            directory,

            body:
              req.body,

            contentType:
              req.headers[
                'content-type'
              ],
          }
        );

        return res
          .status(400)
          .json({
            message:
              'Nenhum arquivo enviado.',
          });
      }

      const publicPath =
        `/uploads/${directory}/${req.file.filename}`;

      console.log(
        'UPLOAD CONCLUÍDO:',
        {
          directory,

          filename:
            req.file.filename,

          originalname:
            req.file.originalname,

          mimetype:
            req.file.mimetype,

          size:
            req.file.size,

          path:
            req.file.path,

          publicPath,
        }
      );

      return res
        .status(200)
        .json({
          message:
            'Upload realizado com sucesso.',

          file: {
            filename:
              req.file.filename,

            originalname:
              req.file.originalname,

            mimetype:
              req.file.mimetype,

            size:
              req.file.size,

            path:
              publicPath,

            url:
              publicPath,
          },
        });
    } catch (error) {
      console.error(
        'ERRO NO CONTROLLER DE UPLOAD:',
        error
      );

      return res
        .status(500)
        .json({
          message:
            'Erro ao realizar upload.',

          error:
            error.message,
        });
    }
  }
}

export default new UploadController();