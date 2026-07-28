import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename =
  fileURLToPath(import.meta.url);

const __dirname =
  path.dirname(__filename);

const uploadDirectory = path.resolve(
  __dirname,
  '../../uploads/posts'
);

fs.mkdirSync(uploadDirectory, {
  recursive: true,
});

const storage = multer.diskStorage({
  destination(req, file, callback) {
    callback(null, uploadDirectory);
  },

  filename(req, file, callback) {
    const hash = crypto
      .randomBytes(16)
      .toString('hex');

    let extension = path
      .extname(file.originalname || '')
      .toLowerCase();

    if (!extension) {
      if (file.mimetype === 'image/png') {
        extension = '.png';
      } else if (
        file.mimetype === 'image/webp'
      ) {
        extension = '.webp';
      } else {
        extension = '.jpg';
      }
    }

    callback(
      null,
      `${Date.now()}-${hash}${extension}`
    );
  },
});

function fileFilter(req, file, callback) {
  const allowedMimeTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
  ];

  if (
    allowedMimeTypes.includes(
      file.mimetype
    )
  ) {
    callback(null, true);
    return;
  }

  callback(
    new Error(
      'Formato inválido. Utilize JPG, PNG ou WEBP.'
    )
  );
}

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize:
      10 * 1024 * 1024,
  },
});

export default upload;
``