// Language support: the selector, the page translator and the T() helper.
//
// English is the source text and the fallback. A language is a file in i18n/ that maps an English string to its
// translation (i18n/<code>.js, and i18n/q-<code>.js for the quiz questions). Any string without a translation stays
// in English, so a missing translation can never break a page.
//
// A language is shown to everyone only when its code is in LIVE below. Add a code here once a native speaker has
// reviewed that language. Reviewers can preview any language with ?langs=all on any page (see i18n/README.md).
(function () {
  'use strict';
  var LANGS = [
    { c: 'en', n: 'English', s: 'EN' },
    { c: 'es', n: 'Español', s: 'ES' },
    { c: 'fr', n: 'Français', s: 'FR' },
    { c: 'ja', n: '日本語', s: '日本語' },
    { c: 'ko', n: '한국어', s: '한국어' },
    { c: 'zh', n: '中文', s: '中文' }
  ];
  var LIVE = ['en', 'es'];            // languages switched on for everyone; es is on for now (not yet reviewed). Others stay hidden until reviewed
  var KEY = 'wbscLang', PREVIEW_KEY = 'wbscLangPreview';

  function qs(name) { try { return new URLSearchParams(location.search).get(name); } catch (e) { return null; } }
  function known(c) { for (var i = 0; i < LANGS.length; i++) if (LANGS[i].c === c) return LANGS[i]; return null; }
  var preview = false;
  try {
    if (qs('langs') === 'all') sessionStorage.setItem(PREVIEW_KEY, '1');
    preview = sessionStorage.getItem(PREVIEW_KEY) === '1' || !!qs('lang');
  } catch (e) { preview = !!qs('lang'); }
  function allowed(c) { return LIVE.indexOf(c) >= 0 || preview; }

  var lang = 'en';
  try {
    var want = qs('lang') || localStorage.getItem(KEY);
    if (want && known(want) && allowed(want)) lang = want;
    if (qs('lang') && lang === qs('lang')) localStorage.setItem(KEY, lang);
  } catch (e) {}

  var DICT = window.WBSC_DICT = window.WBSC_DICT || {};
  window.WBSC_QDICT = window.WBSC_QDICT || {};

  // Load the dictionary before any later script runs, so T() works from the first line of a page script.
  var me = document.currentScript;
  if (lang !== 'en') {
    document.documentElement.setAttribute('lang', lang);
    document.documentElement.classList.add('i18n-pending');
    document.write('<script src="i18n/' + lang + '.js"><\/script>');
    if (me && me.getAttribute('data-quiz') !== null) document.write('<script src="i18n/q-' + lang + '.js"><\/script>');
  }

  function table() { return (DICT[lang] && DICT[lang].t) || {}; }
  function norm(s) { return String(s).replace(/\s+/g, ' ').trim(); }

  // T(text, values): the translated text with the values filled in, for example T('Attempt {n}', { n: 2 }).
  function T(str, vars) {
    var tr = lang === 'en' ? null : table()[norm(str)];
    var out = tr != null ? tr : str;
    if (vars) for (var k in vars) if (Object.prototype.hasOwnProperty.call(vars, k)) out = out.split('{' + k + '}').join(vars[k]);
    return out;
  }

  // ------------------------------------------------------------------ translating the page
  var INLINE = { A: 1, STRONG: 1, EM: 1, B: 1, I: 1, SPAN: 1, BR: 1, CODE: 1, SMALL: 1, SUP: 1, SUB: 1, ABBR: 1, MARK: 1, U: 1 };
  var SKIP = { SCRIPT: 1, STYLE: 1, NOSCRIPT: 1, SVG: 1, TEXTAREA: 1, SELECT: 1, IFRAME: 1, TEMPLATE: 1 };
  var ATTRS = ['placeholder', 'aria-label', 'alt', 'title'];
  var HAS_LETTER = /[A-Za-zÀ-ɏ]/;

  function inlineOnly(el) {
    for (var n = el.firstChild; n; n = n.nextSibling) {
      if (n.nodeType === 3 || n.nodeType === 8) continue;
      if (n.nodeType !== 1 || !INLINE[n.tagName] || !inlineOnly(n)) return false;
    }
    return true;
  }
  function hasText(el) { for (var n = el.firstChild; n; n = n.nextSibling) if (n.nodeType === 3 && n.nodeValue.trim()) return true; return false; }
  function visible(el) { return el.getAttribute('translate') !== 'no' && !el.classList.contains('notranslate'); }

  // Calls fn(element, englishKey) for every translatable unit under root, and fn(textNode, englishKey) for loose text
  // that sits beside other elements (for example a label next to an icon).
  function units(root, fn) {
    var kids = root.children;
    for (var i = 0; i < kids.length; i++) {
      var el = kids[i];
      if (SKIP[el.tagName.toUpperCase()] || !visible(el) || el.hasAttribute('data-i18n-skip')) continue;
      // A unit is an element with its own text and nothing but inline markup inside (a paragraph, a button, a label).
      // An element that only holds other elements (a menu of links, a row of spans) is searched instead.
      if (hasText(el) && inlineOnly(el)) { if (HAS_LETTER.test(el.textContent)) fn(el, norm(el.innerHTML)); }
      else {
        for (var n = el.firstChild; n; n = n.nextSibling) if (n.nodeType === 3 && HAS_LETTER.test(n.nodeValue)) fn(n, norm(n.nodeValue));
        units(el, fn);
      }
    }
  }
  function attrs(root, fn) {
    var all = root.querySelectorAll('[placeholder],[aria-label],[alt],[title]');
    for (var i = 0; i < all.length; i++) {
      if (!visible(all[i])) continue;
      for (var j = 0; j < ATTRS.length; j++) {
        var v = all[i].getAttribute(ATTRS[j]);
        if (v && HAS_LETTER.test(v)) fn(all[i], ATTRS[j], norm(v));
      }
    }
  }

  function apply(root) {
    var t = table();
    units(root || document.body, function (el, key) {
      var tr = t[key];
      if (tr != null && el.nodeType === 3) { var m = /^(\s*)[\s\S]*?(\s*)$/.exec(el.nodeValue); el.nodeValue = m[1] + tr + m[2]; }
      else if (tr != null) { if (el.querySelector('[id]')) replaceKeepingIds(el, tr); else el.innerHTML = tr; }
    });
    attrs(root || document.body, function (el, a, key) { var tr = t[key]; if (tr != null) el.setAttribute(a, tr); });
  }
  // A unit that contains elements with an id (a link the page script finds by id, say) keeps those same elements,
  // so listeners and attributes set by the page scripts survive; only their inner text is replaced.
  function replaceKeepingIds(el, tr) {
    var keep = {}, ids = el.querySelectorAll('[id]'), i;
    for (i = 0; i < ids.length; i++) keep[ids[i].id] = ids[i];
    el.innerHTML = tr;
    for (var id in keep) {
      var fresh = el.querySelector('[id="' + id + '"]');
      if (fresh) { keep[id].innerHTML = fresh.innerHTML; fresh.parentNode.replaceChild(keep[id], fresh); }
    }
  }

  // ------------------------------------------------------------------ the selector
  var CSS =
    '.lang-switch{position:relative;margin-left:8px;}' +
    '.lang-btn{display:flex;align-items:center;gap:8px;background:transparent;color:#fff;border:1px solid rgba(255,255,255,.35);border-radius:2px;padding:8px 12px;cursor:pointer;font:inherit;font-weight:700;letter-spacing:.04em;}' +
    '.lang-btn:hover,.lang-btn[aria-expanded="true"]{background:rgba(255,255,255,.12);}' +
    '.lang-btn:focus-visible,.lang-item:focus-visible{outline:3px solid #c8a24a;outline-offset:2px;}' +
    '.lang-btn svg{width:18px;height:18px;flex-shrink:0;}' +
    '.lang-menu{position:absolute;right:0;top:calc(100% + 8px);min-width:170px;background:#fff;color:#16213a;border-radius:4px;box-shadow:0 8px 28px rgba(10,20,45,.35);padding:6px 0;margin:0;list-style:none;z-index:9500;}' +
    '.lang-menu[hidden]{display:none;}' +
    '.lang-item{display:block;width:100%;text-align:left;background:transparent;border:0;color:inherit;font:inherit;font-size:1rem;padding:11px 18px;cursor:pointer;}' +
    '.lang-item:hover{background:#f1f3f7;}' +
    '.lang-item[aria-current="true"]{font-weight:700;color:#0a1e46;background:#eef1f7;}' +
    '@media (max-width:760px){.lang-switch{margin:0;padding:12px 24px;border-top:1px solid rgba(255,255,255,.18);}.lang-menu{left:24px;right:auto;}}' +
    '.lang-note{background:#eef1f7;color:#16213a;border-bottom:1px solid #cfd5df;padding:10px 24px;font-size:.88rem;text-align:center;}' +
    'html.i18n-pending body{visibility:hidden;}' +
    'html[lang="ja"] body,html[lang="ja"] button,html[lang="ja"] input{font-family:Roboto,"Hiragino Sans","Hiragino Kaku Gothic ProN","Yu Gothic","Meiryo","Noto Sans JP",sans-serif;}' +
    'html[lang="ko"] body,html[lang="ko"] button,html[lang="ko"] input{font-family:Roboto,"Apple SD Gothic Neo","Malgun Gothic","Noto Sans KR",sans-serif;}' +
    'html[lang="zh"] body,html[lang="zh"] button,html[lang="zh"] input{font-family:Roboto,"PingFang SC","Microsoft YaHei","Noto Sans SC","Noto Sans CJK SC",sans-serif;}' +
    'html[lang="ja"] h1,html[lang="ja"] h2,html[lang="ja"] h3,html[lang="ja"] h4,html[lang="ko"] h1,html[lang="ko"] h2,html[lang="ko"] h3,html[lang="ko"] h4,html[lang="zh"] h1,html[lang="zh"] h2,html[lang="zh"] h3,html[lang="zh"] h4{letter-spacing:0;}';

  var GLOBE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="9.5"/><path d="M2.5 12h19M12 2.5c2.6 2.7 4 5.9 4 9.5s-1.4 6.8-4 9.5c-2.6-2.7-4-5.9-4-9.5s1.4-6.8 4-9.5z"/></svg>';

  function choose(c) {
    try { localStorage.setItem(KEY, c); } catch (e) {}
    var u = new URL(location.href); u.searchParams.delete('lang');
    location.href = u.toString();
  }

  function buildSelector() {
    var list = LANGS.filter(function (l) { return allowed(l.c); });
    if (list.length < 2) return;
    var row = document.querySelector('.header-row');
    if (!row || row.querySelector('.lang-switch')) return;
    var cur = known(lang);
    var box = document.createElement('div'); box.className = 'lang-switch'; box.setAttribute('translate', 'no');
    var btn = document.createElement('button');
    btn.type = 'button'; btn.className = 'lang-btn'; btn.setAttribute('aria-expanded', 'false');   // a disclosure button: the list below it is ordinary buttons
    btn.setAttribute('aria-label', T('Language') + ': ' + cur.n);
    btn.innerHTML = GLOBE + '<span>' + cur.s + '</span>';
    var menu = document.createElement('ul'); menu.className = 'lang-menu'; menu.hidden = true;
    list.forEach(function (l) {
      var li = document.createElement('li'), b = document.createElement('button');
      b.type = 'button'; b.className = 'lang-item'; b.setAttribute('lang', l.c); b.textContent = l.n;
      if (l.c === lang) b.setAttribute('aria-current', 'true');
      b.addEventListener('click', function () { if (l.c === lang) { close(); return; } choose(l.c); });
      li.appendChild(b); menu.appendChild(li);
    });
    function close() { menu.hidden = true; btn.setAttribute('aria-expanded', 'false'); }
    btn.addEventListener('click', function (e) { e.stopPropagation(); var open = menu.hidden; menu.hidden = !open; btn.setAttribute('aria-expanded', String(open)); });
    document.addEventListener('click', function (e) { if (!box.contains(e.target)) close(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !menu.hidden) { close(); btn.focus(); } });
    // Arrow keys, Home and End move through the languages (Tab works too).
    var items = menu.querySelectorAll('.lang-item');
    function step(from, d) { var i = Array.prototype.indexOf.call(items, from); items[d === 0 ? 0 : d === 9 ? items.length - 1 : (i + d + items.length) % items.length].focus(); }
    btn.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); menu.hidden = false; btn.setAttribute('aria-expanded', 'true'); (menu.querySelector('[aria-current]') || items[0]).focus(); }
    });
    menu.addEventListener('keydown', function (e) {
      var d = e.key === 'ArrowDown' ? 1 : e.key === 'ArrowUp' ? -1 : e.key === 'Home' ? 0 : e.key === 'End' ? 9 : null;
      if (d !== null && document.activeElement.classList.contains('lang-item')) { e.preventDefault(); step(document.activeElement, d); }
    });
    box.appendChild(btn); box.appendChild(menu);
    var toggle = row.querySelector('.nav-toggle');
    var nav = row.querySelector('nav');
    if (window.matchMedia && window.matchMedia('(max-width:760px)').matches && nav) nav.appendChild(box);
    else row.insertBefore(box, toggle || null);
  }

  // A short note on translated pages: the English text is the reference.
  var NOTE = 'This page is translated from English. The manuals and presentations are in English. If the translation and the English text differ, the English text applies.';
  function addNote() {
    var main = document.querySelector('main');
    if (!main || document.querySelector('.lang-note')) return;
    var d = document.createElement('div'); d.className = 'lang-note'; d.setAttribute('role', 'note'); d.textContent = T(NOTE);
    main.parentNode.insertBefore(d, main);
  }

  function ready() {
    var st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st);
    if (lang !== 'en') {
      try {
        apply(document.body);
        var t = table();
        var d = document.querySelector('meta[name="description"]');
        if (d && t[norm(d.getAttribute('content'))]) d.setAttribute('content', t[norm(d.getAttribute('content'))]);
        if (t[norm(document.title)]) document.title = t[norm(document.title)];
      } catch (e) { if (window.console) console.error('Translation failed', e); }
      document.documentElement.classList.remove('i18n-pending');
    }
    buildSelector();
    if (lang !== 'en') addNote();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ready); else ready();
  // Never leave a page hidden if something goes wrong.
  setTimeout(function () { document.documentElement.classList.remove('i18n-pending'); }, 3000);

  window.WBSC_I18N = { lang: lang, langs: LANGS, live: LIVE, T: T, apply: apply, units: units, attrs: attrs, norm: norm };
  window.WBSC_T = T;
})();
