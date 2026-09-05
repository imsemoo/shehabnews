#!/usr/bin/env python3
"""شهاب — Phase 3/4 hooks: article reader, PhotoSwipe on the lead image,
honest interactive cards on sections/files, the player block on now.html,
and the CSS the new pieces need. Idempotent.

Usage:  python tools/phase3_hooks.py   (then python tools/chrome.py)
"""
import os, re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)


def rw(path, fn):
    s = open(path, encoding='utf-8').read()
    t = fn(s)
    if t != s:
        open(path, 'w', encoding='utf-8', newline='\n').write(t)
    return t


def ico(name, style='s', cls=''):
    return '<svg class="sh-i%s" aria-hidden="true" focusable="false"><use href="assets/images/icons.svg#%s-%s"></use></svg>' % ((' ' + cls) if cls else '', style, name)


READER = '''
      <div class="sh-reader" data-sh-reader role="toolbar" aria-label="أدوات القراءة">
        <span class="sh-reader__group" role="group" aria-label="حجم الخط">
          <button type="button" class="sh-reader__btn" data-sh-font="-" aria-label="تصغير الخط">أ-</button>
          <span class="sh-reader__lbl" data-sh-font-label aria-hidden="true">100%</span>
          <button type="button" class="sh-reader__btn" data-sh-font="+" aria-label="تكبير الخط">أ+</button>
        </span>
        <button type="button" class="sh-reader__btn sh-reader__btn--wide" data-sh-listen aria-pressed="false">''' + ico('headphones') + '''استمع للمقال</button>
        <button type="button" class="sh-reader__btn sh-reader__btn--wide" data-sh-save="article.html" data-sh-save-title="أطفال غزة بين فرحة اللعب وتهديد القصف.. الطائرات الورقية ذريعة جديدة للتصعيد" data-sh-save-cat="تقرير شهاب" aria-pressed="false">''' + ico('bookmark', 'r') + '''<span data-sh-save-label>حفظ</span></button>
        <button type="button" class="sh-reader__btn" data-sh-print aria-label="طباعة">''' + ico('print') + '''</button>
      </div>'''


def article(s):
    if 'data-sh-reader' not in s:
        s = s.replace('    <figure data-screen-label="Lead Image" class="sh-article-lead-image__figure-1">', READER + '\n\n    <figure data-screen-label="Lead Image" class="sh-article-lead-image__figure-1">', 1)
    # the lead image opens in PhotoSwipe: js/gallery.js handles any [data-sh-pswp] wall
    if 'data-sh-pswp' not in s:
        s = re.sub(r'(<figure data-screen-label="Lead Image" class="sh-article-lead-image__figure-1">\s*)<span class="sh-article-lead-image__span-1">(\s*<img[^>]*src="([^"]+)"[^>]*>)',
                   lambda m: m.group(1) + '<span class="sh-article-lead-image__span-1" data-sh-pswp><a href="%s" data-pswp-src="%s" data-pswp-width="1800" data-pswp-height="960" class="sh-article-lead-image__zoom" aria-label="تكبير الصورة">%s</a>' % (m.group(3), m.group(3), m.group(2)), s, count=1)
        s = s.replace('<span class="sh-article-lead-image__span-2">صورة 01</span>', '<span class="sh-article-lead-image__span-2">صورة 01</span><span class="sh-article-lead-image__hint">' + ico('expand') + 'كبّر</span>', 1)
    if 'photoswipe.css' not in s:
        s = s.replace('<link rel="stylesheet" href="css/pages/article.css?v=104">', '<link rel="stylesheet" href="css/pages/article.css?v=104">\n<link rel="stylesheet" href="assets/vendor/photoswipe/photoswipe.css?v=104">\n<link rel="stylesheet" href="css/gallery.css?v=104">', 1)
    if 'js/article.js' not in s:
        s = s.replace('</body>', '<script src="assets/vendor/photoswipe/photoswipe.umd.min.js?v=104" defer></script>\n<script src="assets/vendor/photoswipe/photoswipe-lightbox.umd.min.js?v=104" defer></script>\n<script src="js/gallery.js?v=104" defer></script>\n<script src="js/article.js?v=104" defer></script>\n</body>', 1)
    return s


