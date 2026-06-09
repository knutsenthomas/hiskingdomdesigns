import fs from 'fs';
import path from 'path';

const filePath = '/Users/thomasknutsen/.gemini/antigravity/brain/c3aad923-ed58-4e3b-9cb7-c97c00415b6c/.system_generated/steps/9278/content.md';

function parse() {
  console.log('Reading file...');
  const content = fs.readFileSync(filePath, 'utf-8');
  console.log('File length:', content.length);

  // Let's strip out HTML tags to make it readable, or find tables
  // We can write a simple regex to extract tables or look at the main text.
  let cleaned = content.replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, '');
  cleaned = cleaned.replace(/<style[^>]*>([\s\S]*?)<\/style>/gi, '');
  
  // Find tables
  const tables = [];
  const tableRegex = /<table[^>]*>([\s\S]*?)<\/table>/gi;
  let match;
  while ((match = tableRegex.exec(cleaned)) !== null) {
    tables.push(match[0]);
  }
  
  console.log('Found tables:', tables.length);
  
  // Write the first table or text to scratch
  fs.writeFileSync('scratch/parsed_tables.html', tables.join('\n\n'));
  
  // Also write a text-only version
  const textOnly = cleaned.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
  fs.writeFileSync('scratch/parsed_text.txt', textOnly.substring(0, 10000));
  console.log('Parsed text saved.');
}

parse();
