#!/usr/bin/env python3
"""شهاب — static clock strings → <time data-sh-ago> (relative, evergreen demo).

The demo's «now» is 10:40 م; every «HH:MM م/ص» inside a time-only span becomes
<time class="…" data-sh-ago="N"> (N minutes before now), «أمس» adds a day,
and «محدث HH:MM» keeps the word and gets a <time> after it. js/ui.js turns
those into «منذ 8 د» and a full-date title at runtime; the CMS emits real
datetime attributes instead.

Usage:  python tools/times.py [files…]     (default: the route pages)
"""
import os, re, sys, glob

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)
NOW = 22 * 60 + 40


def ago_of(h, mi, ap, day=0):
    h, mi = int(h), int(mi)
    if ap == 'م' and h != 12:
        h += 12
    if ap == 'ص' and h == 12:
        h = 0
    d = NOW - (h * 60 + mi)
    if d < 0:
        d += 1440
    return d + day * 1440


def convert(s):
    def rep(m):
        cls, pre, h, mi, ap = m.group(1), m.group(2) or '', m.group(3), m.group(4), m.group(5)
        return '<time class="%s" data-sh-ago="%d"></time>' % (cls, ago_of(h, mi, ap, 1 if 'أمس' in pre else 0))
    s = re.sub(r'<span class="([^"]+)">\s*(اليوم |أمس )?(\d{1,2}):(\d{2})\s*(م|ص)\s*</span>', rep, s)
    s = re.sub(r'<span class="sh-upd__time"><b class="sh-tnum">(\d{1,2}):(\d{2})</b><small>(م|ص)</small></span>',
               lambda m: '<span class="sh-upd__time"><time class="sh-tnum" data-sh-ago="%d"></time></span>' % ago_of(m.group(1), m.group(2), m.group(3)), s)
    s = re.sub(r'(محدث|آخر تحديث)\s+(\d{1,2}):(\d{2})\s*(م|ص)?', lambda m: '%s <time data-sh-ago="%d"></time>' % (m.group(1), ago_of(m.group(2), m.group(3), m.group(4) or 'م')), s)
    return s


ROUTES = ['index', 'article', 'category', 'coverage', 'tag', 'archive', 'video', 'video-watch', 'live', 'reels', 'photos', 'files', 'author', 'search', 'sections']

if __name__ == '__main__':
    files = sys.argv[1:] or [p + '.html' for p in ROUTES]
    for f in files:
        s = open(f, encoding='utf-8').read()
        t = convert(s)
        if t != s:
            open(f, 'w', encoding='utf-8', newline='\n').write(t)
        print('%-16s %+d <time>' % (f, t.count('data-sh-ago') - s.count('data-sh-ago')))
