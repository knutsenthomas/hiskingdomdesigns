import fs from 'fs';

const content = fs.readFileSync('dist/assets/index-BLmu6dqb.js', 'utf8');
const lines = content.split('\n');

// Find ble definition
const line = lines[3418]; // line 3419 (0-indexed 3418)
const index = line.indexOf('ble=({children:');

if (index !== -1) {
  console.log('Found ble at index:', index);
  const body = line.substring(index, index + 15000);
  
  // Find all instances of L (isolated variables) in the body
  console.log('--- Occurrences of L ---');
  const matches = body.matchAll(/[^a-zA-Z0-9_$]L[^a-zA-Z0-9_$]/g);
  for (const match of matches) {
    const start = Math.max(0, match.index - 50);
    const end = Math.min(body.length, match.index + 50);
    console.log(`Context at ${match.index}:`, body.substring(start, end));
  }
} else {
  console.log('ble not found in line 3419');
}
