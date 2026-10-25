// Every local link, script, stylesheet and image on every page must exist.
// Run: node tests/site.test.js   (exit 1 if anything is missing)
const fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..');
const pages = [];
(function walk(d) {
  for (const f of fs.readdirSync(d, { withFileTypes: true })) {
    if (['.git', 'node_modules'].includes(f.name)) continue;
    const p = path.join(d, f.name);
    f.isDirectory() ? walk(p) : p.endsWith('.html') && pages.push(p);
  }
})(root);
const errors = []; let checked = 0;
for (const page of pages) {
  const html = fs.readFileSync(page, 'utf8');
  for (const m of html.matchAll(/(?:src|href)="([^"]+)"/g)) {
    let ref = m[1];
    if (/^(https?:|mailto:|tel:|data:|#|javascript:)/.test(ref)) continue;
    ref = ref.split('#')[0].split('?')[0];
    if (!ref) continue;
    let target = path.resolve(path.dirname(page), ref);
    if (ref.endsWith('/')) target = path.join(target, 'index.html');
    else if (fs.existsSync(target) && fs.statSync(target).isDirectory()) target = path.join(target, 'index.html');
    checked++;
    if (!fs.existsSync(target)) errors.push(`${path.relative(root, page)}: "${m[1]}" does not exist`);
    if (!target.startsWith(root)) errors.push(`${path.relative(root, page)}: "${m[1]}" points outside the site`);
  }
}
errors.forEach(e => console.error('error: ' + e));
console.log(`${pages.length} pages, ${checked} local references checked, ${errors.length} error(s)`);
process.exit(errors.length ? 1 : 0);
