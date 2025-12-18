export const ALLOWED_IMAGE_MIME_TYPES = [
  'image/png',
  'image/jpeg',
  'image/webp',
] as const;

export const MAX_FILE_SIZE = 2 * 1024 * 1024;

export function validateImageFile(file: Express.Multer.File): {
  isValid: boolean;
  error?: string;
} {
  if (!file) {
    return { isValid: false, error: 'No file provided' };
  }

  if (file.size > MAX_FILE_SIZE) {
    return {
      isValid: false,
      error: `File size exceeds maximum allowed size of ${MAX_FILE_SIZE / (1024 * 1024)}MB`
    };
  }

  if (!ALLOWED_IMAGE_MIME_TYPES.includes(file.mimetype as any)) {
    return {
      isValid: false,
      error: `Invalid file type. Allowed types: ${ALLOWED_IMAGE_MIME_TYPES.join(', ')}`
    };
  }

  return { isValid: true };
}

export function getFileExtensionFromMimeType(mimeType: string): string {
  const mimeToExt: Record<string, string> = {
    'image/png': 'png',
    'image/jpeg': 'jpg',
    'image/webp': 'webp',
  };

  return mimeToExt[mimeType] || 'jpg';
}

export function generateAvatarPath(userId: string, mimeType: string): string {
  const extension = getFileExtensionFromMimeType(mimeType);
  return `${userId}/profile.${extension}`;
}

export function generateLogoPath(entityId: string, mimeType: string): string {
  const extension = getFileExtensionFromMimeType(mimeType);
  return `${entityId}/logo.${extension}`;
}

export function generateProductImagePath(productId: string, index: number, mimeType: string): string {
  const extension = getFileExtensionFromMimeType(mimeType);
  return `${productId}/image_${index}.${extension}`;
}