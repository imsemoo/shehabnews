/* شهاب — chrome behaviours shared by every page (Phase 1).

   Everything the header, footer and page frame need beyond app.js's content
   widgets. No library; each block is a no-op when its markup is absent.

     sticky()      <html data-compact> once the header scrolls out of view;
                   the slot keeps the header's natural height, the body is fixed
     navCurrent()  aria-current on the nav link that matches this page
     ticker()      the breaking rotator: data-items [{t, href?, ago|time}],
                   7s rotation, pause button (aria-pressed), hover pause,
                   <time> stamped from `ago` minutes
     times()       <time datetime> → relative text, refreshed every minute
     toTop()       the floating «لأعلى» after 1200px
     footerVideo() the footer's ambient video loads only near the viewport
     newsletter()  the footer form → POST /api/newsletter with states
     consent()     the corner <dialog>, remembered in localStorage
     share()       [data-sh-share="x|facebook|telegram|whatsapp|copy|native"]
     tabsRoles()   role=tab / tabpanel on the data-sh-tabs groups
     year()        © year

   Runs after ShUI (js/ui.js). */
(function () {
  'use strict';
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var html = document.documentElement;

  function store(k, v) {
    try {
      if (v === undefined) return localStorage.getItem(k);
      if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, v);
    } catch (e) { return null; }
  }

  /* ------------------------------------------------------------ sticky -- */
  function sticky() {
    var slot = document.querySelector('[data-sh-header-slot]');
    var body = document.querySelector('[data-sh-header-body]');
    if (!slot || !body || !('IntersectionObserver' in window)) return;
    function measure() {
      if (html.hasAttribute('data-compact')) return;
      slot.style.setProperty('--sh-hbody-h', body.offsetHeight + 'px');
    }
    measure();
    window.addEventListener('resize', measure);
    var io = new IntersectionObserver(function (entries) {
      var e = entries[0];
      var out = !e.isIntersecting && e.boundingClientRect.bottom < 0;
      if (out === html.hasAttribute('data-compact')) return;
      if (out) {
        measure();
        html.setAttribute('data-compact', '');
        requestAnimationFrame(function () { html.style.setProperty('--sh-compact-h', body.offsetHeight + 'px'); });
      } else {
        html.removeAttribute('data-compact');
      }
    }, { threshold: [0] });
    io.observe(slot);
  }

  /* -------------------------------------------------------- navCurrent -- */
  function navCurrent() {
    var nav = document.querySelector('.sh-nav');
    if (!nav) return;
    var page = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
    var section = document.body.getAttribute('data-sh-section');
    var links = [].slice.call(nav.querySelectorAll('a[href]'));
    var hit = null;
    if (section) hit = nav.querySelector('[data-sh-section="' + section + '"]');
    if (!hit) hit = links.filter(function (a) { return (a.getAttribute('href') || '').split('#')[0].toLowerCase() === page; })[0];
    if (!hit) return;
    hit.setAttribute('aria-current', 'page');
    if (hit.classList.contains('sh-nav__drop-link')) {
      hit.classList.add('sh-nav__drop-link--current');
      var parent = hit.closest('.sh-menu');
      var top = parent && parent.querySelector(':scope > .sh-nav__link');
      if (top) top.classList.add('sh-nav__link--current');
    } else {
      hit.classList.add('sh-nav__link--current');
    }
  }

  /* ------------------------------------------------------------ ticker -- */
  function ticker() {
    var box = document.querySelector('[data-sh="ticker"]');
    if (!box) return;
    var titleEl = box.querySelector('[data-sh="ticker-title"]');
    var timeEl = box.querySelector('[data-sh="ticker-time"]');
    var countEl = document.querySelector('[data-sh="ticker-count"]');
    var pauseBtn = document.querySelector('[data-sh="ticker-pause"]');
    var items = [];
    try { items = JSON.parse(box.getAttribute('data-items') || '[]'); } catch (e) { return; }
    if (!items.length || !titleEl) return;
    var i = 0, timer = null, paused = false, hover = false;

    function show(n) {
      i = (n + items.length) % items.length;
      var it = items[i];
      titleEl.textContent = it.t;
      if (it.href) box.setAttribute('href', it.href);
      if (timeEl) {
        if (it.ago != null) { timeEl.setAttribute('datetime', new Date(Date.now() - it.ago * 60000).toISOString()); timeEl.removeAttribute('data-sh-ago'); }
        else if (it.at) timeEl.setAttribute('datetime', it.at);
        if (timeEl.getAttribute('datetime')) ShUI.paintTimes(box); else timeEl.textContent = it.time || '';
      }
      if (countEl) countEl.textContent = (i + 1) + ' / ' + items.length;
      if (!reduce) { titleEl.style.animation = 'none'; void titleEl.offsetWidth; titleEl.style.animation = 'sh-fadein .45s ease both'; }
    }
    function start() { stop(); if (paused || hover || reduce) return; timer = setInterval(function () { show(i + 1); }, 7000); }
    function stop() { if (timer) clearInterval(timer); timer = null; }

    document.querySelectorAll('[data-sh="ticker-next"]').forEach(function (b) { b.addEventListener('click', function (e) { e.preventDefault(); show(i + 1); start(); }); });
    document.querySelectorAll('[data-sh="ticker-prev"]').forEach(function (b) { b.addEventListener('click', function (e) { e.preventDefault(); show(i - 1); start(); }); });
    if (pauseBtn) {
      if (reduce) { paused = true; pauseBtn.setAttribute('aria-pressed', 'true'); ShUI.setIcon(pauseBtn.querySelector('.sh-i'), 'play'); pauseBtn.setAttribute('aria-label', 'تشغيل التبديل التلقائي'); }
      pauseBtn.addEventListener('click', function () {
        paused = !paused;
        pauseBtn.setAttribute('aria-pressed', String(paused));
        pauseBtn.setAttribute('aria-label', paused ? 'تشغيل التبديل التلقائي' : 'إيقاف التبديل التلقائي');
        ShUI.setIcon(pauseBtn.querySelector('.sh-i'), paused ? 'play' : 'pause');
        start();
      });
    }
    box.addEventListener('mouseenter', function () { hover = true; stop(); });
    box.addEventListener('mouseleave', function () { hover = false; start(); });
    box.addEventListener('focusin', function () { hover = true; stop(); });
    box.addEventListener('focusout', function () { hover = false; start(); });

    /* the live feed (js/feed.js) pushes new items to the front */
    document.addEventListener('sh-feed:ticker', function (e) {
      var d = e.detail || {};
      if (!d.t) return;
      items.unshift({ t: d.t, href: d.href, at: d.at, ago: d.ago });
      if (items.length > 12) items.length = 12;
      show(0); start();
    });

    show(0);
    start();
  }

  /* ------------------------------------------------------------- times -- */
  function times() {
    ShUI.paintTimes();
    setInterval(function () { ShUI.paintTimes(); }, 60000);
  }

  /* ------------------------------------------------------------- toTop -- */
  function toTop() {
    var btn = document.querySelector('[data-sh-totop]');
    if (!btn) return;
    btn.hidden = false;
    var on = false, ticking = false;
    function check() {
      ticking = false;
      var want = window.scrollY > 1200;
      if (want !== on) { on = want; btn.toggleAttribute('data-on', on); }
    }
    window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(check); } }, { passive: true });
    btn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
      var main = document.getElementById('main');
      if (main) { main.setAttribute('tabindex', '-1'); main.focus({ preventScroll: true }); }
    });
    check();
  }

  /* ------------------------------------------------------- footerVideo -- */
  function footerVideo() {
    var v = document.querySelector('.sh-footer__video[data-src]');
    if (!v) return;
    var conn = navigator.connection || {};
    if (reduce || conn.saveData || /(^|[^0-9])2g/.test(conn.effectiveType || '')) { v.remove(); return; }
    if (!('IntersectionObserver' in window)) return;
    var io = new IntersectionObserver(function (entries) {
      if (!entries[0].isIntersecting) return;
      io.disconnect();
      v.src = v.getAttribute('data-src');
      v.removeAttribute('data-src');
      var p = v.play(); if (p && p.catch) p.catch(function () {});
    }, { rootMargin: '400px 0px' });
    io.observe(v);
  }

  /* -------------------------------------------------------- newsletter -- */
  function newsletter() {
    document.querySelectorAll('form[data-sh-newsletter]').forEach(function (form) {
      var status = form.querySelector('[data-sh-newsletter-status]');
      var input = form.querySelector('input[type="email"]');
      var btn = form.querySelector('button[type="submit"]');
      function say(state, text) { if (status) { status.setAttribute('data-state', state); status.textContent = text; } }
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        if (!input || !input.value.trim()) { say('err', 'اكتب بريدك الإلكتروني أولًا.'); input && input.focus(); return; }
        if (!input.checkValidity()) { say('err', 'البريد الإلكتروني غير صحيح.'); input.focus(); return; }
        if (btn) btn.disabled = true;
        say('', 'جارٍ الاشتراك…');
        var body = new FormData(form);
        fetch(form.getAttribute('action') || '/api/newsletter', { method: 'POST', body: body, headers: { 'Accept': 'application/json' } })
          .then(function (r) { if (!r.ok) throw new Error(String(r.status)); return r.json().catch(function () { return {}; }); })
          .then(function () { say('ok', 'تم الاشتراك. راجع بريدك لتأكيد الاشتراك.'); form.reset(); })
          .catch(function () { say('err', 'تعذّر الاشتراك الآن. حاول مرة أخرى بعد قليل.'); })
          .then(function () { if (btn) btn.disabled = false; });
      });
    });
  }

  /* ----------------------------------------------------------- consent -- */
  function consent() {
    var dlg = document.querySelector('dialog[data-sh-consent]');
    if (!dlg || typeof dlg.show !== 'function') return;
    var saved = store('sh-consent');
    if (saved) { html.setAttribute('data-consent', saved); return; }
    if (ShUI.prerendering()) { document.addEventListener('prerenderingchange', consent, { once: true }); return; }
    setTimeout(function () { if (!dlg.open) dlg.show(); }, 1600);
    dlg.addEventListener('close', function () {
      var v = dlg.returnValue || 'essential';
      store('sh-consent', v);
      html.setAttribute('data-consent', v);
    });
  }

  /* ------------------------------------------------------------- share -- */
  function share() {
    document.addEventListener('click', function (e) {
      var el = e.target.closest('[data-sh-share]');
      if (!el) return;
      e.preventDefault();
      var kind = el.getAttribute('data-sh-share');
      var scope = el.closest('[data-sh-share-url]');
      var url = (scope && scope.getAttribute('data-sh-share-url')) || location.href.replace(/#.*$/, '');
      var title = (scope && scope.getAttribute('data-sh-share-title')) || document.title;
      var enc = encodeURIComponent;
      var links = {
        x: 'https://twitter.com/intent/tweet?text=' + enc(title) + '&url=' + enc(url) + '&via=ShehabAgency',
        facebook: 'https://www.facebook.com/sharer/sharer.php?u=' + enc(url),
        telegram: 'https://t.me/share/url?url=' + enc(url) + '&text=' + enc(title),
        whatsapp: 'https://api.whatsapp.com/send?text=' + enc(title + '\n' + url)
      };
      if (kind === 'native' && navigator.share) {
        navigator.share({ title: title, url: url }).catch(function () {});
      } else if (kind === 'copy' || kind === 'native') {
        var done = function () { ShUI.toast('اتنسخ الرابط'); };
        if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(url).then(done, function () { ShUI.toast(url); });
        else ShUI.toast(url);
      } else if (links[kind]) {
        window.open(links[kind], '_blank', 'noopener,width=640,height=560');
      }
    });
    if (!navigator.share) document.querySelectorAll('[data-sh-share="native"]').forEach(function (b) { b.setAttribute('aria-label', 'نسخ الرابط'); });
  }

  /* --------------------------------------------------------- tabsRoles -- */
  function tabsRoles() {
    document.querySelectorAll('[data-sh-tabs]').forEach(function (group, gi) {
      group.setAttribute('role', 'tablist');
      var scope = group.parentNode;
      group.querySelectorAll('[data-sh-tab]').forEach(function (btn) {
        var key = btn.getAttribute('data-sh-tab');
        var panel = scope.querySelector('[data-sh-panel="' + key + '"]');
        btn.setAttribute('role', 'tab');
        if (!btn.id) btn.id = 'sh-tab-' + gi + '-' + key;
        if (panel) {
          panel.setAttribute('role', 'tabpanel');
          if (!panel.id) panel.id = 'sh-panel-' + gi + '-' + key;
          btn.setAttribute('aria-controls', panel.id);
          panel.setAttribute('aria-labelledby', btn.id);
        }
      });
    });
  }

  function year() {
    document.querySelectorAll('[data-sh-year]').forEach(function (el) { el.textContent = String(new Date().getFullYear()); });
  }

  function init() {
    sticky(); navCurrent(); ticker(); times(); toTop(); footerVideo(); newsletter(); consent(); share(); tabsRoles(); year();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
