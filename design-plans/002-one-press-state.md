# 002 — Give the site one press state

- **Status**: DONE — executed at commit 4b55cd8, shipped in ?v=235
- **Commit**: 4b55cd8
- **Severity**: HIGH
- **Category**: Purpose & frequency · Accessibility
- **Estimated scope**: 23 page sheets, one pasted block each

## Problem

Measured across `css/**/*.css`: **949 `:hover` rules, 2 `:active` rules.**

```css
/* css/header.css:48 — one of the two */
.sh-live:active{background:#8f2125}

/* css/pages/shorts.css:37 — the other */
.sh-shorts__act:active .sh-i{transform:scale(.92)}
```

The site is mobile-first and verified at 375. On a touch screen `:hover` does not
fire, so for a reader on a phone **almost every control on the site gives no
feedback at all between the finger going down and the page changing** — a tap on a
pager button, a section chip, a «كل الأخبار» link or a list row is indistinguishable
from a tap on dead space until navigation happens. On a slow connection that gap is
seconds long, and the usual result is a second tap.

Every one of those controls already carries a `transition` for colour and background
(`.16s ease`), so a press state costs nothing new to run — only a rule.

## Target

One pattern, three rules, in the site's own language: square, flat, no radius, no
shadow, no transform. Navy speaks, blue points, red stays out of it.

```css
/* target — the press pattern */

/* A. a control on a light ground: navy speaks for the moment it is held */
body[data-sh-page="<slug>"] :where(.sh-more,.sh-pager__btn,.sh-chip,.sh-tag,.sh-btn):active{
  background:var(--sh-navy);
  color:#fff;
  border-color:var(--sh-navy);
}

/* B. a control on the navy chrome or a dark band: it lifts out of the ground */
body[data-sh-page="<slug>"] :where(.sh-band,.sh-navy,[class*="--on-dark"]) :where(a,button):active{
  background:rgba(255,255,255,.18);
}

/* C. a whole row or tile that is one link: the ground steps, nothing moves */
body[data-sh-page="<slug>"] :where(.sh-list__row,.sh-card,.sh-fig,.sh-op__row):active{
  background:var(--color-surface-soft);
}
```

Timing: none is needed. Each of these properties is already inside the element's
existing `transition:...background .16s ease...`, which is the contract's colour band
(`DESIGN.md:345`), and a press must read as instant on the way in anyway.

`transform` is deliberately absent: `DESIGN.md` bans rounded corners and shadows and
the client reads scale-on-press as machine output. The ground stepping is the
newspaper equivalent and it survives `prefers-reduced-motion` untouched, since no
motion is involved.

## Repo conventions to follow

- The page slug lives on `<body>`: `<body data-sh-page="video">` (`video.html:52`).
  **Always write `body[data-sh-page="…"]`, never a bare `[data-sh-page]`** — the pager
  in `search.html:255` uses `<div data-sh-page="1">` on page batches and a bare
  selector would hit it.
- Shared sheets (`components`, `widgets`, `responsive`, `base`, `header`, `footer`,
  `chrome`) feed the four locked pages, so a press state must NOT be written there.
  It goes into each editable page's own sheet, scoped by the slug.
- Exemplar of a state rule written the site's way: `css/components.css:59`
  ```css
  @media (hover:hover){.sh-pager__btn:hover{border-color:var(--sh-blue);color:var(--sh-blue)}}
  ```
  Note the `@media (hover:hover)` gate on hover. A press rule gets **no** gate — a
  press happens on every input device.

## Steps

1. For each of the 23 editable page sheets below, append the three-rule block from
   **Target** to the end of the sheet, with `<slug>` replaced by that page's slug:

   | sheet | slug |
   | --- | --- |
   | `css/pages/404.css` | `404` |
   | `css/pages/about.css` | `about` |
   | `css/pages/archive.css` | `archive` |
   | `css/pages/author.css` | `author` |
   | `css/pages/category.css` | `category` |
   | `css/pages/contact.css` | `contact` |
   | `css/pages/coverage.css` | `coverage` |
   | `css/pages/data.css` | `data` |
   | `css/pages/files.css` | `files` |
   | `css/pages/map.css` | `map` |
   | `css/pages/newsletter.css` | `newsletter` |
   | `css/pages/now.css` | `now` |
   | `css/pages/photos.css` | `photos` |
   | `css/pages/privacy.css` | `privacy` |
   | `css/pages/saved.css` | `saved` |
   | `css/pages/search.css` | `search` |
   | `css/pages/sections.css` | `sections` |
   | `css/pages/shorts.css` | `shorts` |
   | `css/pages/tag.css` | `tag` |
   | `css/pages/terms.css` | `terms` |
   | `css/pages/video.css` | `video` |
   | `css/pages/video-watch.css` | `video-watch` |
   | `css/system-states.css` | `system-states` |

   Precede each block with this comment, once per sheet:
   ```css
   /* A press has to answer on a touch screen, where :hover never fires: the ground
      steps to navy for as long as the control is held. No transform and no radius —
      the timing is the colour transition the control already carries. */
   ```
2. Leave `css/pages/shorts.css:37` (`.sh-shorts__act:active .sh-i{transform:scale(.92)}`)
   exactly as it is. It is a purpose-built press on the shorts action rail and it
   predates this pattern.
3. Leave `css/header.css:48` (`.sh-live:active{background:#8f2125}`) exactly as it is.
   It is the live button's own darker red and it is already correct.

## Boundaries

- Do NOT write any press rule into `css/components.css`, `css/widgets.css`,
  `css/responsive.css`, `css/base.css`, `css/header.css`, `css/footer.css` or
  `css/chrome.css` — those reach the locked pages.
- Do NOT add a press state to `index.html`, `reels.html`, `live.html` or
  `article.html`, or to their sheets. Those four pages keep no press state for now;
  name that gap in the hand-off rather than closing it.
- Do NOT add `transform`, `box-shadow`, `border-radius` or `opacity` to the press.
- Do NOT gate the press behind `@media (hover:hover)`.
- Do NOT introduce a new token or a new colour; use `--sh-navy` and
  `--color-surface-soft`, which both already exist in `css/tokens.css`.
- If a class named in the `:where()` lists does not exist on a given page, leave the
  selector in place anyway — `:where()` costs nothing and keeps the block identical
  across sheets. Do NOT tailor the list per page.

## Verification

- **Mechanical**: bump `V` at `tools/chrome.py:25`, then
  ```bash
  python tools/chrome.py
  ```
  ```bash
  python tools/a11y.py
  ```
  Then confirm the count moved:
  ```bash
  grep -roh ":active" css/ --include=*.css | wc -l
  ```
  must report 25 (2 existing + 23 blocks × 1 … each block adds 3, so expect **71**;
  report the actual number rather than forcing it).
- **Feel check** — a press cannot be judged from source. In a browser at 375 with
  touch emulation on, and at 1280 with a mouse, on `search.html`, `category.html`,
  `video.html` and `saved.html`: hold a pager button, a chip and a list row and
  confirm the ground steps to navy immediately and returns on release, that the label
  stays readable white on navy for the whole hold, and that nothing shifts position by
  a pixel.
- **Contrast**: white on `--sh-navy` is the pair the site already ships on every navy
  band; no new measurement is required. If you introduce any other pair, measure it.
- **No regression**: no horizontal overflow and no console errors at 1280 and 375.
