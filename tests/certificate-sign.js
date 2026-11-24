// Adds the Chair's signature image to the unsigned official certificate and writes certificate/certificate-template.pdf.
//   node tests/certificate-sign.js && node tests/certificate-build.js
// Inputs: certificate/certificate-template-unsigned.pdf (WBSC's PDF as supplied) and certificate/nacho-pardo-signature.png.
// The emblem at the top is covered by a charcoal panel carrying the WBSC Oceania logo (images/wbsc-oceania-logo.png), as the owner asked.
// The form fields (umpire_name, completion_date) are left exactly as WBSC made them.
const fs = require('fs'), path = require('path');
const { PDFDocument, rgb } = require('../vendor/pdf-lib.min.js');
const dir = path.join(__dirname, '..', 'certificate');
(async () => {
  const doc = await PDFDocument.load(fs.readFileSync(path.join(dir, 'certificate-template-unsigned.pdf')));
  const img = await doc.embedPng(fs.readFileSync(path.join(dir, 'nacho-pardo-signature.png')));
  const w = 108, h = w * img.height / img.width, page = doc.getPage(0);
  // over the signature line (x 463-683, y about 106 from the bottom), slightly right of centre, above the name "Nacho Pardo"
  page.drawImage(img, { x: 600 - w / 2, y: 106, width: w, height: h });
  // logo panel over the old emblem (the emblem spans x 363-478, y 441-554 from the bottom)
  const logo = await doc.embedPng(fs.readFileSync(path.join(dir, '..', 'images', 'wbsc-oceania-logo.png')));
  const pw = 156, ph = 116, cx = page.getWidth() / 2, py = 441;
  page.drawRectangle({ x: cx - pw / 2, y: py, width: pw, height: ph, color: rgb(0.165, 0.176, 0.192) });
  page.drawRectangle({ x: cx - pw / 2, y: py, width: pw, height: 3, color: rgb(0.78, 0.635, 0.29) });   // gold edge, as on the site
  const lw = 128, lh = lw * logo.height / logo.width;
  page.drawImage(logo, { x: cx - lw / 2, y: py + (ph - lh) / 2 + 2, width: lw, height: lh });
  fs.writeFileSync(path.join(dir, 'certificate-template.pdf'), await doc.save());
  console.log('signed template written (' + Math.round(w) + ' x ' + Math.round(h) + ' pt)');
})();
