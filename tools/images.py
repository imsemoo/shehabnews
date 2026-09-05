#!/usr/bin/env python3
"""شهاب — image pipeline for the static build.

Converts the photographic PNG/JPG assets to WebP at sane sizes, rewrites every
reference (HTML, CSS, JS, partials) to the new file, deletes the originals and
the assets nothing references, and stamps width/height on <img> tags that point
at local files (CLS). Logos stay PNG (alpha, tiny).

Usage:  python tools/images.py
"""
import os, re, glob
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)

# name -> (max width, quality)
CONVERT = {
    'archive-texture.png': (800, 70),      # background texture at 6% opacity
    'coverage-hero2.png': (1600, 78),
    'file-1000-days.png': (452, 82),
    'file-aqmar-altoufan.png': (366, 82),
    'file-raheel-aldaif.png': (900, 78),
    'file-world-cup-2026.png': (462, 82),
    'gaza-coast.png': (1600, 78),
    'hub-arab-world.jpg': (760, 80),
    'live-poster.jpg': (1280, 78),
    'palestine-map.png': (1400, 78),
    'prog-akhbar-shlomo.png': (465, 82),
    'prog-alhikaya.png': (465, 82),
    'prog-hadith-alyawm.png': (465, 82),
    'prog-qissat-soura.png': (465, 82),
    'prog-seen-sareeh.png': (465, 82),
    'reel-akhbar-shlomo.jpg': (360, 80),
    'reel-alhikaya.jpg': (360, 80),
    'reel-hadith-alyawm.jpg': (360, 80),
    'reel-qissat-soura.jpg': (360, 80),
    'reel-seen-sareeh.jpg': (360, 80),
    'video-poster-alhikaya.jpg': (960, 78),
}
# repoint, then delete
ALIAS = {'coverage.png': 'coverage-hero2.webp', 'night-city.webm': 'footer-city.webm'}
DELETE = ['assets/images/coverage.png', 'assets/images/coverage-hero.png', 'assets/video/night-city.webm',
          'thumb_600x600_uploads_images_2022_11_LH21a.jpg', 'thumb_900x1120_uploads_images_2022_11_LH21a.jpg',
          'uploads_images_2021_11_IvQHO.jpg', 'uploads_images_2022_11_EX8f6.png', 'uploads_images_2022_11_LH21a.jpg',
          'uploads_images_2024_10_1Shl3.jpg', 'uploads_images_2026_07_ngA17.jpg', '_tmp_check.txt']

TEXT_FILES = sorted(glob.glob('*.html')) + sorted(glob.glob('partials/*.html')) + sorted(glob.glob('css/*.css')) \
    + sorted(glob.glob('css/pages/*.css')) + sorted(glob.glob('js/*.js')) + ['README.md']


def convert():
    before = after = 0
    for name, (maxw, q) in CONVERT.items():
        src = os.path.join('assets/images', name)
        if not os.path.exists(src):
            continue
        im = Image.open(src)
        if im.width > maxw:
            im = im.resize((maxw, round(im.height * maxw / im.width)), Image.LANCZOS)
        dst = os.path.splitext(src)[0] + '.webp'
        im.save(dst, 'WEBP', quality=q, method=6)
        before += os.path.getsize(src); after += os.path.getsize(dst)
        print('%-32s %5dx%-5d %6.0fKB -> %5.0fKB' % (name, im.width, im.height, os.path.getsize(src) / 1024, os.path.getsize(dst) / 1024))
        os.remove(src)
    print('converted total: %.1fMB -> %.1fMB' % (before / 1048576, after / 1048576))


def rewrite_refs():
    repl = {n: os.path.splitext(n)[0] + '.webp' for n in CONVERT}
    repl.update(ALIAS)
    for f in TEXT_FILES:
        s = open(f, encoding='utf-8').read()
        t = s
        for a, b in repl.items():
            t = t.replace(a, b)
        if t != s:
            open(f, 'w', encoding='utf-8', newline='\n').write(t)


def delete_unused():
    for f in DELETE:
        if os.path.exists(f):
            os.remove(f); print('deleted', f)


IMG_RX = re.compile(r'<img\b([^>]*?)src="(assets/images/[^"]+)"([^>]*?)>')


def stamp_dims():
    n = 0
    for f in sorted(glob.glob('*.html')):
        s = open(f, encoding='utf-8').read()
        def fix(m):
            nonlocal n
            a, src, b = m.group(1), m.group(2), m.group(3)
            attrs = a + b
            if 'width=' in attrs or not os.path.exists(src) or src.endswith('.svg'):
                return m.group(0)
            im = Image.open(src)
            n += 1
            return '<img%ssrc="%s" width="%d" height="%d"%s>' % (a, src, im.width, im.height, b)
        t = IMG_RX.sub(fix, s)
        if t != s:
            open(f, 'w', encoding='utf-8', newline='\n').write(t)
    print('stamped width/height on', n, 'images')


if __name__ == '__main__':
    convert()
    rewrite_refs()
    delete_unused()
    stamp_dims()
