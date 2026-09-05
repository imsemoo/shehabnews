/* شهاب — ريلز شهاب (reels.html): Vidstack (المشغّل الخفيف) + Swiper.

   شريط Swiper أفقي بمقاطع رأسية وجنبه لوحة «المقطع المميز». من 641px المقطع
   النشط أول الشريط لصق اللوحة، وتحت ذلك في النص. اللوحة بتتملى من الشريحة
   النشطة (البرنامج، العنوان، الوصف من data-sh-dek، الوقت، المدة، رابط ملء
   الشاشة) وزرّها بيشغّل/يوقف المقطع النشط.

   التشغيل: مفيش تشغيل تلقائي قبل أول تفاعل — البوستر بيفضل ظاهر لحد ما
   المشاهد يضغط تشغيل (من اللوحة، أو من المشغّل، أو من بطاقة في الشبكة).
   بعدها كل مقطع يوصل للنشط بيشتغل لوحده (مكتوم افتراضيًا زي إنستجرام على
   الويب)، والصوت حالة واحدة مشتركة. السحب، عجلة الماوس (أفقيًا)، والكيبورد
   من Swiper (بيقرا dir=rtl لوحده؛ الأسهم بتتعطّل والتركيز جوه مشغّل عشان
   Vidstack يقدّم/يرجّع بيها). أسهم السابق/التالي بتاعتنا: مع فلتر برنامج
   بتتخطّى المقاطع اللي مش من البرنامج. تبويبات البرامج بتقفز لأول مقطع من
   البرنامج وبتعلّم مقاطعه (مش بتشيل شرايح — إزالة عناصر المشغّل وإرجاعها
   بتعيد إنشاءها). شبكة «كل الريلز» تحت المسرح بتقفز للمقطع وتشغّله. لما
   المسرح يخرج من الشاشة المقطع بيقف. رابط عميق #r=N.

   الخطافات: [data-sh-reels] القسم، [data-sh-reels-swiper] الحاوية،
   [data-sh-reel] المشغّلات، [data-sh-reels-prev/-next]، [data-sh-reels-cur/-total]،
   [data-sh-reels-tabs] > [data-sh-prog]، [data-sh-reels-go="N"] بطاقات الشبكة،
   [data-sh-reels-feature] اللوحة وحقولها [data-sh-f-*]، [data-sh-reels-play] زرّها. */
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
  var feature = root.querySelector('[data-sh-reels-feature]');
  var f = feature ? {
    chip: feature.querySelector('[data-sh-f-chip]'),
    pos: feature.querySelector('[data-sh-f-pos]'),
    title: feature.querySelector('[data-sh-f-title]'),
    dek: feature.querySelector('[data-sh-f-dek]'),
    time: feature.querySelector('[data-sh-f-time]'),
    len: feature.querySelector('[data-sh-f-len]'),
    full: feature.querySelector('[data-sh-f-full]'),
    play: feature.querySelector('[data-sh-reels-play]'),
    label: feature.querySelector('[data-sh-f-play-label]')
  } : null;
  var reduce = ShPlayer.reduceMotion;
  var WIDE = window.matchMedia('(min-width: 641px)');   // the same line as css/pages/reels.css
  var muted = true, ready = false, inView = true, armed = false;

  if (total) total.textContent = String(slides.length);

  var m = /(?:^#|[#&])r=(\d+)/.exec(location.hash);
  var start = m ? Math.min(slides.length - 1, Math.max(0, parseInt(m[1], 10) - 1)) : 0;

  /* wide screens: the active reel sits at the start of the rail next to the
     panel, and a trailing offset lets the last reel reach the start too */
  function fit(sw) {
    var w = el.clientWidth, s = slides[0] ? slides[0].offsetWidth : 0;
    sw.params.slidesOffsetAfter = WIDE.matches ? Math.max(0, w - s) : 0;
  }

  var swiper = new Swiper(el, {
    slidesPerView: 'auto',
    centeredSlides: true,
    spaceBetween: 14,
    breakpoints: { 641: { centeredSlides: false, spaceBetween: 16 } },
    initialSlide: start,
    speed: reduce ? 0 : 340,
    slideToClickedSlide: true,
    grabCursor: true,
    watchSlidesProgress: true,
    keyboard: { enabled: true, onlyInViewport: true },
    mousewheel: { forceToAxis: true, thresholdDelta: 12 },
    a11y: { containerRole: 'region', containerMessage: 'ريلز شهاب', slideLabelMessage: '{{index}} من {{slidesLength}}' },
    on: {
      slideChange: onChange,
      resize: function (sw) { fit(sw); sw.update(); }
    }
  });
  fit(swiper);
  swiper.update();
  swiper.slideTo(start, 0);

  // arrow keys inside a player belong to Vidstack (seek), not to the rail
  el.addEventListener('focusin', function (e) {
    if (e.target && e.target.closest && e.target.closest('media-player')) swiper.keyboard.disable();
  });
  el.addEventListener('focusout', function (e) {
    var t = e.relatedTarget;
    if (!t || !t.closest || !t.closest('media-player')) swiper.keyboard.enable();
  });

  function active() { return players[swiper.activeIndex]; }

  /* prev / next: with a programme filter on, skip the reels that are not its */
  function matches(k) { return !root.hasAttribute('data-filter') || slides[k].hasAttribute('data-match'); }
  function neighbour(from, dir) {
    for (var k = from + dir; k >= 0 && k < slides.length; k += dir) if (matches(k)) return k;
    return -1;
  }
  function step(dir) { var k = neighbour(swiper.activeIndex, dir); if (k >= 0) swiper.slideTo(k); }
  if (prev) prev.addEventListener('click', function () { step(-1); });
  if (next) next.addEventListener('click', function () { step(1); });
  function edge(btn, off) { if (btn) btn.setAttribute('aria-disabled', String(off)); }   // not .disabled: keeps focus on the button at the ends

  /* the feature panel mirrors the active slide */
  function fill(i) {
    if (!f) return;
    var s = slides[i]; if (!s) return;
    var chip = s.querySelector('.sh-lite__chip'), t = s.querySelector('.sh-lite__t');
    var meta = s.querySelector('.sh-lite__meta'), len = s.querySelector('.sh-lite__len');
    if (f.chip && chip) {
      f.chip.textContent = chip.textContent.trim();
      f.chip.classList.toggle('sh-reels__fchip--red', chip.classList.contains('sh-lite__chip--red'));
    }
    if (f.pos) {
      var ms = slides.filter(function (x) { return x.hasAttribute('data-match'); });
      var r = root.hasAttribute('data-filter') ? ms.indexOf(s) : -1;
      f.pos.textContent = r >= 0 ? 'المقطع ' + (r + 1) + ' من ' + ms.length : 'المقطع ' + (i + 1) + ' من ' + slides.length;
    }
    if (f.title && t) f.title.textContent = t.textContent.trim();
    if (f.dek) { var d = s.getAttribute('data-sh-dek') || ''; f.dek.textContent = d; f.dek.hidden = !d; }
    if (f.time && meta) f.time.textContent = meta.textContent.trim();
    if (f.len && len) f.len.textContent = len.textContent.trim();
    if (f.full) f.full.setAttribute('href', 'shorts.html#r=' + (i + 1));
  }

  function syncPlay() {
    if (!f || !f.play) return;
    var p = active(), playing = !!(p && ready && !p.state.paused);
    f.play.toggleAttribute('data-playing', playing);
    if (f.label) f.label.textContent = playing ? 'إيقاف مؤقت' : 'تشغيل المقطع';
  }

  // load="visible" بيحمّل الشريحة لما تبان؛ لو لسه بتحمّل نشغّل أول ما تقدر
  function playSoon(p) {
    var go = function () {
      if (p !== active() || !inView || !armed) return;
      var pr = p.play(); if (pr && pr.catch) pr.catch(function () {});
    };
    if (p.state.canPlay) go();
    else p.addEventListener('can-play', go, { once: true });
  }

  function onChange() {
    var i = swiper.activeIndex;
    slides.forEach(function (s, k) { s.toggleAttribute('data-active', k === i); });
    if (cur) cur.textContent = String(i + 1);
    edge(prev, neighbour(i, -1) < 0);
    edge(next, neighbour(i, 1) < 0);
    history.replaceState(null, '', location.pathname + location.search + '#r=' + (i + 1));
    fill(i);
    if (!ready) return;
    players.forEach(function (p, k) {
      if (!p) return;
      if (k === i) {
        p.muted = muted;
        if (armed) playSoon(p);
      } else if (p.state.canPlay) { if (!p.state.paused) p.currentTime = 0; p.pause(); }
    });
    syncPlay();
  }
  onChange();

  /* the panel's button: play / pause the active reel (and arm the rail) */
  if (f && f.play) f.play.addEventListener('click', function () {
    var p = active();
    if (!p || !ready) return;
    armed = true;
    if (p.state.paused) { var pr = p.play(); if (pr && pr.catch) pr.catch(function () {}); }
    else p.pause();
  });

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
      // the first play (always the viewer's) arms the rail; a tap on a side
      // reel brings it to the centre
      p.addEventListener('play', function () {
        armed = true;
        if (p !== active()) swiper.slideTo(i);
        syncPlay();
      });
      p.addEventListener('pause', syncPlay);
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
      else if (inView && ready && armed && p.state.paused && !p.state.ended) { var pr = p.play(); if (pr && pr.catch) pr.catch(function () {}); }
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
    if (first >= 0 && first !== swiper.activeIndex) swiper.slideTo(first);
    else onChange();   // same reel: refresh the arrows and the position
  });

  /* grid cards → the rail, and play */
  document.addEventListener('click', function (e) {
    var card = e.target.closest('[data-sh-reels-go]');
    if (!card) return;
    e.preventDefault();
    var i = parseInt(card.getAttribute('data-sh-reels-go'), 10) - 1;
    if (isNaN(i)) return;
    armed = true;
    root.scrollIntoView({ block: 'start', behavior: reduce ? 'auto' : 'smooth' });
    swiper.slideTo(i);
    if (i === swiper.activeIndex) onChange();
  });
})();
