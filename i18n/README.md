# Translations

English is the source. Every other language is a translation of the English text on the page or in `questions.js`.
A missing translation falls back to English; it never breaks a page.

## Files
- `i18n.js`: the language menu, the page translator and `T()` for text the page scripts make. `LIVE` lists the languages shown to everyone (now English only).
- `i18n/src/<lang>.tsv`: page text. One line per string: `number<TAB>translation`. The number matches the line in `i18n/en-strings.json`.
- `i18n/src/q-en.tsv` and `i18n/src/q-<lang>.tsv`: quiz titles, questions, options and `why` explanations, keyed like `m06-pca.3.o2`.
- `i18n/<lang>.js` and `i18n/q-<lang>.js`: generated. Do not edit them.

## Editing a translation
1. Edit the line in the `.tsv` (keep `{placeholders}`, HTML tags such as `<strong>`, numbers and abbreviations like U1, PU, HP, F8, 1B).
2. `node tests/i18n-build.js` and `node tests/i18n-build-questions.js` rebuild the generated files and check placeholders, tags and numbers match the English.
3. `node tests/i18n.test.js` checks nothing is missing.

## When the English changes
Run `node tests/i18n-extract.js` to refresh `en-strings.json` and `q-en.tsv`, translate the new lines in each `.tsv`, then rebuild.
Quiz answers are marked by option position, so reordering or editing translated options never changes what is correct.

## Reviewing a language
Open any page with `?langs=all` (a menu appears) or `?lang=es`. Check meaning first, then terminology, then tone.
Keep these English terms in the translation as the WBSC manuals use them: U1, U2, U3, PU, HP, ULF, URF, F7, F8, F9, POP, FEET (the Four Essential Elements).

## Glossary
| English | es | fr | ja | ko | zh |
|---|---|---|---|---|---|
| umpire | árbitro | arbitre | 審判員 | 심판 | 裁判员 |
| Plate umpire (PU) | árbitro de home (PU) | arbitre au marbre (PU) | 球審 (PU) | 구심 (PU) | 主审 (PU) |
| base umpire | árbitro de base | arbitre de but | 塁審 | 루심 | 垒审 |
| Four Essential Elements | Cuatro Elementos Esenciales | Quatre éléments essentiels | 4つの基本要素 | 네 가지 핵심 요소 | 四大基本要素 |
| backfill | backfilling | backfilling | バックフィル | 백필 (backfill) | 补位 (backfill) |
| tag up | tag up | tag-up | タッグアップ | 태그업 | 触垒返回 |
| leading edge | borde de ataque | bord d’attaque | リーディングエッジ | 리딩 에지 | 前缘 |
| Knowledge Check | Comprobación de conocimientos | Vérification des connaissances | 理解度チェック | 지식 점검 | 知识自测 |

(Reviewers: please correct this table too; the glossary is a starting point and the pages are the authority.)
