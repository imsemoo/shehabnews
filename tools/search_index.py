#!/usr/bin/env python3
"""شهاب — build data/search-index.json from the static pages.

Every internal link whose text looks like a headline becomes one entry:
{t, href, cat, type, ago, page}. The dev server answers api/search from this
file; production indexes the CMS instead (Laravel Scout + Meilisearch) and
returns the same shape.

Usage:  python tools/search_index.py
"""
import os, re, json, glob

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)

TYPE_BY_HREF = {'article.html': 'news', 'video-watch.html': 'video', 'video.html': 'video', 'photos.html': 'photo',
                'files.html': 'file', 'coverage.html': 'coverage', 'reels.html': 'video', 'shorts.html': 'video'}
SKIP_PAGES = {'homepage-v2', 'homepage-v3', 'homepage-v4', 'loader', 'system-states', 'offline', 'saved'}
ANCHOR = re.compile(r'<a\b([^>]*)>(.*?)</a>', re.S)
HREF = re.compile(r'href="([^"]+)"')
TAG = re.compile(r'<[^>]+>')
AGO = re.compile(r'data-sh-ago="([0-9.]+)"')
KICK = re.compile(r'class="(?:[^"]*\b)?(?:sh-link|sh-meta__cat|sh-upd__cat|sh-hubcard__cat|sh-coverage-timeline__span-12|sh-index-live-coverage__span-14)\b[^"]*"[^>]*>(.*?)</span>', re.S)
TITLE = re.compile(r'class="(?:[^"]*\b)?(?:sh-card__title|sh-upd__t|sh-rail__title|sh-search-search-body__span-1|sh-search-featured-result__span-3|sh-index-live-coverage__span-16|sh-coverage-timeline__span-15|sh-coverage-timeline__span-20|sh-hubcard__title|sh-list__title|sh-index-hero__span-5|sh-index-top-now__a-1|sh-index-live-coverage__h3-1)\b[^"]*"[^>]*>(.*?)</(?:span|h3|a)>', re.S)


def clean(s):
    return re.sub(r'\s+', ' ', TAG.sub(' ', s)).strip()


def headline(inner, attrs):
    m = TITLE.search(inner)
    if m:
        return clean(m.group(1))
    # a bare anchor around one headline (list rows, top-now)
    t = clean(inner)
    if 24 <= len(t) <= 160 and not re.search(r'اقرأ|المزيد|كل ال|شاهد|افتح', t):
        return t
    return ''


def kicker(inner):
    m = KICK.search(inner)
    if not m:
        return ''
    k = clean(m.group(1))
    k = re.sub(r'\s*(جديد|عاجل)$', '', k).strip()
    return k[:24]


def build():
    seen, out = {}, []
    for f in sorted(glob.glob('*.html')):
        page = f[:-5]
        if page in SKIP_PAGES:
            continue
        s = open(f, encoding='utf-8').read()
        for m in ANCHOR.finditer(s):
            attrs, inner = m.group(1), m.group(2)
            h = HREF.search(attrs)
            if not h:
                continue
            href = h.group(1).split('#')[0].split('?')[0]
            if href not in TYPE_BY_HREF:
                continue
            t = headline(inner, attrs)
            if not t or t in seen:
                continue
            ago = AGO.search(inner)
            entry = {'t': t, 'href': h.group(1), 'cat': kicker(inner), 'type': TYPE_BY_HREF[href], 'ago': float(ago.group(1)) if ago else None, 'page': page}
            seen[t] = 1
            out.append(entry)
    return out


if __name__ == '__main__':
    os.makedirs('data', exist_ok=True)
    items = build()
    json.dump(items, open('data/search-index.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=0)
    by = {}
    for it in items:
        by[it['type']] = by.get(it['type'], 0) + 1
    print('indexed', len(items), 'headlines', by)
