import fetch from 'node-fetch';

async function checkAllImages() {
  try {
    console.log('Fetching live homepage HTML...');
    const htmlRes = await fetch('https://hiskingdomdesigns.no/');
    const html = await htmlRes.text();
    
    // Find all images using regex
    const imgRegex = /<img[^>]+src="([^"]+)"/g;
    const images = [];
    let match;
    while ((match = imgRegex.exec(html)) !== null) {
      if (match[1]) {
        images.push(match[1]);
      }
    }
    
    console.log(`Found ${images.length} images in HTML. Checking sizes...`);
    
    let totalSize = 0;
    for (const src of images) {
      const absoluteUrl = src.startsWith('http') ? src : `https://hiskingdomdesigns.no${src}`;
      try {
        const res = await fetch(absoluteUrl, { method: 'HEAD' });
        const len = res.headers.get('content-length');
        const sizeKb = len ? (parseInt(len) / 1024).toFixed(1) : 'unknown';
        if (len) totalSize += parseInt(len);
        console.log(`- Image: ${src} -> Size: ${sizeKb} KB`);
      } catch (err) {
        console.error(`- Failed to fetch size for ${src}`);
      }
    }
    
    console.log(`Total image size from HTML: ${(totalSize / 1024 / 1024).toFixed(2)} MB`);
  } catch (err) {
    console.error('Error analyzing images:', err);
  }
}

checkAllImages();
