/* شهاب — نواة المشغّل.

   Vidstack 1.15.6 (MIT، مثبَّت محليًا في assets/vendor/vidstack — بناء
   `cdn/with-layouts` كما هو مع الـchunks والـproviders، لأن الحزمة ESM بس
   والمسارات النسبية بينهم لازم تفضل زي ما هي). hls.js 1.7.2 (Apache-2.0) في
   assets/vendor/hls كبناء UMD؛ Vidstack بيحمّله بـ<script> ويقرا window.Hls،
   فبنمرّر له المسار المحلي بدل jsdelivr الافتراضي.

   الملف ده هو الأساس المشترك لكل تجارب الفيديو (المشاهدة، البث المباشر،
   الريلز، الشورتس). اللي فيه:
     - ShPlayer.ready      وعد بيتحلّ لما عناصر Vidstack تتعرّف.
     - ShPlayer.mount(el)  بيجهّز <media-player data-sh-vs>: الاتجاه LTR،
                           الترجمة العربية للـDefault Layout، hls.js المحلي،
                           سلسلة مصادر بديلة، ورسالة خطأ عربية.
     - ShPlayer.fmt(s)     وقت mm:ss / h:mm:ss بأرقام لاتينية للـtnum.
   منطق الصفحات (قوائم التشغيل، الفيدات، السحب) في ملفاته الخاصة ومش هنا.

   RTL: الـDefault Layout ما فيهوش دعم اتجاه؛ لو ورث dir=rtl شريط التقدّم
   بيتملي كله والوقت بيتقلب. فالمشغّل نفسه دايمًا dir="ltr" (زي كل العارضات
   في الثيم: الهندسة LTR والنصوص عربي)، والصفحة حواليه RTL عادي.

   الخطافات في الماركب:
     <media-player data-sh-vs
                   data-sh-sources="a.m3u8|b.m3u8|c.mp4"   مصادر بديلة بالترتيب (اختياري)
                   data-sh-hls='{"lowLatencyMode":true}'   إعدادات hls.js (اختياري)>
   الأحداث المخصّصة: `sh-vs-ready` بعد التجهيز، و`sh-vs-fallback` عند التبديل لمصدر
   بديل (detail: index / src / last). */
