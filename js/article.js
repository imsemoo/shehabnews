/* شهاب — قارئ المقال (article.html, Phase 3).

     progress   a 3px bar under the header that fills as the reader scrolls
                (CSS scroll-driven animation where supported, rAF otherwise)
     reader     the toolbar in the intro: حجم الخط (٣ درجات على --reader-scale،
                محفوظة)، استمع (يسلّم فقرات المقال لمشغّل الموجز js/brief.js)،
                حفظ (المحفوظات في localStorage، صفحة saved.html)، طباعة
     zoom       the lead figure opens in PhotoSwipe (js/gallery.js handles the
                [data-sh-pswp] wall once the anchor carries data-pswp-*)
     save       delegated: any [data-sh-save] with data-sh-save-* attributes

   Hooks: article[data-sh-story], [data-sh-reader], [data-sh-font="-|0|+"],
   [data-sh-listen], [data-sh-save], .sh-article-article-body__p-1 */
(function () {
  'use strict';
  var art = document.querySelector('article[data-sh-story]');
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function store(k, v) { try { if (v === undefined) return JSON.parse(localStorage.getItem(k)); if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, JSON.stringify(v)); } catch (e) { return null; } }

  /* ----------------------------------------------------------- progress -- */
  function progress() {
    if (!art) return;
    var bar = document.createElement('div');
    bar.className = 'sh-progress';
    bar.setAttribute('aria-hidden', 'true');
    document.body.appendChild(bar);
    if (window.CSS && CSS.supports && CSS.supports('animation-timeline: scroll()')) { bar.setAttribute('data-css', ''); return; }
    var ticking = false;
    function paint() {
      ticking = false;
      var max = document.documentElement.scrollHeight - innerHeight;
      bar.style.transform = 'scaleX(' + (max > 0 ? Math.min(1, window.scrollY / max) : 0) + ')';
    }
    window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(paint); } }, { passive: true });
    paint();
  }

  /* ---------------------------------------------------------- font size -- */
  var SCALES = [0.92, 1, 1.12, 1.26];
  function fontSize() {
    var bar = document.querySelector('[data-sh-reader]');
    if (!bar) return;
    var i = store('sh-reader-scale');
    if (typeof i !== 'number' || !SCALES[i]) i = 1;
    function apply() {
      document.documentElement.style.setProperty('--reader-scale', String(SCALES[i]));
      bar.querySelectorAll('[data-sh-font]').forEach(function (b) {
        var k = b.getAttribute('data-sh-font');
        b.disabled = (k === '-' && i === 0) || (k === '+' && i === SCALES.length - 1);
      });
      var lbl = bar.querySelector('[data-sh-font-label]');
      if (lbl) lbl.textContent = Math.round(SCALES[i] * 100) + '%';
    }
    bar.addEventListener('click', function (e) {
      var b = e.target.closest('[data-sh-font]');
      if (!b) return;
      var k = b.getAttribute('data-sh-font');
      i = k === '+' ? Math.min(SCALES.length - 1, i + 1) : k === '-' ? Math.max(0, i - 1) : 1;
      store('sh-reader-scale', i);
      apply();
    });
    apply();
  }

  /* ------------------------------------------------------------- listen -- */
  function listen() {
    var btn = document.querySelector('[data-sh-listen]');
    if (!btn || !art) return;
    btn.addEventListener('click', function () {
      var title = (document.querySelector('h1') || {}).textContent || '';
      var cat = (art.querySelector('.sh-link') || {}).textContent || 'شهاب';
      var paras = [].slice.call(art.querySelectorAll('.sh-article-article-body__p-1, .sh-article-article-body__p-3, .sh-article-article-intro__p-1'))
        .map(function (p) { return p.textContent.replace(/\s+/g, ' ').trim(); }).filter(Boolean);
      var items = [{ c: cat.trim(), time: '', href: location.pathname, t: title.trim(), say: title.trim() }]
        .concat(paras.map(function (p, k) { return { c: cat.trim(), time: '', href: location.pathname, t: 'الفقرة ' + (k + 1), say: p }; }));
      document.dispatchEvent(new CustomEvent('sh-brief:play', { detail: { id: 'article:' + art.getAttribute('data-sh-story'), edition: 'استمع للمقال', items: items } }));
      btn.setAttribute('aria-pressed', 'true');
    });
  }

  /* --------------------------------------------------------------- save -- */
  function saved() { return store('sh-saved') || []; }
  function isSaved(href) { return saved().some(function (x) { return x.href === href; }); }
  function paintSave(btn) {
    var href = btn.getAttribute('data-sh-save') || location.pathname;
    var on = isSaved(href);
    btn.setAttribute('aria-pressed', String(on));
    ShUI.setIcon(btn.querySelector('.sh-i'), 'bookmark', on ? 'solid' : 'regular');
    var l = btn.querySelector('[data-sh-save-label]');
    if (l) l.textContent = on ? 'محفوظ' : 'حفظ';
  }
  function save() {
    document.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-sh-save]');
      if (!btn) return;
      e.preventDefault();
      var href = btn.getAttribute('data-sh-save') || location.pathname;
      var list = saved();
      if (isSaved(href)) {
        list = list.filter(function (x) { return x.href !== href; });
        ShUI.toast('اتشال من المحفوظات');
      } else {
        list.unshift({
          href: href,
          t: btn.getAttribute('data-sh-save-title') || (document.querySelector('h1') || {}).textContent.trim() || document.title,
          cat: btn.getAttribute('data-sh-save-cat') || ((art && art.querySelector('.sh-link')) || {}).textContent || '',
          at: new Date().toISOString()
        });
        if (list.length > 200) list.length = 200;
        ShUI.toast('اتحفظ في المحفوظات');
      }
      store('sh-saved', list);
      document.querySelectorAll('[data-sh-save]').forEach(paintSave);
    });
    document.querySelectorAll('[data-sh-save]').forEach(paintSave);
  }

  /* -------------------------------------------------------------- print -- */
  function print() {
    var b = document.querySelector('[data-sh-print]');
    if (b) b.addEventListener('click', function () { window.print(); });
  }

  function init() { progress(); fontSize(); listen(); save(); print(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
