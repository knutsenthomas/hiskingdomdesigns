import fs from 'fs';
import path from 'path';

function findFile(dir, term) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      findFile(fullPath, term);
    } else if (file.endsWith('.d.ts')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes(term)) {
        console.log(`Found in: ${fullPath}`);
      }
    }
  }
}

console.log('Searching for "catalogReference" in auto_sdk packages...');
findFile('./node_modules', 'catalogReference');
console.log('Done.');
