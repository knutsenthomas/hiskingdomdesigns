import { getOptimizedWixImageUrl } from '../src/lib/media.js';

const urls = [
  'https://static.wixstatic.com/media/db4f96_9fcdd8aa200f474fa0bf49db2b353504~mv2.png',
  'https://static.wixstatic.com/media/3a1544_3f2314e5b0af4427a546223573a01df2~mv2.jpg',
  'wix:image://v1/db4f96_9fcdd8aa200f474fa0bf49db2b353504~mv2.png/file.png#originWidth=1000&originHeight=1000'
];

urls.forEach(url => {
  console.log(`Input:  ${url}`);
  console.log(`Output: ${getOptimizedWixImageUrl(url, 400, 400)}\n`);
});
