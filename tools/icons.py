#!/usr/bin/env python3
"""شهاب — build the SVG icon sprite and retire Font Awesome.

Reads every `fa-solid|regular|brands fa-<name>` used in the HTML and JS (plus the
names the JS composes at runtime), extracts those glyph outlines from the local
FA 6.5.2 fonts with fontTools, and writes them as <symbol>s into
assets/images/icons.svg. Then rewrites every <i class="fa-… fa-name"> into
<svg class="sh-i …"><use href="assets/images/icons.svg#…"></use></svg>.

Symbol ids: s-<name> (solid), r-<name> (regular), b-<name> (brands).

Usage:  python tools/icons.py            build sprite + rewrite pages
        python tools/icons.py --check    list icons only

Font Awesome Free icons are CC BY 4.0 (https://fontawesome.com/license/free);
the attribution lives in the sprite header.
"""
import os, re, sys, glob
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)

FONTS = {
    'solid': 'tools/fonts/fa-solid-900.ttf',
    'regular': 'tools/fonts/fa-regular-400.ttf',
    'brands': 'tools/fonts/fa-brands-400.ttf',
}
PREFIX = {'solid': 's', 'regular': 'r', 'brands': 'b'}

# names the JS builds at runtime (not visible to the grep below)
RUNTIME = {
    'solid': ['play', 'pause', 'volume-high', 'volume-xmark', 'compress', 'expand',
              'caret-up', 'caret-down', 'minus', 'sun', 'moon', 'cloud-sun', 'cloud-moon',
              'cloud', 'smog', 'cloud-rain', 'cloud-showers-heavy', 'snowflake',
              'cloud-sun-rain', 'cloud-moon-rain', 'cloud-bolt', 'location-dot', 'coins',
              'file-lines', 'chevron-right', 'chevron-left', 'chevron-up', 'chevron-down',
              'xmark', 'link', 'rotate-right', 'arrow-up-right-from-square', 'check',
              'bookmark', 'bell', 'bell-slash', 'share-nodes', 'arrow-up', 'print',
              'text-height', 'circle-half-stroke', 'wifi', 'download', 'font',
              'magnifying-glass', 'clock-rotate-left', 'arrow-right', 'arrow-left',
              'circle-info', 'triangle-exclamation', 'map-location-dot', 'chart-line',
              'filter', 'list', 'table-cells', 'circle-play', 'stop', 'forward-step',
              'backward-step', 'gauge-high', 'headphones', 'tower-broadcast', 'newspaper',
              'images', 'video', 'camera', 'map', 'timeline', 'heart', 'up-right-and-down-left-from-center',
              'up-right-from-square', 'mobile-screen', 'rss', 'envelope', 'paper-plane',
              'chart-simple', 'file-signature', 'list-check', 'quote-right', 'microphone-lines',
              'signal', 'lock', 'tv', 'arrows-up-down', 'paperclip', 'circle', 'share', 'eye',
              'moon', 'sun', 'circle-xmark', 'plus', 'minus', 'crosshairs', 'layer-group',
              'calendar-days', 'fire', 'house', 'person-walking', 'truck-medical', 'school',
              'mosque', 'hospital', 'droplet', 'utensils', 'bolt', 'circle-dot', 'expand'],
    'regular': ['clock', 'heart', 'comment', 'eye', 'envelope', 'bookmark', 'bell', 'circle-play', 'circle-check', 'circle-xmark'],
    'brands': ['x-twitter', 'facebook-f', 'instagram', 'whatsapp', 'telegram', 'youtube', 'tiktok'],
}

ICON_CSS = 'tools/fonts/font-awesome.css'
SPRITE = 'assets/images/icons.svg'
PAGES = sorted(glob.glob('*.html')) + sorted(glob.glob('partials/*.html'))
SCRIPTS = sorted(glob.glob('js/*.js'))


def codepoints():
    css = open(ICON_CSS, encoding='utf-8').read()
    out = {}
    # FA groups aliases: .fa-magnifying-glass:before,.fa-search:before{content:"\f002"}
    for sels, cp in re.findall(r'((?:\.fa-[a-z0-9-]+:before,?)+)\{content:"\\([0-9a-f]+)"\}', css):
        for name in re.findall(r'\.fa-([a-z0-9-]+):before', sels):
            out[name] = int(cp, 16)
    return out


