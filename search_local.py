"""شهاب — local search over data/search-index.json (dev stand-in for Meilisearch).

Arabic-aware enough for a demo: strips tashkeel and tatweel, folds the alef
forms, taa marbuta and alef maqsura, and matches every query token as a
prefix of some headline token. Ranking: phrase hit > all tokens at word start
> token count, then recency. Production: Laravel Scout + Meilisearch answer
the same JSON shape ({q, hits:[{t, href, cat, type, ago}], total}).
"""
import json, os, re, time

INDEX = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'data', 'search-index.json')
_cache = {'t': 0, 'items': []}

TASHKEEL = ''.join(chr(c) for c in range(0x064B, 0x0653)) + chr(0x0670) + chr(0x0640)
FOLD = str.maketrans({'أ': 'ا', 'إ': 'ا', 'آ': 'ا', 'ٱ': 'ا', 'ة': 'ه', 'ى': 'ي', 'ؤ': 'و', 'ئ': 'ي', '«': ' ', '»': ' ', '"': ' ', '،': ' ', '.': ' ', ':': ' ', '|': ' '})
PREFIX = re.compile('^(و|ف|ب|ل|ك|ال|لل|وال|بال|فال|كال)')


def norm(s):
    s = (s or '').translate(FOLD)
    s = ''.join(ch for ch in s if ch not in TASHKEEL)
    return re.sub(r'\s+', ' ', s).strip().lower()


def tokens(s):
    return [t for t in norm(s).split(' ') if t]


def stem(t):
    m = PREFIX.match(t)
    return t[m.end():] if m and len(t) - m.end() >= 3 else t


def items():
    try:
        mt = os.path.getmtime(INDEX)
    except OSError:
        return []
    if mt != _cache['t']:
        data = json.load(open(INDEX, encoding='utf-8'))
        for it in data:
            it['_n'] = norm(it['t'] + ' ' + (it.get('cat') or ''))
            it['_w'] = [stem(w) for w in it['_n'].split(' ')]
        _cache['t'] = mt
        _cache['items'] = data
    return _cache['items']


def search(q, limit=8):
    q = (q or '').strip()
    if not q:
        return {'q': q, 'hits': [], 'total': 0}
    nq = norm(q)
    qt = [stem(t) for t in tokens(q)]
    scored = []
    for it in items():
        words = it['_w']
        score = 0
        if nq in it['_n']:
            score += 40
        ok = True
        for t in qt:
            if any(w.startswith(t) for w in words):
                score += 10
            elif any(t in w for w in words) and len(t) >= 3:
                score += 4
            else:
                ok = False
                break
        if not ok:
            continue
        ago = it.get('ago')
        if ago is not None:
            score += max(0, 6 - ago / 240.0)
        if it.get('type') == 'news':
            score += 1
        scored.append((score, it))
    scored.sort(key=lambda x: -x[0])
    hits = [{k: v for k, v in it.items() if not k.startswith('_')} for _, it in scored[:limit]]
    return {'q': q, 'hits': hits, 'total': len(scored)}
