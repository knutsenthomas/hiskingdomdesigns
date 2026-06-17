import fs from 'fs';

const content = fs.readFileSync('dist/assets/index-BLmu6dqb.js', 'utf8');
const lines = content.split('\n');
const lineNum = 3419;
const colNum = 8137;

console.log(`Line count in file: ${lines.length}`);
if (lines.length >= lineNum) {
  const line = lines[lineNum - 1]; // 1-indexed
  console.log(`Line length: ${line.length}`);
  
  const start = Math.max(0, colNum - 200);
  const end = Math.min(line.length, colNum + 200);
  
  console.log('--- Context ---');
  console.log(line.substring(start, end));
  console.log('--- Match ---');
  console.log('Index col:', line.substring(colNum - 10, colNum + 10));
} else {
  console.log('Line number exceeds file lines.');
}
