#!/usr/bin/env python3
"""شهاب — Phase 1: no dead links. Every href="#" gets a real destination.

Rules are per page and per context (class / text). Controls that only make
sense with JS (player buttons) become <button>s. The search page gets its
functional controls (form, filters, sort, advanced panel, pager hrefs).

Usage:  python tools/phase1_links.py
"""
import os, re, urllib.parse

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)


def rw(path, fn):
    s = open(path, encoding='utf-8').read()
    t = fn(s)
    if t != s:
        open(path, 'w', encoding='utf-8', newline='\n').write(t)
    return t


def text(s):
    return re.sub(r'\s+', ' ', re.sub(r'<[^>]+>', '', s)).strip()


def q(s):
    return urllib.parse.quote(s)


def by_class(s, cls, href):
    return re.sub(r'<a href="#"( [^>]*)?class="%s' % re.escape(cls), lambda m: '<a href="%s"%sclass="%s' % (href, m.group(1) or ' ', cls), s)


def pager(s, page, prefix=''):
    """data-sh-goto / prev / next pager links get ?page= hrefs (js pager() intercepts)."""
    s = re.sub(r'<a data-sh-goto="(\d+)" href="#"', lambda m: '<a data-sh-goto="%s" href="%s?%spage=%s"' % (m.group(1), page, prefix, m.group(1)), s)
    s = re.sub(r'<a href="#" data-sh-goto="(\d+)"', lambda m: '<a href="%s?%spage=%s" data-sh-goto="%s"' % (page, prefix, m.group(1), m.group(1)), s)
    s = s.replace('<a href="#" data-sh-prev-page', '<a href="%s?%spage=1" data-sh-prev-page' % (page, prefix))
    s = s.replace('<a href="#" data-sh-next-page', '<a href="%s?%spage=2" data-sh-next-page' % (page, prefix))
    # bare numbered / prev / next links without hooks
    s = re.sub(r'<a href="#" class="(sh-pager__btn|sh-[a-z-]+-pagination__a-2)">(\d+)</a>', lambda m: '<a href="%s?%spage=%s" class="%s">%s</a>' % (page, prefix, m.group(2), m.group(1), m.group(2)), s)
    s = re.sub(r'<a href="#" class="(sh-[a-z-]+-pagination__a-1)">', lambda m: '<a href="%s?%spage=1" class="%s">' % (page, prefix, m.group(1)), s)
    s = re.sub(r'<a href="#" class="(sh-[a-z-]+-pagination__a-3)">', lambda m: '<a href="%s?%spage=2" class="%s">' % (page, prefix, m.group(1)), s)
    return s


# ------------------------------------------------------------------ index --
def index(s):
    # the small player's controls are buttons, not links
    for hook, label in (('data-sh-bigplay', 'تشغيل'), ('data-sh-toggle', 'تشغيل/إيقاف'), ('data-sh-mute', 'الصوت'), ('data-sh-fs', 'ملء الشاشة')):
        s = re.sub(r'<a href="#" %s aria-label="%s" class="([^"]+)">([\s\S]*?)</a>' % (hook, label),
                   lambda m: '<button type="button" %s aria-label="%s" class="%s sh-btn-reset">%s</button>' % (hook, label, m.group(1), m.group(2)), s)
    s = by_class(s, 'sh-vid__prog', 'video.html')
    s = s.replace('<a href="#" class="sh-more">كل الرياضة', '<a href="category.html" class="sh-more">كل الرياضة')
    return s


# --------------------------------------------------------------- category --
def category(s):
    s = s.replace('<a href="#" data-sh-more class=', '<a href="category.html?page=2" data-sh-more class=')
    s = by_class(s, 'sh-mute', 'tag.html')
    s = by_class(s, 'sh-category-section-stream__a-1', 'category.html')
    s = by_class(s, 'sh-category-lead-composition__a-2', 'category.html')
    s = by_class(s, 'sh-category-coverage-closing__a-1', 'coverage.html')
    return s


