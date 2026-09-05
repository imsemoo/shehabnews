#!/usr/bin/env python3
"""شهاب — Phase 2: wire the live channel into the pages.

Adds data-sh-feed="updates" containers with their <template> rows on the
index (updates rail + live-coverage list), the coverage timeline, the story
banner on the article, the feed status on the live page, and the docked live
bar in the footer partial. Idempotent.

Usage:  python tools/phase2_hooks.py   (then python tools/chrome.py)
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


TPL_RAIL = '''<template data-sh-feed-tpl><a href="{href}" class="sh-index-hero__a-3 sh-upd">
                <span class="sh-upd__time"><time class="sh-tnum" data-sh-time-slot></time></span>
                <span class="sh-upd__node" aria-hidden="true"></span>
                <span class="sh-upd__body">
                  <span class="sh-upd__cat">{cat}</span>
                  <span class="sh-upd__t">{t}</span>
                </span>
              </a></template>
'''
TPL_LIVE_LIST = '''<template data-sh-feed-tpl><a href="{href}" class="sh-index-live-coverage__a-3">
                  <time class="sh-index-live-coverage__span-11" data-sh-time-slot></time>
                  <span class="sh-index-live-coverage__span-12"><span class="sh-mark sh-index-live-coverage__span-13"></span></span>
                  <span class="sh-min0">
                    <span class="sh-index-live-coverage__span-14"><span>{cat}</span><span class="sh-index-live-coverage__span-15">جديد</span></span>
                    <span class="sh-index-live-coverage__span-16">{t}</span>
                  </span>
                </a></template>
'''
TPL_TIMELINE = '''<template data-sh-feed-tpl><div>
          <a href="{href}" class="sh-coverage-timeline__a-1">
            <time class="sh-coverage-timeline__span-8" data-sh-time-slot data-sh-format="clock"></time>
            <span class="sh-coverage-timeline__span-9"><span class="sh-mark sh-coverage-timeline__span-10"></span></span>
            <span class="sh-coverage-timeline__span-11">
              <span class="sh-coverage-timeline__span-12">{cat}<span class="sh-coverage-timeline__span-13"><span class="sh-coverage-timeline__span-14"></span>جديد</span></span>
              <span class="sh-coverage-timeline__span-15">{t}</span>
              <span class="sh-coverage-timeline__span-16">مراسل شهاب</span>
            </span>
          </a>
        </div></template>
'''
STORY = '''
      <aside class="sh-story" data-sh-story-updates hidden aria-live="polite">
        <div class="sh-story__head"><span class="sh-story__dot" aria-hidden="true"></span>تحدّث هذا الخبر <time data-sh-story-time data-sh-format="clock"></time></div>
        <ul class="sh-story__list" data-sh-story-list></ul>
      </aside>'''
DOCK = '''<aside class="sh-livedock" data-sh-livedock hidden aria-label="البث المباشر الآن">
  <a href="live.html" class="sh-livedock__thumb" style="background-image:url(assets/images/live-poster.webp)" aria-hidden="true" tabindex="-1"><span class="sh-livedock__badge">مباشر</span></a>
  <span class="sh-livedock__body">
    <span class="sh-livedock__kicker">على الهواء الآن</span>
    <a href="live.html" class="sh-livedock__title" data-sh-livedock-title>شهاب مباشر — بث من غزة</a>
    <span class="sh-livedock__meta"><b data-sh-livedock-viewers></b> يشاهدون · <a href="live.html">شاهد البث</a></span>
  </span>
  <button type="button" class="sh-livedock__close" data-sh-livedock-close aria-label="إغلاق"><svg class="sh-i" aria-hidden="true" focusable="false"><use href="assets/images/icons.svg#s-xmark"></use></svg></button>
</aside>
'''


def index(s):
    if 'data-sh-feed="updates"' not in s:
        s = s.replace('<div class="sh-index-hero__div-8">', '<div class="sh-index-hero__div-8" data-sh-feed="updates" data-sh-feed-max="6">\n              ' + TPL_RAIL, 1)
        s = s.replace('<div class="sh-index-live-coverage__div-10">\n                <span class="sh-index-live-coverage__span-10"></span>',
                      '<div class="sh-index-live-coverage__div-10" data-sh-feed="updates" data-sh-feed-max="8">\n                <span class="sh-index-live-coverage__span-10" data-sh-feed-head></span>\n                ' + TPL_LIVE_LIST, 1)
    s = s.replace('<ol class="sh-index-top-now__ol-1">', '<ol class="sh-index-top-now__ol-1" data-sh-feed="top">', 1)
    return s


def coverage(s):
    if 'data-sh-feed="updates"' not in s:
        # the list starts right after the day divider block; the divider stays the fixed head
        s = re.sub(r'(<div class="sh-coverage-timeline__div-2">\s*<span class="sh-coverage-timeline__span-4"></span>\s*<div>)',
                   lambda m: m.group(1).replace('<div class="sh-coverage-timeline__div-2">', '<div class="sh-coverage-timeline__div-2" data-sh-feed="updates" data-sh-feed-count="[data-sh-cov-count]">\n      ' + TPL_TIMELINE).replace('<span class="sh-coverage-timeline__span-4"></span>', '<span class="sh-coverage-timeline__span-4"></span>').replace('\n        <div>', '\n        <div data-sh-feed-head>'), s, count=1)
        s = s.replace('التسلسل الزمني <span class="sh-coverage-timeline__span-1">14 حدثًا</span>', 'التسلسل الزمني <span class="sh-coverage-timeline__span-1"><span data-sh-cov-count>14</span> حدثًا</span>')
    s = re.sub(r'<span class="sh-coverage-timeline__span-2"><span class="sh-coverage-timeline__span-3"></span>الأحدث أولًا — يتحدّث تلقائيًا</span>',
               '<span class="sh-coverage-timeline__span-2"><span class="sh-coverage-timeline__span-3"></span>الأحدث أولًا — <span data-sh-feed-status>يتحدّث تلقائيًا</span></span>', s)
    return s


def article(s):
    if 'data-sh-story-updates' not in s:
        s = s.replace('        </div>\n      </div>\n    </div>\n\n    <figure data-screen-label="Lead Image"', '        </div>\n      </div>' + STORY + '\n    </div>\n\n    <figure data-screen-label="Lead Image"', 1)
    s = s.replace('<time datetime="2026-09-02T22:06:00+03:00" data-sh-format="abs">الثلاثاء 2 سبتمبر 2026 · 10:06 م</time> · قراءة 4 دقائق',
                  '<time datetime="2026-09-02T22:06:00+03:00" data-sh-format="abs">الثلاثاء 2 سبتمبر 2026 · 10:06 م</time> · قراءة 4 دقائق <span class="sh-story__mod" hidden>· آخر تحديث <time data-sh-story-modified data-sh-format="clock"></time></span>')
    return s


def live(s):
    s = s.replace('<body data-sh-page="live"', '<body data-sh-page="live" data-sh-page-live', 1)
    return s


def footer(s):
    if 'data-sh-livedock' not in s:
        s = s.replace('<button type="button" class="sh-totop"', DOCK + '<button type="button" class="sh-totop"', 1)
    return s


if __name__ == '__main__':
    t = rw('index.html', index); print('index feeds:', t.count('data-sh-feed='))
    t = rw('coverage.html', coverage); print('coverage feeds:', t.count('data-sh-feed='), '| status', t.count('data-sh-feed-status'))
    t = rw('article.html', article); print('article story banner:', 'data-sh-story-updates' in t)
    rw('live.html', live)
    t = rw('partials/footer.html', footer); print('footer dock:', 'data-sh-livedock' in t)
