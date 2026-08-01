const fs = require('fs');
const path = require('path');
const https = require('https');

const HOST = 'www.7brewguide.com';
const API_KEY = '8fc77e73994e4414ae0f66666541145f';
const KEY_LOCATION = `https://${HOST}/${API_KEY}.txt`;
const SITEMAP_URL = `https://${HOST}/sitemap.xml`;
const ROOT_DIR = __dirname;

const INDEXNOW_ENDPOINTS = [
  'api.indexnow.org',
  'www.bing.com'
];

function getUrlsFromSitemap() {
  const sitemapPath = path.join(ROOT_DIR, 'sitemap.xml');
  if (!fs.existsSync(sitemapPath)) {
    console.error('sitemap.xml not found! Please run node generate_sitemap.js first.');
    process.exit(1);
  }

  const xmlContent = fs.readFileSync(sitemapPath, 'utf8');
  const locRegex = /<loc>(https?:\/\/[^<]+)<\/loc>/g;
  const urls = [];
  let match;

  while ((match = locRegex.exec(xmlContent)) !== null) {
    urls.push(match[1]);
  }

  return urls;
}

function submitToIndexNow(endpoint, host, key, keyLocation, urlList) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({
      host: host,
      key: key,
      keyLocation: keyLocation,
      urlList: urlList
    });

    const options = {
      hostname: endpoint,
      port: 443,
      path: '/indexnow',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Length': Buffer.byteLength(payload)
      }
    };

    const req = https.request(options, (res) => {
      let responseBody = '';
      res.on('data', (chunk) => responseBody += chunk);
      res.on('end', () => {
        resolve({
          endpoint: endpoint,
          statusCode: res.statusCode,
          statusMessage: res.statusMessage,
          body: responseBody
        });
      });
    });

    req.on('error', (err) => {
      reject({ endpoint: endpoint, error: err });
    });

    req.write(payload);
    req.end();
  });
}

function pingBingSitemap() {
  return new Promise((resolve, reject) => {
    const url = `https://www.bing.com/ping?sitemap=${encodeURIComponent(SITEMAP_URL)}`;
    https.get(url, (res) => {
      resolve(res.statusCode);
    }).on('error', (err) => resolve(null));
  });
}

async function run() {
  console.log('==============================================');
  console.log('       Bing & IndexNow Site Submitter         ');
  console.log('==============================================');
  console.log(`Host: ${HOST}`);
  console.log(`API Key: ${API_KEY}`);
  console.log(`Key Location: ${KEY_LOCATION}`);
  console.log(`Sitemap: ${SITEMAP_URL}`);

  const urls = getUrlsFromSitemap();
  console.log(`\nFound ${urls.length} URLs in sitemap.xml.\n`);

  console.log('1. Pinging Bing Search Engine with updated Sitemap...');
  const pingStatus = await pingBingSitemap();
  if (pingStatus === 200) {
    console.log(`   [SUCCESS] Bing Sitemap pinged successfully (HTTP ${pingStatus}).\n`);
  } else {
    console.log(`   [INFO] Bing Sitemap ping response code: ${pingStatus}\n`);
  }

  console.log('2. Submitting URLs via IndexNow Protocol...');
  for (const endpoint of INDEXNOW_ENDPOINTS) {
    console.log(`   Submitting ${urls.length} URLs to https://${endpoint}/indexnow ...`);
    try {
      const result = await submitToIndexNow(endpoint, HOST, API_KEY, KEY_LOCATION, urls);
      if (result.statusCode === 200 || result.statusCode === 202) {
        console.log(`   [SUCCESS] ${endpoint} returned HTTP ${result.statusCode} (${result.statusMessage}). All URLs indexed successfully!\n`);
      } else {
        console.log(`   [RESPONSE] ${endpoint} returned HTTP ${result.statusCode} (${result.statusMessage}).`);
        if (result.body) console.log(`   Details: ${result.body}\n`);
      }
    } catch (err) {
      console.error(`   [ERROR] Failed to connect to ${endpoint}:`, err.error ? err.error.message : err);
    }
  }

  console.log('==============================================');
  console.log('Bing & IndexNow Submission Process Complete.');
  console.log('==============================================');
}

run();
