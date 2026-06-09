import fs from 'fs';
import path from 'path';

const searchDirs = [
  './node_modules/@wix/auto_sdk_ecom_checkout',
  './node_modules/@wix/auto_sdk_ecom_cart',
  './node_modules/@wix/auto_sdk_ecom_current-cart'
];

function findDtsFiles(dir) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      results = results.concat(findDtsFiles(fullPath));
    } else if (file.endsWith('.d.ts')) {
      results.push(fullPath);
    }
  }
  return results;
}

const allDtsFiles = searchDirs.flatMap(findDtsFiles);
console.log(`Found ${allDtsFiles.length} .d.ts files in ecom_checkout/cart.`);

allDtsFiles.forEach(filePath => {
  const content = fs.readFileSync(filePath, 'utf8');
  if (content.includes('CatalogReference') || content.includes('catalogReference')) {
    console.log(`\n=== FOUND IN ${filePath} ===`);
    const lines = content.split('\n');
    lines.forEach((line, idx) => {
      if (line.includes('catalogReference') || line.includes('CatalogReference') || line.includes('customTextFields') || line.includes('customTextField')) {
        console.log(`  L${idx + 1}: ${line.trim()}`);
      }
    });
  }
});
