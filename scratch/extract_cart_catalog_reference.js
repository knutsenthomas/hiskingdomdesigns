import fs from 'fs';

const filePath = './node_modules/@wix/auto_sdk_ecom_current-cart/build/internal/cjs/schemas.d.ts';
if (fs.existsSync(filePath)) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  console.log(`Successfully read ${filePath}`);
  
  lines.forEach((line, idx) => {
    if (line.includes('catalogReference: z.ZodObject') || line.includes('catalogReference: z.ZodOptional<z.ZodObject')) {
      console.log(`\nLine ${idx + 1}: ${line}`);
      for (let i = 1; i <= 15; i++) {
        if (lines[idx + i]) console.log(`  L${idx + i + 1}: ${lines[idx + i]}`);
      }
    }
  });
} else {
  console.log(`${filePath} does not exist.`);
}
