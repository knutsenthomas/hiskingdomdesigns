import fs from 'fs';

const filePath = './node_modules/@wix/auto_sdk_ecom_checkout/build/internal/cjs/schemas.d.ts';
if (fs.existsSync(filePath)) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  console.log(`Successfully read ${filePath}`);
  
  // Find where `catalogReference` object is defined in detail
  let inLineItem = false;
  let braces = 0;
  lines.forEach((line, idx) => {
    if (line.includes('catalogReference: z.ZodObject') || line.includes('catalogReference: z.ZodOptional<z.ZodObject')) {
      console.log(`\nLine ${idx + 1}: ${line}`);
      // Print the next 30 lines to see what fields it contains
      for (let i = 1; i <= 30; i++) {
        if (lines[idx + i]) console.log(`  L${idx + i + 1}: ${lines[idx + i]}`);
      }
    }
  });
} else {
  console.log(`${filePath} does not exist.`);
}
