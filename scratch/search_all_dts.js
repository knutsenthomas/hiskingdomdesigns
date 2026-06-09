import fs from 'fs';
import path from 'path';

function searchDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      searchDir(fullPath);
    } else if (file.endsWith('.d.ts') || file.endsWith('.js')) {
      try {
        const content = fs.readFileSync(fullPath, 'utf8');
        if (content.toLowerCase().includes('customtextfield')) {
          console.log(`Found in: ${fullPath}`);
          const lines = content.split('\n');
          lines.forEach((line, idx) => {
            if (line.toLowerCase().includes('customtextfield')) {
              console.log(`  L${idx + 1}: ${line.trim()}`);
            }
          });
        }
      } catch (err) {
        // ignore read errors
      }
    }
  }
}

console.log('Searching node_modules/@wix...');
searchDir('./node_modules/@wix');
console.log('Search finished.');
