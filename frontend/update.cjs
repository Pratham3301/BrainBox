const fs = require('fs');
const path = require('path');
const dir = './src';
const files = fs.readdirSync(dir).filter(f => f.endsWith('tsx'));
for (const file of files) {
  const p = path.join(dir, file);
  let content = fs.readFileSync(p, 'utf8');
  if (content.includes('http://localhost:8000')) {
    // Check if import already exists
    if (!content.includes('import { API_BASE_URL }')) {
      content = 'import { API_BASE_URL } from "./config";\n' + content;
    }
    content = content.replace(/['"`]http:\/\/localhost:8000\//g, 'API_BASE_URL + \'/');
    content = content.replace(/['"`]http:\/\/localhost:8000['"`]/g, 'API_BASE_URL');
    fs.writeFileSync(p, content);
    console.log(`Updated ${file}`);
  }
}
