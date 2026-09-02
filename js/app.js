/* Shehab News — front-end behaviours for the static build.
   The markup is a rendered snapshot; this file re-attaches the live bits. */
(function () {
  'use strict';

  /* 1. Header clock + Gregorian/Hijri date -------------------------------- */
  function paintDate() {
    var d = new Date();
    var fmt = function (o) { return new Intl.DateTimeFormat('ar-EG-u-nu-latn', o).format(d); };
    var set = function (sel, txt) {
      document.querySelectorAll(sel).forEach(function (el) { el.textContent = txt; });
    };
    set('[data-sh="date"]', fmt({ weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }));
    try {
      set('[data-sh="hijri"]', new Intl.DateTimeFormat('ar-EG-u-ca-islamic-umalqura-nu-latn',
        { day: 'numeric', month: 'long', year: 'numeric' }).format(d));
    } catch (e) { /* locale unavailable */ }
    set('[data-sh="clock"]', fmt({ hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Jerusalem' }));
  }

  /* 2. Breaking-news ticker ---------------------------------------------- */
  function ticker() {
    var box = document.querySelector('[data-sh="ticker"]');
    if (!box) return;
    var titleEl = box.querySelector('[data-sh="ticker-title"]');
    var timeEl = box.querySelector('[data-sh="ticker-time"]');
    var countEl = document.querySelector('[data-sh="ticker-count"]');
    var items = [];
    try { items = JSON.parse(box.getAttribute('data-items') || '[]'); } catch (e) { return; }
    if (!items.length || !titleEl) return;
    var i = 0, timer = null;
    function show(n) {
      i = (n + items.length) % items.length;
      titleEl.textContent = items[i].t;
      if (timeEl) timeEl.textContent = items[i].time || '';
      if (countEl) countEl.textContent = (i + 1) + ' / ' + items.length;
      titleEl.style.animation = 'none';
      void titleEl.offsetWidth;
      titleEl.style.animation = 'sh-fadein .45s ease both';
    }
    function start() { stop(); timer = setInterval(function () { show(i + 1); }, 7000); }
    function stop() { if (timer) clearInterval(timer); timer = null; }
    document.querySelectorAll('[data-sh="ticker-next"]').forEach(function (b) {
      b.addEventListener('click', function (e) { e.preventDefault(); show(i + 1); start(); });
    });
    document.querySelectorAll('[data-sh="ticker-prev"]').forEach(function (b) {
      b.addEventListener('click', function (e) { e.preventDefault(); show(i - 1); start(); });
    });
    box.addEventListener('mouseenter', stop);
    box.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  /* 3. Tab groups: [data-sh-tabs] wraps [data-sh-tab] buttons and
        [data-sh-panel] panels sharing the same value. ----------------------- */
  function tabs() {
    document.querySelectorAll('[data-sh-tabs]').forEach(function (group) {
      var btns = group.querySelectorAll('[data-sh-tab]');
      btns.forEach(function (btn) {
        btn.addEventListener('click', function (e) {
          e.preventDefault();
          var val = btn.getAttribute('data-sh-tab');
          btns.forEach(function (b) { b.setAttribute('aria-selected', String(b === btn)); });
          group.querySelectorAll('[data-sh-panel]').forEach(function (p) {
            p.hidden = p.getAttribute('data-sh-panel') !== val;
          });
        });
      });
    });
  }

  /* 4. Galleries: [data-sh-gallery] with [data-sh-shot] thumbs and a
        [data-sh-stage] image. --------------------------------------------- */
  function galleries() {
    document.querySelectorAll('[data-sh-gallery]').forEach(function (g) {
      var stage = g.querySelector('[data-sh-stage]');
      var shots = g.querySelectorAll('[data-sh-shot]');
      if (!stage || !shots.length) return;
      var idx = 0;
      function show(n) {
        idx = (n + shots.length) % shots.length;
        var s = shots[idx];
        var src = s.getAttribute('data-src') || (s.querySelector('img') || {}).src;
        if (src) stage.style.backgroundImage = 'url("' + src + '")';
        var cap = g.querySelector('[data-sh-caption]');
        if (cap) cap.textContent = s.getAttribute('data-caption') || '';
        shots.forEach(function (x, k) { x.setAttribute('aria-current', String(k === idx)); });
      }
      shots.forEach(function (s, k) {
        s.addEventListener('click', function (e) { e.preventDefault(); show(k); });
      });
      var n = g.querySelector('[data-sh-next]'), p = g.querySelector('[data-sh-prev]');
      if (n) n.addEventListener('click', function (e) { e.preventDefault(); show(idx + 1); });
      if (p) p.addEventListener('click', function (e) { e.preventDefault(); show(idx - 1); });
      show(0);
    });
  }

  /* 5. Dropdown menus also open on keyboard focus (CSS covers hover). ------ */
  function menus() {
    document.querySelectorAll('.sh-menu').forEach(function (m) {
      var drop = m.querySelector('.sh-drop');
      if (!drop) return;
      m.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') { drop.style.visibility = 'hidden'; drop.style.opacity = '0'; }
      });
    });
  }

  function init() { paintDate(); ticker(); tabs(); galleries(); menus(); setInterval(paintDate, 60000); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
