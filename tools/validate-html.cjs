const fs = require('fs');
const path = require('path');

const input = process.argv[2];
if (!input) {
  console.error('Usage: node tools/validate-html.cjs <html-file>');
  process.exit(2);
}

const file = path.resolve(input);
const html = fs.readFileSync(file, 'utf8');
const scripts = [...html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/gi)].map(match => match[1]);

if (!scripts.length) {
  console.error(`No inline scripts found in ${file}`);
  process.exit(1);
}

for (let index = 0; index < scripts.length; index += 1) {
  try {
    new Function(scripts[index]);
  } catch (error) {
    console.error(`Inline script ${index + 1} failed to parse in ${file}`);
    throw error;
  }
}

console.log(`PARSE_OK ${scripts.length} script block(s): ${file}`);
