/**
 * Safely extracts and builds an optimized Wix CDN image URL with custom scaling and quality parameters.
 * Forces WebP format for modern browsers to optimize web vitals (LCP).
 * 
 * @param {string} url The original image URL or Wix media URI
 * @param {number} width Desired width in pixels
 * @param {number} height Desired height in pixels
 * @param {number} quality Compression quality (1-100), defaults to 80
 * @returns {string} The optimized image URL
 */
export const getOptimizedWixImageUrl = (url, width, height, quality = 80) => {
  if (!url || typeof url !== 'string') return url;

  // 1. Handle Wix internal image URIs (e.g. wix:image://v1/hash/filename.jpg#...)
  if (url.startsWith('wix:image://')) {
    const match = url.match(/wix:image:\/\/v1\/([^\/]+)\/([^\s#?]+)/);
    if (match && match[1]) {
      const imageId = match[1];
      const filename = match[2];
      const webpFilename = filename.replace(/\.(jpg|jpeg|png|avif|webp)$/i, '.webp');
      return `https://static.wixstatic.com/media/${imageId}/v1/fill/w_${width},h_${height},q_${quality}/${webpFilename}`;
    }
  }

  // 2. Handle standard Wix HTTP CDN URLs (e.g. https://static.wixstatic.com/media/hash/...)
  if (url.includes('static.wixstatic.com/media/')) {
    const mediaPrefix = 'static.wixstatic.com/media/';
    const index = url.indexOf(mediaPrefix);
    const pathAfterMedia = url.substring(index + mediaPrefix.length);
    
    const segments = pathAfterMedia.split('/');
    const imageId = segments[0];
    
    let filename = 'image.webp';
    if (segments.length > 1) {
      const lastSegment = segments[segments.length - 1].split('?')[0];
      if (lastSegment && lastSegment !== 'file' && lastSegment.includes('.')) {
        filename = lastSegment;
      } else {
        filename = imageId;
      }
    } else {
      filename = imageId;
    }
    
    const webpFilename = filename.replace(/\.(jpg|jpeg|png|avif|webp)$/i, '.webp');
    if (!webpFilename.endsWith('.webp')) {
      return `https://static.wixstatic.com/media/${imageId}/v1/fill/w_${width},h_${height},q_${quality}/${webpFilename}.webp`;
    }
    return `https://static.wixstatic.com/media/${imageId}/v1/fill/w_${width},h_${height},q_${quality}/${webpFilename}`;
  }

  return url;
};
