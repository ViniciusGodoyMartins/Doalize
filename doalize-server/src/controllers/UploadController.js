import dotenv from 'dotenv';

dotenv.config();

class UploadController {

  // UPLOAD
  async upload(req, res) {

    try {

      // VERIFICA SE O ARQUIVO FOI ENVIADO
      if (!req.file) {

        return res.status(400).json({
          message:
            'Nenhum arquivo enviado',
        });
      }


      // CAMINHO RELATIVO DO ARQUIVO
      // NÃO SALVA localhost NEM IP NO BANCO
      const fileUrl =
        `/uploads/${req.file.filename}`;


      return res.status(200).json({

        message:
          'Upload realizado com sucesso',

        file: {

          filename:
            req.file.filename,

          originalname:
            req.file.originalname,

          mimetype:
            req.file.mimetype,

          size:
            req.file.size,

          url:
            fileUrl,
        },

      });

    } catch (error) {

      console.log(
        'ERRO UPLOAD:',
        error
      );

      return res.status(500).json({
        message:
          'Erro no upload',

        error:
          error.message,
      });
    }
  }

}

export default new UploadController();