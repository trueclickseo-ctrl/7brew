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
    } else if (file.endsWith('.html')) {
      let content = fs.readFileSync(filePath, 'utf8');
      
      // Matches both relative and absolute links to style.css with any version query
      const regex = /href="[^"]*style\.css(?:\?v=[0-9.]+)"/g;
      if (content.match(regex)) {
        content = content.replace(regex, 'href="/assets/css/style.css?v=1.0.9"');
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('Updated CSS reference in: ' + filePath);
      }
    }
  });
}

walkDir(rootDir);
console.log('Stylesheet version update completed.');
