/* شهاب — ريلز شهاب (reels.html): Vidstack (المشغّل الخفيف) + Swiper.

   شريط Swiper أفقي بمقاطع رأسية: المقطع النشط في النص هو اللي بيشتغل (مكتوم
   افتراضيًا زي إنستجرام على الويب)، والباقي بوستر وواقف. الصوت حالة واحدة
   مشتركة: لما المشاهد يفتح صوت مقطع كل اللي بعده يبقى بصوت. السحب، الأسهم،
   عجلة الماوس (أفقيًا)، والكيبورد كلهم من Swiper، وهو بيقرا dir=rtl لوحده.
   تبويبات البرامج بتقفز لأول مقطع من البرنامج وبتعلّم مقاطعه (مش بتشيل
   شرايح — إزالة عناصر المشغّل وإرجاعها بتعيد إنشاءها). شبكة «كل الريلز»
   تحت المسرح بتقفز للمقطع وتطلع له. لما المسرح يخرج من الشاشة المقطع بيقف.
   رابط عميق #r=N.

   الخطافات: [data-sh-reels] القسم، [data-sh-reels-swiper] الحاوية،
   [data-sh-reel] المشغّلات، [data-sh-reels-prev/-next]، [data-sh-reels-cur/-total]،
   [data-sh-reels-tabs] > [data-sh-prog]، [data-sh-reels-go="N"] بطاقات الشبكة. */
(function () {
  'use strict';
  var root = document.querySelector('[data-sh-reels]');
  if (!root || !window.ShPlayer || !window.Swiper) return;
  var el = root.querySelector('[data-sh-reels-swiper]');
  if (!el) return;

  var slides = [].slice.call(el.querySelectorAll('.swiper-slide'));
  var players = slides.map(function (s) { return s.querySelector('media-player'); });
  var cur = root.querySelector('[data-sh-reels-cur]'), total = root.querySelector('[data-sh-reels-total]');
  var prev = root.querySelector('[data-sh-reels-prev]'), next = root.querySelector('[data-sh-reels-next]');
  var tabs = root.querySelector('[data-sh-reels-tabs]');
  var reduce = ShPlayer.reduceMotion;
  var muted = true, ready = false, inView = true;

  if (total) total.textContent = String(slides.length);

  var m = /(?:^#|[#&])r=(\d+)/.exec(location.hash);
  var start = m ? Math.min(slides.length - 1, Math.max(0, parseInt(m[1], 10) - 1)) : 0;

  var swiper = new Swiper(el, {
    slidesPerView: 'auto',
    centeredSlides: true,
    spaceBetween: 14,
    initialSlide: start,
    speed: reduce ? 0 : 340,
    slideToClickedSlide: true,
    grabCursor: true,
    watchSlidesProgress: true,
    keyboard: { enabled: true, onlyInViewport: true },
    mousewheel: { forceToAxis: true, thresholdDelta: 12 },
    navigation: { prevEl: prev, nextEl: next },
    a11y: {
      prevSlideMessage: 'المقطع السابق', nextSlideMessage: 'المقطع التالي',
      firstSlideMessage: 'هذا أول مقطع', lastSlideMessage: 'هذا آخر مقطع',
      containerMessage: 'ريلز شهاب', slideLabelMessage: '{{index}} من {{slidesLength}}'
    },
    on: { slideChange: onChange }
  });

  function active() { return players[swiper.activeIndex]; }

  function onChange() {
    var i = swiper.activeIndex;
    slides.forEach(function (s, k) { s.toggleAttribute('data-active', k === i); });
    if (cur) cur.textContent = String(i + 1);
    if (prev) prev.disabled = swiper.isBeginning;
    if (next) next.disabled = swiper.isEnd;
    history.replaceState(null, '', location.pathname + location.search + '#r=' + (i + 1));
    if (!ready) return;
    players.forEach(function (p, k) {
      if (!p) return;
      if (k === i) {
        p.muted = muted;
        if (inView) { var pr = p.play(); if (pr && pr.catch) pr.catch(function () {}); }
      } else if (!p.state.paused) { p.pause(); p.currentTime = 0; }
    });
  }

  ShPlayer.ready.then(function () {
    ready = true;
    players.forEach(function (p, i) {
      if (!p) return;
      // one sound state for the rail
      p.addEventListener('volume-change', function () {
        if (p !== active() || p.state.muted === muted) return;
        muted = p.state.muted;
        players.forEach(function (q) { if (q && q !== p) q.muted = muted; });
      });
      // a tap on a side reel brings it to the centre
      p.addEventListener('play', function () { if (p !== active()) swiper.slideTo(i); });
    });
    onChange();
  });

  /* off-screen: nothing plays */
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      inView = entries[0].intersectionRatio >= 0.35;
      var p = active();
      if (!p) return;
      if (!inView && !p.state.paused) p.pause();
      else if (inView && ready && p.state.paused && !p.state.ended) { var pr = p.play(); if (pr && pr.catch) pr.catch(function () {}); }
    }, { threshold: [0, 0.35, 1] }).observe(el);
  }

  /* programme tabs: jump + highlight */
  if (tabs) tabs.addEventListener('click', function (e) {
    var b = e.target.closest('[data-sh-prog]');
    if (!b) return;
    var prog = b.getAttribute('data-sh-prog') || '';
    [].forEach.call(tabs.querySelectorAll('[data-sh-prog]'), function (x) { x.setAttribute('aria-pressed', String(x === b)); });
    root.toggleAttribute('data-filter', !!prog);
    var first = -1;
    slides.forEach(function (s, k) {
      var on = !prog || s.getAttribute('data-sh-prog') === prog;
      s.toggleAttribute('data-match', on);
      if (on && first < 0) first = k;
    });
    if (first >= 0) swiper.slideTo(first);
  });

  /* grid cards → the rail */
  document.addEventListener('click', function (e) {
    var card = e.target.closest('[data-sh-reels-go]');
    if (!card) return;
    e.preventDefault();
    var i = parseInt(card.getAttribute('data-sh-reels-go'), 10) - 1;
    if (isNaN(i)) return;
    root.scrollIntoView({ block: 'start', behavior: reduce ? 'auto' : 'smooth' });
    swiper.slideTo(i);
    if (i === swiper.activeIndex) onChange();
  });
})();