(function () {
  'use strict';

  var HLS_LIB = 'assets/vendor/hls/hls.min.js';

  /* الـ56 كلمة اللي بيستخدمها الـDefault Layout (DefaultLayoutWord في أنواع الحزمة). */
  var AR = {
    'Announcements': 'التنبيهات الصوتية',
    'Accessibility': 'إتاحة الوصول',
    'AirPlay': 'AirPlay',
    'Audio': 'الصوت',
    'Auto': 'تلقائي',
    'Boost': 'تعزيز',
    'Captions': 'الترجمة',
    'Caption Styles': 'شكل الترجمة',
    'Captions look like this': 'الترجمة ستظهر بهذا الشكل',
    'Chapters': 'الفصول',
    'Closed-Captions Off': 'إيقاف الترجمة',
    'Closed-Captions On': 'تشغيل الترجمة',
    'Connected': 'متصل',
    'Continue': 'متابعة',
    'Connecting': 'جارٍ الاتصال',
    'Default': 'افتراضي',
    'Disabled': 'معطّل',
    'Disconnected': 'غير متصل',
    'Display Background': 'خلفية العرض',
    'Download': 'تنزيل',
    'Enter Fullscreen': 'ملء الشاشة',
    'Enter PiP': 'صورة داخل صورة',
    'Exit Fullscreen': 'الخروج من ملء الشاشة',
    'Exit PiP': 'إغلاق صورة داخل صورة',
    'Font': 'الخط',
    'Family': 'نوع الخط',
    'Fullscreen': 'ملء الشاشة',
    'Google Cast': 'Google Cast',
    'Keyboard Animations': 'مؤثرات لوحة المفاتيح',
    'LIVE': 'مباشر',
    'Loop': 'تكرار',
    'Mute': 'كتم الصوت',
    'Normal': 'عادي',
    'Off': 'إيقاف',
    'Pause': 'إيقاف مؤقت',
    'Play': 'تشغيل',
    'Playback': 'التشغيل',
    'PiP': 'صورة داخل صورة',
    'Quality': 'الجودة',
    'Replay': 'إعادة',
    'Reset': 'إعادة الضبط',
    'Seek Backward': 'رجوع',
    'Seek Forward': 'تقدّم',
    'Seek': 'تقديم',
    'Settings': 'الإعدادات',
    'Skip To Live': 'إلى البث الحي',
    'Speed': 'السرعة',
    'Size': 'الحجم',
    'Color': 'اللون',
    'Opacity': 'الشفافية',
    'Shadow': 'الظل',
    'Text': 'النص',
    'Text Background': 'خلفية النص',
    'Track': 'المسار',
    'Unmute': 'تشغيل الصوت',
    'Volume': 'مستوى الصوت'
  };

  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------------------------------------------------- readiness */
  var ready = window.customElements
    ? Promise.all([customElements.whenDefined('media-player'), customElements.whenDefined('media-video-layout')])
    : Promise.reject(new Error('no custom elements'));

  // الحزمة ESM: من file:// الكروم بيرفض الـmodule scripts. نقول ده بوضوح بدل صمت.
  setTimeout(function () {
    if (window.customElements && !customElements.get('media-player') && document.querySelector('media-player')) {
      console.warn('[شهاب] Vidstack ما اتحمّلش. صفحات الفيديو بتشتغل على http:// (شغّل السيرفر المحلي) مش من file://.');
      document.querySelectorAll('media-player[data-sh-vs]').forEach(function (el) { showError(el, 'المشغّل لا يعمل من الملف مباشرة — افتح الصفحة عبر السيرفر المحلي.', false); });
    }
  }, 4000);

  /* ------------------------------------------------------------ helpers */
  function fmt(s) {
    if (!isFinite(s) || s < 0) s = 0;
    var h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), r = Math.floor(s % 60);
    var mm = (h && m < 10 ? '0' : '') + m, ss = (r < 10 ? '0' : '') + r;
    return h ? h + ':' + mm + ':' + ss : mm + ':' + ss;
  }

  function parseJSON(s, fallback) {
    if (!s) return fallback;
    try { return JSON.parse(s); } catch (e) { return fallback; }
  }

  function showError(el, text, retry) {
    var box = el.querySelector('.sh-vs__error');
    if (!box) {
      box = document.createElement('div');
      box.className = 'sh-vs__error';
      box.setAttribute('role', 'alert');
      box.innerHTML = '<span class="sh-vs__error-mark"></span><p class="sh-vs__error-text"></p>' +
        '<button type="button" class="sh-vs__error-btn"><i class="fa-solid fa-rotate-right" aria-hidden="true"></i>إعادة المحاولة</button>';
      el.appendChild(box);
    }
    box.querySelector('.sh-vs__error-text').textContent = text;
    var btn = box.querySelector('.sh-vs__error-btn');
    btn.hidden = retry === false;
    btn.onclick = function () {
      box.remove();
      el._shSourceIdx = 0;
      var first = el._shSources && el._shSources[0];
      if (first) { el.src = ''; el.src = first; }
      var p = el.play && el.play(); if (p && p.catch) p.catch(function () {});
    };
    el.setAttribute('data-sh-error', '');
  }

  function clearError(el) {
    var box = el.querySelector('.sh-vs__error');
    if (box) box.remove();
    el.removeAttribute('data-sh-error');
  }

  /* --------------------------------------------------------------- mount */
  function mount(el, opts) {
    if (!el || el._shMounted) return el;
    el._shMounted = true;
    opts = opts || {};

    // الهندسة LTR دايمًا (انظر رأس الملف)
    if (!el.hasAttribute('dir')) el.setAttribute('dir', 'ltr');
    el.classList.add('sh-vs');
    // الـDefault Layout ما بيرسمش قبل ما يعرف إن الوسيط فيديو؛ مع بث بطيء الإقلاع
    // ده يعني شاشة سودا لثوانٍ. كل مشغّلاتنا فيديو، فنقولها من الأول.
    if (!el.hasAttribute('view-type')) el.setAttribute('view-type', 'video');

    // الترجمة على الـlayout (خاصية، مش سمة — كائن)
    var layout = el.querySelector('media-video-layout, media-audio-layout');
    if (layout) layout.translations = Object.assign({}, AR, opts.translations || {});

    // hls.js المحلي + إعداداته. provider-change بيتبعت قبل setup فالتعيين بيلحق.
    var hlsConfig = Object.assign({}, parseJSON(el.getAttribute('data-sh-hls'), {}), opts.hls || {});
    el.addEventListener('provider-change', function (e) {
      var p = e.detail;
      if (p && p.type === 'hls') {
        p.library = opts.hlsLibrary || HLS_LIB;
        if (Object.keys(hlsConfig).length) p.config = hlsConfig;
      }
    });

    // سلسلة المصادر البديلة: data-sh-sources="a|b|c" (أو src لوحده)
    var chain = (el.getAttribute('data-sh-sources') || '').split('|').map(function (s) { return s.trim(); }).filter(Boolean);
    if (!chain.length && el.getAttribute('src')) chain = [el.getAttribute('src')];
    el._shSources = chain;
    el._shSourceIdx = 0;
    if (chain.length && !el.getAttribute('src')) el.setAttribute('src', chain[0]);

    // تبديل المصدر بيطلع حدث إجهاض (code 1) من الوسيط القديم بعد ما بدّلنا —
    // فبنتجاهل أي خطأ خلال ثانية ونصف من آخر تبديل، وأي إجهاض دايمًا.
    var switchedAt = 0;
    function fallback(reason) {
      if (Date.now() - switchedAt < 1500) return true;
      var next = el._shSourceIdx + 1;
      if (next < el._shSources.length) {
        el._shSourceIdx = next;
        switchedAt = Date.now();
        console.warn('[شهاب] المصدر فشل (' + reason + ')، جرّب البديل ' + (next + 1) + '/' + el._shSources.length);
        el.setAttribute('data-sh-source-index', String(next));
        el.src = el._shSources[next];
        el.dispatchEvent(new CustomEvent('sh-vs-fallback', { bubbles: true, detail: { index: next, src: el._shSources[next], last: next === el._shSources.length - 1 } }));
        var wasPlaying = !el.paused;
        if (wasPlaying || el.autoplay) { var p = el.play(); if (p && p.catch) p.catch(function () {}); }
        return true;
      }
      return false;
    }

    el.addEventListener('hls-error', function (e) {
      var d = e.detail;
      if (d && d.fatal && !fallback(d.details || d.type)) showError(el, 'تعذّر تشغيل البث الآن. تحقّق من الاتصال ثم أعد المحاولة.');
    });
    el.addEventListener('error', function (e) {
      var d = e.detail;
      // خطأ الوسيط نفسه (ملف ناقص/صيغة غير مدعومة) — الـhls بيبلّغ عن نفسه فوق
      if (d && d.code != null && d.code !== 1 && !fallback('media ' + d.code)) showError(el, 'تعذّر تشغيل الفيديو. تحقّق من الاتصال ثم أعد المحاولة.');
    });
    el.addEventListener('can-play', function () { clearError(el); });

    // storage بيرجّع آخر موضع؛ لو كان عند النهاية نبدأ من الأول بدل ما الفيديو
    // يفتح «منتهيًا» (ويشغّل التالي فورًا).
    el.addEventListener('can-play', function () {
      var st = el.state, d = st.duration;
      if (el.hasAttribute('storage') && isFinite(d) && d > 0 && st.currentTime > d - 1.5) el.currentTime = 0;
    });

    // المدة: Vidstack بياخدها من seekable عند can-play؛ سيرفر بلا دعم Range
    // (زي http.server المحلي) بيرجّع seekable فاضي فتبقى المدة صفر وشريط
    // التقدّم ميت. نكمّلها من عنصر الفيديو نفسه، ونصفّرها مع تغيير المصدر.
    function fixDuration() {
      var v = el.querySelector('video'), st = el.state;
      if (v && isFinite(v.duration) && v.duration > 0 && !(st.duration > 0)) el.duration = v.duration;
    }
    el.addEventListener('can-play', fixDuration);
    el.addEventListener('loaded-metadata', fixDuration);
    el.addEventListener('source-change', function () { if (el.duration) el.duration = 0; });

    // شبكة أمان لسباق في مزوّد HLS: لو can-play سبق LEVEL_LOADED (سيرفر بطيء)
    // بيسيب نوع البث «unknown» — والـDefault Layout ما بيرسمش حاجة — وقائمة
    // الجودات فاضية. نصحّح النوع من المدة، ولو hls.js شايف سلّم جودات والقائمة
    // فاضية نعيد تحميل المصدر مرة واحدة عشان الجلسة تتسجّل صح.
    var healed = false;
    el.addEventListener('can-play', function () {
      var st = el.state;
      if (st.streamType === 'unknown') el.streamType = (isFinite(st.duration) && st.duration > 0) ? 'on-demand' : 'live';
      var prov = el.provider, inst = prov && prov.type === 'hls' && prov.instance;
      if (!healed && inst && inst.levels && inst.levels.length > 1 && st.qualities.length === 0) {
        healed = true;
        var src = st.source.src;
        console.warn('[شهاب] سلّم الجودات ما اتسجّلش (سباق في مزوّد HLS) — إعادة تحميل المصدر مرة واحدة.');
        el.src = '';
        setTimeout(function () { el.src = src; }, 0);
      }
    });

    // تشغيل تلقائي محجوب من المتصفح (سياسة الصوت): كتم وأعد المحاولة
    el.addEventListener('auto-play-fail', function () {
      if (!el.muted) { el.muted = true; var p = el.play(); if (p && p.catch) p.catch(function () {}); }
    });

    el.setAttribute('data-sh-ready', '');
    el.dispatchEvent(new CustomEvent('sh-vs-ready', { bubbles: true }));
    return el;
  }

  /* --------------------------------------------------------- auto-mount */
  var mounted = [];
  function mountAll(root) {
    (root || document).querySelectorAll('media-player[data-sh-vs]').forEach(function (el) {
      if (!el._shMounted) mounted.push(mount(el));
    });
  }
  ready.then(function () {
    mountAll();
  }, function () {});

  window.ShPlayer = {
    ready: ready,
    mount: function (el, opts) { return ready.then(function () { return mount(el, opts); }); },
    mountAll: function (root) { return ready.then(function () { mountAll(root); }); },
    translations: AR,
    hlsLibrary: HLS_LIB,
    fmt: fmt,
    reduceMotion: reduce,
    showError: showError,
    clearError: clearError,
    players: mounted
  };
})();
