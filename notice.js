// Small information pop-up about cookies and browser storage, shown once per browser on every page.
// The site sets no cookies and has no analytics, so this is a notice with an OK button, not a consent form.
// Remembering that it was dismissed uses one setting in localStorage ("wbscNoticeSeen"); the Privacy page says so.
// If you ever add analytics, embeds or anything that sets cookies, this must become a real consent choice.
(function(){
  var KEY = 'wbscNoticeSeen';
  try { if (localStorage.getItem(KEY)) return; } catch (e) {}
  var css = document.createElement('style');
  css.textContent =
    '.cookie-note{position:fixed;left:16px;bottom:16px;z-index:9000;max-width:380px;background:#fff;color:#16213a;' +
    'border:1px solid #cfd5df;border-top:4px solid #c8a24a;border-radius:4px;padding:16px 18px;box-shadow:0 8px 28px rgba(10,20,45,.28);' +
    'font-family:Roboto,Arial,sans-serif;font-size:.9rem;line-height:1.5;}' +
    '.cookie-note strong{display:block;margin-bottom:6px;font-size:.95rem;}' +
    '.cookie-note p{margin:0 0 12px;}' +
    '.cookie-note a{color:#0a1e46;text-decoration:underline;}' +
    '.cookie-note .row{display:flex;gap:12px;align-items:center;flex-wrap:wrap;}' +
    '.cookie-note button{font:inherit;font-weight:700;letter-spacing:.04em;text-transform:uppercase;background:#0a1e46;color:#fff;' +
    'border:2px solid #0a1e46;border-radius:2px;padding:8px 20px;cursor:pointer;}' +
    '.cookie-note button:focus-visible,.cookie-note a:focus-visible{outline:3px solid #c8a24a;outline-offset:2px;}' +
    '@media (max-width:520px){.cookie-note{left:8px;right:8px;bottom:8px;max-width:none;}}' +
    '@media print{.cookie-note{display:none;}}';
  document.head.appendChild(css);
  var T = window.WBSC_T || function(x){ return x; };
  var box = document.createElement('div');
  box.className = 'cookie-note';
  box.setAttribute('role', 'region');
  box.setAttribute('aria-label', T('Cookies and privacy'));
  function esc(t){ return String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;'); }
  box.innerHTML =
    '<strong>' + esc(T('Cookies and privacy')) + '</strong>' +
    '<p>' + esc(T('This site does not use cookies or tracking. It keeps what you type in your browser for this visit only. It contacts Google to email you a login code, to save your marked results and, if you stop a marked assessment part-way, to save your progress so you can resume on any device.')) + '</p>' +
    '<div class="row"><button type="button">' + esc(T('OK')) + '</button><a href="privacy.html">' + esc(T('Read the privacy page')) + '</a></div>';
  box.querySelector('button').addEventListener('click', function(){
    try { localStorage.setItem(KEY, '1'); } catch (e) {}
    if (box.parentNode) box.parentNode.removeChild(box);
  });
  function add(){ document.body.appendChild(box); }
  if (document.body) add(); else document.addEventListener('DOMContentLoaded', add);
})();
