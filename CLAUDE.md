# WBSC Umpire Mechanics Training portal: project rules

A temporary training site (not the official WBSC website) on GitHub Pages, with a Google Apps Script
backend that saves results to a Google Sheet. Read [`README.md`](./README.md) for the layout, the pass
mark and attempt rules, and how to deploy. The earlier generic quiz lives in [`demo/`](./demo/) with its own
`CLAUDE.md`.

## Rules

- **Merging to `main` or redeploying the Apps Script / Worker needs the owner's OK.**
- **Never commit secrets** (passwords, keys). The Web App URL and the Director of Umpires' address are
  already public in the pages and are fine.
- **Relative links only**, so the site works at `/WBSC/` or anywhere else. `node tests/site.test.js` checks them.
- **Save before email, and the server decides.** `apps-script/Code.gs` decides PASS / NOT PASSED (85%) and
  refuses a third attempt. The values in `assessment-widget.html` are display only: keep `PASS_MARK`,
  `MAX_ATTEMPTS` and the contact address equal in both files.
- **Update the existing Apps Script deployment with a new version.** A "New deployment" creates a different
  URL and breaks the page. If the URL ever changes, update `APPS_SCRIPT_URL` in `assessment-widget.html` and
  `tests/widget.test.js`.
- **Only the WBSC logo (`images/wbsc-logo.svg`) may appear on the site.** No partner, sponsor or other organisation logos. `tests/site.test.js` fails if one is added.
- **Fonts are hosted in `fonts/`** (Roboto, OFL licence). Do not load Google Fonts or any other third-party font service.
- **The temporary-site notice must stay on every page** ("This is not the official WBSC website"). The tests
  fail if it is removed.
- Before pushing, run: `node tests/bank.test.js && node tests/site.test.js && node tests/code-gs.test.js`.
- **Secrets stay in Script properties** (`RESULTS_PASSWORD`, `ALERT_EMAIL`). `results.html` must stay `noindex` and out of the main menu (it is linked only from the footer as "Director login").
- **Questions live in `questions.js`**, not in the page. Only the `Presentation Competency Assessment` is recorded; `Manual Knowledge Check` is unmarked practice and the server refuses to save it.
- **Keep `privacy.html` true.** If the site starts collecting or storing anything new (analytics, cookies, new fields, new emails), update it and `notice.js`. `notice.js` must be loaded on every page.
- **English is the source for every translation.** Page text and quiz questions are translated into Spanish, French, Japanese, Korean and Chinese (`i18n/`, see `i18n/README.md`). When you change English text on a page, in `notice.js` or in `questions.js`, update the `.tsv` files in `i18n/src/` and rebuild (`node tests/i18n-extract.js`, `node tests/i18n-build.js`, `node tests/i18n-build-questions.js`); `node tests/i18n.test.js` fails if a string or question lacks a translation. A language is shown to the public only when its code is in `LIVE` in `i18n.js`, which needs a native-speaker reviewer's sign-off. `results.html` (Director page), manuals, presentations and the emails stay in English. The server (`Code.gs`) decides PASS / NOT PASSED on the answer index, never on translated text.
