import bcrypt from 'bcryptjs';

import jwt from 'jsonwebtoken';

import dotenv from 'dotenv';

import User from '../models/User.js';

dotenv.config();

class AuthController {

  // REGISTER
  async register(req, res) {

    try {

      const {
        name,
        email,
        password,
      } = req.body;


      // VALIDAÇÃO
      if (
        !name ||
        !email ||
        !password
      ) {

        return res.status(400).json({
          message:
            'Preencha todos os campos',
        });
      }


      // VERIFICA EMAIL
      const userExists =
        await User.findOne({
          where: { email },
        });

      if (userExists) {

        return res.status(400).json({
          message:
            'E-mail já cadastrado',
        });
      }


      // HASH SENHA
      const hashedPassword =
        await bcrypt.hash(
          password,
          10
        );


      // FOTO PADRÃO
      const defaultPhoto =
        '/uploads/usuarioimage.png';


      // CRIA USUÁRIO
      const user = await User.create({

        name,

        email,

        password:
          hashedPassword,

        photo:
          defaultPhoto,

        description:
          null,

        location:
          null,
      });


      // TOKEN
      const token =
        jwt.sign(
          {
            id: user.id,
          },

          process.env.JWT_SECRET,

          {
            expiresIn: '7d',
          }
        );


      return res.status(201).json({

        message:
          'Usuário criado com sucesso',

        token,

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
        },

      });

    } catch (error) {

      console.log(error);

      return res.status(500).json({
        message:
          'Erro interno no servidor',
      });
    }
  }


  // LOGIN
  async login(req, res) {

    try {

      const {
        email,
        password,
      } = req.body;


      // VALIDAÇÃO
      if (
        !email ||
        !password
      ) {

        return res.status(400).json({
          message:
            'Preencha todos os campos',
        });
      }


      // BUSCA USUÁRIO
      const user =
        await User.findOne({
          where: { email },
        });


      if (!user) {

        return res.status(404).json({
          message:
            'Usuário não encontrado',
        });
      }


      // VALIDA SENHA
      const passwordMatch =
        await bcrypt.compare(
          password,
          user.password
        );


      if (!passwordMatch) {

        return res.status(401).json({
          message:
            'Senha inválida',
        });
      }


      // TOKEN
      const token =
        jwt.sign(
          {
            id: user.id,
          },

          process.env.JWT_SECRET,

          {
            expiresIn: '7d',
          }
        );


      return res.status(200).json({

        token,

        user: {

          id:
            user.id,

          name:
            user.name,

          email:
            user.email,

          photo:
            user.photo ||
            '/uploads/usuarioimage.png',

          description:
            user.description,

          location:
            user.location,
        },

      });

    } catch (error) {

      console.log(error);

      return res.status(500).json({
        message:
          'Erro interno no servidor',
      });
    }
  }

}


export default new AuthController();