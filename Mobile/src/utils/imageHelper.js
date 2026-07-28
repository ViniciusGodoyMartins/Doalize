import { API_BASE_URL } from '../services/api';

export function resolveImageUrl(image) {
  if (!image || typeof image !== 'string') {
    return null;
  }

  const normalizedImage = image
    .trim()
    .replace(/\\/g, '/')
    .replace(/^["']|["']$/g, '');

  if (!normalizedImage) {
    return null;
  }

  if (
    normalizedImage.startsWith('http://') ||
    normalizedImage.startsWith('https://') ||
    normalizedImage.startsWith('file://') ||
    normalizedImage.startsWith('content://') ||
    normalizedImage.startsWith('data:')
  ) {
    return normalizedImage;
  }

  if (normalizedImage.startsWith('/')) {
    return `${API_BASE_URL}${normalizedImage}`;
  }

  if (normalizedImage.startsWith('uploads/')) {
    return `${API_BASE_URL}/${normalizedImage}`;
  }

  /*
   * Compatibilidade com registros que tenham somente
   * o nome do arquivo.
   */
  if (!normalizedImage.includes('/')) {
    return `${API_BASE_URL}/uploads/posts/${normalizedImage}`;
  }

  return `${API_BASE_URL}/${normalizedImage}`;
}

export function parsePostImages(images) {
  if (!images) {
    return [];
  }

  let parsedImages = images;

  if (typeof parsedImages === 'string') {
    const value = parsedImages.trim();

    if (!value) {
      return [];
    }

    try {
      parsedImages = JSON.parse(value);
    } catch {
      parsedImages = [value];
    }
  }

  if (!Array.isArray(parsedImages)) {
    parsedImages = [parsedImages];
  }

  return parsedImages
    .map((image) => {
      if (typeof image === 'string') {
        return resolveImageUrl(image);
      }

      if (image && typeof image === 'object') {
        return resolveImageUrl(
          image.url ||
            image.path ||
            image.uri ||
            image.filename
        );
      }

      return null;
    })
    .filter(Boolean);
}

export function normalizePost(post) {
  if (!post || typeof post !== 'object') {
    return post;
  }

  return {
    ...post,
    images: parsePostImages(post.images),
    user: post.user
      ? {
          ...post.user,
          photo: resolveImageUrl(post.user.photo),
        }
      : null,
  };
}

export const DEFAULT_AVATAR =
  'https://i.pravatar.cc/150';