# --------------------------------------------------------------- coverage --
def coverage(s):
    anchors = {'ملخص': '#cov-summary', 'التسلسل الزمني': '#cov-timeline', 'خلفية': '#cov-background', 'مرتبط': '#cov-related',
               'الصور': 'photos.html', 'آخر التطورات': '#cov-timeline', 'أبرز الأحداث': '#cov-timeline'}
    def nav(m):
        label = text(m.group(2))
        for k, v in anchors.items():
            if label.startswith(k):
                return '<a href="%s" class="%s">%s</a>' % (v, m.group(1), m.group(2))
        return '<a href="#cov-timeline" class="%s">%s</a>' % (m.group(1), m.group(2))
    s = re.sub(r'<a href="#" class="(sh-coverage-coverage-nav__a-[12])">([\s\S]*?)</a>', nav, s)
    s = s.replace('<a href="#" class="sh-link">أرشيف التغطية</a>', '<a href="archive.html" class="sh-link">أرشيف التغطية</a>')
    s = by_class(s, 'sh-coverage-timeline__a-4', 'category.html')
    return s


# -------------------------------------------------------------------- tag --
def tag(s):
    s = re.sub(r'<a href="#" class="sh-inline-flex">', '<a href="tag.html" class="sh-inline-flex">', s)
    s = s.replace('<a href="#" class="sh-tag-tag-listing__a-2">', '<a href="tag.html?page=1" class="sh-tag-tag-listing__a-2">')
    s = s.replace('<a href="#" class="sh-tag-tag-listing__a-3">', '<a href="tag.html?page=2" class="sh-tag-tag-listing__a-3">')
    return s


# ---------------------------------------------------------------- archive --
def archive(s):
    def year(m):
        y = re.search(r'sh-archive-archive-rail__span-5">(\d{4})<', m.group(0))
        return m.group(0).replace('href="#"', 'href="archive.html?year=%s"' % (y.group(1) if y else '2026'), 1)
    s = re.sub(r'<a href="#" class="sh-archive-archive-rail__a-2">[\s\S]*?</a>', year, s)
    # month / day chips in the date nav
    k = [0]
    def chip(m):
        k[0] += 1
        return '<a href="archive.html?d=%d" class="sh-inline-flex">' % k[0]
    s = re.sub(r'<a href="#" class="sh-inline-flex">', chip, s)
    s = s.replace('<a href="#" class="sh-archive-archive-timeline__a-4">', '<a href="archive.html?page=2" class="sh-archive-archive-timeline__a-4">')
    return s


# ------------------------------------------------------------------ video --
def video(s):
    s = pager(s, 'video.html')
    s = by_class(s, 'sh-video-video-categories__a-1', 'video.html')
    s = by_class(s, 'sh-video-latest-videos__a-1', 'video.html')
    s = by_class(s, 'sh-video-coverage-collections__a-1', 'coverage.html')
    return s


def video_watch(s):
    s = s.replace('<a href="#" aria-label="واتساب" class="sh-video-watch-v', '<a href="https://api.whatsapp.com/send?text=https://shehabnews.com/video-watch.html" data-sh-share="whatsapp" rel="noopener" target="_blank" aria-label="واتساب" class="sh-video-watch-v')
    s = s.replace('<a href="#" aria-label="نسخ الرابط" data-sh-watch-copy', '<a href="https://shehabnews.com/video-watch.html" aria-label="نسخ الرابط" data-sh-watch-copy')
    s = re.sub(r'<a href="#" class="sh-inline-flex">', '<a href="video.html" class="sh-inline-flex">', s)
    return s


# ----------------------------------------------------------------- photos --
def photos(s):
    s = pager(s, 'photos.html')
    s = by_class(s, 'sh-photos-from-the-lens__a-2', 'photos.html')
    s = by_class(s, 'sh-photos-photos-closing__a-1', 'newsletter.html')
    s = by_class(s, 'sh-photos-photo-categories__a-1', 'photos.html')
    s = by_class(s, 'sh-photos-editors-picks__a-1', 'photos.html')
    return s


