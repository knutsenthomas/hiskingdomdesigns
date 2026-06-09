import fs from 'fs';

const filePath = './node_modules/@wix/ecom/build/cjs/schemas.d.ts';
const content = fs.readFileSync(filePath, 'utf8');
console.log('File size:', content.length);
console.log('First 500 chars:', content.substring(0, 500));

function findDefinitionCaseInsensitive(term) {
  const lowerContent = content.toLowerCase();
  const lowerTerm = term.toLowerCase();
  const idx = lowerContent.indexOf(lowerTerm);
  if (idx !== -1) {
    console.log(`\n=== FOUND "${term}" ===`);
    const start = Math.max(0, idx - 100);
    const end = Math.min(content.length, idx + 500);
    console.log(content.substring(start, end));
  } else {
    console.log(`\n=== NOT FOUND "${term}" ===`);
  }
}

findDefinitionCaseInsensitive('createCheckout');
findDefinitionCaseInsensitive('catalogReference');
findDefinitionCaseInsensitive('lineitem');
