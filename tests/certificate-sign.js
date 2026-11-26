// Adds the signatory's signature image to the unsigned official certificate and writes certificate/certificate-template.pdf.
//   node tests/certificate-sign.js && node tests/certificate-build.js
// Inputs: certificate/certificate-template-unsigned.pdf (WBSC's PDF as supplied) and certificate/leigh-evans-signature.png.
// The printed signatory (Nacho Pardo, Chair Softball Umpiring Commission) is covered with white and replaced, as the owner asked,
// by Leigh Evans, Umpire Director, WBSC Oceania (Spanish line in gold italic, like the template).
// The emblem at the top is replaced by the WBSC Oceania logo (certificate/wbsc-oceania-logo-dark.png), as the owner asked.
// The form fields (umpire_name, completion_date) are left exactly as WBSC made them.
const fs = require('fs'), path = require('path');
const { PDFDocument, rgb, StandardFonts, PDFName, PDFArray, decodePDFRawStream } = require('../vendor/pdf-lib.min.js');
const dir = path.join(__dirname, '..', 'certificate');
(async () => {
  const doc = await PDFDocument.load(fs.readFileSync(path.join(dir, 'certificate-template-unsigned.pdf')));
  const img = await doc.embedPng(fs.readFileSync(path.join(dir, 'leigh-evans-signature.png')));
  const w = 104, h = w * img.height / img.width, page = doc.getPage(0);
  // signatory block: the template's three lines are centred on x 573, 11 pt high, top at 492.75 / 505.75 / 518.75 pt from the top
  // take the old signatory's three lines out of the page's text (so they cannot be selected or found), not just paint over them
  const OLD = ['(Nacho Pardo) Tj', '(Chair Softball Umpiring Commission) Tj', '(Presidente de la Comisi\\002n de Arbitraje de Softbol) Tj'];
  const cont = page.node.get(PDFName.of('Contents')), refs = cont instanceof PDFArray ? cont.asArray() : [cont];
  let removed = 0;
  for (const ref of refs) {
    const raw = doc.context.lookup(ref);
    let text = Buffer.from(decodePDFRawStream(raw).decode()).toString('latin1');
    for (const o of OLD) if (text.includes(o)) { text = text.split(o).join('() Tj'); removed++; }
    doc.context.assign(ref, doc.context.flateStream(Buffer.from(text, 'latin1')));
  }
  if (removed !== OLD.length) throw new Error('expected the three signatory lines in the template, found ' + removed);
  const H = page.getHeight(), bold = await doc.embedFont(StandardFonts.HelveticaBold), reg = await doc.embedFont(StandardFonts.Helvetica),
        ital = await doc.embedFont(StandardFonts.HelveticaOblique), size = 10.5, cxs = 573;
  page.drawRectangle({ x: 455, y: H - 532, width: 245, height: 41, color: rgb(1, 1, 1) });
  [['Leigh Evans', bold, rgb(0, 0, 0), 503.75], ['Umpire Director, WBSC Oceania', reg, rgb(0, 0, 0), 516.75],
   ['Director de Árbitros, WBSC Oceanía', ital, rgb(165 / 255, 141 / 255, 45 / 255), 529.75]].forEach(([t, f, c, yMax]) => {
    page.drawText(t, { x: cxs - f.widthOfTextAtSize(t, size) / 2, y: H - yMax + 2.6, size, font: f, color: c });
  });
  // over the signature line (x 463-683, y about 106 from the bottom), centred above the name
  page.drawImage(img, { x: 604 - w / 2, y: 107, width: w, height: h });
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