# ------------------------------------------------------------------ files --
def files(s):
    s = re.sub(r'<a href="#" class="sh-tabs__link">(عالم|تحقيقات|إنفوغرافيك)</a>', lambda m: '<a href="files.html?desk=%s" class="sh-tabs__link">%s</a>' % (q(m.group(1)), m.group(1)), s)
    s = by_class(s, 'sh-files-files-hero__a-1', 'coverage.html')
    s = by_class(s, 'sh-files-files-closing__a-1', 'map.html')
    s = by_class(s, 'sh-files-featured-special__a-1', 'coverage.html')
    s = by_class(s, 'sh-files-featured-special__a-2', 'coverage.html')
    s = by_class(s, 'sh-files-archive__a-1', 'archive.html')
    return s


# ----------------------------------------------------------------- author --
def author(s):
    s = pager(s, 'author.html')
    s = by_class(s, 'sh-author-author-topics__a-1', 'tag.html')
    k = [2025]
    def yr(m):
        k[0] += 1
        return '<a href="author.html?year=%d" class="sh-author-author-archive__a-2">' % k[0]
    s = re.sub(r'<a href="#" class="sh-author-author-archive__a-2">', yr, s)
    return s


# ---------------------------------------------------------------- contact --
def contact(s):
    s = s.replace('<a href="#" aria-label="فيسبوك" class="sh-contact-conta', '<a href="https://www.facebook.com/sahpp2023" rel="noopener" target="_blank" aria-label="فيسبوك" class="sh-contact-conta')
    s = s.replace('<a href="#" aria-label="إكس" class="sh-contact-conta', '<a href="https://twitter.com/ShehabAgency" rel="noopener" target="_blank" aria-label="إكس" class="sh-contact-conta')
    s = s.replace('<a href="#" aria-label="إنستغرام" class="sh-contact-conta', '<a href="https://www.instagram.com/shehabagency/" rel="noopener" target="_blank" aria-label="إنستغرام" class="sh-contact-conta')
    s = s.replace('<a href="#" aria-label="تيليغرام" class="sh-contact-conta', '<a href="https://t.me/ShehabTelegram" rel="noopener" target="_blank" aria-label="تيليغرام" class="sh-contact-conta')
    s = s.replace('<a href="#" aria-label="يوتيوب" class="sh-contact-conta', '<a href="https://www.youtube.com/channel/UChvBXfexWtP5gdGZespJnZw" rel="noopener" target="_blank" aria-label="يوتيوب" class="sh-contact-conta')
    s = re.sub(r'<a href="#" class="sh-inline-flex">', '<a href="contact.html" class="sh-inline-flex">', s)
    return s


# ----------------------------------------------------------------- search --
ADV = '''<details class="sh-search-adv" data-sh-sadv>
      <summary class="sh-search-search-hero__a-1">بحث متقدم</summary>
      <div class="sh-search-adv__body">
        <label class="sh-search-adv__field">القسم <select data-sh-sadv-section><option value="">الكل</option></select></label>
        <label class="sh-search-adv__field">الفترة <select data-sh-sadv-period><option value="">كل الوقت</option><option value="day">آخر 24 ساعة</option><option value="week">آخر أسبوع</option><option value="month">آخر شهر</option></select></label>
      </div>
    </details>'''


