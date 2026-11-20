// Run after any page generator and before publishing static HTML.
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const common = '\n<link rel="stylesheet" href="/assets/fonts/fonts.css?v=20261120">\n<link rel="stylesheet" href="/assets/site-consent.css?v=20261120-1">\n<script src="/assets/site-consent.js?v=20261120-1" defer></script>\n';
let total = 0;
function walk(directory) {
  for (const item of fs.readdirSync(directory, { withFileTypes: true })) {
    if (['.git', 'node_modules'].includes(item.name)) continue;
    const file = path.join(directory, item.name);
    if (item.isDirectory()) { walk(file); continue; }
    if (!file.endsWith('.html')) continue;
    let html = fs.readFileSync(file, 'utf8');
    if (!/<html\b/i.test(html)) continue; // HTML fragments are not standalone pages.
    if (!/<\/head>/i.test(html) && /<(?:body|header|main)\b/i.test(html)) {
      html = html.replace(/<(body|header|main)\b/i, '</head>\n<$1');
    }
    if (!/<\/head>/i.test(html)) throw new Error('Missing head: ' + file);
    if (!html.includes('/assets/site-consent.js?')) {
      html = html.replace(/<\/head>/i, common + '</head>');
      fs.writeFileSync(file, html);
    }
    total++;
  }
}
walk(root);
console.log('Consent configured on ' + total + ' HTML pages.');
