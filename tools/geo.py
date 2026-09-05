#!/usr/bin/env python3
"""شهاب — data/incidents.geojson: demo ceasefire-violation points.

Real place coordinates in Gaza, the West Bank and Jerusalem; the incidents
themselves are illustrative and dated relative to now so the map's «آخر 24
ساعة» filter always has something to show. Production replaces this file
with the CMS export (same properties).

Usage:  python tools/geo.py
"""
import os, json, random, datetime

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)

PLACES = [
    ('غزة', 'مدينة غزة', 31.5017, 34.4668), ('غزة', 'جباليا', 31.5290, 34.4830), ('غزة', 'بيت لاهيا', 31.5490, 34.4960),
    ('غزة', 'بيت حانون', 31.5380, 34.5360), ('غزة', 'الشيخ رضوان', 31.5340, 34.4620), ('غزة', 'الزيتون', 31.4880, 34.4610),
    ('غزة', 'الشجاعية', 31.5030, 34.4870), ('غزة', 'النصيرات', 31.4490, 34.3900), ('غزة', 'البريج', 31.4390, 34.4030),
    ('غزة', 'المغازي', 31.4290, 34.3950), ('غزة', 'دير البلح', 31.4180, 34.3510), ('غزة', 'خانيونس', 31.3400, 34.3060),
    ('غزة', 'بني سهيلا', 31.3410, 34.3350), ('غزة', 'عبسان', 31.3260, 34.3510), ('غزة', 'المواسي', 31.3220, 34.2650),
    ('غزة', 'رفح', 31.2870, 34.2500), ('غزة', 'الشابورة', 31.2900, 34.2440),
    ('الضفة', 'جنين', 32.4600, 35.3000), ('الضفة', 'مخيم جنين', 32.4650, 35.2900), ('الضفة', 'طولكرم', 32.3100, 35.0300),
    ('الضفة', 'مخيم نور شمس', 32.3200, 35.0500), ('الضفة', 'نابلس', 32.2210, 35.2540), ('الضفة', 'بلاطة', 32.2130, 35.2820),
    ('الضفة', 'قلقيلية', 32.1900, 34.9700), ('الضفة', 'كفر قدوم', 32.2150, 35.0300), ('الضفة', 'رام الله', 31.9038, 35.2034),
    ('الضفة', 'قلنديا', 31.8610, 35.2260), ('الضفة', 'بيت لحم', 31.7050, 35.2020), ('الضفة', 'الخليل', 31.5326, 35.0998),
    ('الضفة', 'طوباس', 32.3210, 35.3690), ('الضفة', 'طولكرم — دير الغصون', 32.3430, 35.0640), ('الضفة', 'نحالين', 31.6870, 35.1170),
    ('الضفة', 'عزون', 32.1740, 35.0570), ('الضفة', 'سلفيت', 32.0850, 35.1810), ('الضفة', 'أريحا', 31.8570, 35.4590),
    ('القدس', 'المسجد الأقصى', 31.7767, 35.2356), ('القدس', 'الشيخ جراح', 31.7920, 35.2310), ('القدس', 'سلوان', 31.7710, 35.2360),
    ('القدس', 'العيسوية', 31.8010, 35.2470), ('القدس', 'شعفاط', 31.8200, 35.2320),
]
TYPES = {
    'قصف': ['قصف مدفعي يستهدف {p}', 'غارة من مسيّرة على تجمع مواطنين في {p}', 'قصف منزل في {p}'],
    'إطلاق نار': ['إطلاق نار من آليات الاحتلال شرق {p}', 'إطلاق نار من «كواد كابتر» في {p}', 'إطلاق نار على صيادين قبالة {p}'],
    'اقتحام': ['قوات الاحتلال تقتحم {p} وتداهم منازل', 'اقتحام {p} وسط انتشار واسع', 'حملة مداهمات في {p}'],
    'اعتقال': ['اعتقال 3 شبان من {p}', 'اعتقال أسير محرر من {p}', 'اعتقالات في {p} بعد اقتحام فجرًا'],
    'هدم': ['هدم منزل في {p} بحجة عدم الترخيص', 'إخطارات هدم في {p}', 'تجريف أراضٍ في {p}'],
    'استيطان': ['مستوطنون يهاجمون مركبات قرب {p}', 'إقامة بؤرة استيطانية على أراضي {p}', 'اعتداء مستوطنين على رعاة في {p}'],
}
GAZA_TYPES = ['قصف', 'إطلاق نار', 'قصف', 'اقتحام']
WB_TYPES = ['اقتحام', 'اعتقال', 'استيطان', 'هدم', 'إطلاق نار']
JLM_TYPES = ['اقتحام', 'اعتقال', 'هدم', 'استيطان']
SOURCES = ['مراسل شهاب', 'مصادر محلية', 'الدفاع المدني', 'وزارة الصحة', 'نادي الأسير', 'أوتشا']

if __name__ == '__main__':
    rnd = random.Random(11)
    now = datetime.datetime.now().astimezone().replace(microsecond=0)
    feats = []
    for i in range(72):
        area, place, lat, lon = rnd.choice(PLACES)
        pool = GAZA_TYPES if area == 'غزة' else WB_TYPES if area == 'الضفة' else JLM_TYPES
        typ = rnd.choice(pool)
        hours = rnd.choice([rnd.uniform(0.3, 24), rnd.uniform(24, 24 * 7), rnd.uniform(24 * 7, 24 * 30)])
        at = now - datetime.timedelta(hours=hours)
        feats.append({
            'type': 'Feature',
            'geometry': {'type': 'Point', 'coordinates': [round(lon + rnd.uniform(-0.012, 0.012), 4), round(lat + rnd.uniform(-0.01, 0.01), 4)]},
            'properties': {
                'id': 'i%03d' % (i + 1), 't': rnd.choice(TYPES[typ]).format(p=place), 'type': typ, 'area': area, 'place': place,
                'at': at.isoformat(timespec='seconds'), 'source': rnd.choice(SOURCES), 'href': 'article.html',
                'casualties': rnd.choice([0, 0, 0, 1, 2, 3, 5]) if typ in ('قصف', 'إطلاق نار') else 0,
            }
        })
    feats.sort(key=lambda f: f['properties']['at'], reverse=True)
    out = {'type': 'FeatureCollection', '_note': 'نقاط توضيحية للنموذج على إحداثيات حقيقية للأماكن. تُستبدل بتصدير الـCMS بنفس الخصائص.', 'features': feats}
    json.dump(out, open('data/incidents.geojson', 'w', encoding='utf-8'), ensure_ascii=False, indent=0)
    print('wrote', len(feats), 'incidents')
