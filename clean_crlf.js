const fs = require('fs');
const path = require('path');

const rootDir = __dirname;

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      if (file !== '.git' && file !== 'node_modules') {
        walkDir(filePath);
      }
    } else if (file.endsWith('.html') || file.endsWith('.js') || file.endsWith('.css') || file.endsWith('.json') || file.endsWith('.htaccess')) {
      let content = fs.readFileSync(filePath, 'utf8');
      if (content.includes('\r\n')) {
        content = content.replace(/\r\n/g, '\n');
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('Cleaned CRLF in: ' + filePath);
      }
    }
  });
}

walkDir(rootDir);
console.log('CRLF line endings cleanup completed.');
