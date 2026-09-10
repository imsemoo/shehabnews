# design-plans — motion

Written 2026-09-10 against commit `4b55cd8`. Read-only audit; no source was changed.

Scope: everything except the four locked pages — `index`, `reels`, `live`, `article`.
Those were read as the reference and are named in each plan's boundaries. Shared
sheets (`components`, `widgets`, `responsive`, `base`, `header`, `footer`, `chrome`)
feed the locked four, so every fix that would land in one of them is written scoped
by `body[data-sh-page="…"]` inside the page's own sheet instead.

## Order

| # | Plan | Severity | Depends on | Status |
| --- | --- | --- | --- | --- |
| 002 | [One press state](002-one-press-state.md) | HIGH | — | **DONE** `?v=235` |
| 003 | [Reduced-motion guards](003-reduced-motion-guards.md) | HIGH · LOW | — | **DONE** `?v=235` |
| 001 | [The signed curve and the picture band](001-signed-curve-and-picture-scale.md) | MEDIUM | — | **DONE** `?v=236` |
| 004 | [Duration drift and the contract gap](004-duration-drift-and-the-contract-gap.md) | LOW · MEDIUM | — | **DONE** `?v=236` |

All four are done. Original order and reasoning:

Run 002 first: it is the only finding a reader can feel on a phone today. 003 next,
because `video-watch.html` currently ignores the preference outright. 001 and 004 are
consistency work and can wait.

002 and 003 both append a block to the same 23 page sheets. Doing them in one pass is
fine and halves the rebuilds; doing them separately is also fine.

## Every plan ends the same way

Bump `V` at `tools/chrome.py:25`, then:

```bash
python tools/chrome.py
```

```bash
python tools/a11y.py
```

then check the result at **1280 and 375**, in Arabic and in English, for horizontal
overflow and console errors.

## Left alone on purpose

- `cubic-bezier(.2,.6,.3,1)` — `css/header.css:33,34`, the masthead meteor. A
  documented motif with its own arc.
- `cubic-bezier(.2,.8,.2,1)` — `css/pages/shorts.css:50`, the like pop. A pop is not a
  lift.
- `cubic-bezier(.2,.6,.2,1)` — `css/pages/index.css:269`, a 6s slow pan in a locked
  sheet.
- `@view-transition` — `css/chrome.css:140`. Works, already guarded.
- `.sh-shorts__act:active` and `.sh-live:active` — the site's two existing press
  states. Both purpose-built and correct.
- The `.22s`–`.3s` fades on menus, veils, lightboxes and feed rows. The code has been
  consistent about them; the contract simply never wrote the band down. See 004.

## Known gaps the lock leaves open

- The four locked pages get no press state (002) and keep an unguarded burger-menu
  rotation from `css/responsive.css` (003). Both are consequences of the lock, not
  oversights. Unlocking `css/responsive.css` for one guard block would close the
  second for every page at once.
- `cubic-bezier(.2,.75,.2,1)` survives in `css/pages/index.css` (9 occurrences) after
  001, as predicted. Nothing can be done about it while that sheet is locked.

## What executing 002 and 003 turned up

- A bare `a{transition:none}` in a page sheet **loses** to a class rule in a shared
  sheet, because the shared sheets load *after* the page sheet (see the `<link>` order
  in any page's head). Every guard selector therefore carries the
  `body[data-sh-page="…"]` prefix, which also raises its specificity above a single
  class. Plan 003's target block has been left as written; the executed code scopes
  the own-guard line the same way the responsive line was always scoped.
- `@keyframes sh-ring` in `css/pages/video-watch.css:5` is **dead** — nothing in that
  sheet uses it, and the same dead copy sits in `archive.css`, `contact.css`,
  `newsletter.css`, `tag.css` and `system-states.css`. Only `css/pages/404.css:30`
  actually animates it. Not in scope for a motion plan; worth a separate dead-CSS
  sweep.
- `AbortError: Transition was skipped` appears twice when a script navigates faster
  than `@view-transition` can finish. It does not appear in the 28-page gate and it is
  the documented behaviour of the API the brief asked to leave alone.

## What executing 001 and 004 turned up

- Both of 004's open questions were answered yes. `css/header.css` was touched, so
  three colour timings changed on the four locked pages too: `border-color` .22s -> .16s
  on two rules and `background` .15s (with no easing keyword at all) -> .16s ease. The
  change is 0.01–0.06s on a colour fade and is not visible; it is recorded here because
  it reached locked pages.
- `DESIGN.md:345` now reads «arrows step in 0.2s; **a panel, a veil or a toast fades in
  0.22–0.3s ease;** anything that moves or scales rides…». Thirty-odd declarations that
  the audit had to list as "outside the contract" are now inside it.
- The picture band is the one change a person still has to judge. Every scaling picture
  outside the locked four now runs 0.8s, up from 0.6s or 0.7s — measured, not assumed:
  video 6 live spans, photos 17, files 12, sections 6, author 5, all reporting
  `0.8s cubic-bezier(0.2, 0.7, 0.2, 1)`. Whether 0.8s reads as settled or as slow on the
  denser grids is a judgement for the client, not for a measurement.
