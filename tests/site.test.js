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
    // a link to a section of another page must name an id that exists there
    // (#assessment-<key> is a routed hash handled by the assessments page and is checked in bank.test.js)
    const frag = m[1].split('#')[1];
    if (frag && fs.existsSync(target) && target.endsWith('.html') && !frag.startsWith('assessment-') && path.resolve(target) !== path.resolve(page)) {
      if (!fs.readFileSync(target, 'utf8').includes(`id="${frag}"`)) errors.push(`${path.relative(root, page)}: "${m[1]}" points to a missing section`);
    }
    if (!target.startsWith(root)) errors.push(`${path.relative(root, page)}: "${m[1]}" points outside the site`);
  }
}
// Drive links on the home page must be the same manuals as on the Manuals page (and well-formed)
const manualDrive = new Set([...fs.readFileSync(path.join(root, 'manuals.html'), 'utf8').matchAll(/https:\/\/drive\.google\.com\/file\/d\/[^"]+/g)].map(m => m[0]));
for (const m of fs.readFileSync(path.join(root, 'index.html'), 'utf8').matchAll(/href="(https:\/\/drive\.google\.com[^"]*)"[^>]*>/g)) {
  if (!/^https:\/\/drive\.google\.com\/file\/d\/[\w-]+\/view\?usp=sharing$/.test(m[1])) errors.push('home page: malformed Drive link ' + m[1]);
  else if (!manualDrive.has(m[1])) errors.push('home page: Drive link is not one of the manuals on manuals.html: ' + m[1]);
  if (!/target="_blank"/.test(m[0]) || !/noopener/.test(m[0])) errors.push('home page: Drive link must open in a new tab with rel="noopener": ' + m[1]);
}
// --- site rules: self-hosted fonts, only the WBSC logo -------------------------------------
for (const page of pages) {
  const h = fs.readFileSync(page, 'utf8');
  if (/fonts\.googleapis\.com|fonts\.gstatic\.com/.test(h)) errors.push(`${path.relative(root, page)}: loads Google Fonts (fonts are hosted in /fonts)`);
}
const fontsCss = path.join(root, 'fonts', 'fonts.css');
if (!fs.existsSync(fontsCss)) errors.push('fonts/fonts.css is missing');
else for (const m of fs.readFileSync(fontsCss, 'utf8').matchAll(/url\('([^']+)'\)/g)) {
  if (!fs.existsSync(path.join(root, 'fonts', m[1]))) errors.push('fonts/fonts.css refers to a missing file: ' + m[1]);
}
if (!fs.existsSync(path.join(root, 'fonts', 'OFL.txt'))) errors.push('fonts/OFL.txt (font licence) is missing');
for (const f of fs.readdirSync(path.join(root, 'images'))) {
  if (/logo/i.test(f) && f !== 'wbsc-logo.svg') errors.push('images/' + f + ': only the WBSC logo (wbsc-logo.svg) may be on this site');
}
for (const page of pages) {
  for (const m of fs.readFileSync(page, 'utf8').matchAll(/(?:src|href)="(?:[^"]*\/)?([^"\/]*logo[^"\/]*)"/gi)) {
    if (m[1] !== 'wbsc-logo.svg') errors.push(`${path.relative(root, page)}: uses a logo other than the WBSC logo: ${m[1]}`);
  }
}
errors.forEach(e => console.error('error: ' + e));
console.log(`${pages.length} pages, ${checked} local references checked, ${errors.length} error(s)`);
process.exit(errors.length ? 1 : 0);
