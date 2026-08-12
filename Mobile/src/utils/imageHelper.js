import api from '../services/api';


const API_BASE_URL =
  api.defaults.baseURL ||
  'http://10.0.2.2:3333';


export function resolveImageUrl(
  image
) {

  if (
    !image ||
    typeof image !== 'string'
  ) {
    return null;
  }


  let normalizedImage =
    image
      .trim()
      .replace(/\\/g, '/')
      .replace(/^["']|["']$/g, '');


  if (!normalizedImage) {
    return null;
  }


  // localhost antigo
  if (
    normalizedImage.startsWith(
      'http://localhost:3333'
    )
  ) {

    normalizedImage =
      normalizedImage.replace(
        'http://localhost:3333',
        API_BASE_URL
      );
  }


  // 127.0.0.1 antigo
  if (
    normalizedImage.startsWith(
      'http://127.0.0.1:3333'
    )
  ) {

    normalizedImage =
      normalizedImage.replace(
        'http://127.0.0.1:3333',
        API_BASE_URL
      );
  }


  // URL completa
  if (
    normalizedImage.startsWith(
      'http://'
    ) ||
    normalizedImage.startsWith(
      'https://'
    )
  ) {

    return normalizedImage;
  }


  // caminho do servidor
  if (
    normalizedImage.startsWith(
      '/uploads/'
    )
  ) {

    return (
      API_BASE_URL +
      normalizedImage
    );
  }


  if (
    normalizedImage.startsWith(
      'uploads/'
    )
  ) {

    return (
      `${API_BASE_URL}/${normalizedImage}`
    );
  }


  // somente nome do arquivo
  if (
    !normalizedImage.includes('/')
  ) {

    return (
      `${API_BASE_URL}/uploads/${normalizedImage}`
    );
  }


  return (
    `${API_BASE_URL}/${normalizedImage}`
  );
}


export function parsePostImages(
  images
) {

  if (!images) {
    return [];
  }


  let parsedImages =
    images;


  if (
    typeof parsedImages ===
    'string'
  ) {

    const value =
      parsedImages.trim();


    if (!value) {
      return [];
    }


    try {

      parsedImages =
        JSON.parse(value);

    } catch {

      parsedImages =
        [value];
    }
  }


  if (
    !Array.isArray(
      parsedImages
    )
  ) {

    parsedImages =
      [parsedImages];
  }


  return parsedImages
    .map(
      (image) => {

        if (
          typeof image ===
          'string'
        ) {

          return resolveImageUrl(
            image
          );
        }


        if (
          image &&
          typeof image ===
          'object'
        ) {

          return resolveImageUrl(
            image.url ||
            image.path ||
            image.uri ||
            image.filename
          );
        }


        return null;
      }
    )
    .filter(Boolean);
}


export function normalizePost(
  post
) {

  if (
    !post ||
    typeof post !==
      'object'
  ) {

    return post;
  }


  return {
    ...post,

    images:
      parsePostImages(
        post.images
      ),

    user:
      post.user
        ? {
            ...post.user,

            photo:
              post.user.photo
                ? resolveImageUrl(
                    post.user.photo
                  )
                : null,
          }
        : null,
  };
}