def used():
    names = {k: set(v) for k, v in RUNTIME.items()}
    rx = re.compile(r'fa-(solid|regular|brands)\s+fa-([a-z0-9-]+)')
    for f in PAGES + SCRIPTS:
        for style, name in rx.findall(open(f, encoding='utf-8').read()):
            names[style].add(name)
    return names


def glyph_path(font, cp):
    cmap = font.getBestCmap()
    if cp not in cmap:
        return None
    gs = font.getGlyphSet()
    g = gs[cmap[cp]]
    asc = font['hhea'].ascent
    pen = SVGPathPen(gs, ntos=lambda v: ('%.1f' % v).rstrip('0').rstrip('.'))
    g.draw(TransformPen(pen, (1, 0, 0, -1, 0, asc)))
    upm = font['head'].unitsPerEm
    return pen.getCommands(), g.width, upm


def build_sprite(names, cps):
    fonts = {k: TTFont(v) for k, v in FONTS.items()}
    out = ['<svg xmlns="http://www.w3.org/2000/svg" style="display:none">',
           '<!-- شهاب icon sprite. Glyphs from Font Awesome Free 6.5.2 (CC BY 4.0, https://fontawesome.com/license/free), extracted by tools/icons.py. -->']
    missing = []
    count = 0
    for style in ('solid', 'regular', 'brands'):
        for name in sorted(names[style]):
            cp = cps.get(name)
            res = glyph_path(fonts[style], cp) if cp else None
            if not res:
                missing.append((style, name))
                continue
            d, w, upm = res
            out.append('<symbol id="%s-%s" viewBox="0 0 %d %d"><path d="%s"/></symbol>' % (PREFIX[style], name, w, upm, d))
            count += 1
    out.append('</svg>')
    open(SPRITE, 'w', encoding='utf-8').write('\n'.join(out))
    return count, missing


I_RX = re.compile(r'<i\s+([^>]*?)class="([^"]*)"([^>]*)>\s*</i>')


def rewrite_tag(m):
    before, cls, after = m.group(1), m.group(2), m.group(3)
    classes = cls.split()
    style = next((c[3:] for c in classes if c in ('fa-solid', 'fa-regular', 'fa-brands')), None)
    name = next((c[3:] for c in classes if c.startswith('fa-') and c not in ('fa-solid', 'fa-regular', 'fa-brands')), None)
    if not style or not name:
        return m.group(0)
    keep = [c for c in classes if not c.startswith('fa-')]
    attrs = (before + ' ' + after).strip()
    if 'aria-hidden' not in attrs:
        attrs = (attrs + ' aria-hidden="true"').strip()
    attrs = ' ' + attrs if attrs else ''
    return '<svg class="%s"%s focusable="false"><use href="assets/images/icons.svg#%s-%s"></use></svg>' % (
        ' '.join(['sh-i'] + keep), attrs, PREFIX[style], name)


def rewrite_pages():
    n = 0
    for f in PAGES:
        src = open(f, encoding='utf-8').read()
        new, k = I_RX.subn(rewrite_tag, src)
        # drop the Font Awesome stylesheet link
        new = re.sub(r'\s*<link rel="stylesheet" href="css/font-awesome\.css[^"]*">', '', new)
        if new != src:
            open(f, 'w', encoding='utf-8', newline='\n').write(new)
            n += k
    return n


if __name__ == '__main__':
    cps = codepoints()
    names = used()
    total = sum(len(v) for v in names.values())
    if '--check' in sys.argv:
        for s, v in names.items():
            print(s, sorted(v))
        print('total', total)
        sys.exit()
    count, missing = build_sprite(names, cps)
    print('sprite: %d symbols -> %s (%.1f KB)' % (count, SPRITE, os.path.getsize(SPRITE) / 1024))
    if missing:
        print('missing:', missing)
    print('rewrote <i> tags:', rewrite_pages())
