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
- **The temporary-site notice must stay on every page** ("This is not the official WBSC website"). The tests
  fail if it is removed.
- Before pushing, run: `node tests/bank.test.js && node tests/site.test.js && node tests/code-gs.test.js`.
