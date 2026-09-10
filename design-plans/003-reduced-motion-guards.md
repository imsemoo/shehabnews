# 003 — Close the eleven sheets that ignore prefers-reduced-motion

- **Status**: DONE — executed at commit 4b55cd8, shipped in ?v=235
- **Commit**: 4b55cd8
- **Severity**: HIGH (video-watch) · LOW (the rest)
- **Category**: Accessibility
- **Estimated scope**: 11 files, one guard block each

## Problem

`DESIGN.md:345` is unconditional:

> `prefers-reduced-motion: reduce` removes every transition, animation and hover transform, and stops every pulse.

Eleven sheets carry motion and no guard. Counted as `grep -c "transition:\|animation:"` against `grep -c "prefers-reduced-motion"`:

| sheet | motion declarations | guards |
| --- | --- | --- |
| `css/pages/video-watch.css` | 11 | **0** |
| `css/responsive.css` | 4 | **0** |
| `css/pages/data.css` | 2 | **0** |
| `css/pages/archive.css` | 1 | **0** |
| `css/pages/contact.css` | 1 | **0** |
| `css/pages/newsletter.css` | 1 | **0** |
| `css/pages/privacy.css` | 1 | **0** |
| `css/pages/saved.css` | 1 | **0** |
| `css/pages/tag.css` | 1 | **0** |
| `css/pages/terms.css` | 1 | **0** |
| `css/mark.css` | 0 | 0 — no motion, nothing to guard, listed only so it is not searched for twice |

`css/pages/video-watch.css` is the one that matters. It is the watch page: a reader
who asked for less motion still gets a pulsing ring, a sliding switch and a toast
that slides in.

```css
/* css/pages/video-watch.css:5 — a ring that scales and fades, forever */
@keyframes sh-ring{0%{transform:scale(.55);opacity:.9}70%{opacity:.12}100%{transform:scale(1.6);opacity:0}}

/* css/pages/video-watch.css:141-142 — the switch knob travels */
.sh-watch__switch-ui{...;transition:background .2s ease;...}
.sh-watch__switch-ui::after{content:"";position:absolute;...;transition:transform .2s ease}

/* css/pages/video-watch.css:200 — the "next video" toast slides */
transition:opacity .2s ease,transform .2s ease;direction:rtl;...
```

`css/responsive.css` is a **shared** sheet and feeds the four locked pages, so its two
real transforms cannot be guarded there:

```css
/* css/responsive.css:61 — the burger's bars rotate into an X */
.sh-nav-toggle span{display:block;width:18px;height:2px;background:#fff;transition:transform .2s ease,opacity .2s ease}

/* css/responsive.css:100 — the drop-menu chevron */
header nav .sh-menu > a > span:last-child{transition:transform .2s ease}
```

The remaining eight sheets each hold one declaration and it is the same one every
time — a colour transition, not movement:

```css
/* css/pages/tag.css, terms.css, privacy.css, newsletter.css, contact.css, archive.css */
transition:color .16s ease,background .16s ease,border-color .16s ease,gap .16s ease
```

A 0.16s colour fade is not motion and harms nobody. It is only in scope because the
contract says *every* transition. Treat it as LOW and do it for consistency, not for
safety — but note `gap` **is** a layout move and does belong under the guard.

## Target

### video-watch — a full guard

Append to `css/pages/video-watch.css`:

```css
/* the ring, the switch and the toast all read without moving */
@media (prefers-reduced-motion:reduce){
  .sh-watch__now::before,[class*="sh-ring"],.sh-video-watch-related-videos__span-5,
  .sh-video-watch-related-videos__span-10,.sh-video-watch-more-videos__span-6{animation:none}
  .sh-watch__switch-ui,.sh-watch__switch-ui::after,.sh-watch__next,.sh-watch__next-btn,
  .sh-watch__now,a{transition:none}
}
```

Before writing it, open the file and replace the selector list with the elements that
actually carry `animation:` and `transition:` in it — the list above is built from the
declarations quoted in **Problem** and must be checked against the file, not trusted.

### responsive.css — scoped into the page sheets

Do **not** edit `css/responsive.css`. Instead append this to each of the 23 editable
page sheets listed in `design-plans/002-one-press-state.md` step 1, with `<slug>`
substituted:

