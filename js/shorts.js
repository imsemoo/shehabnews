/* شهاب — شورتس شهاب (shorts.html): Vidstack + Swiper رأسي + IntersectionObserver.

   فيد بملء الشاشة زي تيك توك/إنستجرام: Swiper رأسي (شريحة واحدة لكل شاشة،
   سحب، عجلة الماوس، الأسهم) بيتكفّل بالسنَاب، والـIntersectionObserver
   (جذره حاوية الـSwiper) هو اللي بيقرّر التشغيل: الشريحة اللي 60% منها
   ظاهرة بتشتغل، والباقي بيقف ويرجع للأول. الحلّين مع بعض عشان السحب السريع
   أو تسلسل الشرائح المتلاحق ما يسيبش مقطعين شغّالين.

   - load="visible" بيحمّل المقطع لما يدخل الشاشة، وبنحمّل التالي مسبقًا.
   - الصوت حالة واحدة للفيد كله (مكتوم لحد ما المشاهد يفتحه).
   - لمسة = إيقاف/تشغيل (media-gesture)، لمستان = إعجاب (قلب بيطلع في النص).
   - المفاتيح: مسافة إيقاف/تشغيل، M كتم، الأسهم أعلى/أسفل من Swiper.
   - إخفاء التبويب بيوقف المقطع ويكمّله لما يرجع.
   - رابط عميق #r=N، ونسخ الرابط من زر المشاركة.

   الخطافات: [data-sh-shorts] الصفحة، [data-sh-shorts-swiper]، [data-sh-short]
   المشغّلات، [data-sh-shorts-prev/-next]، [data-sh-shorts-cur/-total]،
   [data-sh-like] + [data-sh-like-n]، [data-sh-share]، [data-sh-mute] (زر الصوت
   الجانبي بيوجّه على media-mute-button)، .sh-shorts__heart للقلب. */
