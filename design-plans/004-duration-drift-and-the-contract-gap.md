# 004 — The leftover duration drift, and the band the contract never wrote

- **Status**: TODO — needs one decision before step 3
- **Commit**: 4b55cd8
- **Severity**: LOW (the drift) · MEDIUM (the gap)
- **Category**: Easing & duration · Cohesion & tokens
- **Estimated scope**: 6 files for the drift; 1 paragraph of `DESIGN.md` for the gap

## Problem

The audit counted 49 declarations on durations outside the contract's numbers
(`.15 .22 .25 .28 .3 .38 .42 .45 .55 .62`). Reading all 49, they split into three
groups, and only the first is drift.

### Group 1 — real drift, 8 declarations in editable sheets

```css
/* css/pages/author.css:3 and css/pages/sections.css:3 — identical */
a{transition:color .16s ease,opacity .16s ease,border-color .16s ease,background .16s ease,gap .16s ease,transform .3s ease}
```
A `transform` on `ease` at `.3s`: the wrong curve, and below the contract's 0.35–0.5s
lift band. These are the only two places on the site where a transform rides the
browser's default easing.

```css
/* css/header.css:128 */
transition:background .15s
```
No easing keyword at all, and `.15s` for a background where the contract says
0.16–0.18s.

```css
/* css/header.css:97 and :110 */
transition:color .16s ease,border-color .22s ease
```
Two halves of one colour change running at two speeds.

```css
/* css/pages/map.css:7 */
transition:background .15s ease,color .15s ease,border-color .15s ease
```

```css
/* css/pages/photos.css:18 */
transition:opacity .25s ease,background .25s ease
```
The `background` half belongs in the colour band.

### Group 2 — the contract never covers them, 30+ declarations

The contract names three things: colour and background (0.16–0.18s), arrows (0.2s),
and things that move or scale (0.35–0.5s lift, 0.8–1.2s picture scale or crossfade
settle). It says nothing about **a UI element fading in or out** — a dropdown, a veil,
a lightbox, a toast, a feed row arriving.

```css
/* css/gallery.css:66 */    transition:opacity .22s ease,transform .22s ease,visibility 0s linear .22s
/* css/transition.css:19 */ transition:opacity .28s ease,visibility 0s linear .28s
/* css/components.css:172 */ animation:sh-hubview-veil .3s ease both
/* css/components.css:428 */ animation:sh-bo-veil .25s ease both
/* css/feed.css:13,23 */     animation:sh-feed-in .3s ease both
/* css/pages/shorts.css:22,62 */ transition:opacity .3s ease
/* css/player.css:138 */     transition:opacity .3s ease
```

Every one of these sits between `.22s` and `.3s`. That is not drift — it is a fourth
band the site invented consistently and never wrote down. Forcing them into 0.8–1.2s
("a crossfade settle") would make every menu on the site feel broken.

### Group 3 — not durations at all

`visibility 0s linear .22s`, `animation-delay:.42s`, `transition:opacity .5s ease .3s`
— the `.3s` and `.42s` there are **delays** in a stagger, and `0s` is the visibility
trick that keeps a hidden menu out of the tab order. Nothing to fix.

## Target

### Group 1

```css
/* css/pages/author.css:3 — target */
a{transition:color .16s ease,opacity .16s ease,border-color .16s ease,background .16s ease,gap .16s ease,transform .35s cubic-bezier(.2,.7,.2,1)}
```
Identical target for `css/pages/sections.css:3`.

```css
/* css/header.css:128 — target */
transition:background .16s ease
```

```css
/* css/header.css:97 and :110 — target */
transition:color .16s ease,border-color .16s ease
```

```css
/* css/pages/map.css:7 — target */
transition:background .16s ease,color .16s ease,border-color .16s ease
```

```css
/* css/pages/photos.css:18 — target */
transition:opacity .25s ease,background .16s ease
```
The `opacity .25s` stays: it is Group 2.

`css/header.css` is a shared sheet feeding the four locked pages. Its three
declarations are colour timings changing by 0.01–0.06s — invisible, and identical in
kind on every page. **Ask before touching it.** If the answer is no, drop the two
header rows and keep the other four.

### Group 2 — write the band down

Add one clause to `DESIGN.md:345`, after the arrows clause:

> a panel, a veil or a toast fades in 0.22–0.3s ease;

That is the sentence the code has been obeying for months. Once it is written, the 30
declarations stop being findings and the next audit does not re-raise them.

## Repo conventions to follow

- `DESIGN.md` is the binding contract; `docs/pages-visual-audit.md §3` and `§5` hold
  the approved exceptions. A band the code follows everywhere belongs in `DESIGN.md`,
  not in the exceptions list.
- Exemplar of the colour band written correctly: `css/pages/video-watch.css:3`
  ```css
  a{transition:color .16s ease,background .16s ease,border-color .16s ease,gap .16s ease}
  ```
- Exemplar of a lift on the signed curve: `css/components.css:120`
  ```css
  transition:transform .45s cubic-bezier(.2,.7,.2,1)
  ```

## Steps

1. Apply the Group 1 targets to `css/pages/author.css`, `css/pages/sections.css`,
   `css/pages/map.css` and `css/pages/photos.css`. Four files, five declarations.
2. STOP and ask whether `css/header.css:97`, `:110` and `:128` may be touched, since
   that sheet reaches the four locked pages. Apply only on a yes.
3. STOP and ask whether the fade band goes into `DESIGN.md:345`. Apply only on a yes,
   and add exactly the clause quoted above — do not reword it, do not add examples.
4. Leave every declaration in Group 2 and Group 3 alone.

## Boundaries

- Do NOT touch `css/pages/index.css`, `css/pages/reels.css`, `css/pages/live.css` or
  `css/pages/article.css`.
- Do NOT change any of the `.22s`–`.3s` fades in Group 2. They are the site's fourth
  band, not drift.
- Do NOT change `visibility 0s` anywhere — removing it puts hidden menus back in the
  tab order.
- Do NOT touch `animation-delay` values; they are stagger offsets.
- Do NOT edit `css/header.css` or `DESIGN.md` without the answers from steps 2 and 3.
- Do NOT introduce a duration token; `css/tokens.css` deliberately holds no spacing or
  timing scale (see the comment at its head).

## Verification

- **Mechanical**: bump `V` at `tools/chrome.py:25`, then
  ```bash
  python tools/chrome.py
  ```
  ```bash
  python tools/a11y.py
  ```
- **Feel check**: on `author.html` and `sections.html` at 1280, hover a link that moves
  (the ones carrying the page-level `a{...transform...}`) and confirm the move now
  rides the house curve — it should ease out the way a card's picture does on
  `index.html`, not stop flat. On `map.html`, hover a filter control and confirm the
  colour change is indistinguishable from the same control on `category.html`.
- **No regression**: no horizontal overflow and no console errors at 1280 and 375.