```css
@media (prefers-reduced-motion:reduce){
  body[data-sh-page="<slug>"] .sh-nav-toggle span,
  body[data-sh-page="<slug>"] header nav .sh-menu > a > span:last-child{transition:none}
}
```

The four locked pages keep the unguarded burger. Say so in the hand-off; it is a
consequence of the lock, not an oversight.

### the eight one-liners

Append to each of `css/pages/{archive,contact,data,newsletter,privacy,saved,tag,terms}.css`:

```css
@media (prefers-reduced-motion:reduce){a{transition:none}}
```

For `css/pages/data.css` the block is:

```css
@media (prefers-reduced-motion:reduce){a,.sh-data-figure{transition:none}}
```

— check the second declaration's real selector in the file (`transition:border-color .18s ease`) and use that selector, not the placeholder.

## Repo conventions to follow

- Guards go at the **end of the sheet they guard**. A guard written in another sheet
  loses to a later sheet of equal specificity — this bit the project before, when a
  footer's live dot kept beating because its guard sat in `css/header.css`.
- Exemplar: `css/pages/photos.css:160`
  ```css
  @media (prefers-reduced-motion:reduce){
    .sh-ph-tile img,.sh-ph-tile__hover{transition:none}
    a:hover .sh-ph-tile img,a:focus-visible .sh-ph-tile img{transform:none}
  }
  ```
  Note that it kills the hover **transform** as well as the transition — a guard that
  only writes `transition:none` still lets the element jump to its hovered position.
  Do the same wherever a `:hover` rule sets a `transform` on the same element.
- `css/system-states.css` already guards inline animations page-wide with
  `@media (prefers-reduced-motion: reduce){[style*="animation"]{animation:none !important}}`.
  That is the pattern for style attributes; do not copy it where a class exists.

## Steps

1. Read `css/pages/video-watch.css` top to bottom. List every selector that carries
   `animation:` or `transition:`, and every selector whose `:hover` rule sets a
   `transform`. Write one guard block at the end of the file covering exactly those.
2. Append the eight one-line guards, with `data.css`'s second selector read from the
   file.
3. Append the `responsive.css` scoped guard to the 23 editable page sheets.
4. Re-run the count and confirm no editable sheet with motion reports 0 guards:
   ```bash
   for f in $(ls css/*.css css/pages/*.css | grep -v ltr.css); do \
     m=$(grep -c "transition:\|animation:" $f); g=$(grep -c "prefers-reduced-motion" $f); \
     [ "$m" -gt 0 ] && [ "$g" -eq 0 ] && echo "$f  motion $m  guards 0"; done
   ```
   The only lines left should be `css/responsive.css` (shared, deliberately untouched).

## Boundaries

- Do NOT edit `css/responsive.css`, `css/components.css`, `css/widgets.css`,
  `css/base.css`, `css/header.css`, `css/footer.css` or `css/chrome.css`.
- Do NOT touch `css/chrome.css:140`'s `@view-transition` — it works and it is already
  guarded.
- Do NOT touch the meteor or the sheen in `css/header.css`; they are a documented
  motif and `css/header.css` already carries 2 guards.
- Do NOT add `!important` unless the declaration being overridden is a style
  attribute, as in `css/system-states.css`.
- Do NOT change any duration, curve or colour in this plan. Guards only.
- If `css/pages/video-watch.css` has drifted from the excerpts above since commit
  4b55cd8, STOP and report.

## Verification

- **Mechanical**: bump `V` at `tools/chrome.py:25`, then
  ```bash
  python tools/chrome.py
  ```
  ```bash
  python tools/a11y.py
  ```
- **Feel check** — emulate the preference and confirm the page is *still legible*, not
  just still. In a browser with `prefers-reduced-motion: reduce` forced, at 1280 and
  375, on `video-watch.html`: the ring must be a static ring and not vanish, the
  autoplay switch must still show which side it is on, and the "next video" toast must
  still appear — a guard that hides state instead of stilling it is a worse bug than
  the motion was. Then open the burger menu on any of the 23 pages at 375 and confirm
  it opens with no rotation and no chevron sweep.
- **No regression**: with the preference off, every animation named above must still
  run exactly as it did. Compare against the same page before the change.
