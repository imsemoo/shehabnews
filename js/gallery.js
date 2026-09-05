/* شهاب — مكتبة الصور: عارض الصور.

   PhotoSwipe 5 (MIT، موزَّع محليًا في assets/vendor/photoswipe كبناء UMD عشان
   يشتغل من file:// زي باقي الثيم) على كل حائط عليه [data-sh-pswp]. كل بوستر
   <a> بيحمل رابط الألبوم في href (بديل بلا JS وللـSEO) والصورة الكاملة في
   data-pswp-src بأبعادها الحقيقية — الأبعاد هي اللي بتخلّي أنيميشن الفتح من
   الثمبنيل مضبوطًا.

   اللي بنستخدمه من PhotoSwipe: الفتح والإغلاق بالزوم من الثمبنيل، التكبير
   بالبينش والدبل-تاب وعجلة الماوس، السحب للتنقل، السحب الرأسي للإغلاق،
   الكيبورد (الأسهم، Esc)، العدّاد، التحميل المسبق للجارة، وحبس التركيز.

   اللي بنضيفه فوقه بواجهته (registerElement): كابشن بالعنوان ورابط الألبوم
   (جنب الصورة على الديسكتوب، تحتها على الموبايل)، زر نسخ رابط الصورة، زر ملء
   الشاشة، ورابط عميق #pswp=N بيفتح الصورة مباشرة وبيتحدّث مع التنقل.

   الهندسة LTR كما هي في كل العارضات (سحب لليسار = التالي، السهم الأيمن =
   التالي) عشان الأزرار والحركة والكيبورد يفضلوا متطابقين. */
(function () {
  'use strict';
  if (!window.PhotoSwipeLightbox || !window.PhotoSwipe) return;
  var walls = [].slice.call(document.querySelectorAll('[data-sh-pswp]'));
  if (!walls.length) return;

  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var wide = function () { return window.innerWidth >= 900; };
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  var lightbox = new PhotoSwipeLightbox({
    gallery: '[data-sh-pswp]',
    children: 'a[data-pswp-src]',
    pswpModule: PhotoSwipe,
    mainClass: 'sh-pswp',
    bgOpacity: 0.94,
    /* symmetric sides so the picture sits dead centre; the bottom leaves room
       for the caption band, and the sides clear the arrows */
    paddingFn: function (viewport) {
      return viewport.x >= 900
        ? { top: 56, bottom: 128, left: 72, right: 72 }
        : { top: 16, bottom: 136, left: 12, right: 12 };
    },
    showHideAnimationType: reduce ? 'none' : 'zoom',
    showAnimationDuration: reduce ? 0 : 320,
    hideAnimationDuration: reduce ? 0 : 260,
    initialZoomLevel: 'fit',
    secondaryZoomLevel: 1.6,
    maxZoomLevel: 3,
    wheelToZoom: true,
    preload: [1, 2],
    closeTitle: 'إغلاق',
    zoomTitle: 'تكبير',
    arrowPrevTitle: 'الصورة السابقة',
    arrowNextTitle: 'الصورة التالية',
    errorMsg: 'تعذّر تحميل الصورة',
    indexIndicatorSep: ' / '
  });

  /* ------------------------------------------------ the house UI additions */
  lightbox.on('uiRegister', function () {
    var pswp = lightbox.pswp;

    // caption: kicker (the chip on the tile, or «ألبوم شهاب»), the title, the album link
    pswp.ui.registerElement({
      name: 'sh-caption', order: 9, isButton: false, appendTo: 'root',
      html: '<div class="sh-pswp__caption" dir="rtl"></div>',
      onInit: function (el) {
        // PhotoSwipe wraps the html in its own element; the styled box is the child
        var box = el.querySelector('.sh-pswp__caption') || el;
        function render() {
          var a = pswp.currSlide && pswp.currSlide.data.element;
          if (!a) { box.innerHTML = ''; return; }
          var img = a.querySelector('img');
          var chip = a.querySelector('.sh-gal__chip');
          box.innerHTML =
            '<span class="sh-pswp__kicker"><span class="sh-mark"></span>' + esc(chip ? chip.textContent.trim() : 'ألبوم شهاب') + '</span>' +
            '<h3 class="sh-pswp__title">' + esc(img ? img.getAttribute('alt') : '') + '</h3>' +
            '<a class="sh-pswp__album" href="' + esc(a.getAttribute('href')) + '" target="_blank" rel="noopener">افتح الألبوم على شهاب ' +
              '<i class="fa-solid fa-arrow-up-right-from-square" aria-hidden="true"></i></a>';
        }
        pswp.on('change', render);
        render();
      }
    });

    // copy the deep link of the current picture
    pswp.ui.registerElement({
      name: 'sh-share', order: 8, isButton: true, tagName: 'button', title: 'نسخ رابط الصورة',
      html: '<i class="fa-solid fa-link" aria-hidden="true"></i>',
      onClick: function () {
        var url = location.href.replace(/#.*$/, '') + '#pswp=' + (pswp.currIndex + 1);
        var done = function () { toast(pswp, 'اتنسخ رابط الصورة'); };
        if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(url).then(done, function () { toast(pswp, url); });
        else toast(pswp, url);
      }
    });

    // fullscreen on the viewer itself
    if (document.fullscreenEnabled) {
      pswp.ui.registerElement({
        name: 'sh-fs', order: 8.5, isButton: true, tagName: 'button', title: 'ملء الشاشة',
        html: '<i class="fa-solid fa-expand" aria-hidden="true"></i>',
        onInit: function (el) {
          document.addEventListener('fullscreenchange', function () {
            var i = el.querySelector('i');
            if (i) i.className = document.fullscreenElement ? 'fa-solid fa-compress' : 'fa-solid fa-expand';
          });
        },
        onClick: function () {
          if (document.fullscreenElement) document.exitFullscreen();
          else if (pswp.element.requestFullscreen) pswp.element.requestFullscreen();
        }
      });
    }
  });

  function toast(pswp, text) {
    var t = pswp.element.querySelector('.sh-pswp__toast');
    if (!t) { t = document.createElement('span'); t.className = 'sh-pswp__toast'; t.setAttribute('role', 'status'); pswp.element.appendChild(t); }
    t.textContent = text;
    t.setAttribute('data-on', '');
    clearTimeout(t._h);
    t._h = setTimeout(function () { t.removeAttribute('data-on'); }, 1600);
  }

  /* --------------------------------------------------- deep link #pswp=N */
  function hashIndex() {
    var m = /(?:^#|[#&])pswp=(\d+)/.exec(location.hash);
    return m ? parseInt(m[1], 10) - 1 : -1;
  }
  lightbox.on('change', function () {
    history.replaceState(null, '', location.pathname + location.search + '#pswp=' + (lightbox.pswp.currIndex + 1));
  });
  lightbox.on('close', function () {
    if (document.fullscreenElement) document.exitFullscreen();
    history.replaceState(null, '', location.pathname + location.search);
  });

  lightbox.init();

  var start = hashIndex();
  if (start >= 0) {
    var items = walls[0].querySelectorAll('a[data-pswp-src]');
    if (start < items.length) {
      lightbox.loadAndOpen(start, { gallery: walls[0] });
      if (items[start].scrollIntoView) items[start].scrollIntoView({ block: 'center' });
    }
  }
})();
