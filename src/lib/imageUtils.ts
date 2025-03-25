import fs from 'fs';
import path from 'path';
import { createId } from '@paralleldrive/cuid2';
import * as mime from 'mime-types';

/**
 * Ensures that a directory exists, creating it if necessary
 */
export const ensureDirectoryExists = (dirPath: string): void => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

/**
 * Generates a unique filename for an uploaded image
 */
export const generateUniqueFilename = (originalFilename: string): string => {
  const fileExtension = path.extname(originalFilename);
  const uniqueId = createId();
  return `${uniqueId}${fileExtension}`;
};

/**
 * Saves an image file to the specified directory
 */
export const saveImageFile = (
  buffer: Buffer,
  filename: string,
  directory: string
): string => {
  ensureDirectoryExists(directory);
  const filepath = path.join(directory, filename);
  fs.writeFileSync(filepath, buffer);
  return filepath;
};

/**
 * Gets MIME type from a buffer
 */
export const getMimeType = (buffer: Buffer, fallback = 'application/octet-stream'): string => {
  // Check for common image signatures
  if (buffer.length >= 2) {
    // JPEG starts with FF D8
    if (buffer[0] === 0xFF && buffer[1] === 0xD8) {
      return 'image/jpeg';
    }
    
    // PNG starts with 89 50 4E 47 (hex)
    if (buffer.length >= 4 &&
        buffer[0] === 0x89 && 
        buffer[1] === 0x50 && 
        buffer[2] === 0x4E && 
        buffer[3] === 0x47) {
      return 'image/png';
    }
    
    // GIF starts with GIF87a or GIF89a
    if (buffer.length >= 6 &&
        buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46 &&
        buffer[3] === 0x38 && (buffer[4] === 0x37 || buffer[4] === 0x39) && 
        buffer[5] === 0x61) {
      return 'image/gif';
    }
  }
  
  return fallback;
};

/**
 * Gets file extension from MIME type
 */
export const getExtensionFromMime = (mimeType: string): string => {
  const extension = mime.extension(mimeType);
  return extension ? `.${extension}` : '';
};

/**
 * Validates if a file is an image based on its MIME type
 */
export const isValidImageType = (mimeType: string): boolean => {
  const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  return validTypes.includes(mimeType);
};

/**
 * Validates if a file size is within allowed limit
 */
export const isValidFileSize = (sizeInBytes: number, maxSizeInMB = 5): boolean => {
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
  return sizeInBytes <= maxSizeInBytes;
}; 