def search(s):
    s = s.replace('<main id="main" class="sh-container">', '<main id="main" class="sh-container" data-sh-search-page>', 1)
    s = re.sub(r'<div class="sh-search-search-hero__div-3">([\s\S]*?)<input type="text" value="غزة" placeholder="([^"]+)" class="sh-search-search-hero__input-1">\s*<button type="button" class="sh-search-search-hero__button-1">بحث</button>\s*</div>',
               lambda m: '<form class="sh-search-search-hero__div-3" action="search.html" method="get" role="search" data-sh-search>%s<label class="sr-only" for="sh-q">ابحث في شهاب</label><input id="sh-q" type="search" name="q" value="غزة" placeholder="%s" class="sh-search-search-hero__input-1" autocomplete="off" data-sh-search-q>\n      <button type="submit" class="sh-search-search-hero__button-1">بحث</button>\n    </form>' % (m.group(1), m.group(2)), s, count=1)
    s = s.replace('<strong class="sh-search-search-hero__strong-1">«غزة»</strong>', '<strong class="sh-search-search-hero__strong-1" data-sh-search-term>«غزة»</strong>')
    s = s.replace('<span class="sh-search-search-hero__span-2">1,248 نتيجة</span>', '<span class="sh-search-search-hero__span-2" data-sh-search-count></span>')
    s = s.replace('<a href="#" class="sh-search-search-hero__a-1">بحث متقدم</a>', ADV)
    s = s.replace('<a href="#" class="sh-search-search-hero__a-2">الكل</a>', '<a href="search.html?q=غزة" class="sh-search-search-hero__a-2" data-sh-sfilter="all" aria-pressed="true">الكل</a>')
    s = s.replace('<a href="#" class="sh-rail__link sh-rail__link--pad">الأخبار</a>', '<a href="search.html?q=غزة&amp;type=news" class="sh-rail__link sh-rail__link--pad" data-sh-sfilter="news" aria-pressed="false">الأخبار</a>')
    s = s.replace('<a href="#" class="sh-rail__link sh-rail__link--pad">التقارير</a>', '<a href="search.html?q=غزة&amp;type=report" class="sh-rail__link sh-rail__link--pad" data-sh-sfilter="report" aria-pressed="false">التقارير</a>')
    s = s.replace('<a href="video.html" class="sh-rail__link sh-rail__link--pad">الفيديو</a>', '<a href="video.html?q=غزة" class="sh-rail__link sh-rail__link--pad">الفيديو</a>')
    s = s.replace('<a href="photos.html" class="sh-rail__link sh-rail__link--pad">الصور</a>', '<a href="photos.html?q=غزة" class="sh-rail__link sh-rail__link--pad">الصور</a>')
    s = s.replace('<a href="#" class="sh-search-search-hero__a-3">', '<a href="search.html?q=غزة&amp;sort=old" class="sh-search-search-hero__a-3" data-sh-ssort>')
    s = pager(s, 'search.html', 'q=غزة&amp;')
    s = re.sub(r'<a href="#" class="sh-search-discovery-strip__a-1">([\s\S]*?)</a>', lambda m: '<a href="search.html?q=%s" class="sh-search-discovery-strip__a-1">%s</a>' % (q(text(m.group(1))[:40]), m.group(1)), s)
    s = re.sub(r'<a href="#" class="sh-timeline__item">', '<a href="archive.html" class="sh-timeline__item">', s)
    if 'data-sh-search-empty' not in s:
        s = s.replace('<nav data-sh-pager data-screen-label="Pagination"', '<p class="sh-search__empty" data-sh-search-empty hidden>لا نتائج مطابقة للفلاتر المختارة. جرّب «الكل» أو وسّع الفترة.</p>\n    <nav data-sh-pager data-screen-label="Pagination"', 1)
    if 'js/search.js' not in s:
        s = s.replace('</body>', '<script src="js/search.js?v=103" defer></script>\n</body>', 1)
    return s


# ------------------------------------------------------------- everything --
def generic(s):
    # a breaking bar with no story yet points at the live coverage
    s = s.replace('<a href="#" class="sh-breaking__title" data-sh-breaking-title></a>', '<a href="coverage.html" class="sh-breaking__title" data-sh-breaking-title></a>')
    return s


PAGES = {'index': index, 'category': category, 'coverage': coverage, 'tag': tag, 'archive': archive, 'video': video,
         'video-watch': video_watch, 'photos': photos, 'files': files, 'author': author, 'contact': contact, 'search': search}

if __name__ == '__main__':
    import glob
    for f in sorted(glob.glob('*.html')):
        page = f[:-5]
        if page.startswith('homepage-v') or page in ('loader', 'system-states'):
            continue
        fn = PAGES.get(page)
        t = rw(f, lambda s: generic(fn(s) if fn else s))
        n = t.count('href="#"')
        if n:
            print('%-14s href="#" left: %d' % (f, n))
    # the shared partial too, so the next chrome sync keeps it
    rw('partials/header.html', generic)
    print('done')
