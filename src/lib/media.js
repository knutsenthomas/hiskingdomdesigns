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

  // Handle Wix internal image URIs (e.g. wix:image://v1/hash/filename.jpg#originWidth=...&originHeight=...)
  if (url.startsWith('wix:image://')) {
    const match = url.match(/wix:image:\/\/v1\/([^\/]+)\/([^\s#?]+)/);
    if (match && match[1]) {
      const imageId = match[1];
      const filename = match[2];
      const webpFilename = filename.replace(/\.(jpg|jpeg|png)$/i, '.webp');
      return `https://static.wixstatic.com/media/${imageId}/v1/fill/w_${width},h_${height},q_${quality}/${webpFilename}`;
    }
  }

  // Handle standard Wix HTTP CDN URLs (e.g. https://static.wixstatic.com/media/hash/...)
  if (url.includes('static.wixstatic.com/media/')) {
    // If it already has scaling parameters, replace them with our requested dimensions
    if (url.includes('/v1/fill/')) {
      return url.replace(/\/v1\/fill\/w_\d+,h_\d+[^/]*\//, `/v1/fill/w_${width},h_${height},q_${quality}/`);
    }

    // Otherwise append the fill scaling path
    const urlParts = url.split('?');
    const baseUrl = urlParts[0];
    const filename = baseUrl.substring(baseUrl.lastIndexOf('/') + 1);
    const webpFilename = filename.replace(/\.(jpg|jpeg|png)$/i, '.webp');
    return `${baseUrl}/v1/fill/w_${width},h_${height},q_${quality}/${webpFilename}`;
  }

  return url;
};