(function () {
  'use strict';
  var root = document.querySelector('[data-sh-shorts]');
  if (!root || !window.ShPlayer || !window.Swiper) return;
  var el = root.querySelector('[data-sh-shorts-swiper]');
  if (!el) return;

  var slides = [].slice.call(el.querySelectorAll('.swiper-slide'));
  var players = slides.map(function (s) { return s.querySelector('media-player'); });
  var cur = root.querySelector('[data-sh-shorts-cur]'), total = root.querySelector('[data-sh-shorts-total]');
  var prev = root.querySelector('[data-sh-shorts-prev]'), next = root.querySelector('[data-sh-shorts-next]');
  var reduce = ShPlayer.reduceMotion;
  var muted = true, ready = false, activeIdx = -1;

  if (total) total.textContent = String(slides.length);
  var m = /(?:^#|[#&])r=(\d+)/.exec(location.hash);
  var start = m ? Math.min(slides.length - 1, Math.max(0, parseInt(m[1], 10) - 1)) : 0;

  var swiper = new Swiper(el, {
    direction: 'vertical',
    slidesPerView: 1,
    spaceBetween: 0,
    initialSlide: start,
    speed: reduce ? 0 : 360,
    threshold: 8,
    resistanceRatio: .55,
    mousewheel: { forceToAxis: true, thresholdDelta: 24, thresholdTime: 250 },
    keyboard: { enabled: true },
    navigation: { prevEl: prev, nextEl: next },
    a11y: {
      prevSlideMessage: 'المقطع السابق', nextSlideMessage: 'المقطع التالي',
      firstSlideMessage: 'هذا أول مقطع', lastSlideMessage: 'هذا آخر مقطع',
      containerMessage: 'شورتس شهاب', slideLabelMessage: '{{index}} من {{slidesLength}}'
    },
    on: {
      slideChange: function () { paintNav(); root.setAttribute('data-moved', ''); }
    }
  });

  function paintNav() {
    if (cur) cur.textContent = String(swiper.activeIndex + 1);
    if (prev) prev.disabled = swiper.isBeginning;
    if (next) next.disabled = swiper.isEnd;
  }

  function play(p) {
    if (!p || !ready) return;
    var go = function () {
      if (players[activeIdx] !== p || document.hidden) return;
      var pr = p.play(); if (pr && pr.catch) pr.catch(function () {});
    };
    if (p.state.canPlay) go();
    else { if (!p.state.canLoad) p.startLoading(); p.addEventListener('can-play', go, { once: true }); }
  }
  function preload(i) {
    var p = players[i];
    if (p && ready && !p.state.canLoad) p.startLoading();
  }

  /* ------------------------------------------------ IO decides who plays */
  function activate(i) {
    if (i === activeIdx || !slides[i]) return;
    activeIdx = i;
    slides.forEach(function (s, k) { s.toggleAttribute('data-active', k === i); });
    players.forEach(function (p, k) {
      if (!p) return;
      if (k === i) { p.muted = muted; play(p); }
      else if (ready && p.state.canPlay) { if (!p.state.paused) p.currentTime = 0; p.pause(); }
    });
    preload(i + 1);
    history.replaceState(null, '', location.pathname + location.search + '#r=' + (i + 1));
  }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      var i = slides.indexOf(en.target);
      if (i >= 0 && en.intersectionRatio >= .6) activate(i);
    });
  }, { root: el, threshold: [0, .6, 1] });
  slides.forEach(function (s) { io.observe(s); });

  ShPlayer.ready.then(function () {
    ready = true;
    players.forEach(function (p, i) {
      if (!p) return;
      p.addEventListener('volume-change', function () {
        if (i !== activeIdx || p.state.muted === muted) return;
        muted = p.state.muted;
        players.forEach(function (q) { if (q && q !== p) q.muted = muted; });
        paintMute();
      });
      // double tap = like
      p.addEventListener('dblclick', function () { like(i, true); });
    });
    if (activeIdx >= 0) { var p = players[activeIdx]; p.muted = muted; play(p); preload(activeIdx + 1); }
    else activate(swiper.activeIndex);
    paintMute();
  });
  paintNav();

  /* ------------------------------------------------ side actions */
  function fmtCount(n) { return n >= 1000 ? (n / 1000).toFixed(n >= 10000 ? 0 : 1).replace(/\.0$/, '') + ' ألف' : String(n); }
  function like(i, on) {
    var s = slides[i]; if (!s) return;
    var btn = s.querySelector('[data-sh-like]'), n = s.querySelector('[data-sh-like-n]');
    var was = btn && btn.getAttribute('aria-pressed') === 'true';
    var now = on === true ? true : !was;
    if (btn) btn.setAttribute('aria-pressed', String(now));
    if (n && now !== was) {
      var base = parseInt(n.getAttribute('data-n') || '0', 10) + (now ? 1 : 0);
      n.textContent = fmtCount(base);
    }
    if (now && on === true) {
      var h = s.querySelector('.sh-shorts__heart');
      if (h) { h.removeAttribute('data-on'); void h.offsetWidth; h.setAttribute('data-on', ''); }
    }
  }
  root.addEventListener('click', function (e) {
    var likeBtn = e.target.closest('[data-sh-like]');
    if (likeBtn) { like(slides.indexOf(likeBtn.closest('.swiper-slide'))); return; }
    var share = e.target.closest('[data-sh-share]');
    if (share) {
      e.preventDefault();
      var i = slides.indexOf(share.closest('.swiper-slide'));
      var url = location.href.replace(/#.*$/, '') + '#r=' + (i + 1);
      var done = function () { toast('اتنسخ رابط المقطع'); };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(url).then(done, function () { toast(url); });
      else toast(url);
      return;
    }
    var muteBtn = e.target.closest('[data-sh-mute]');
    if (muteBtn) {
      var p = players[activeIdx];
      if (p) p.muted = !p.state.muted;
    }
  });
  function paintMute() {
    [].forEach.call(root.querySelectorAll('[data-sh-mute]'), function (b) { b.toggleAttribute('data-muted', muted); b.setAttribute('aria-label', muted ? 'تشغيل الصوت' : 'كتم الصوت'); });
  }

  /* ------------------------------------------------ keys + visibility */
  document.addEventListener('keydown', function (e) {
    var t = e.target, tag = t && t.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || e.ctrlKey || e.metaKey || e.altKey) return;
    var p = players[activeIdx];
    if (!p) return;
    if (e.key === ' ' || e.key === 'k') { e.preventDefault(); if (p.state.paused) play(p); else p.pause(); }
    else if (e.key === 'm' || e.key === 'M') { e.preventDefault(); p.muted = !p.state.muted; }
    else if (e.key === 'l' || e.key === 'L') { like(activeIdx, true); }
  });
  var wasPlaying = false;
  document.addEventListener('visibilitychange', function () {
    var p = players[activeIdx]; if (!p) return;
    if (document.hidden) { wasPlaying = !p.state.paused; p.pause(); }
    else if (wasPlaying) play(p);
  });

  function toast(text) {
    var t = document.querySelector('.sh-shorts__toast');
    if (!t) { t = document.createElement('span'); t.className = 'sh-shorts__toast'; t.setAttribute('role', 'status'); document.body.appendChild(t); }
    t.textContent = text;
    t.setAttribute('data-on', '');
    clearTimeout(t._h);
    t._h = setTimeout(function () { t.removeAttribute('data-on'); }, 1600);
  }
})();