def sections(s):
    s = s.replace('<a href="files.html" class="sh-sections-interactive-map__a-1">استكشف الخريطة', '<a href="map.html" class="sh-sections-interactive-map__a-1">استكشف الخريطة')
    s = re.sub(r'<span class="sh-sections-interactive-map__span-4">325</span><span class="sh-sections-interactive-map__span-5">يومًا موثّقًا</span>',
               '<span class="sh-sections-interactive-map__span-4" data-sh-figure="ceasefire">—</span><span class="sh-sections-interactive-map__span-5">يومًا على وقف إطلاق النار</span>', s)
    s = re.sub(r'<span class="sh-sections-interactive-map__span-4">1,204</span><span class="sh-sections-interactive-map__span-5">حادثة على الخريطة</span>',
               '<span class="sh-sections-interactive-map__span-4" data-sh-figure="incidents">—</span><span class="sh-sections-interactive-map__span-5">خرقًا على الخريطة</span>', s)
    if 'js/figures.js' not in s:
        s = s.replace('</body>', '<script src="js/figures.js?v=104" defer></script>\n</body>', 1)
    return s


def files(s):
    # the two «ملفات تفاعلية» cards point at the real pages now
    s = re.sub(r'<a href="article\.html" class="sh-files-interactive-files__a-1">(\s*<span class="sh-files-interactive-files__span-4">\s*<span class="sh-files-interactive-files__span-5">)',
               r'<a href="map.html" class="sh-files-interactive-files__a-1">\1', s, count=1)
    s = s.replace('<span class="sh-files-interactive-files__span-9">1000 يوم.. الحرب يومًا بيوم</span>', '<span class="sh-files-interactive-files__span-9">مكتب البيانات.. الأرقام بالمصدر والتاريخ</span>')
    s = s.replace('<span class="sh-files-interactive-files__span-10">تصفّح أحداث الحرب من 7 أكتوبر حتى اليوم في خط زمني تفاعلي.</span>', '<span class="sh-files-interactive-files__span-10">الشهداء، النزوح، المساعدات، والخروقات: كل رقم بمصدره واتجاهه في آخر أسبوعين.</span>')
    s = s.replace('<span class="sh-files-interactive-files__span-7"><svg class="sh-i sh-files-interactive-files__i-1" aria-hidden="true" focusable="false"><use href="assets/images/icons.svg#s-timeline"></use></svg>خط زمني</span>',
                  '<span class="sh-files-interactive-files__span-7"><svg class="sh-i sh-files-interactive-files__i-1" aria-hidden="true" focusable="false"><use href="assets/images/icons.svg#s-chart-simple"></use></svg>مكتب البيانات</span>')
    s = re.sub(r'(<span class="sh-files-interactive-files__span-9">مكتب البيانات[\s\S]*?)<span class="sh-tnum">1,000 تحديثًا</span>', r'\1<span class="sh-tnum"><span data-sh-figure="martyrs">—</span> شهيدًا</span>', s, count=1)
    # the second card's anchor
    s = re.sub(r'<a href="article\.html" class="sh-files-interactive-files__a-1">(\s*<span class="sh-files-interactive-files__span-4">\s*<span class="sh-files-interactive-files__span-13">)',
               r'<a href="data.html" class="sh-files-interactive-files__a-1">\1', s, count=1)
    s = s.replace('<span class="sh-tnum">325 تحديثًا</span>', '<span class="sh-tnum"><span data-sh-figure="incidents">—</span> خرقًا</span>')
    if 'js/figures.js' not in s:
        s = s.replace('</body>', '<script src="js/figures.js?v=104" defer></script>\n</body>', 1)
    return s


def now(s):
    if '<!-- sh:player -->' not in s:
        return s
    live = open('live.html', encoding='utf-8').read()
    m = re.search(r'<media-player[\s\S]*?</media-player>', live)
    if not m:
        print('  ! no media-player in live.html')
        return s
    player = m.group(0).replace('sh-live-stage__player', 'sh-now__player')
    return s.replace('<!-- sh:player -->', player, 1)


