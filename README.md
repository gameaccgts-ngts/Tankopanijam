# TankopaniJam — site

A static HTML/CSS/JS site recreated from `Presentation/TankopaniJam 2025.pptx`.
It mirrors the deck's "click-through" structure: a logo-driven home page, a
Table of Contents hub, and one page per topic, with the same keyword
cross-links the slides used.

## Run it

No build step. Either:

- **Double-click `index.html`** (works over `file://`), or
- Serve the folder: `python -m http.server 8000` then open <http://localhost:8000>.

## Structure

```
index.html            Home / hero (slide 1, the logo)
contents.html         Table of Contents hub (slide 2)
pages/                One page per topic (slides 3–18)
assets/css/style.css  Theme — palette pulled from the badge logo
assets/js/site.js     Injects the persistent header + footer + pager on every page
assets/img/           logo.png, alfred.jpeg, etc. (extracted from the .pptx)
```

## How navigation works

- The **logo** in the top-left is a persistent header on every page and links home.
- The header has a clean **"Contents ▾" dropdown** (all sections, numbered) plus a
  persistent **Sign Up** button.
- **`assets/js/site.js`** holds the ordered page list (`PAGES`). It builds the
  dropdown, the footer link list, and the prev/next pager from that one array —
  so adding or reordering a page is a single edit there.
- The original deck's **hyperlinked keywords** are preserved as `.xlink`
  links (e.g. Timeline → Patients / Check-ins / Judging Criteria / Awards).

## Interactive features

- **Team Sign-Up** (`pages/team-signup.html`, `assets/js/signup.js`) — a real,
  validated registration form. Dynamic 2–5 member rows, enforces the
  participation rules (engine, platform, sponsor, GPA 3.0+, shared-ownership
  attestation). On submit it saves to `localStorage`, downloads a JSON receipt,
  and — if you set `SUBMIT_ENDPOINT` at the top of `signup.js` to a form backend
  (Formspree, a serverless function, etc.) — POSTs the registration there.
  Stored registrations live under the `tankopani_registrations` localStorage key.
- **Judging Rubric** (`pages/rubric.html`, `assets/js/rubric.js`) — an interactive
  scorecard for judges built from the three measures (Alfred/tech, Jessie/education,
  Alicia/design). Score each criterion 0–5; per-measure subtotals and the grand
  total update live. Auto-saves a draft to `localStorage` and exports a JSON
  scorecard per game.

## Source mapping

| Page | Slide(s) |
|------|----------|
| index | 1 |
| contents | 2 |
| what-is-a-game-jam | 3 |
| summary | 4 |
| who | 5 |
| participation-requirements | 6 |
| timeline | 7 + 8 (the two "When" slides, merged) |
| judging-criteria | 9 |
| judging-day | 10 |
| patients | 11 |
| game-requirements | 12 |
| theme | 13 |
| check-ins | 14 |
| awards | 15 |
| judge-requirements | 16 |
| roi | 17 |
| alfred | 18 |

Text was lightly cleaned (encoding/smart-quote fixes, obvious typos) but kept
faithful to the deck. `Presentation/_extracted/` holds the raw images pulled
from the `.pptx` if you need the originals.
