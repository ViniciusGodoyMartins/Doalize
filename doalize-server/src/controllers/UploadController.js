class UploadController {
  async upload(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({
          message:
            'Nenhum arquivo enviado.',
        });
      }

      const publicPath =
        `/uploads/posts/${req.file.filename}`;

      return res.status(200).json({
        message:
          'Upload realizado com sucesso.',
        file: {
          filename:
            req.file.filename,
          originalname:
            req.file.originalname,
          mimetype:
            req.file.mimetype,
          size: req.file.size,
          path: publicPath,
        },
      });
    } catch (error) {
      console.error(
        'ERRO NO UPLOAD:',
        error
      );

      return res.status(500).json({
        message:
          'Erro interno no upload.',
      });
    }
  }
}

export default new UploadController();