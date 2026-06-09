const getOptimizedWixImageUrl = (url, width, height, quality = 80) => {
  if (!url || typeof url !== 'string') return url;

  if (url.startsWith('wix:image://')) {
    const match = url.match(/wix:image:\/\/v1\/([^\/]+)\/([^\s#?]+)/);
    if (match && match[1]) {
      const imageId = match[1];
      const filename = match[2];
      const webpFilename = filename.replace(/\.(jpg|jpeg|png|avif|webp)$/i, '.webp');
      return `https://static.wixstatic.com/media/${imageId}/v1/fill/w_${width},h_${height},q_${quality}/${webpFilename}`;
    }
  }

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

// Test cases
const url1 = "https://static.wixstatic.com/media/db4f96_1a1409b793fc4a5dba017e6cd2caa5c1~mv2.png/v1/fit/w_1000,h_1000,q_90/file.png";
const url2 = "https://static.wixstatic.com/media/db4f96_1a1409b793fc4a5dba017e6cd2caa5c1~mv2.png";
const url3 = "wix:image://v1/db4f96_1a1409b793fc4a5dba017e6cd2caa5c1~mv2.png/file.png#originWidth=1000&originHeight=1000";

console.log("Input 1:", url1);
console.log("Output 1:", getOptimizedWixImageUrl(url1, 400, 400));
console.log();
console.log("Input 2:", url2);
console.log("Output 2:", getOptimizedWixImageUrl(url2, 400, 400));
console.log();
console.log("Input 3:", url3);
console.log("Output 3:", getOptimizedWixImageUrl(url3, 400, 400));
