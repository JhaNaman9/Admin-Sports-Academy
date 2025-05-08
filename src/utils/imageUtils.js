import cloudinaryConfig from '../config/cloudinaryConfig';

/**
 * Convert a File object to a Base64 string
 * @param {File} file - The file to convert
 * @returns {Promise<string>} - Promise that resolves with the Base64 string
 */
export const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    if (!file) {
      resolve(null);
      return;
    }
    
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};

/**
 * Get Cloudinary URL for a given public ID
 * @param {string} publicId - The public ID of the image in Cloudinary
 * @param {Object} options - Transformation options
 * @returns {string} - Cloudinary URL
 */
export const getCloudinaryUrl = (publicId, options = {}) => {
  if (!publicId) return null;

  // Default options
  const defaultOptions = {
    cloud_name: 'dfc2einlx',
    secure: true
  };

  // Merge options
  const mergedOptions = { ...defaultOptions, ...options };

  // Build transformation string
  let transformations = '';
  if (options.width) transformations += `w_${options.width},`;
  if (options.height) transformations += `h_${options.height},`;
  if (options.crop) transformations += `c_${options.crop},`;
  if (options.quality) transformations += `q_${options.quality},`;
  
  // Remove trailing comma
  if (transformations.endsWith(',')) {
    transformations = transformations.slice(0, -1);
  }
  
  // Build URL
  let url = `https://res.cloudinary.com/${mergedOptions.cloud_name}/image/upload`;
  
  // Add transformations if any
  if (transformations) {
    url += `/${transformations}`;
  }
  
  // Add public ID
  url += `/${publicId}`;
  
  return url;
};

/**
 * Extract public ID from Cloudinary URL
 * @param {string} url - Cloudinary URL
 * @returns {string} - Public ID
 */
export const extractPublicIdFromUrl = (url) => {
  if (!url || !url.includes('cloudinary.com')) return null;
  
  try {
    // Check if this is one of our Cloudinary URLs
    const regex = /cloudinary\.com\/[^\/]+\/image\/upload\/?([^\/]+\/)*([^\/\.]+)/;
    const matches = url.match(regex);
    
    if (matches && matches.length >= 3) {
      // If we extracted the public ID from regex
      let publicId = matches[2];
      // Add folder path if present
      if (matches[1] && matches[1].length > 0) {
        publicId = matches[1].replace(/\/$/, '') + '/' + publicId;
      }
      return publicId;
    } else {
      // Fallback to traditional extraction
      const urlParts = url.split('/');
      const uploadIndex = urlParts.indexOf('upload');
      
      if (uploadIndex !== -1 && uploadIndex + 1 < urlParts.length) {
        // Get parts after 'upload'
        const pathParts = urlParts.slice(uploadIndex + 1);
        
        // Remove version number if present (v1, v12345, etc.)
        let startIndex = 0;
        if (pathParts.length > 0 && /^v\d+$/.test(pathParts[0])) {
          startIndex = 1;
        }
        
        // Get the rest of the path excluding file extension
        const remainingPath = pathParts.slice(startIndex);
        if (remainingPath.length === 0) return null;
        
        // Handle the last part (remove extension)
        const lastPart = remainingPath[remainingPath.length - 1].split('.');
        remainingPath[remainingPath.length - 1] = lastPart[0];
        
        return remainingPath.join('/');
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error extracting public ID from URL:', error);
    return null;
  }
};

/**
 * Check if a URL is a Cloudinary URL
 * @param {string} url - The URL to check
 * @returns {boolean} - True if it's a Cloudinary URL
 */
export const isCloudinaryUrl = (url) => {
  return url && typeof url === 'string' && url.includes('cloudinary.com');
};

/**
 * Get the Cloudinary placeholder URL
 * @returns {string} - URL to use for placeholder images
 */
export const getPlaceholderUrl = () => {
  return 'https://via.placeholder.com/300';
};

/**
 * Check if a string is a Base64 image
 * @param {string} str - The string to check
 * @returns {boolean} - True if the string is a Base64 image
 */
export const isBase64Image = (str) => {
  if (!str || typeof str !== 'string') return false;
  return str.startsWith('data:image/') && str.includes('base64,');
};

/**
 * Get image dimensions from a Base64 string
 * @param {string} base64Image - The Base64 image string
 * @returns {Promise<{width: number, height: number}>} - Promise that resolves with the image dimensions
 */
export const getBase64ImageDimensions = (base64Image) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      resolve({
        width: img.width,
        height: img.height
      });
    };
    img.src = base64Image;
  });
};

/**
 * Resize a Base64 image to make it smaller for upload
 * @param {string} base64Image - The Base64 image string
 * @param {number} maxWidth - Maximum width
 * @param {number} maxHeight - Maximum height
 * @param {number} quality - JPEG quality (0-1)
 * @returns {Promise<string>} - Resized Base64 image
 */
export const resizeBase64Image = (base64Image, maxWidth = 800, maxHeight = 800, quality = 0.7) => {
  return new Promise((resolve, reject) => {
    try {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        
        // Calculate new dimensions
        if (width > height) {
          if (width > maxWidth) {
            height = Math.floor(height * (maxWidth / width));
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.floor(width * (maxHeight / height));
            height = maxHeight;
          }
        }
        
        // Create canvas and resize
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        // Get as JPEG with quality
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      
      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };
      
      img.src = base64Image;
    } catch (error) {
      reject(error);
    }
  });
}; 