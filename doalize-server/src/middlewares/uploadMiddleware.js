import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import fs from 'fs';

import {
  fileURLToPath,
} from 'url';

const __filename =
  fileURLToPath(
    import.meta.url
  );

const __dirname =
  path.dirname(__filename);

const uploadsDirectory =
  path.resolve(
    __dirname,
    '../../uploads'
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

fs.mkdirSync(
  postsDirectory,
  {
    recursive: true,
  }
);

fs.mkdirSync(
  usersDirectory,
  {
    recursive: true,
  }
);

const allowedExtensions = [
  '.jpg',
  '.jpeg',
  '.png',
  '.webp',
];

const allowedMimeTypes = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'application/octet-stream',
];

function getExtension(file) {
  const originalExtension =
    path
      .extname(
        file.originalname ||
          ''
      )
      .toLowerCase();

  if (
    allowedExtensions.includes(
      originalExtension
    )
  ) {
    return originalExtension;
  }

  if (
    file.mimetype ===
    'image/png'
  ) {
    return '.png';
  }

  if (
    file.mimetype ===
    'image/webp'
  ) {
    return '.webp';
  }

  return '.jpg';
}

function createStorage(
  destinationDirectory
) {
  return multer.diskStorage({
    destination(
      req,
      file,
      callback
    ) {
      console.log(
        'DESTINO DO UPLOAD:',
        destinationDirectory
      );

      callback(
        null,
        destinationDirectory
      );
    },

    filename(
      req,
      file,
      callback
    ) {
      const hash =
        crypto
          .randomBytes(16)
          .toString('hex');

      const extension =
        getExtension(file);

      const fileName =
        `${Date.now()}-${hash}${extension}`;

      console.log(
        'ARQUIVO DO UPLOAD:',
        {
          originalname:
            file.originalname,

          mimetype:
            file.mimetype,

          generatedName:
            fileName,
        }
      );

      callback(
        null,
        fileName
      );
    },
  });
}

function fileFilter(
  req,
  file,
  callback
) {
  const extension =
    path
      .extname(
        file.originalname ||
          ''
      )
      .toLowerCase();

  const validMime =
    allowedMimeTypes.includes(
      file.mimetype
    );

  const validExtension =
    allowedExtensions.includes(
      extension
    );

  console.log(
    'VALIDANDO ARQUIVO:',
    {
      originalname:
        file.originalname,

      mimetype:
        file.mimetype,

      extension,

      validMime,

      validExtension,
    }
  );

  if (
    validMime &&
    (
      validExtension ||
      file.mimetype.startsWith(
        'image/'
      )
    )
  ) {
    callback(null, true);
    return;
  }

  callback(
    new Error(
      'Formato inválido. Utilize JPG, JPEG, PNG ou WEBP.'
    )
  );
}

const commonOptions = {
  fileFilter,

  limits: {
    fileSize:
      10 * 1024 * 1024,

    files: 1,
  },
};

export const postUpload =
  multer({
    ...commonOptions,

    storage:
      createStorage(
        postsDirectory
      ),
  });

export const userUpload =
  multer({
    ...commonOptions,

    storage:
      createStorage(
        usersDirectory
      ),
  });

export default postUpload;