CSS_ARTICLE = '''
/* ---- Phase 3: the reader ---- */
.sh-article-article-body__div-1{max-width:620px;font-size:calc(16px * var(--reader-scale,1))}
.sh-article-article-intro__p-1{font-size:calc(16px * var(--reader-scale,1))}
.sh-reader{display:flex;flex-wrap:wrap;align-items:center;gap:8px;margin-top:14px}
.sh-reader__group{display:inline-flex;align-items:center;border:1px solid var(--color-border)}
.sh-reader__group .sh-reader__btn{border:0}
.sh-reader__lbl{min-width:44px;text-align:center;font-family:var(--sh-font);font-size:11px;font-weight:800;color:var(--sh-mute);font-variant-numeric:tabular-nums}
.sh-reader__btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;min-width:40px;min-height:40px;padding:0 12px;border:1px solid var(--color-border);background:#fff;color:var(--sh-navy);font-family:var(--sh-font);font-size:12.5px;font-weight:800;cursor:pointer;transition:background .15s ease,color .15s ease,border-color .15s ease}
.sh-reader__btn:hover{border-color:var(--sh-blue);color:var(--sh-blue)}
.sh-reader__btn[aria-pressed="true"]{background:var(--sh-navy);border-color:var(--sh-navy);color:#fff}
.sh-reader__btn[disabled]{opacity:.4;cursor:default}
.sh-reader__btn:focus-visible{outline:2px solid var(--sh-blue);outline-offset:2px}
.sh-progress{position:fixed;top:0;left:0;right:0;height:3px;z-index:950;background:var(--sh-red);transform-origin:right center;transform:scaleX(0);pointer-events:none}
html[dir="rtl"] .sh-progress{transform-origin:right center}
.sh-progress[data-css]{animation:sh-progress linear both;animation-timeline:scroll(root)}
@keyframes sh-progress{from{transform:scaleX(0)}to{transform:scaleX(1)}}
.sh-article-lead-image__zoom{display:block;cursor:zoom-in}
.sh-article-lead-image__hint{position:absolute;bottom:12px;inset-inline-end:12px;display:inline-flex;align-items:center;gap:6px;padding:5px 10px;background:rgba(10,26,51,.72);color:#fff;font-family:var(--sh-font);font-size:11px;font-weight:800;pointer-events:none}
.sh-story__mod{color:var(--color-red-soft);font-weight:700}
.sh-story__mod[hidden]{display:none}
@media print{
  .sh-header,.sh-footer,.sh-ticker,.sh-breaking,.sh-reader,.sh-ad,.sh-totop,.sh-toast,.sh-consent,.sh-livedock,.sh-progress,.sh-article-article-sidebar__aside-1,.sh-article-related__section-1,.sh-article-article-end__a-2,.sh-article-article-intro__div-4,.sh-article-article-end__div-4,.sh-skip,[data-bf]{display:none!important}
  .sh-article-article__article-1{display:block}
  .sh-article-article-body__div-1{max-width:none;font-size:12pt}
  body{background:#fff;color:#000}
  a{color:inherit;text-decoration:none}
}
'''

