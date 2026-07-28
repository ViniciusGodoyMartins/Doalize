import express from 'express';
import http from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

import sequelize from './config/database.js';
import routes from './routes/index.js';
import {
  initializeSocket,
} from './config/socket.js';

import './models/Chat.js';

dotenv.config();

const __filename =
  fileURLToPath(import.meta.url);

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

app.use(cors());

app.use(express.json());

