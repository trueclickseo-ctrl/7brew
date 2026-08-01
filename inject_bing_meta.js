const fs = require('fs');
const path = require('path');

const rootDir = __dirname;
const bingMetaTag = '  <meta name="msvalidate.01" content="8fc77e73994e4414ae0f66666541145f">\n  <meta name="indexnow" content="8fc77e73994e4414ae0f66666541145f">';

function walkDir(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      if (file !== '.git' && file !== 'node_modules' && file !== 'assets' && file !== 'data') {
        walkDir(filePath, fileList);
      }
    } else if (file.endsWith('.html') && file !== 'google3a5b61468c7de336.html') {
      fileList.push(filePath);
    }
  });
  return fileList;
}

const htmlFiles = walkDir(rootDir);
let updatedCount = 0;

htmlFiles.forEach(filePath => {
  let content = fs.readFileSync(filePath, 'utf8');
  if (!content.includes('msvalidate.01')) {
    // Insert right after <meta name="description" ...> or after <head>
    if (content.includes('<meta name="description"')) {
      content = content.replace(/(<meta name="description" content="[^"]*">)/, `$1\n${bingMetaTag}`);
    } else if (content.includes('<head>')) {
      content = content.replace('<head>', `<head>\n${bingMetaTag}`);
    }
    fs.writeFileSync(filePath, content, 'utf8');
    updatedCount++;
  }
});

console.log(`Successfully injected Bing/IndexNow meta tags into ${updatedCount} HTML files.`);
