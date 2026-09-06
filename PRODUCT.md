# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- Arabic-speaking readers following Palestinian news (Gaza, the West Bank, Jerusalem, the diaspora), mostly on phones and often on weak connections, checking a developing story several times a day. They read fast, share to WhatsApp/Telegram, and come back for updates.
- The agency's management evaluating this front-end as a client demo on a laptop (1280–1536 wide): they judge each page by whether it looks hand-designed like a newspaper and dense with real content. (Inferred from the session's feedback; not stated by the user as a persona.)

## Product Purpose

The new front-end for وكالة شهاب للأنباء (Shehab News Agency, Palestinian, founded 2007): 24-hour coverage from the field, breaking news, live coverage, special files, photo desk (عدسة شهاب), video programmes, a data desk. Success: readers reach the story and its context in seconds on a phone, and the client sees a premium editorial product rather than a template.

## Positioning

Field presence: correspondents inside Gaza, the West Bank and Jerusalem reporting the event as it happens, with the agency's own photographs and video. The site's mechanism is the picture plus the headline plus the live context (updates, figures, timeline) around every story.

## Operating Context

- Static HTML/CSS/JS, no build step. `partials/header.html` and `partials/footer.html` are the source of truth; `python tools/chrome.py` regenerates every page's head/header/footer and the `?v=` asset version. `python tools/a11y.py` regenerates the 12px phone type floor in `css/responsive.css` after any CSS change. `python tools/search_index.py` rebuilds the search index.
- Dev server `python serve.py` (SSE feed for live updates: ticker, breaking, story updates via `data-sh-story-updates`). Service worker versioned with the assets.
- Libraries in use: PhotoSwipe (lightbox walls `[data-sh-pswp]`), Vidstack 1.15.6 (video), Swiper 14 (rails), Leaflet (map). Shared JS: `js/app.js`, `js/feed.js`, `js/figures.js` (`[data-sh-figure]`), `js/brief.js` (audio reader), `js/article.js` (progress bar, font size, listen, save, print).
- Pages: index, category, article, video, video-watch, live, reels, shorts, photos, files, data, map, coverage, about, sections, author, archive, newsletter, saved, contact, search, tag, now, privacy, terms, 404.

## Capabilities and Constraints

- Arabic RTL throughout: logical properties only; any SVG or Latin number run isolated with `direction:ltr` / `unicode-bidi:isolate`; grid children need `min-width:0`.
- Phone rules: 44px touch targets, no text under 12px on phones, no horizontal overflow at 375px; verified at 1280 and 375 before delivery.
- Content is never invented: headlines, texts, figures and images come from shehabnews.com, the agency's own assets in `assets/images`, `data/figures.json`, or Wikimedia Commons photographs already used on the site. The article demo body (the kites report) is demo copy written in the agency's voice; do not add new factual claims to it.
- Fonts are self-hosted: Almarai 400/700/800 for display and UI, Noto Naskh Arabic for reading text. IBM Plex Sans Arabic is banned; Cairo is avoided.
- The header, footer, navigation, URLs and information architecture are fixed; page work happens between the `sh:header` and `sh:footer` markers.
- Cache: after any CSS/JS change the `?v=N` version is bumped in `tools/chrome.py`, `sw.js` and every HTML file.

## Brand Commitments

- Palette: navy `#0a1a33`, navy-2 `#0f2a4f`, brand blue `#1b5aa6` (links, marks, selected), sky `#7ea8dd` (text and marks on navy), breaking red `#e0302f`, live red `#bf2f32`; white ground, warm paper `#fbfaf7` for the files shelf, soft `#f5f7fa`, blue tint `#edf2f8`. Text ink `#14233a`.
- The ش blade mark (`assets/images/mark-sheen.svg`) and its arrow (`mark-arrow.svg`) are the house glyphs; the blue rule of the house style is the 120px intro signature, used once per page at most.
- One dark (navy) band per page at most. No decorative hairlines, card top-rules, eyebrow lines, ghost numerals, decorative circles or framed panels: the user called those «بيرن الـAI». Separation comes from whitespace, type scale and the photograph. Functional lines only (tab underline, timeline).
- Dense, newspaper-like sections; no blank areas, no oversized blocks, titles only unless asked; real photographs shown whole, never stretched.
- Logo files `assets/images/logo-white.png` / `logo-blue.png`; the meteor "sheen" motif in the header sky.

## Evidence on Hand

- Real headlines, categories, correspondents' lines and figures pulled from shehabnews.com across the pages; the live special-files index (20 files with covers) in `files.html`; programme posters in `assets/images/prog-*.webp` and `reel-*.webp`; `data/figures.json` figures (days since the 10 October 2025 ceasefire, casualties, mosques destroyed).
- Photographs: Wikimedia Commons files already on the site (Al-Mawasi tents aerial, Rafah destruction aerial, Al-Rasheed street return, Beach camp aerial, Jerusalem Old City, Qalandia checkpoint, Jenin, Hebron school children, Gaza fishermen, olive harvest), plus `assets/images/gaza-coast.webp`, `coverage-hero2.webp`, `live-poster.webp`.
- No real author portraits (the author page uses an initial tile); no real ad creatives (ad slots are placeholders and may be omitted from demos); no real comment threads.

## Product Principles

1. The photograph and the headline carry every page; everything else is set in type, not in boxes.
2. Density over decoration: fill the width with real content, size each block to its importance.
3. Context travels with the story: updates, figures, the timeline and the next read are part of the article, not chrome around it.
4. Real content only; when real data is missing, the element is dropped rather than faked.
5. Phone first, laptop demo second: everything verified at 375 and 1280.

## Accessibility & Inclusion

Body text ≥ 4.5:1 on its surface; 44px targets; visible keyboard focus in brand blue; `prefers-reduced-motion` respected on every animation; reading tools (font size ×4 steps, listen, save, print) on the article page.
