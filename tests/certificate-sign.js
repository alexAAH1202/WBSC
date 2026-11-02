// Adds the Chair's signature image to the unsigned official certificate and writes certificate/certificate-template.pdf.
//   node tests/certificate-sign.js && node tests/certificate-build.js
// Inputs: certificate/certificate-template-unsigned.pdf (WBSC's PDF as supplied) and certificate/nacho-pardo-signature.png.
// The form fields (umpire_name, completion_date) are left exactly as WBSC made them.
const fs = require('fs'), path = require('path');
const { PDFDocument } = require('../vendor/pdf-lib.min.js');
const dir = path.join(__dirname, '..', 'certificate');
(async () => {
  const doc = await PDFDocument.load(fs.readFileSync(path.join(dir, 'certificate-template-unsigned.pdf')));
  const img = await doc.embedPng(fs.readFileSync(path.join(dir, 'nacho-pardo-signature.png')));
  const w = 108, h = w * img.height / img.width, page = doc.getPage(0);
  // over the signature line (x 463-683, y about 106 from the bottom), slightly right of centre, above the name "Nacho Pardo"
  page.drawImage(img, { x: 600 - w / 2, y: 106, width: w, height: h });
  fs.writeFileSync(path.join(dir, 'certificate-template.pdf'), await doc.save());
  console.log('signed template written (' + Math.round(w) + ' x ' + Math.round(h) + ' pt)');
})();
