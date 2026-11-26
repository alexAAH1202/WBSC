// Adds the Chair's signature image to the unsigned official certificate and writes certificate/certificate-template.pdf.
//   node tests/certificate-sign.js && node tests/certificate-build.js
// Inputs: certificate/certificate-template-unsigned.pdf (WBSC's PDF as supplied) and certificate/nacho-pardo-signature.png.
// The emblem at the top is replaced by the WBSC Oceania logo (certificate/wbsc-oceania-logo-dark.png), as the owner asked.
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
  // The old emblem (x 363-478, y 441-554 from the bottom) is covered with white, like the white halo it sat in, and the
  // WBSC Oceania logo (a dark-lettered copy, certificate/wbsc-oceania-logo-dark.png) is placed above the gold border line.
  const logo = await doc.embedPng(fs.readFileSync(path.join(dir, 'wbsc-oceania-logo-dark.png')));
  const cx = page.getWidth() / 2;
  page.drawRectangle({ x: cx - 62, y: 438, width: 124, height: 120, color: rgb(1, 1, 1) });
  // close the gold frame: the line the old emblem used to hide (3 pt thick, 113.5-116.5 pt from the top, colour 200/182/78)
  page.drawRectangle({ x: cx - 68, y: page.getHeight() - 116.5, width: 136, height: 3, color: rgb(200 / 255, 182 / 255, 78 / 255) });
  const lw = 150, lh = lw * logo.height / logo.width;
  page.drawImage(logo, { x: cx - lw / 2, y: page.getHeight() - 44 - lh, width: lw, height: lh });
  fs.writeFileSync(path.join(dir, 'certificate-template.pdf'), await doc.save());
  console.log('signed template written (' + Math.round(w) + ' x ' + Math.round(h) + ' pt)');
})();
