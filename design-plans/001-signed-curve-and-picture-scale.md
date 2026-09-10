# 001 — Put the 30 page-sheet picture scales on the signed curve and the contract's band

- **Status**: DONE — executed and shipped in ?v=236
- **Commit**: 4b55cd8
- **Severity**: MEDIUM
- **Category**: Cohesion & tokens · Easing & duration
- **Estimated scope**: 5 files, 30 declarations, mechanical

## Problem

`DESIGN.md:345` states the contract:

> anything that moves or scales rides `cubic-bezier(.2,.7,.2,1)` — 0.35–0.5s for a lift or a deck, 0.8–1.2s for a picture's hover scale or a crossfade settle.

The site uses two nearly identical curves. Measured across `css/**/*.css` (excluding the generated `css/ltr.css`):

| curve | total | in the four locked sheets | in editable page sheets |
| --- | --- | --- | --- |
| `cubic-bezier(.2,.7,.2,1)` — the contract | 29 | 15 (index 9, article 3, reels 2, live 1) | 14 (components 9, files 2, brief 1, chrome 1, header 1) |
| `cubic-bezier(.2,.75,.2,1)` — undocumented | 39 | 9 (index) | **30** (video 17, sections 6, author 5, files 1, photos 1) |

The two curves are visually indistinguishable — the only difference is the second control point's y (0.75 vs 0.70). There is no comment, no doc line and no pattern that explains the fork: it is drift.

Every one of the 30 editable occurrences is the same declaration on a picture's hover scale, and every one is also **below** the contract's 0.8–1.2s band for exactly that gesture:

```css
/* css/pages/video.css — 17 declarations, all identical */
transition:transform .6s cubic-bezier(.2,.75,.2,1)

/* css/pages/sections.css — 6 declarations */
transition:transform .7s cubic-bezier(.2,.75,.2,1)

/* css/pages/author.css — 5 declarations */
transition:transform .7s cubic-bezier(.2,.75,.2,1)

/* css/pages/files.css — 1 declaration */
transition:transform .7s cubic-bezier(.2,.75,.2,1)

/* css/pages/photos.css — 1 declaration */
transition:transform .6s cubic-bezier(.2,.75,.2,1)
```

The reference pages already obey the contract — `css/pages/index.css:95` runs its lead picture at `transform 1.2s cubic-bezier(.2,.7,.2,1)`. So the locked pages are right and the page sheets drifted, not the other way round.

### Three other curves exist and each has a reason — do NOT touch them

- `css/header.css:33,34` — `cubic-bezier(.2,.6,.3,1)` on `sh-meteor` / `sh-meteor-head`. The masthead meteor is a documented motif with its own arc; a lift curve would flatten it.
- `css/pages/shorts.css:50` — `cubic-bezier(.2,.8,.2,1)` on `sh-shorts-heart`. A like pops; it is not a lift.
- `css/pages/index.css:269` — `cubic-bezier(.2,.6,.2,1)` on a 6s slow pan. Locked sheet, and a 6s drift is not a lift.

## Target

All 30 declarations become, verbatim:

```css
transition:transform .8s cubic-bezier(.2,.7,.2,1)
```

`.8s` is the bottom of the contract's picture band, so it is the smallest move that lands inside it.

After the change, `cubic-bezier(.2,.75,.2,1)` survives only in `css/pages/index.css` (9 occurrences), which is locked. Record that in the plan's outcome; do not edit `index.css`.

## Repo conventions to follow

- Page sheets live in `css/pages/<page>.css` and are loaded per page; shared sheets are `css/{components,widgets,responsive,base,header,footer,chrome}.css`.
- Exemplar of the contract done right: `css/pages/index.css:95`
  ```css
  .sh-lc__lead-img{...;transition:transform 1.2s cubic-bezier(.2,.7,.2,1)}
  ```
- `css/ltr.css` is **generated** by `python tools/ltr.py`. Never edit it by hand; re-run the tool.

## Steps

1. In `css/pages/video.css`, replace every occurrence of the exact string
   `transform .6s cubic-bezier(.2,.75,.2,1)` with `transform .8s cubic-bezier(.2,.7,.2,1)`.
   Expect **17** replacements.
2. In `css/pages/sections.css`, replace every `transform .7s cubic-bezier(.2,.75,.2,1)`
   with `transform .8s cubic-bezier(.2,.7,.2,1)`. Expect **6**.
3. In `css/pages/author.css`, same replacement. Expect **5**.
4. In `css/pages/files.css`, same replacement. Expect **1**.
5. In `css/pages/photos.css`, replace `transform .6s cubic-bezier(.2,.75,.2,1)` with
   `transform .8s cubic-bezier(.2,.7,.2,1)`. Expect **1**.
6. Confirm the totals: `grep -roc "cubic-bezier(.2,.75,.2,1)" css/` must now report a
   non-zero count **only** for `css/pages/index.css` (9).

## Boundaries

- Do NOT touch `css/pages/index.css`, `css/pages/reels.css`, `css/pages/live.css`,
  `css/pages/article.css` — those four pages are locked.
- Do NOT touch the three curves listed under "each has a reason" above.
- Do NOT touch `css/ltr.css` by hand.
- Do NOT change any property other than the `transition` value named in each step —
  no markup, no colours, no layout.
- If a file contains a different number of matches than the step states, STOP and
  report; the sheets have drifted since commit 4b55cd8.

## Verification

- **Mechanical**
  ```bash
  python tools/chrome.py
  ```
  then
  ```bash
  python tools/a11y.py
  ```
  `tools/chrome.py` must print `synced 28 pages; sw cache sh-<N>` with N one higher
  than before — bump `V` at `tools/chrome.py:25` first, as every CSS change requires.
- **Feel check** — this step changes how the site feels, so it must be looked at, not
  only greped. At 1280 and at 375, on `video.html`, `sections.html`, `author.html`,
  `files.html` and `photos.html`: hover a card's picture and confirm the zoom now
  settles rather than snaps, and that it matches the homepage's lead picture on
  `index.html` when the two are compared side by side. If `.8s` reads as sluggish on
  the dense grids (`video.html` has 17 of them in one viewport), report that back
  rather than inventing a third value.
- **No regression**: no horizontal overflow and no console errors at 1280 and 375.
