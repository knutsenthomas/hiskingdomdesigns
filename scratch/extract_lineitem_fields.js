import fs from 'fs';

const filePath = './node_modules/@wix/auto_sdk_ecom_checkout/build/internal/cjs/schemas.d.ts';
if (fs.existsSync(filePath)) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  console.log(`Successfully read ${filePath}`);
  
  // Print lines 16200 to 16400
  for (let i = 16200; i <= 16400; i++) {
    console.log(`L${i}: ${lines[i - 1]}`);
  }
} else {
  console.log(`${filePath} does not exist.`);
}
