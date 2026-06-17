import fetch from 'node-fetch';
import { getOptimizedWixImageUrl } from '../src/lib/media.js';

const originalUrl = 'https://static.wixstatic.com/media/3a1544_fd343ead0a094799aac08e7f17391ce5~mv2.jpg';
const optimizedUrl = getOptimizedWixImageUrl(originalUrl, 800, 500);

console.log('Original URL:', originalUrl);
console.log('Optimized URL:', optimizedUrl);

async function checkUrl(url) {
  try {
    const res = await fetch(url, { method: 'HEAD' });
    console.log(`\nURL: ${url}`);
    console.log(`Status: ${res.status} ${res.statusText}`);
    console.log(`Content-Length: ${res.headers.get('content-length')}`);
    console.log(`Content-Type: ${res.headers.get('content-type')}`);
  } catch (err) {
    console.error('Error fetching URL:', err);
  }
}

await checkUrl(originalUrl);
await checkUrl(optimizedUrl);
