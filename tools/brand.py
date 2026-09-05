#!/usr/bin/env python3
"""شهاب — brand assets the head needs: favicon.svg, PWA icons, og-default.jpg.

Everything is derived from assets/images/logo-white.png and the sheen mark
(assets/images/mark-sheen.svg) so nothing new is invented.

Usage:  python tools/brand.py
"""
import os
from PIL import Image, ImageDraw

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)
NAVY = (10, 26, 51)
BLUE = (27, 90, 166)
OUT = 'assets/images'


def square_icon(size, pad_ratio=0.16, bg=BLUE, maskable=False):
    im = Image.new('RGBA', (size, size), bg + (255,))
    logo = Image.open(os.path.join(OUT, 'logo-white.png')).convert('RGBA')
    pad = int(size * (0.22 if maskable else pad_ratio))
    box = size - 2 * pad
    scale = min(box / logo.width, box / logo.height)
    logo = logo.resize((max(1, int(logo.width * scale)), max(1, int(logo.height * scale))), Image.LANCZOS)
    im.alpha_composite(logo, ((size - logo.width) // 2, (size - logo.height) // 2))
    return im


def og_image():
    W, H = 1200, 630
    im = Image.new('RGB', (W, H), NAVY)
    d = ImageDraw.Draw(im)
    d.rectangle([0, 0, W, 8], fill=BLUE)
    logo = Image.open(os.path.join(OUT, 'logo-white.png')).convert('RGBA')
    scale = 420 / logo.width
    logo = logo.resize((int(logo.width * scale), int(logo.height * scale)), Image.LANCZOS)
    im.paste(logo, ((W - logo.width) // 2, (H - logo.height) // 2 - 20), logo)
    # the sheen dots as a small mark under the logo
    d.rectangle([W // 2 - 60, H // 2 + 150, W // 2 + 60, H // 2 + 153], fill=BLUE)
    im.save(os.path.join(OUT, 'og-default.jpg'), 'JPEG', quality=86, optimize=True, progressive=True)


def favicon_svg():
    mark = open(os.path.join(OUT, 'mark-sheen.svg'), encoding='utf-8').read()
    # reuse the mark's path inside a blue tile
    import re
    m = re.search(r'viewBox="([^"]+)"', mark)
    vb = m.group(1) if m else '0 0 100 100'
    paths = ''.join(re.findall(r'<path[^>]*/>|<path[^>]*>.*?</path>', mark, re.S))
    paths = re.sub(r'fill="[^"]*"', '', paths)
    svg = ('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">'
           '<rect width="64" height="64" rx="10" fill="#1b5aa6"/>'
           '<svg x="12" y="12" width="40" height="40" viewBox="%s" fill="#fff">%s</svg></svg>' % (vb, paths))
    open(os.path.join(OUT, 'favicon.svg'), 'w', encoding='utf-8').write(svg)


if __name__ == '__main__':
    for s in (192, 512):
        square_icon(s).save(os.path.join(OUT, 'icon-%d.png' % s), 'PNG', optimize=True)
        square_icon(s, maskable=True).save(os.path.join(OUT, 'icon-%d-maskable.png' % s), 'PNG', optimize=True)
    square_icon(180, bg=NAVY).convert('RGB').save(os.path.join(OUT, 'apple-touch-icon.png'), 'PNG', optimize=True)
    og_image()
    favicon_svg()
    for f in ('favicon.svg', 'icon-192.png', 'icon-512.png', 'icon-192-maskable.png', 'icon-512-maskable.png', 'apple-touch-icon.png', 'og-default.jpg'):
        print('%-26s %6.1f KB' % (f, os.path.getsize(os.path.join(OUT, f)) / 1024))
