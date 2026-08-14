import express from 'express';
import http from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

import {
  fileURLToPath,
} from 'url';

import sequelize from './config/database.js';

import routes from './routes/index.js';

import {
  initializeSocket,
} from './config/socket.js';

import './models/User.js';
import './models/Post.js';
import './models/Chat.js';
import './models/Message.js';
import './models/PasswordVerification.js';

dotenv.config();

const __filename =
  fileURLToPath(
    import.meta.url
  );

const __dirname =
  path.dirname(__filename);

const uploadsDirectory =
  path.resolve(
    __dirname,
    '../uploads'
  );

const postsDirectory =
  path.join(
    uploadsDirectory,
    'posts'
  );

const usersDirectory =
  path.join(
    uploadsDirectory,
    'users'
  );

fs.mkdirSync(postsDirectory, {
  recursive: true,
});

fs.mkdirSync(usersDirectory, {
  recursive: true,
});

const app = express();

const server =
  http.createServer(app);

initializeSocket(server);

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(
  express.json({
    limit: '10mb',
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: '10mb',
  })
);

app.use(
  (
    req,
    res,
    next
  ) => {
    console.log(
      `${new Date().toISOString()} ${req.method} ${req.url}`
    );

    next();
  }
);

app.use(
  '/uploads',
  express.static(
    uploadsDirectory
  )
);

app.get(
  '/',
  (req, res) => {
    return res
      .status(200)
      .json({
        message:
          'DOALIZE API ONLINE',
      });
  }
);

app.use(routes);

app.use(
  (
    req,
    res
  ) => {
    return res
      .status(404)
      .json({
        message:
          'Rota não encontrada.',
      });
  }
);

app.use(
  (
    error,
    req,
    res,
    next
  ) => {
    console.error(
      'ERRO NÃO TRATADO:',
      error
    );

    if (res.headersSent) {
      return next(error);
    }

    return res
      .status(500)
      .json({
        message:
          error.message ||
          'Erro interno do servidor.',
      });
  }
);

const PORT =
  Number(
    process.env.PORT
  ) || 3333;

server.on(
  'error',
  (error) => {
    if (
      error.code ===
      'EADDRINUSE'
    ) {
      console.error(
        `A porta ${PORT} já está sendo utilizada.`
      );

      process.exit(1);
    }

    console.error(
      'ERRO NO SERVIDOR:',
      error
    );

    process.exit(1);
  }
);

async function startServer() {
  try {
    await sequelize.authenticate();

    console.log(
      'MySQL conectado.'
    );

    await sequelize.sync({
      alter: true,
    });

    console.log(
      'Tabelas sincronizadas.'
    );

    server.listen(
      PORT,
      '0.0.0.0',
      () => {
        console.log(
          `Servidor Doalize rodando na porta ${PORT}.`
        );

        console.log(
          `Uploads: ${uploadsDirectory}`
        );
      }
    );
  } catch (error) {
    console.error(
      'ERRO AO INICIAR SERVIDOR:',
      error
    );

    process.exit(1);
  }
}

startServer();

export {
  app,
  server,
};