CSS_CHROME = '''
/* ---- Phase 3: instant search ---- */
.sh-search{position:relative}
.sh-searchbox{position:absolute;top:calc(100% + 8px);inset-inline-end:0;z-index:950;width:min(92vw,560px);background:#fff;color:var(--sh-ink);box-shadow:0 24px 60px rgba(10,26,51,.35);border-top:3px solid var(--sh-blue);text-align:start}
.sh-searchbox[hidden]{display:none}
.sh-searchbox__sheethead{display:none}
.sh-searchbox__body{max-height:min(70vh,560px);overflow-y:auto;overscroll-behavior:contain;padding:8px 0}
.sh-searchbox__h{padding:10px 18px 4px;font-family:var(--sh-font);font-size:11px;font-weight:800;color:var(--sh-mute);letter-spacing:.02em}
.sh-searchbox__opt{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:2px 12px;padding:10px 18px;color:var(--sh-ink);font-family:var(--sh-font)}
.sh-searchbox__opt > .sh-i{grid-row:span 2;align-self:center;color:var(--sh-mute)}
.sh-searchbox__opt:hover,.sh-searchbox__opt[aria-selected="true"]{background:var(--color-surface-blue);color:var(--sh-navy)}
.sh-searchbox__kicker{font-size:11px;font-weight:800;color:var(--sh-blue)}
.sh-searchbox__t{font-size:14px;font-weight:700;line-height:1.55}
.sh-searchbox__t mark{background:transparent;color:var(--sh-blue);font-weight:800}
.sh-searchbox__time{grid-column:2;grid-row:1 / span 2;align-self:center;font-size:11.5px;color:var(--sh-mute);white-space:nowrap;font-variant-numeric:tabular-nums}
.sh-searchbox__chips{display:flex;flex-wrap:wrap;gap:6px;padding:6px 18px 12px}
.sh-searchbox__chip{display:inline-flex;align-items:center;min-height:32px;padding:0 12px;border:1px solid var(--color-border);font-family:var(--sh-font);font-size:12px;font-weight:800;color:var(--sh-navy)}
.sh-searchbox__chip:hover{border-color:var(--sh-blue);color:var(--sh-blue)}
.sh-searchbox__all{display:flex;align-items:center;justify-content:space-between;gap:10px;margin:6px 0 0;padding:12px 18px;border-top:1px solid var(--color-border-soft);font-family:var(--sh-font);font-size:13px;font-weight:800;color:var(--sh-blue)}
.sh-searchbox__all:hover{background:var(--color-surface-soft)}
.sh-searchbox__empty{padding:18px;text-align:center;font-family:var(--sh-font);font-size:13px;font-weight:700;color:var(--sh-mute)}
@media (max-width:900px){
  .sh-searchbox{position:fixed;inset:0;top:0;width:auto;max-width:none;border-top:0;display:flex;flex-direction:column}
  .sh-searchbox[hidden]{display:none}
  .sh-searchbox__sheethead{display:flex;align-items:center;gap:8px;padding:12px 12px 12px 16px;background:var(--sh-blue)}
  .sh-searchbox__input{flex:1 1 auto;min-width:0;height:44px;padding:0 14px;border:0;background:#fff;color:var(--sh-navy);font-family:var(--sh-font);font-size:15px;font-weight:700;outline:none}
  .sh-searchbox__close{width:44px;height:44px;border:0;background:transparent;color:#fff;cursor:pointer;display:grid;place-items:center}
  .sh-searchbox__body{max-height:none;flex:1 1 auto}
  html[data-searchbox]{overflow:hidden}
}
/* ---- Phase 3: PWA update bar ---- */
.sh-update{position:fixed;bottom:16px;inset-inline-start:16px;z-index:1260;display:flex;align-items:center;gap:12px;padding:10px 12px 10px 16px;background:var(--sh-navy);color:#fff;font-family:var(--sh-font);font-size:13px;font-weight:700;box-shadow:0 14px 40px rgba(10,26,51,.38)}
.sh-update__btn{min-height:36px;padding:0 14px;border:0;background:var(--sh-blue);color:#fff;font-family:var(--sh-font);font-size:12.5px;font-weight:800;cursor:pointer}
.sh-update__btn:hover{background:var(--color-brand-blue-deep)}
.sh-update__x{width:32px;height:32px;border:0;background:transparent;color:var(--sh-on-dark-72);cursor:pointer;display:grid;place-items:center}
/* ---- data-saver: no ambient video, no autoplay ---- */
html[data-save-data] .sh-footer__video{display:none}
'''


def append_once(path, marker, css):
    s = open(path, encoding='utf-8').read()
    if marker in s:
        return
    open(path, 'a', encoding='utf-8', newline='\n').write(css)


if __name__ == '__main__':
    t = rw('article.html', article); print('article: reader', 'data-sh-reader' in t, '| zoom', 'data-sh-pswp' in t, '| article.js', 'js/article.js' in t)
    t = rw('sections.html', sections); print('sections: map link', 'href="map.html" class="sh-sections-interactive-map__a-1"' in t)
    t = rw('files.html', files); print('files: cards ->', t.count('href="map.html" class="sh-files-interactive-files__a-1"'), t.count('href="data.html" class="sh-files-interactive-files__a-1"'))
    t = rw('now.html', now); print('now: player', '<media-player' in t)
    append_once('css/pages/article.css', 'Phase 3: the reader', CSS_ARTICLE)
    append_once('css/chrome.css', 'Phase 3: instant search', CSS_CHROME)
    print('css appended')
