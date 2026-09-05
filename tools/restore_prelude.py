#!/usr/bin/env python3
"""شهاب — restore the blocks that sat between the header and <main>.

A page-frame cleanup once assumed nothing lives between </header> and the
first <main>; live.html (the live stage), coverage.html (the coverage hero)
and video-watch.html (the player) do. This script takes those blocks from the
last commit, re-applies the session's mechanical transforms (icon sprite,
webp names, <time> conversion) and puts them back right after the header
marker. Idempotent: a page that already has content before <main> is skipped.

Usage:  python tools/restore_prelude.py
"""
import os, re, subprocess, sys, importlib.util

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)
sys.path.insert(0, os.path.join(ROOT, 'tools'))


def load(name):
    spec = importlib.util.spec_from_file_location(name, os.path.join(ROOT, 'tools', name + '.py'))
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


icons = load('icons')
images = load('images')
times = load('times')


def original(page):
    out = subprocess.run(['git', 'show', 'HEAD:%s.html' % page], capture_output=True)
    return out.stdout.decode('utf-8') if out.returncode == 0 else ''


def prelude_of(html):
    """Markup between the site header and the first <main>, if it is real content."""
    m = re.search(r'</header>(.*?)<main\b', html, re.S)
    if not m:
        return ''
    block = m.group(1)
    if not re.search(r'<(section|div|article)\b', block):
        return ''
    return block.strip('\n')


def transform(block):
    block = icons.I_RX.sub(icons.rewrite_tag, block)
    for name in images.CONVERT:
        block = block.replace(name, os.path.splitext(name)[0] + '.webp')
    for a, b in images.ALIAS.items():
        block = block.replace(a, b)
    block = times.convert(block)
    return block


def restore(page):
    f = page + '.html'
    cur = open(f, encoding='utf-8').read()
    if prelude_of(cur):
        return 'kept'
    block = prelude_of(original(page))
    if not block:
        return 'none'
    block = transform(block)
    marker = '<!-- /sh:header -->'
    if marker not in cur:
        return 'no-marker'
    cur = cur.replace(marker, marker + '\n\n' + block + '\n', 1)
    open(f, 'w', encoding='utf-8', newline='\n').write(cur)
    return 'restored (%d chars)' % len(block)


if __name__ == '__main__':
    pages = [p for p in icons.PAGES if p.endswith('.html') and '/' not in p]
    for f in sorted(pages):
        page = f[:-5]
        if page.startswith('homepage-v') or page in ('loader', 'system-states', 'shorts', 'offline', 'now', 'map', 'data', 'saved'):
            continue
        r = restore(page)
        if r not in ('none', 'kept'):
            print('%-16s %s' % (f, r))
    print('done')
