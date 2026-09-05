#!/usr/bin/env python3
"""شهاب — Phase 1 one-off page edits (index / article / live).

Idempotent where it matters: each edit checks for its own marker first.
Usage:  python tools/phase1_pages.py
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


# ------------------------------------------------------------------ index --
def index(s):
    # one h1 per page: hero panels become h2, an sr-only h1 names the page
    s = re.sub(r'<h1 class="sh-index-hero__h1-1">([\s\S]*?)</h1>', r'<h2 class="sh-index-hero__h1-1">\1</h2>', s)
    if 'class="sr-only">وكالة شهاب' not in s:
        s = s.replace('<main id="main" class="sh-container">',
                      '<main id="main" class="sh-container">\n        <h1 class="sr-only">وكالة شهاب للأنباء — آخر أخبار فلسطين لحظة بلحظة</h1>', 1)
    # honest live labels (js/feed.js fills data-sh-feed-status)
    s = s.replace('<span class="sh-index-top-now__span-2">محدّث كل دقيقة</span>',
                  '<span class="sh-index-top-now__span-2" data-sh-feed-status>يتحدّث مع التغطية</span>')
    s = re.sub(r'<span class="sh-index-live-coverage__span-8"><span class="sh-index-live-coverage__span-9"></span>\s*يتحدّث\s+تلقائيًا</span>',
               '<span class="sh-index-live-coverage__span-8"><span class="sh-index-live-coverage__span-9"></span><span data-sh-feed-status>يتحدّث تلقائيًا</span></span>', s)
    # reserved ad slot between «الأبرز الآن» and the live coverage
    if 'sh-ad--leader' not in s:
        s = s.replace('        <section data-screen-label="Live Coverage"',
                      '        <aside class="sh-ad sh-ad--leader" aria-label="إعلان"><span class="sh-ad__note">مساحة إعلانية محجوزة 970×120 · على الموبايل 320×100</span></aside>\n        <section data-screen-label="Live Coverage"', 1)
    # social: real channels, no invented follower counts
    social = [('https://www.facebook.com/sahpp2023', 'فيسبوك', 'sahpp2023'),
              ('https://twitter.com/ShehabAgency', 'إكس', '@ShehabAgency'),
              ('https://www.instagram.com/shehabagency/', 'إنستغرام', '@shehabagency'),
              ('https://t.me/ShehabTelegram', 'تيليغرام', 'ShehabTelegram')]
    k = [0]
    def soc(m):
        href, name, handle = social[k[0] % 4]; k[0] += 1
        inner = m.group(1)
        inner = re.sub(r'<span class="sh-index-social__span-1">[\s\S]*?</span>', '<span class="sh-index-social__span-1">%s</span>' % name, inner)
        inner = re.sub(r'<span class="sh-index-social__span-2">[\s\S]*?</span>', '<span class="sh-index-social__span-2" dir="ltr">%s</span>' % handle, inner)
        return '<a href="%s" class="sh-index-social__a-1" rel="noopener" target="_blank">%s</a>' % (href, inner)
    s = re.sub(r'<a href="#" class="sh-index-social__a-1">([\s\S]*?)</a>', soc, s)
    # below-the-fold sections defer their rendering
    for lbl in ['Statements', 'Lens', 'Video', 'Reports', 'Opinion Sports', 'Photo Library', 'Social']:
        s = s.replace('<section data-screen-label="%s" class="' % lbl, '<section data-screen-label="%s" class="sh-cv ' % lbl)
    return s


# ---------------------------------------------------------------- article --
U = 'https://shehabnews.com/article.html'
T = 'أطفال غزة بين فرحة اللعب وتهديد القصف'


def share_row(cls, icls):
    def b(kind, label, icon, href, extra='rel="noopener" target="_blank"'):
        return ('<a href="%s" data-sh-share="%s" aria-label="%s" class="%s" %s>'
                '<svg class="sh-i %s" aria-hidden="true" focusable="false"><use href="assets/images/icons.svg#%s"></use></svg></a>'
                % (href, kind, label, cls, extra, icls, icon))
    return '\n          '.join([
        b('x', 'مشاركة على إكس', 'b-x-twitter', 'https://twitter.com/intent/tweet?url=%s&text=%s' % (U, T)),
        b('facebook', 'مشاركة على فيسبوك', 'b-facebook-f', 'https://www.facebook.com/sharer/sharer.php?u=' + U),
        b('whatsapp', 'مشاركة على واتساب', 'b-whatsapp', 'https://api.whatsapp.com/send?text=%s%%20%s' % (T, U)),
        b('telegram', 'مشاركة على تيليغرام', 'b-telegram', 'https://t.me/share/url?url=%s&text=%s' % (U, T)),
        b('native', 'مشاركة', 's-share-nodes', U, 'data-sh-share-native')])


def article(s):
    s = re.sub(r'(<div class="sh-article-article-intro__div-4">)[\s\S]*?(\n        </div>)',
               lambda m: m.group(1) + '\n          ' + share_row('sh-article-article-intro__a-2', 'sh-article-article-intro__i-1') + m.group(2), s, count=1)
    s = re.sub(r'(<span class="sh-article-article-end__span-2">شارك التقرير</span>)[\s\S]*?(\n          </div>)',
               lambda m: m.group(1) + '\n            ' + share_row('sh-article-article-end__a-1', 'sh-article-article-end__i-1') + m.group(2), s, count=1)
    s = s.replace('<span class="sh-article-article-intro__span-3">الثلاثاء 2 سبتمبر 2026 · 10:06 م · قراءة 4 دقائق</span>',
                  '<span class="sh-article-article-intro__span-3"><time datetime="2026-09-02T22:06:00+03:00" data-sh-format="abs">الثلاثاء 2 سبتمبر 2026 · 10:06 م</time> · قراءة 4 دقائق</span>')
    s = s.replace('<span class="sh-article-article-end__span-1">نُشر في 2 سبتمبر 2026 · فريق التقارير — وكالة شهاب للأنباء</span>',
                  '<span class="sh-article-article-end__span-1">نُشر في <time datetime="2026-09-02T22:06:00+03:00" data-sh-format="abs">2 سبتمبر 2026 · 10:06 م</time> · فريق التقارير — وكالة شهاب للأنباء</span>')
    if 'data-sh-share-url' not in s:
        s = s.replace('<article data-screen-label="Article" class="sh-article-article__article-1">',
                      '<article data-screen-label="Article" class="sh-article-article__article-1" data-sh-share-url="%s" data-sh-share-title="%s" data-sh-story="163540">' % (U, T))
    if 'sh-ad--box' not in s:
        s = s.replace('    <div class="sh-article-article-sidebar__div-2">',
                      '    <aside class="sh-ad sh-ad--box" aria-label="إعلان"><span class="sh-ad__note">300×250</span></aside>\n    <div class="sh-article-article-sidebar__div-2">', 1)
    if 'sh-ad--inline' not in s:
        s = s.replace('      <h2 class="sh-article-article-body__h2-1">طفولة تحت المجهر</h2>',
                      '      <aside class="sh-ad sh-ad--inline" aria-label="إعلان"><span class="sh-ad__note">728×90 · على الموبايل 320×100</span></aside>\n      <h2 class="sh-article-article-body__h2-1">طفولة تحت المجهر</h2>', 1)
    return s


# ------------------------------------------------------------------- live --
LU = 'https://shehabnews.com/live.html'


def live(s):
    s = s.replace('<span class="sh-live-stage__meta"><svg class="sh-i" aria-hidden="true" focusable="false"><use href="assets/images/icons.svg#r-eye"></use></svg><b class="sh-tnum" data-sh-live-viewers>3,218</b>يشاهدون الآن</span>',
                  '<span class="sh-live-stage__meta" data-sh-live-viewers-wrap hidden><svg class="sh-i" aria-hidden="true" focusable="false"><use href="assets/images/icons.svg#r-eye"></use></svg><b class="sh-tnum" data-sh-live-viewers></b>يشاهدون الآن</span>')
    ico = '<svg class="sh-i" aria-hidden="true" focusable="false"><use href="assets/images/icons.svg#%s"></use></svg>'
    s = s.replace('<a href="#" aria-label="فيسبوك">' + ico % 'b-facebook-f' + '</a>',
                  '<a href="https://www.facebook.com/sharer/sharer.php?u=%s" data-sh-share="facebook" aria-label="فيسبوك" rel="noopener" target="_blank">%s</a>' % (LU, ico % 'b-facebook-f'))
    s = s.replace('<a href="#" aria-label="إكس">' + ico % 'b-x-twitter' + '</a>',
                  '<a href="https://twitter.com/intent/tweet?url=%s" data-sh-share="x" aria-label="إكس" rel="noopener" target="_blank">%s</a>' % (LU, ico % 'b-x-twitter'))
    s = s.replace('<a href="#" aria-label="واتساب">' + ico % 'b-whatsapp' + '</a>',
                  '<a href="https://api.whatsapp.com/send?text=%s" data-sh-share="whatsapp" aria-label="واتساب" rel="noopener" target="_blank">%s</a>' % (LU, ico % 'b-whatsapp'))
    s = s.replace('<a href="#" aria-label="نسخ الرابط" data-sh-live-copy>', '<a href="%s" aria-label="نسخ الرابط" data-sh-share="copy">' % LU)
    return s


def live_js(s):
    if 'viewers (demo counter)' in s:
        a = s.index('  /* ------------------------------------------------ viewers (demo counter) */')
        b = s.index('  /* ------------------------------------------------ copy link */')
        s = s[:a] + """  /* ------------------------------------------------ viewers: only what the feed reports */
  var viewersWrap = root.querySelector('[data-sh-live-viewers-wrap]');
  document.addEventListener('sh-feed:live-state', function (e) {
    var d = e.detail || {};
    if (viewersEl && typeof d.viewers === 'number') { viewersEl.textContent = fmtInt(d.viewers); if (viewersWrap) viewersWrap.hidden = false; }
  });

""" + s[b:]
    if 'copy link */' in s:
        a = s.index('  /* ------------------------------------------------ copy link */')
        b = s.index('  /* ------------------------------------------------ player-bound UI */')
        s = s[:a] + s[b:]
    return s


if __name__ == '__main__':
    t = rw('index.html', index)
    print('index: h1', t.count('<h1'), '| social real', t.count('sh-index-social__a-1" rel'), '| sh-cv', t.count('class="sh-cv'))
    t = rw('article.html', article)
    print('article: share', t.count('data-sh-share='), '| href=#', t.count('href="#"'))
    t = rw('live.html', live)
    print('live: href=#', t.count('href="#"'))
    rw('js/live.js', live_js)
    print('live.js ok')
