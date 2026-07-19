const fs = require('fs');
const path = require('path');

const rootDir = __dirname;
const domain = 'https://www.7brewguide.com';

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

const allHtmlFiles = walkDir(rootDir);

let sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;

allHtmlFiles.forEach(file => {
  let relativePath = path.relative(rootDir, file).replace(/\\/g, '/');
  
  // Clean URL formats
  let urlPath = relativePath;
  if (urlPath === 'index.html') {
    urlPath = '';
  } else {
    // strip .html
    urlPath = urlPath.replace(/\.html$/, '');
    
    // Rewrite specific names if they map to rewrites in htaccess
    if (urlPath === 'menu') urlPath = '7brew-menu';
    if (urlPath === 'calorie-calculator') urlPath = '7brew-calorie-calculator';
    if (urlPath === 'locations') urlPath = '7brew-locations';
    if (urlPath === 'blog') urlPath = '7brew-blog';
    if (urlPath === 'deals') urlPath = '7brew-deals';
    if (urlPath === 'rewards') urlPath = '7brew-rewards';
    if (urlPath === 'recipe-maker') urlPath = '7brew-recipe-maker';
    if (urlPath === 'secret-menu') urlPath = 'secret-menu'; // or 7brew-secret-menu
  }

  const url = `${domain}/${urlPath}`;
  const today = new Date().toISOString().split('T')[0];

  sitemapContent += `  <url>
    <loc>${url}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${urlPath === '' ? '1.0' : (urlPath.includes('/') ? '0.6' : '0.8')}</priority>
  </url>
`;
});

sitemapContent += `</urlset>
`;

fs.writeFileSync(path.join(rootDir, 'sitemap.xml'), sitemapContent, 'utf8');
console.log('Sitemap.xml generated successfully with ' + allHtmlFiles.length + ' URLs.');
