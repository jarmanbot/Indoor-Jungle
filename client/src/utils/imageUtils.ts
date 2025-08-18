// Utility functions for handling plant images

export function isValidImageUrl(url: string | null | undefined): boolean {
  if (!url || typeof url !== 'string') return false;
  
  // Check for valid HTTP/HTTPS URLs
  if (url.startsWith('http://') || url.startsWith('https://')) {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }
  
  // Check for valid base64 data URLs
  if (url.startsWith('data:image/')) {
    const parts = url.split(',');
    if (parts.length !== 2) return false;
    
    const base64Part = parts[1];
    if (!base64Part || base64Part.length < 100) return false;
    
    // Basic base64 validation
    const base64Pattern = /^[A-Za-z0-9+/]+={0,2}$/;
    return base64Pattern.test(base64Part);
  }
  
  return false;
}

export function validateAndFixImageUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  
  if (isValidImageUrl(url)) {
    return url;
  }
  
  // If invalid, return null so fallback placeholder will be used
  return null;
}

export function getSafeImageUrl(url: string | null | undefined): string {
  const validUrl = validateAndFixImageUrl(url);
  return validUrl || "https://via.placeholder.com/200x200?text=Plant+Image";
}

export function compressBase64Image(base64Url: string, quality: number = 0.7, maxWidth: number = 400): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      reject(new Error('Canvas context not available'));
      return;
    }
    
    img.onload = () => {
      // Calculate new dimensions
      let { width, height } = img;
      if (width > maxWidth) {
        const ratio = maxWidth / width;
        width = maxWidth;
        height = Math.floor(height * ratio);
      }
      
      // Set canvas size
      canvas.width = width;
      canvas.height = height;
      
      // Draw and compress
      ctx.drawImage(img, 0, 0, width, height);
      const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
      resolve(compressedBase64);
    };
    
    img.onerror = () => {
      reject(new Error('Failed to load image for compression'));
    };
    
    img.src = base64Url;
  });
}