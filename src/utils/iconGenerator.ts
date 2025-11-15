/**
 * Icon Generator Utility for PWA Icons
 * Generates multiple icon sizes from a single source image
 */

export interface IconSize {
  width: number;
  height: number;
  purpose: 'any' | 'maskable' | 'monochrome';
}

export const PWA_ICON_SIZES: IconSize[] = [
  { width: 72, height: 72, purpose: 'any' },
  { width: 96, height: 96, purpose: 'any' },
  { width: 128, height: 128, purpose: 'any' },
  { width: 144, height: 144, purpose: 'any' },
  { width: 152, height: 152, purpose: 'any' },
  { width: 192, height: 192, purpose: 'any' },
  { width: 384, height: 384, purpose: 'any' },
  { width: 512, height: 512, purpose: 'any' },
  { width: 192, height: 192, purpose: 'maskable' },
  { width: 512, height: 512, purpose: 'maskable' },
];

/**
 * Client-side icon validation
 * Validates that an uploaded image meets PWA icon requirements
 */
export async function validateIcon(file: File): Promise<{ valid: boolean; error?: string }> {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      
      // Check minimum size
      if (img.width < 192 || img.height < 192) {
        resolve({ 
          valid: false, 
          error: 'Icon must be at least 192x192 pixels' 
        });
        return;
      }

      // Check aspect ratio (should be square)
      if (img.width !== img.height) {
        resolve({ 
          valid: false, 
          error: 'Icon must be square (equal width and height)' 
        });
        return;
      }

      // Check file size (should be under 1MB for each icon)
      if (file.size > 1024 * 1024) {
        resolve({ 
          valid: false, 
          error: 'Icon file size should be under 1MB' 
        });
        return;
      }

      resolve({ valid: true });
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve({ 
        valid: false, 
        error: 'Failed to load image' 
      });
    };

    img.src = url;
  });
}

/**
 * Client-side icon resizing using canvas
 * Note: For production, icon generation should be done server-side
 */
export async function resizeIcon(
  file: File, 
  targetWidth: number, 
  targetHeight: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      const canvas = document.createElement('canvas');
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }

      // Draw image with high quality settings
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to create blob'));
          }
        },
        'image/png',
        1.0
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };

    img.src = url;
  });
}

/**
 * Generate maskable icon with safe zone padding
 * PWA maskable icons need 10% safe zone padding
 */
export async function generateMaskableIcon(
  file: File,
  size: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }

      // Add white or branded background
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, size, size);

      // Calculate safe zone (80% of canvas, centered)
      const safeZoneSize = size * 0.8;
      const offset = size * 0.1;

      // Draw image with high quality
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, offset, offset, safeZoneSize, safeZoneSize);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to create blob'));
          }
        },
        'image/png',
        1.0
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };

    img.src = url;
  });
}

/**
 * Get icon generation instructions for sellers
 */
export const ICON_GUIDELINES = {
  minSize: { width: 512, height: 512 },
  recommended: { width: 1024, height: 1024 },
  format: ['PNG', 'JPG', 'WEBP'],
  aspectRatio: '1:1 (Square)',
  maxFileSize: '1MB',
  tips: [
    'Use a square image with equal width and height',
    'Minimum size: 512x512 pixels',
    'Recommended size: 1024x1024 pixels for best quality',
    'Use PNG format with transparent background if possible',
    'Ensure your logo is centered and clearly visible',
    'Avoid placing important content at the edges',
    'Keep file size under 1MB for fast loading'
  ]
};

