# شهاب News — Static front-end build

موقع ستاتيك كامل: HTML لكل صفحة + CSS لكل صفحة + ملف JS واحد + مجلد الأصول.
لا يحتاج أي build step أو npm — افتح `index.html` مباشرة أو ارفع المجلد على أي استضافة.

## البنية

```
site/
├── index.html              الرئيسية (النسخة الأساسية)
├── homepage-v2.html        الرئيسية — الاتجاه الثاني
├── homepage-v3.html        الرئيسية — الاتجاه الثالث
├── homepage-v4.html        الرئيسية — الاتجاه الرابع
├── sections.html           أقسام شهاب
├── category.html           صفحة قسم (غزة)
├── article.html            صفحة الخبر / التقرير
├── coverage.html           التغطية الحية
├── tag.html                صفحة الوسم
├── archive.html            الأرشيف
├── video.html              الفيديو
├── video-watch.html        مشاهدة فيديو
├── photos.html             الصور
├── files.html              ملفات شهاب
├── author.html             صفحة الكاتب
├── search.html             البحث
├── about.html              من نحن
├── contact.html            تواصل معنا
├── newsletter.html         النشرة البريدية
├── privacy.html            سياسة الخصوصية
├── terms.html              شروط الاستخدام
├── system-states.html      حالات النظام (مرجع الـ UI states)
├── loader.html             مؤشّر التحميل
├── 404.html                صفحة غير موجودة
├── css/<page>.css          ستايل كل صفحة (متغيّرات الهوية + keyframes + حالات hover)
├── js/app.js               السلوك التفاعلي (ملف واحد لكل الصفحات)
├── data/<page>.json        بيانات كل صفحة (عناوين، أوقات، تصنيفات، روابط الصور)
└── assets/                 الشعارات، البوسترات، الخرائط، الفيديو
```

## الهوية

| الاستخدام | القيمة |
|---|---|
| أزرق شهاب | `#1b5aa6` |
| كحلي داكن | `#0a1a33` |
| كحلي وسيط | `#0f2a4f` |
| أزرق فاتح (أرضيات) | `#eaf1fa` |
| رمادي أرضية | `#f7f9fc` |
| حدود | `#d5dde8` / `#eef2f7` |
| نص أساسي | `#14233a` |
| نص ثانوي | `#4a5568` / `#8a95a6` |
| أحمر (عاجل فقط) | `#e0302f` |

الخطوط: **Almarai** للعناوين والواجهة، **Noto Naskh Arabic** لنصوص القراءة الطويلة.
الأيقونات: Font Awesome 6.5.2 (CDN).

## JS — ما يفعله `js/app.js`

يعمل على كل الصفحات ويبحث عن hooks عبر `data-*`:

| Hook | الوظيفة |
|---|---|
| `data-sh="date" / "hijri" / "clock"` | التاريخ الميلادي والهجري وساعة القدس، تُحدَّث كل دقيقة |
| `data-sh="ticker"` + `data-items` | شريط العاجل: تبديل تلقائي كل 7 ثوانٍ، يتوقف عند المرور بالماوس |
| `data-sh="ticker-prev/next/count"` | أزرار الشريط وعدّاده |
| `data-sh-tabs` + `data-sh-tab` + `data-sh-panel` | مجموعات التابات |
| `data-sh-gallery` + `data-sh-shot` + `data-sh-stage` | ألبومات الصور (مصغّرات + إطار رئيسي + أسهم) |
| `.sh-menu` / `.sh-drop` | قوائم الهيدر المنسدلة (الفتح بالـ CSS، والإغلاق بـ Escape من JS) |

## ملاحظات للمطوّر

1. **CSS مكتوب inline على العناصر** لأن هذه الصفحات مُصدَّرة من مرحلة التصميم. ملف الـ CSS لكل صفحة يحمل: الـ resets، الـ `@keyframes`، وكل قواعد `:hover/:focus/::before/::after`. عند الدمج في CMS أو framework، انقل الـ inline styles إلى classes.
2. **الصور** نوعان: محلية في `assets/`، وصور خارجية من Wikimedia Commons (روابط مباشرة داخل الـ HTML) — استبدلها بصور شهاب الحقيقية من الـ CMS.
3. **البيانات** كلها في `data/<page>.json` بنفس المفاتيح المستخدمة في الصفحة — نقطة البداية الطبيعية لربط الصفحات بـ API أو WordPress.
4. **الحالات غير الطبيعية** (فراغ، تحميل، خطأ، 404، نماذج) موثّقة كاملة في `system-states.html` — استخدمها كمرجع بدل اختراع تصميم جديد لكل حالة.
5. الصفحات **RTL** بالكامل (`dir="rtl"` على `<html>`) ومتجاوبة عبر `grid-template-columns` بـ `minmax()` و`flex-wrap`.
