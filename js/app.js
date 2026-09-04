/* Shehab News — front-end behaviours for the static build.
   The markup is a rendered snapshot; this file re-attaches the live bits. */
(function () {
  'use strict';

  /* Loader veil markup — generated from partials/loader-veil.html, which is
     itself cut verbatim from loader.html. Kept inline so the transition works
     from file:// too, where fetch() of a sibling file is blocked. */
  var LOADER_VEIL = "<div class=\"sh-anim\" style=\"position:absolute;inset:0;background:#0a1a33;display:flex;align-items:center;justify-content:center;animation:none\">\n      <span style=\"position:absolute;top:0;bottom:0;right:22%;width:1px;background:rgba(126,168,221,.1)\"></span>\n      <span style=\"position:absolute;top:0;bottom:0;left:22%;width:1px;background:rgba(126,168,221,.1)\"></span>\n      <span style=\"position:absolute;top:-170px;left:-130px;width:480px;height:480px;border:1px solid rgba(126,168,221,.1);border-radius:50%;pointer-events:none\"></span>\n\n      <div style=\"position:relative;display:flex;flex-direction:column;align-items:center;gap:22px;animation:none\">\n        <!-- 01 seed diamond (center) → hands over to the nib -->\n        <span class=\"sh-hide-static\" style=\"position:absolute;top:calc(50% - 40px);width:12px;height:12px;background:#1b5aa6;opacity:0;animation:sh-seed .42s cubic-bezier(.2,.7,.2,1) forwards, sh-fade .28s .5s reverse forwards\"></span>\n\n        <!-- 02–03 the mark draws itself along its own calligraphic stroke -->\n        <span style=\"position:relative;width:300px;aspect-ratio:583/377\">\n          <svg viewBox=\"0 0 583 377\" style=\"position:absolute;inset:0;width:100%;height:100%;overflow:visible\">\n            <defs>\n              <mask id=\"mFinal\" maskUnits=\"userSpaceOnUse\" x=\"-60\" y=\"-60\" width=\"703\" height=\"497\">\n                <path class=\"sh-static\" pathLength=\"1000\" d=\"M 505 28 C 530 60, 470 88, 452 118 C 432 150, 470 170, 440 205 C 405 245, 360 225, 335 195 C 305 160, 300 110, 275 100 C 268 170, 282 250, 300 320 C 330 342, 360 300, 330 268 C 280 215, 190 280, 120 300 C 55 315, 20 270, 22 200 C 25 120, 90 55, 170 42 C 205 38, 235 45, 262 60\" fill=\"none\" stroke=\"#fff\" stroke-width=\"118\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-dasharray=\"1000\" stroke-dashoffset=\"1000\" style=\"animation:sh-draw 1.35s cubic-bezier(.45,0,.2,1) .4s forwards\"></path>\n                <rect class=\"sh-static\" x=\"-60\" y=\"-60\" width=\"703\" height=\"497\" fill=\"#fff\" opacity=\"0\" style=\"animation:sh-fade .35s ease 1.55s forwards\"></rect>\n              </mask>\n            </defs>\n            <image href=\"assets/images/logo-white.png\" width=\"583\" height=\"377\" mask=\"url(#mFinal)\"></image>\n          </svg>\n          <span class=\"sh-hide-static\" style=\"position:absolute;top:0;left:0;width:15px;height:15px;background:#1b5aa6;transform:rotate(45deg);offset-path:path('M 259.9 14.4 C 272.7 30.9, 241.9 45.3, 232.6 60.7 C 222.3 77.2, 241.9 87.5, 226.4 105.5 C 208.4 126.1, 185.2 115.8, 172.4 100.3 C 156.9 82.3, 154.4 56.6, 141.5 51.5 C 137.9 87.5, 145.1 128.6, 154.4 164.7 C 169.8 176.0, 185.2 154.4, 169.8 137.9 C 144.1 110.6, 97.8 144.1, 61.7 154.4 C 28.3 162.1, 10.3 138.9, 11.3 102.9 C 12.9 61.7, 46.3 28.3, 87.5 21.6 C 105.5 19.6, 120.9 23.2, 134.8 30.9');offset-rotate:0deg;opacity:0;animation:sh-nib-travel 1.35s cubic-bezier(.45,0,.2,1) .4s forwards\"></span>\n          <!-- 06 one light sweep once the mark is complete -->\n          <span class=\"sh-hide-static\" style=\"position:absolute;top:-10%;bottom:-10%;left:0;width:14%;background:#fff;opacity:0;mix-blend-mode:overlay;animation:sh-sweep .9s cubic-bezier(.45,0,.2,1) 1.9s forwards\"></span>\n        </span>\n\n        <!-- 04–05 wordline rises, softer tagline fades -->\n        <span style=\"display:flex;flex-direction:column;align-items:center;gap:8px\">\n          <span class=\"sh-static\" style=\"display:flex;align-items:center;gap:10px;font-family:'Almarai',sans-serif;font-size:12px;font-weight:800;letter-spacing:.22em;color:#fff;opacity:0;animation:sh-rise .55s cubic-bezier(.2,.7,.2,1) 1.75s forwards\"><span style=\"width:16px;height:1px;background:#1b5aa6\"></span>وكالة شهاب للأنباء<span style=\"width:16px;height:1px;background:#1b5aa6\"></span></span>\n          <span class=\"sh-static\" style=\"font-family:'Noto Naskh Arabic',serif;font-size:12.5px;color:#7ea8dd;opacity:0;animation:sh-fade .8s ease 2.15s forwards\">نرصد اللحظة ونحفظ أثرها</span>\n        </span>\n\n        <!-- 07 loading indicator: three diamonds — the only element that loops -->\n        <span class=\"sh-hide-static\" style=\"display:flex;align-items:center;gap:9px;margin-top:6px;opacity:0;animation:sh-fade .5s ease 2.5s forwards\">\n          <span style=\"width:7px;height:7px;background:#1b5aa6;animation:sh-dots 1.1s ease-in-out infinite\"></span>\n          <span style=\"width:7px;height:7px;background:#1b5aa6;animation:sh-dots 1.1s ease-in-out infinite .18s\"></span>\n          <span style=\"width:7px;height:7px;background:#1b5aa6;animation:sh-dots 1.1s ease-in-out infinite .36s\"></span>\n        </span>\n      </div>\n      <!-- exit: the diamond leaves first -->\n      <span style=\"position:absolute;bottom:18%;width:10px;height:10px;background:#1b5aa6;transform:rotate(45deg);opacity:0;animation:none\"></span>\n    </div>";

  /* The markup used to carry every display value inline, and these routines
     read it back to remember/restore/copy it. Once styles live in classes
     `el.style.display` is empty, so read the computed value instead -- the
     same number whenever an inline style did exist. */
  function disp(el) { return window.getComputedStyle(el).display; }

  /* Two-state controls (tabs, filters, pager) used to copy the active/idle
     look from the markup as style-attribute strings and swap them. Those
     looks now live in class lists, so snapshot both and swap both. */
  function snapState(el) {
    return el ? { style: el.getAttribute('style'), cls: el.className } : { style: null, cls: '' };
  }
  function applyState(el, st) {
    el.className = st.cls;
    if (st.style !== null) el.setAttribute('style', st.style); else el.removeAttribute('style');
  }

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
      var btns = [].slice.call(group.querySelectorAll('[data-sh-tab]'));
      if (!btns.length) return;

      // Panels are siblings of the tab strip, not children of it.
      var scope = group.parentNode || document;
      var panels = [].slice.call(scope.querySelectorAll('[data-sh-panel]'));

      // The markup ships one button styled active and the rest idle. Read those
      // two inline-style strings off the markup instead of hard-coding them, so
      // the design stays the single source of truth.
      var on = btns.filter(function (b) { return b.getAttribute('aria-selected') === 'true'; })[0] || btns[0];
      var off = btns.filter(function (b) { return b !== on; })[0];
      var STYLE_ON = snapState(on);
      var STYLE_OFF = off ? snapState(off) : STYLE_ON;

      // The panels carry an inline display (grid), which beats the [hidden]
      // attribute's UA display:none — so visibility has to be driven through
      // that same inline display. The markup ships the inactive panels with
      // display:none already, so read the live value off the visible one.
      var live = panels.filter(function (p) { return !p.hidden; })[0] || panels[0];
      var DISPLAY = disp(live) !== 'none' ? disp(live) : '';

      function select(btn) {
        var val = btn.getAttribute('data-sh-tab');
        btns.forEach(function (b) {
          var active = b === btn;
          b.setAttribute('aria-selected', String(active));
          applyState(b, active ? STYLE_ON : STYLE_OFF);
        });
        panels.forEach(function (p) {
          var show = p.getAttribute('data-sh-panel') === val;
          p.style.display = show ? DISPLAY : 'none';
          p.hidden = !show;                       // keeps it out of the a11y tree
        });
      }

      select(on);                                 // apply the initial state


      btns.forEach(function (btn) {
        btn.setAttribute('role', 'tab');
        btn.addEventListener('click', function (e) { e.preventDefault(); select(btn); });
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

  /* 6. Hero accordion: [data-sh-hero] wraps [data-sh-hero-panel] anchors.
        The exported markup already carries one panel expanded and the rest
        collapsed, and every transition is declared inline on the elements.
        So instead of hard-coding design values here, we read the open state and
        the closed state straight off the markup and swap them. Change the design
        and this keeps working. ---------------------------------------------- */
  function hero() {
    document.querySelectorAll('[data-sh-hero]').forEach(function (box) {
      var panels = [].slice.call(box.querySelectorAll('[data-sh-hero-panel]'));
      if (panels.length < 2) return;

      var open = 0;
      // which slide ships open: its flex-grow is 1. That value used to be inline
      // and now comes from a class, so read it computed -- otherwise every slide
      // reads '' here, `open` stays 0, and the OPEN/SHUT caption templates are
      // snapped from the wrong panels: the first hover then shows the captions
      // on the collapsed slides and hides them on the open one.
      panels.forEach(function (p, i) { if (window.getComputedStyle(p).flexGrow === '1') open = i; });
      var closed = open === 0 ? 1 : 0;

      var snap = function (p) {
        return [].slice.call(p.children).map(function (c) {
          var cc = window.getComputedStyle(c);
          return { opacity: c.style.opacity || cc.opacity, transform: c.style.transform || cc.transform };
        });
      };
      var OPEN = snap(panels[open]);
      var SHUT = snap(panels[closed]);

      function show(idx) {
        if (idx === open) return;
        open = idx;
        panels.forEach(function (p, i) {
          var set = i === idx ? OPEN : SHUT;
          p.style.flexGrow = i === idx ? '1' : '0';
          [].slice.call(p.children).forEach(function (c, k) {
            if (!set[k]) return;
            c.style.opacity = set[k].opacity;
            c.style.transform = set[k].transform;
          });
        });
      }

      panels.forEach(function (p, i) {
        p.addEventListener('mouseenter', function () { show(i); });
        p.addEventListener('focus', function () { show(i); });
        p.addEventListener('click', function (e) {
          if (p.getAttribute('href') === '#') e.preventDefault();
          show(i);
        });
      });
    });
  }

  /* 7. Lightbox for the photo grids.
        [data-sh-lightbox] wraps [data-sh-shot] tiles carrying data-src (the
        full-size image), data-caption and an optional data-story link.
        One overlay is shared by every grid on the page. Styling is inline and
        uses the theme palette, so no stylesheet is involved. --------------- */
  function lightbox() {
    var groups = [].slice.call(document.querySelectorAll('[data-sh-lightbox]'));
    if (!groups.length) return;

    var FONT = "'Almarai','Noto Naskh Arabic',system-ui,sans-serif";
    var GHOST = 'width:44px;height:44px;border:1px solid rgba(255,255,255,.28);' +
      'background:rgba(10,26,51,.55);color:#fff;display:flex;align-items:center;' +
      'justify-content:center;cursor:pointer;flex:none;padding:0;' +
      'transition:background .18s ease,border-color .18s ease';
    var box, imgEl, capEl, countEl, storyEl, prevEl, nextEl, closeEl;
    var shots = [], idx = 0, opener = null, scrollY = 0;

    function el(tag, style, html) {
      var n = document.createElement(tag);
      n.setAttribute('style', style);
      if (html != null) n.innerHTML = html;
      return n;
    }

    function ghost(label, icon) {
      var b = el('button', GHOST, '<i class="' + icon + '" style="font-size:15px"></i>');
      b.type = 'button';
      b.setAttribute('aria-label', label);
      b.addEventListener('mouseenter', function () {
        b.style.background = '#1b5aa6'; b.style.borderColor = '#1b5aa6';
      });
      b.addEventListener('mouseleave', function () {
        b.style.background = 'rgba(10,26,51,.55)'; b.style.borderColor = 'rgba(255,255,255,.28)';
      });
      return b;
    }

    function build() {
      box = el('div', 'position:fixed;inset:0;z-index:9999;display:none;' +
        'flex-direction:column;background:rgba(10,26,51,.985);opacity:0;' +
        'transition:opacity .22s ease;font-family:' + FONT + ';direction:rtl');
      box.setAttribute('role', 'dialog');
      box.setAttribute('aria-modal', 'true');
      box.setAttribute('aria-label', 'عارض الصور');

      var bar = el('div', 'display:flex;align-items:center;justify-content:space-between;' +
        'gap:16px;padding:18px 22px;flex:none');
      countEl = el('span', 'font-size:12.5px;font-weight:700;color:#fff;' +
        'font-variant-numeric:tabular-nums;display:flex;align-items:center;gap:9px');
      closeEl = ghost('إغلاق', 'fa-solid fa-xmark');
      bar.appendChild(countEl);
      bar.appendChild(closeEl);

      var stage = el('div', 'flex:1;min-height:0;display:flex;align-items:center;' +
        'justify-content:center;gap:18px;padding:0 22px');
      prevEl = ghost('السابق', 'fa-solid fa-chevron-right');
      nextEl = ghost('التالي', 'fa-solid fa-chevron-left');
      imgEl = el('img', 'max-width:100%;max-height:100%;object-fit:contain;display:block;' +
        'background:#0f2a4f;opacity:0;transition:opacity .25s ease');
      imgEl.alt = '';
      var frame = el('div', 'flex:1;min-width:0;height:100%;display:flex;' +
        'align-items:center;justify-content:center');
      frame.appendChild(imgEl);
      stage.appendChild(nextEl);
      stage.appendChild(frame);
      stage.appendChild(prevEl);

      var foot = el('div', 'flex:none;padding:16px 22px 24px;display:flex;' +
        'align-items:baseline;justify-content:space-between;gap:20px;flex-wrap:wrap');
      capEl = el('span', 'font-size:14px;font-weight:700;color:#fff;line-height:1.7;' +
        'max-width:72ch;text-wrap:pretty');
      storyEl = el('a', 'font-size:12px;font-weight:700;color:#7ea8dd;display:none;' +
        'align-items:center;gap:8px;white-space:nowrap', 'اقرأ القصة ←');
      foot.appendChild(capEl);
      foot.appendChild(storyEl);

      box.appendChild(bar);
      box.appendChild(stage);
      box.appendChild(foot);
      document.body.appendChild(box);

      closeEl.addEventListener('click', close);
      prevEl.addEventListener('click', function () { go(idx - 1); });
      nextEl.addEventListener('click', function () { go(idx + 1); });
      box.addEventListener('click', function (e) {
        if (e.target === box || e.target === stage || e.target === frame) close();
      });
      document.addEventListener('keydown', onKey);
    }

    function preload(n) {
      var s = shots[(n + shots.length) % shots.length];
      if (s) { var i = new Image(); i.src = s.getAttribute('data-src'); }
    }

    function go(n) {
      if (!shots.length) return;
      idx = (n + shots.length) % shots.length;
      var s = shots[idx];
      imgEl.style.opacity = '0';
      var next = new Image();
      next.onload = function () { imgEl.src = next.src; imgEl.style.opacity = '1'; };
      next.onerror = function () { imgEl.src = next.src; imgEl.style.opacity = '1'; };
      next.src = s.getAttribute('data-src');
      var cap = s.getAttribute('data-caption') || '';
      capEl.textContent = cap;
      imgEl.alt = cap;
      countEl.innerHTML = '<span style="width:6px;height:6px;background:#1b5aa6;' +
        'transform:rotate(45deg);display:block"></span>' + (idx + 1) + ' / ' + shots.length;
      var story = s.getAttribute('data-story');
      storyEl.href = story || '#';
      storyEl.style.display = story ? 'inline-flex' : 'none';
      var many = shots.length > 1;
      prevEl.style.visibility = nextEl.style.visibility = many ? 'visible' : 'hidden';
      preload(idx + 1); preload(idx - 1);
    }

    function onKey(e) {
      if (!box || disp(box) === 'none') return;
      if (e.key === 'Escape') { e.preventDefault(); close(); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); go(idx + 1); }   // RTL: left = forward
      else if (e.key === 'ArrowRight') { e.preventDefault(); go(idx - 1); }
      else if (e.key === 'Tab') {                                            // keep focus inside
        var f = [closeEl, prevEl, nextEl].concat(disp(storyEl) !== 'none' ? [storyEl] : []);
        var at = f.indexOf(document.activeElement);
        e.preventDefault();
        f[(at + (e.shiftKey ? -1 : 1) + f.length) % f.length].focus();
      }
    }

    function open(list, start, from) {
      if (!box) build();
      shots = list; opener = from;
      scrollY = window.pageYOffset;
      document.body.style.top = -scrollY + 'px';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
      box.style.display = 'flex';
      void box.offsetWidth;
      box.style.opacity = '1';
      go(start);
      closeEl.focus();
    }

    function close() {
      if (!box) return;
      box.style.opacity = '0';
      setTimeout(function () {
        box.style.display = 'none';
        imgEl.removeAttribute('src');
      }, 220);
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      window.scrollTo(0, scrollY);
      if (opener) opener.focus();
    }

    groups.forEach(function (g) {
      var list = [].slice.call(g.querySelectorAll('[data-sh-shot]'));
      list.forEach(function (shot, i) {
        shot.addEventListener('click', function (e) {
          if (e.metaKey || e.ctrlKey || e.shiftKey || e.button > 0) return;  // let people open the story in a tab
          e.preventDefault();
          open(list, i, shot);
        });
      });
    });
  }

  /* 8. Video player: [data-sh-player] wraps a [data-sh-video] plus the controls
        the design already ships — poster, big play, progress track with a knob,
        time readout, mute and fullscreen. The bar is right-anchored because the
        page is RTL, so progress grows leftwards from the right edge. -------- */
  function player() {
    document.querySelectorAll('[data-sh-player]').forEach(function (stage) {
      var v = stage.querySelector('[data-sh-video]');
      if (!v) return;
      var poster = stage.querySelector('[data-sh-poster]');
      var big = stage.querySelector('[data-sh-bigplay]');
      var toggle = stage.querySelector('[data-sh-toggle]');
      var track = stage.querySelector('[data-sh-track]');
      var fill = stage.querySelector('[data-sh-fill]');
      var knob = stage.querySelector('[data-sh-knob]');
      var timeEl = stage.querySelector('[data-sh-time]');
      var mute = stage.querySelector('[data-sh-mute]');
      var fs = stage.querySelector('[data-sh-fs]');

      function icon(host, name) {
        var i = host && host.querySelector('i');
        if (i) i.className = name;
      }
      function mmss(s) {
        if (!isFinite(s) || s < 0) s = 0;
        var m = Math.floor(s / 60), r = Math.floor(s % 60);
        return (m < 10 ? '0' : '') + m + ':' + (r < 10 ? '0' : '') + r;
      }
      function paint() {
        var d = v.duration, pct = d ? (v.currentTime / d) * 100 : 0;
        if (fill) fill.style.width = pct + '%';
        if (knob) knob.style.right = pct + '%';
        if (timeEl) timeEl.textContent = mmss(v.currentTime) + ' / ' + mmss(d);
        if (track) {
          track.setAttribute('aria-valuemin', '0');
          track.setAttribute('aria-valuemax', String(Math.round(d || 0)));
          track.setAttribute('aria-valuenow', String(Math.round(v.currentTime)));
        }
      }
      function playing(on) {
        icon(toggle, 'fa-solid fa-' + (on ? 'pause' : 'play'));
        if (poster) poster.style.opacity = on ? '0' : '.9';
        if (big) {
          big.style.opacity = on ? '0' : '1';
          big.style.pointerEvents = on ? 'none' : '';
        }
      }
      function flip(e) {
        if (e) e.preventDefault();
        if (v.paused) { var p = v.play(); if (p && p.catch) p.catch(function () {}); }
        else v.pause();
      }
      function seekTo(clientX) {
        var r = track.getBoundingClientRect();
        if (!r.width || !isFinite(v.duration)) return;
        var f = (r.right - clientX) / r.width;          // RTL: right edge is zero
        v.currentTime = Math.max(0, Math.min(1, f)) * v.duration;
        paint();
      }

      if (poster) poster.style.transition = 'opacity .3s ease';
      if (big) big.style.transition = 'opacity .3s ease';

      if (big) big.addEventListener('click', flip);
      if (toggle) toggle.addEventListener('click', flip);
      v.addEventListener('click', flip);
      v.addEventListener('play', function () { playing(true); });
      v.addEventListener('pause', function () { playing(false); });
      v.addEventListener('ended', function () { playing(false); v.currentTime = 0; paint(); });
      v.addEventListener('timeupdate', paint);
      v.addEventListener('loadedmetadata', paint);

      if (track) {
        var dragging = false;
        track.addEventListener('pointerdown', function (e) {
          dragging = true;
          track.setPointerCapture && track.setPointerCapture(e.pointerId);
          seekTo(e.clientX);
        });
        track.addEventListener('pointermove', function (e) { if (dragging) seekTo(e.clientX); });
        var stop = function () { dragging = false; };
        track.addEventListener('pointerup', stop);
        track.addEventListener('pointercancel', stop);
        track.addEventListener('keydown', function (e) {
          if (e.key === 'ArrowLeft') { e.preventDefault(); v.currentTime += 5; }
          else if (e.key === 'ArrowRight') { e.preventDefault(); v.currentTime -= 5; }
          else if (e.key === ' ' || e.key === 'Enter') { flip(e); }
        });
      }

      if (mute) {
        mute.addEventListener('click', function (e) {
          e.preventDefault();
          v.muted = !v.muted;
          icon(mute, 'fa-solid fa-volume-' + (v.muted ? 'xmark' : 'high'));
          mute.setAttribute('aria-label', v.muted ? 'إلغاء الكتم' : 'كتم الصوت');
        });
      }

      if (fs) {
        fs.addEventListener('click', function (e) {
          e.preventDefault();
          if (document.fullscreenElement) document.exitFullscreen();
          else if (stage.requestFullscreen) stage.requestFullscreen();
        });
        document.addEventListener('fullscreenchange', function () {
          icon(fs, 'fa-solid fa-' + (document.fullscreenElement === stage ? 'compress' : 'expand'));
        });
      }

      stage.setAttribute('tabindex', '0');
      stage.addEventListener('keydown', function (e) {
        if (e.target === track) return;
        var k = e.key.toLowerCase();
        if (k === ' ' || k === 'k') { flip(e); }
        else if (e.key === 'ArrowLeft') { e.preventDefault(); v.currentTime += 5; }
        else if (e.key === 'ArrowRight') { e.preventDefault(); v.currentTime -= 5; }
        else if (k === 'm' && mute) { mute.click(); }
        else if (k === 'f' && fs) { fs.click(); }
      });

      playing(false);
      paint();
    });
  }

  /* 9. Load more: [data-sh-more] reveals the next [data-sh-batch] inside the
        nearest [data-sh-more-list]. Once every batch is out, the whole button
        row is removed so no dead control is left on the page. -------------- */
  function loadMore() {
    document.querySelectorAll('[data-sh-more]').forEach(function (btn) {
      var scope = btn.closest('section') || document;
      var list = scope.querySelector('[data-sh-more-list]');
      if (!list) return;
      var row = btn.parentNode;

      btn.addEventListener('click', function (e) {
        e.preventDefault();
        var next = list.querySelector('[data-sh-batch]:not([data-sh-shown])');
        if (!next) return;
        next.setAttribute('data-sh-shown', '');
        next.style.display = '';
        next.style.opacity = '0';
        next.style.transition = 'opacity .35s ease';
        void next.offsetWidth;
        next.style.opacity = '1';
        // move focus to the first new row so keyboard users land in the right place
        var first = next.querySelector('a');
        if (first) { first.setAttribute('tabindex', '-1'); first.focus({ preventScroll: true }); }
        if (!list.querySelector('[data-sh-batch]:not([data-sh-shown])') && row) {
          row.style.transition = 'opacity .3s ease';
          row.style.opacity = '0';
          setTimeout(function () { row.style.display = 'none'; }, 300);
        }
      });
    });
  }

  /* 10. Pagination: [data-sh-pager] drives the [data-sh-page] batches inside
         [data-sh-pager-list]. Page numbers the static build does not ship are
         shown in the same muted style the design already uses for a disabled
         control — the real page count comes from the backend later. -------- */
  function pager() {
    document.querySelectorAll('[data-sh-pager]').forEach(function (nav) {
      // A nav can name the list it drives (data-sh-pager="results"), which is
      // needed when the two are not siblings. Otherwise take the nearest one.
      var id = nav.getAttribute('data-sh-pager');
      var scope = nav.closest('section') || nav.parentNode || document;
      var list = id ? document.querySelector('[data-sh-pager-list="' + id + '"]')
                    : (scope.querySelector('[data-sh-pager-list]') ||
                       document.querySelector('[data-sh-pager-list]'));
      if (!list) return;

      var pages = [].slice.call(list.querySelectorAll('[data-sh-page]'));
      if (pages.length < 2) return;
      var available = pages.map(function (p) { return p.getAttribute('data-sh-page'); });

      // A batch inside a CSS grid must keep its own display value (typically
      // display:contents, so the rows stay direct grid items). Remember it.
      var shown = pages.filter(function (p) { return disp(p) !== 'none'; })[0] || pages[0];
      var DISPLAY = disp(shown) !== 'none' ? disp(shown) : '';

      var nums = [].slice.call(nav.querySelectorAll('[data-sh-goto]'));
      var prev = nav.querySelector('[data-sh-prev-page]');
      var next = nav.querySelector('[data-sh-next-page]');

      /* Read the states the design already ships. They used to live in the
         style attribute; now they live in the class list. Snapshot both and
         swap both, so the code is exact whichever the markup carries. */
      var ON = snapState(nums[0]), OFF = snapState(nums[1] || nums[0]);
      var LINK_ON = snapState(next), LINK_OFF = snapState(prev);
      function apply(el, st, dead) {
        applyState(el, st);
        if (dead) {
          // a page number beyond the real count: the shipped build swapped the
          // OFF colour for #c3cbd7 and added cursor:default
          if (!st.style || st.style.indexOf('color:#4a5568') !== -1) el.style.color = '#c3cbd7';
          el.style.cursor = 'default';
        }
      }

      var cur = available[0];

      function show(page) {
        if (available.indexOf(page) === -1) return;
        cur = page;
        pages.forEach(function (p) {
          var on = p.getAttribute('data-sh-page') === page;
          p.style.display = on ? DISPLAY : 'none';
          p.hidden = !on;
        });
        nums.forEach(function (a) {
          var v = a.getAttribute('data-sh-goto');
          var real = available.indexOf(v) !== -1;
          apply(a, v === page ? ON : OFF, !real);
          a.setAttribute('aria-current', v === page ? 'page' : 'false');
          if (!real) a.setAttribute('aria-disabled', 'true');
        });
        var i = available.indexOf(page);
        if (prev) {
          var canPrev = i > 0;
          apply(prev, canPrev ? LINK_ON : LINK_OFF, false);
          prev.setAttribute('aria-disabled', String(!canPrev));
        }
        if (next) {
          var canNext = i < available.length - 1;
          apply(next, canNext ? LINK_ON : LINK_OFF, false);
          next.setAttribute('aria-disabled', String(!canNext));
        }
        var top = list.getBoundingClientRect().top + window.pageYOffset - 90;
        window.scrollTo({ top: top, behavior: 'smooth' });
      }

      nums.forEach(function (a) {
        a.addEventListener('click', function (e) {
          e.preventDefault();
          show(a.getAttribute('data-sh-goto'));
        });
      });
      if (prev) prev.addEventListener('click', function (e) {
        e.preventDefault();
        var i = available.indexOf(cur);
        if (i > 0) show(available[i - 1]);
      });
      if (next) next.addEventListener('click', function (e) {
        e.preventDefault();
        var i = available.indexOf(cur);
        if (i < available.length - 1) show(available[i + 1]);
      });

      show(available[0]);
      window.scrollTo(0, 0);          // show() scrolls; undo it for the initial paint
    });
  }

  /* 11. "ملفات شهاب" shelf. The design ships four spines and one open file, and
         its own caption says "اضغط كعب الملف لفتحه" — but the spines were plain
         links that navigated away. Pressing one now opens that file in place.

         Deliberately minimal: the shelf keeps its six columns, the cover and the
         paper never move, only their content swaps, and the only thing that
         changes on a spine is its background — between the two colours the
         design already uses (#1b5aa6 open, #0f2a4f closed). --------------- */
  function files() {
    document.querySelectorAll('[data-sh-files]').forEach(function (shelf) {
      // one div.sh-file per file: its spine first, then its body (cover + paper)
      var wraps = [].slice.call(shelf.querySelectorAll('[data-sh-file-wrap]'));
      if (wraps.length < 2) return;
      var keys = wraps.map(function (w) { return w.getAttribute('data-sh-file-wrap'); });
      var spines = wraps.map(function (w) { return w.querySelector('[data-sh-file]'); });
      if (spines.some(function (s) { return !s; })) return;

      // the open and closed spine colours, read off the markup as shipped
      var read = function (el, prop) { return el.style[prop] || window.getComputedStyle(el)[prop === 'background' ? 'backgroundColor' : prop]; };
      var OPEN_BG = read(spines[0], 'background') || '#1b5aa6';
      var SHUT_BG = read(spines[1], 'background') || '#0f2a4f';
      var current = null;

      function partsOf(k) {
        return [].slice.call(shelf.querySelectorAll('[data-sh-file-part="' + k + '"]'));
      }
      // The accordion clips a closed file at its spine, so every body stays in
      // the layout; a page that ships files 02-04 with display:none (the
      // inline-styled comparison page) has that cleared here.
      keys.forEach(function (k) { partsOf(k).forEach(function (p) { if (getComputedStyle(p).display === 'none') p.style.display = ''; }); });

      function replay(el) {
        var anim = [el].concat([].slice.call(el.querySelectorAll('*')))
          .filter(function (n) { return n.style && (n.style.animation || window.getComputedStyle(n).animationName !== 'none'); });
        anim.forEach(function (n) { n.__anim = n.style.animation || ''; n.style.animation = 'none'; });
        void el.offsetWidth;
        anim.forEach(function (n) { n.style.animation = n.__anim; });
      }

      function open(k, animate) {
        if (k === current || keys.indexOf(k) === -1) return;
        current = k;
        /* The width hand-off itself is CSS (flex-grow transitions on
           .sh-file[data-open]); this only flips the state. */
        wraps.forEach(function (w, i) { w.setAttribute('data-open', String(keys[i] === k)); });
        spines.forEach(function (s, i) {
          var on = keys[i] === k;
          s.style.transition = 'background .2s';
          s.style.background = on ? OPEN_BG : SHUT_BG;
          s.style.cursor = on ? 'default' : 'pointer';
          s.setAttribute('aria-expanded', String(on));
          // Spines 02-04 carry two full-bleed overlays (the file artwork and a
          // navy tint). Left on, they would darken the open spine's blue. Fade
          // them out while the file is open and restore them when it closes.
          // Matched on computed geometry, not on the style string: the browser
          // rewrites "inset:0" to "inset: 0px", so substring selectors miss.
          // Spine 01's 4px white rule has left:auto, so it never matches.
          [].slice.call(s.children).forEach(function (o) {
            var cs = getComputedStyle(o);
            if (cs.position !== 'absolute' || cs.left !== '0px' || cs.right !== '0px') return;
            if (o.__op === undefined) o.__op = o.style.opacity || getComputedStyle(o).opacity || '1';
            o.style.transition = 'opacity .2s ease';
            o.style.opacity = on ? '0' : o.__op;
          });
        });
        keys.forEach(function (key) {
          partsOf(key).forEach(function (p) {
            p.setAttribute('aria-hidden', String(key !== k));
            p.tabIndex = key === k ? 0 : -1;     // a clipped file is not a tab stop
          });
        });
        if (animate) partsOf(k).forEach(replay);
      }

      spines.forEach(function (s, i) {
        s.setAttribute('role', 'button');
        s.addEventListener('click', function (e) {
          if (e.metaKey || e.ctrlKey || e.shiftKey || e.button > 0) return;
          e.preventDefault();          // a spine opens its file, it does not navigate
          open(keys[i], true);
        });
        s.addEventListener('keydown', function (e) {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(keys[i], true); }
        });
      });

      open(keys[0], false);            // file 01 keeps the load animation as designed
    });
  }

  /* 12. Page transition — the approved loader, variant A "الضربة الضوئية".
         Leaving a page raises the veil and lets the nib start drawing; the next
         page picks the veil back up and drops it once it has painted, so the
         two halves read as one stroke. Only ever shown between pages, never on
         a first visit. Markup: LOADER_VEIL. Styles: css/transition.css. ----- */
  function transition() {
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var FLAG = 'sh-nav';    // set when we leave through an internal link
    var AT = 'sh-nav-at';   // how far the stroke had got, in animation ms

    /* The loader's sequence runs 3.0s end to end (seed .42 -> stroke .4-1.75 ->
       mark revealed 1.9 -> sweep 1.9-2.8 -> wordline 2.3 -> tagline 2.95 ->
       dots 3.0). Playing that whole thing on each half of a navigation would
       cost 6s, so the veil plays loader.css's own timeline FASTER rather than
       shorter -- same shape, same easing, nothing redrawn -- and the two halves
       resume one continuous stroke instead of each restarting from zero. */
    var SPEED = 2.3;    // 3.0s of animation in ~1.3s of wall clock
    var OUT = 600;      // wall time the veil is up before we leave (~46%)
    var TOTAL = 3000;   // the sequence's own length, in animation ms
    /* The handoff is the real playhead, not OUT * SPEED, so a timer that fires
       late still resumes at the right frame. Cap it anyway: on a busy device
       that timer can slip far enough to hand over a finished animation, and the
       arriving page would then flash a completed mark and vanish. */
    var MAX_HANDOFF = TOTAL * 0.6;
    var FALLBACK_IN = 700;  // arrival hold where getAnimations() is missing
    var SAFETY = 4000;  // never strand a visitor behind the veil

    var veil = document.createElement('div');
    veil.setAttribute('data-sh-veil', '');
    veil.setAttribute('aria-hidden', 'true');
    veil.innerHTML = LOADER_VEIL;
    document.body.appendChild(veil);

    var stage = veil.firstElementChild;

    /* Restart every inline animation, run it at SPEED, and drop the playhead at
       `at` ms so an arriving page picks the stroke up mid-flight. Returns the
       live animation objects; empty on browsers without getAnimations(). */
    function replay(at) {
      var anim = [].slice.call(stage.querySelectorAll('[style*="animation"]'));
      anim.forEach(function (n) { n.__a = n.style.animation; n.style.animation = 'none'; });
      void stage.offsetWidth;
      anim.forEach(function (n) { n.style.animation = n.__a; });
      void stage.offsetWidth;                    // flush so the new ones exist
      if (!stage.getAnimations) return [];
      var list = stage.getAnimations({ subtree: true });
      /* Seek by startTime, not currentTime. These animations were created by
         the style change two lines up, so they are still play-pending, and
         per spec assigning currentTime to a pending animation sets a hold time
         rather than a playhead. Anchoring startTime to the document timeline
         positions them without that hazard. Note document.timeline.currentTime
         is legitimately 0 this early in the page's life; a negative startTime
         is the correct result and is what makes the stroke resume mid-flight. */
      var now = document.timeline && document.timeline.currentTime;
      if (now && typeof now.value === 'number') now = now.value;   // CSSNumberish
      list.forEach(function (a) {
        try {
          a.playbackRate = SPEED;
          if (at && typeof now === 'number') a.startTime = now - at / SPEED;
        } catch (e) { /* engine refused the seek; it still plays through */ }
      });
      return list;
    }
    // the three dots loop forever, so only the one-shot animations can settle
    function oneShot(list) {
      return list.filter(function (a) {
        var t = a.effect && a.effect.getTiming && a.effect.getTiming();
        return t && t.iterations !== Infinity;
      });
    }
    function show(at) { var l = replay(at); veil.setAttribute('data-on', ''); return l; }
    function hide() { veil.removeAttribute('data-on'); }

    function flagged() {
      try { return sessionStorage.getItem(FLAG) === '1'; } catch (e) { return false; }
    }
    function flag(on) {
      try { on ? sessionStorage.setItem(FLAG, '1') : sessionStorage.removeItem(FLAG); }
      catch (e) { /* private mode */ }
    }

    /* Arriving from an internal link: the veil is already opaque on the page we
       came from, so it must not fade in again here -- that would read as a
       flicker across the swap. Resume the stroke where it stopped and hold
       until BOTH the animation has finished and the page has painted. */
    if (flagged() && !reduce) {
      var at = 0;
      try { at = parseFloat(sessionStorage.getItem(AT)) || 0; } catch (e) {}
      if (!(at > 0)) at = 0;                       // NaN, negative, or absent
      if (at > MAX_HANDOFF) at = MAX_HANDOFF;      // stale value from an older build

      veil.style.transition = 'none';
      var list = show(at);
      void veil.offsetWidth;
      veil.style.transition = '';

      var loaded = document.readyState === 'complete'
        ? Promise.resolve()
        : new Promise(function (r) { window.addEventListener('load', r, { once: true }); });

      var settled = oneShot(list).map(function (a) { return a.finished; });
      if (!settled.length) {                       // no Web Animations support
        settled = [new Promise(function (r) { setTimeout(r, FALLBACK_IN); })];
      }
      Promise.all(settled.concat([loaded])).then(hide, hide);
      setTimeout(hide, SAFETY);
    }
    flag(false);
    try { sessionStorage.removeItem(AT); } catch (e) {}

    if (reduce) return;   // no veil, no delay

    document.addEventListener('click', function (e) {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      var a = e.target.closest && e.target.closest('a[href]');
      if (!a) return;
      var href = a.getAttribute('href');
      if (!href || href.charAt(0) === '#' || /^(?:[a-z]+:)?\/\//i.test(href)) return;
      if (/^(mailto|tel|javascript):/i.test(href)) return;
      if (a.target && a.target !== '_self') return;
      if (a.hasAttribute('download')) return;
      if (!/\.html(?:[?#]|$)/i.test(href)) return;
      var url = new URL(a.href, location.href);
      if (url.origin !== location.origin) return;
      if (url.pathname === location.pathname && url.search === location.search) return;

      e.preventDefault();
      flag(true);
      var out = show(0);
      setTimeout(function () {
        // hand the playhead over so the next page continues this same stroke
        var at = 0;
        out.forEach(function (an) {
          var c = an.currentTime;
          if (typeof c === 'number' && c > at) at = c;
        });
        at = Math.min(at || OUT * SPEED, MAX_HANDOFF);
        try { sessionStorage.setItem(AT, String(at)); } catch (err) {}
        location.href = a.href;
      }, OUT);
      setTimeout(function () {   // navigation blocked
        hide(); flag(false);
        try { sessionStorage.removeItem(AT); } catch (err) {}
      }, SAFETY);
    });   // bubble phase on purpose: a component (file spine, lightbox tile,
          // pager, load-more) gets to call preventDefault first, and the
          // defaultPrevented check above then leaves that click alone.

    // coming back through the bfcache must never leave the veil up
    window.addEventListener('pageshow', function (e) {
      if (!e.persisted) return;
      hide(); flag(false);
      try { sessionStorage.removeItem(AT); } catch (err) {}
    });
  }

  /* 13. Category filters. [data-sh-filters] holds links carrying
         data-sh-filter="cat|cat" (or "*" for the all-items link); each item in
         the same section carries data-sh-item + data-sh-cat. The accepted
         categories live in the markup rather than in here, so editing the
         taxonomy never means touching this file. -------------------------- */
  function filters() {
    document.querySelectorAll('[data-sh-filters]').forEach(function (strip) {
      var links = [].slice.call(strip.querySelectorAll('[data-sh-filter]'));
      if (!links.length) return;
      var scope = strip.closest('section') || document;
      var items = [].slice.call(scope.querySelectorAll('[data-sh-item]'));
      if (!items.length) return;

      var on = links.filter(function (a) { return a.getAttribute('aria-current') === 'true'; })[0] || links[0];
      var off = links.filter(function (a) { return a !== on; })[0];
      var STYLE_ON = snapState(on);
      var STYLE_OFF = off ? snapState(off) : STYLE_ON;

      items.forEach(function (it) {
        it.__display = it.style.display || disp(it) || '';
        it.style.transition = 'opacity .28s ease';
      });

      // one empty state, styled like the rest of the section
      var empty = document.createElement('p');
      empty.setAttribute('data-sh-empty', '');
      empty.style.cssText = 'display:none;grid-column:1/-1;margin:0;padding:26px 0;' +
        "font-family:'Almarai',sans-serif;font-size:13.5px;color:#8a95a6";
      empty.textContent = 'لا توجد أخبار في هذا القسم حاليًا.';
      items[0].parentNode.appendChild(empty);

      function apply(link) {
        var accept = (link.getAttribute('data-sh-filter') || '*').split('|');
        var all = accept.indexOf('*') !== -1;
        var shown = 0;

        links.forEach(function (a) {
          var active = a === link;
          applyState(a, active ? STYLE_ON : STYLE_OFF);
          a.setAttribute('aria-current', String(active));
        });

        items.forEach(function (it) {
          var hit = all || accept.indexOf(it.getAttribute('data-sh-cat')) !== -1;
          if (hit) shown++;
          it.style.display = hit ? it.__display : 'none';
          it.style.opacity = hit ? '1' : '0';
        });

        empty.style.display = shown ? 'none' : 'block';
      }

      links.forEach(function (a) {
        a.addEventListener('click', function (e) { e.preventDefault(); apply(a); });
      });

      apply(on);
    });
  }

  /* 14. «محاور» — collections and the collection viewer. [data-sh-hubs] holds
         one [data-sh-hub] per topic (data-sh-filter="cat|cat"); the stories
         live in the section's <template data-sh-hub-source> as
         <a data-sh-item data-sh-cat data-sh-time data-sh-image href>headline</a>.
         A hub's cover is its newest story's photograph unless the tile names
         one with data-sh-cover. The viewer shows ONE story at a time as a deck
         of cards: the ones still to come peek out of the right edge, going
         forward throws the top card off to the left. Drag it, tap its sides,
         or use the arrows; the strip under the card names what is next, and
         at the end of a hub it names the next hub. «اسمع المحور» hands the
         hub to the brief player. ------------------------------------------ */
  function hubs() {
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var PEEK = 2;                   // how many upcoming cards show an edge

    function minutes(t) {           // "09:31 م" -> minutes since midnight, for sorting
      var m = /(\d{1,2}):(\d{2})\s*([صم])?/.exec(t || '');
      if (!m) return -1;
      var h = +m[1] % 12, mi = +m[2];
      if (m[3] === 'م') h += 12;
      return h * 60 + mi;
    }
    function count(n) {
      if (n === 1) return 'خبر واحد';
      if (n === 2) return 'خبران';
      if (n <= 10) return n + ' أخبار';
      return n + ' خبرًا';
    }
    function two(n) { return (n < 10 ? '0' : '') + n; }
    function esc(t) { return String(t).replace(/[<>&"]/g, function (c) { return { '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' }[c]; }); }

    document.querySelectorAll('[data-sh-hubs]').forEach(function (grid) {
      var tiles = [].slice.call(grid.querySelectorAll('[data-sh-hub]'));
      var scope = grid.closest('section') || document;
      var src = scope.querySelector('[data-sh-hub-source]');
      var pool = src ? (src.content || src) : scope;
      var all = [].slice.call(pool.querySelectorAll('[data-sh-item]')).map(function (a) {
        var time = (a.getAttribute('data-sh-time') || '').replace(/\s+/g, ' ').trim();
        return { c: a.getAttribute('data-sh-cat') || '', time: time, m: minutes(time),
                 img: a.getAttribute('data-sh-image') || '', credit: a.getAttribute('data-sh-credit') || '',
                 href: a.getAttribute('href') || '#', t: a.textContent.replace(/\s+/g, ' ').trim() };
      }).filter(function (i) { return i.t; });          // a story without a headline is not a story
      if (!tiles.length || !all.length) return;

      var hubs = tiles.map(function (tile) {
        var accept = (tile.getAttribute('data-sh-filter') || '').split('|');
        var items = all.filter(function (i) { return accept.indexOf(i.c) !== -1; })
          .sort(function (a, b) { return b.m - a.m; });
        var withPic = items.filter(function (i) { return i.img; })[0];
        return {
          tile: tile, items: items, accept: accept,
          name: (tile.querySelector('.sh-hub__name') || tile).textContent.trim(),
          cover: tile.getAttribute('data-sh-cover') || (withPic ? withPic.img : '')
        };
      }).filter(function (h) {
        if (h.items.length) return true;
        h.tile.setAttribute('data-sh-empty', '');        // nothing in this hub today
        return false;
      });
      if (!hubs.length) return;

      hubs.forEach(function (h, hi) {
        var c = h.tile.querySelector('[data-sh-hub-count]'), m = h.tile.querySelector('[data-sh-hub-meta]');
        var cover = h.tile.querySelector('.sh-hub__cover');
        var newest = h.items[0];
        if (c) c.textContent = String(h.items.length);
        if (m) m.innerHTML = esc(count(h.items.length)) + (newest.time ? ' · <span>' + esc(newest.time) + '</span>' : '');
        if (cover && h.cover && !cover.querySelector('img')) {
          var im = document.createElement('img');
          im.className = 'sh-hub__art'; im.alt = ''; im.loading = 'lazy'; im.decoding = 'async';
          im.src = h.cover;
          cover.insertBefore(im, cover.firstChild);
        }
        h.tile.setAttribute('aria-haspopup', 'dialog');
        h.tile.addEventListener('click', function (e) {
          if (e.metaKey || e.ctrlKey || e.shiftKey || e.button > 0) return;   // a new tab still gets the section page
          e.preventDefault();
          open(hi, 0, h.tile);
        });
      });

      /* the viewer, built once */
      var view = null, els = {}, cards = [], cur = { h: -1, i: -1 }, opener = null, closing = 0;
      function build() {
        view = document.createElement('div');
        view.className = 'sh-hubview';
        view.setAttribute('role', 'dialog');
        view.setAttribute('aria-modal', 'true');
        view.setAttribute('aria-label', 'محور');
        view.hidden = true;
        view.innerHTML =
          '<div class="sh-hubview__veil" data-sh-hv-close></div>' +
          '<div class="sh-hubview__frame">' +
            '<div class="sh-hubview__bar">' +
              '<span class="sh-hubview__brand"><span class="sh-mark"></span>محور</span>' +
              '<span class="sh-hubview__name" data-sh-hv-name></span>' +
              '<span class="sh-hubview__pos" data-sh-hv-pos></span>' +
              '<button type="button" class="sh-hubview__listen" data-sh-hv-listen><span class="sh-mark"></span>اسمع المحور</button>' +
              '<button type="button" class="sh-hubview__close" data-sh-hv-close aria-label="إغلاق">&times;</button>' +
            '</div>' +
            '<div class="sh-hubview__segs" data-sh-hv-segs></div>' +
            '<div class="sh-hubview__deck" data-sh-hv-deck></div>' +
            '<button type="button" class="sh-hubview__next" data-sh-hv-nextbar>' +
              '<span class="sh-hubview__nlabel"><span class="sh-mark"></span><span data-sh-hv-nlabel>التالي</span></span>' +
              '<span class="sh-hubview__ntitle" data-sh-hv-ntitle></span>' +
              '<span class="sh-hubview__ntime" data-sh-hv-ntime></span>' +
            '</button>' +
          '</div>';
        document.body.appendChild(view);
        var q = function (s) { return view.querySelector(s); };
        els = { name: q('[data-sh-hv-name]'), pos: q('[data-sh-hv-pos]'), segs: q('[data-sh-hv-segs]'),
                deck: q('[data-sh-hv-deck]'), nextbar: q('[data-sh-hv-nextbar]'), nlabel: q('[data-sh-hv-nlabel]'),
                ntitle: q('[data-sh-hv-ntitle]'), ntime: q('[data-sh-hv-ntime]'),
                close: q('.sh-hubview__close'), listen: q('[data-sh-hv-listen]') };

        [].slice.call(view.querySelectorAll('[data-sh-hv-close]')).forEach(function (b) { b.addEventListener('click', close); });
        els.nextbar.addEventListener('click', next);
        els.listen.addEventListener('click', function () {
          var h = hubs[cur.h];
          document.dispatchEvent(new CustomEvent('sh-brief:play', { detail: {
            id: 'hub:' + h.name, edition: 'محور ' + h.name,
            items: h.items.map(function (r) { return { c: r.c, time: r.time, href: r.href, t: r.t, say: r.t }; })
          } }));
          close();
        });
        // one handler for the whole deck: the tap zones, and the peeking edges
        els.deck.addEventListener('click', function (e) {
          if (e.target.closest('a')) return;                       // the story's own link
          if (e.target.closest('[data-sh-hv-prev]')) { prev(); return; }
          if (e.target.closest('[data-sh-hv-next]')) { next(); return; }
          var card = e.target.closest('.sh-hubcard');
          if (card && card.getAttribute('data-state') === 'next') next();
        });
        drag(els.deck);
        // the story's clock stops while the pointer or the focus is on the deck
        els.deck.addEventListener('mouseenter', function () { view.setAttribute('data-paused', ''); });
        els.deck.addEventListener('mouseleave', function () { view.removeAttribute('data-paused'); });
        els.deck.addEventListener('focusin', function () { view.setAttribute('data-paused', ''); });
        els.deck.addEventListener('focusout', function () { view.removeAttribute('data-paused'); });
        // the filling segment is the clock: when its animation ends, move on
        els.segs.addEventListener('animationend', function (e) {
          if (e.animationName === 'sh-hubview-seg' && !view.hidden) next();
        });
        document.addEventListener('visibilitychange', function () {
          if (view.hidden) return;
          if (document.hidden) view.setAttribute('data-paused', ''); else view.removeAttribute('data-paused');
        });
        document.addEventListener('keydown', function (e) {
          if (view.hidden) return;
          if (e.key === 'Escape') { e.preventDefault(); close(); }
          else if (e.key === 'ArrowLeft') { e.preventDefault(); next(); }     // RTL: forward is leftward
          else if (e.key === 'ArrowRight') { e.preventDefault(); prev(); }
          else if (e.key === 'Tab') trap(e);
        });
      }

      /* dragging the top card: it follows the pointer, and past a third of
         the deck's width the release turns the page */
      function drag(deck) {
        var id = null, x0 = 0, dx = 0, top = null, moved = 0;
        deck.addEventListener('pointerdown', function (e) {
          if (e.button > 0 || e.target.closest('a')) return;
          top = cards[cur.i];
          if (!top) return;
          id = e.pointerId; x0 = e.clientX; dx = 0; moved = 0;
          deck.setAttribute('data-drag', '');
          view.setAttribute('data-paused', '');
          if (deck.setPointerCapture) { try { deck.setPointerCapture(id); } catch (err) {} }
        });
        deck.addEventListener('pointermove', function (e) {
          if (id === null || e.pointerId !== id) return;
          dx = e.clientX - x0;
          if (Math.abs(dx) > 4) moved = 1;
          top.style.transform = 'translateX(' + dx + 'px) rotate(' + (dx / 60).toFixed(2) + 'deg)';
          var nx = cards[cur.i + 1];
          if (nx) {
            var p = Math.min(1, Math.max(0, -dx / 220));           // only a forward drag pulls it in
            nx.style.transform = 'translateX(' + (22 * (1 - p)) + 'px) scale(' + (1 - .035 * (1 - p)).toFixed(3) + ')';
          }
        });
        function end(e) {
          if (id === null || (e && e.pointerId !== id)) return;
          id = null;
          deck.removeAttribute('data-drag');
          view.removeAttribute('data-paused');
          var w = deck.getBoundingClientRect().width || 1;
          var far = Math.abs(dx) > Math.min(140, w / 3);
          top.style.transform = '';
          if (cards[cur.i + 1]) cards[cur.i + 1].style.transform = '';
          if (far && dx < 0) next();
          else if (far && dx > 0) prev();
          dx = 0;
        }
        deck.addEventListener('pointerup', end);
        deck.addEventListener('pointercancel', end);
        // a drag must not also fire the click that turns the page
        deck.addEventListener('click', function (e) { if (moved) { e.stopPropagation(); moved = 0; } }, true);
      }

      function trap(e) {
        var f = [].slice.call(view.querySelectorAll('button, a[href]')).filter(function (n) { return n.offsetParent !== null && n.tabIndex !== -1; });
        if (!f.length) return;
        var first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
      function wrap(i) { return (i + hubs.length) % hubs.length; }

      function card(r, i) {
        var el = document.createElement('article');
        el.className = 'sh-hubcard';
        el.innerHTML =
          '<span class="sh-hubcard__photo">' +
            (r.img ? '<img class="sh-hubcard__art" src="' + esc(r.img) + '" alt="" decoding="async">' : '') +
            '<span class="sh-hubcard__no">' + two(i + 1) + '</span>' +
            (r.credit ? '<span class="sh-hubcard__credit">' + esc(r.credit) + '</span>' : '') +
            '<button type="button" class="sh-hubview__tap sh-hubview__tap--prev" data-sh-hv-prev aria-label="الخبر السابق">' +
              '<i class="fa-solid fa-chevron-right" aria-hidden="true"></i></button>' +
            '<button type="button" class="sh-hubview__tap sh-hubview__tap--next" data-sh-hv-next aria-label="الخبر التالي">' +
              '<i class="fa-solid fa-chevron-left" aria-hidden="true"></i></button>' +
          '</span>' +
          '<span class="sh-hubcard__body">' +
            '<span class="sh-hubcard__line"><span class="sh-hubcard__cat">' + esc(r.c) + '</span>' +
            (r.time ? '<span class="sh-hubcard__time"><span>' + esc(r.time) + '</span></span>' : '') + '</span>' +
            '<h3 class="sh-hubcard__title">' + esc(r.t) + '</h3>' +
            '<a class="sh-hubcard__read" href="' + esc(r.href) + '">اقرأ الخبر كاملًا <span class="sh-mark"></span></a>' +
          '</span>';
        return el;
      }

      function open(hi, si, from) {
        if (!view) build();
        if (from) opener = from;
        var h = hubs[hi];
        cur.h = hi;
        els.name.textContent = h.name;
        els.segs.innerHTML = h.items.map(function () { return '<span class="sh-hubview__seg"></span>'; }).join('');
        els.deck.innerHTML = '';
        cards = h.items.map(function (r, i) { return card(r, i); });
        // painted back to front, so the first story ends up on top of the deck
        cards.slice().reverse().forEach(function (el) { els.deck.appendChild(el); });
        if (view.hidden) {
          view.hidden = false;
          view.removeAttribute('data-closing');
          document.documentElement.setAttribute('data-sh-hubview-open', '');
          els.close.focus();
        }
        cur.i = -1;
        show(si < 0 ? h.items.length - 1 : si);
      }

      function show(i) {
        var h = hubs[cur.h], r = h.items[i];
        if (!r) return;
        cur.i = i;
        cards.forEach(function (el, k) {
          var o = k - i;
          var state = o < 0 ? 'past' : o === 0 ? 'on' : o <= PEEK ? 'next' : 'deep';
          el.setAttribute('data-state', state);
          el.style.setProperty('--o', String(Math.min(o < 0 ? 0 : o, PEEK)));
          el.setAttribute('aria-hidden', String(o !== 0));
          el.style.zIndex = String(cards.length - Math.abs(o));
          [].slice.call(el.querySelectorAll('a, button')).forEach(function (n) { n.tabIndex = o === 0 ? 0 : -1; });
        });
        [].slice.call(els.segs.children).forEach(function (s, k) {
          s.className = 'sh-hubview__seg' + (k < i ? ' sh-hubview__seg--done' : k === i && !reduce ? ' sh-hubview__seg--on' : '');
        });
        els.pos.textContent = two(i + 1) + ' / ' + two(h.items.length);
        // what is coming: the next story, or -- at the end -- the next hub
        var nx = h.items[i + 1], last = !nx && hubs.length > 1;
        var nh = last ? hubs[wrap(cur.h + 1)] : null;
        els.nextbar.hidden = !nx && !last;
        els.nlabel.textContent = nx ? 'التالي' : 'المحور التالي';
        els.ntitle.textContent = nx ? nx.t : nh ? nh.name + ' · ' + count(nh.items.length) : '';
        els.ntime.textContent = nx ? (nx.time || '') : '';
      }
      function next() {
        var h = hubs[cur.h];
        if (cur.i + 1 < h.items.length) show(cur.i + 1);
        else if (hubs.length > 1) open(wrap(cur.h + 1), 0);
        else close();
      }
      function prev() {
        if (cur.i > 0) show(cur.i - 1);
        else if (hubs.length > 1) open(wrap(cur.h - 1), -1);
      }
      function close() {
        if (!view || view.hidden || closing) return;
        closing = 1;
        view.setAttribute('data-closing', '');
        setTimeout(function () {
          view.hidden = true;
          view.removeAttribute('data-closing');
          view.removeAttribute('data-paused');
          document.documentElement.removeAttribute('data-sh-hubview-open');
          els.segs.innerHTML = '';
          els.deck.innerHTML = '';
          cards = [];
          cur = { h: -1, i: -1 };
          closing = 0;
          if (opener && opener.focus) opener.focus();
        }, reduce ? 0 : 230);
      }
    });
  }

  /* 15. «ملفات خاصة» — the binders. [data-sh-binders] holds one
         [data-sh-binder] per file: its spine button ([data-sh-binder-open]),
         its 3D faces, and a hidden [data-sh-binder-inside] with the file's
         description, facts and documents. Opening a binder builds the opened
         view (sh-bo) from that content: sheet 1 is the file's card, the rest
         hold its documents four to a sheet; sheets turn over onto the cover
         the way they do on a lever arch. ---------------------------------- */
  function binders() {
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var PER = 4;                                       // documents per sheet
    function esc(t) { return String(t).replace(/[<>&"]/g, function (c) { return { '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' }[c]; }); }
    function two(n) { return (n < 10 ? '0' : '') + n; }
    function docsWord(n) { return n === 1 ? 'وثيقة واحدة' : n === 2 ? 'وثيقتان' : n <= 10 ? n + ' وثائق' : n + ' وثيقة'; }

    document.querySelectorAll('[data-sh-binders]').forEach(function (root) {
      var items = [].slice.call(root.querySelectorAll('[data-sh-binder]'));
      if (!items.length) return;

      var files = items.map(function (b) {
        var inside = b.querySelector('[data-sh-binder-inside]');
        var color = ([].slice.call(b.classList).filter(function (c) { return /^sh-binder--/.test(c); })[0]) || '';
        var stateEl = inside && inside.querySelector('[data-sh-binder-state]');
        return {
          el: b, spine: b.querySelector('[data-sh-binder-open]'), color: color,
          cover: b.getAttribute('data-sh-cover') || '', href: b.getAttribute('data-sh-href') || '',
          no: (b.querySelector('.sh-binder__no') || {}).textContent || '',
          title: (b.querySelector('.sh-binder__title') || {}).textContent || '',
          desc: inside && inside.querySelector('.sh-binder__desc') ? inside.querySelector('.sh-binder__desc').innerHTML : '',
          facts: inside && inside.querySelector('.sh-binder__facts') ? inside.querySelector('.sh-binder__facts').innerHTML : '',
          state: stateEl ? stateEl.getAttribute('data-sh-binder-state') : '',
          stateText: stateEl ? stateEl.textContent.trim() : '',
          docs: inside ? [].slice.call(inside.querySelectorAll('.sh-binder__docs a')).map(function (a) {
            var i = a.querySelector('i');
            return { href: a.getAttribute('href') || '#', type: a.getAttribute('data-type') || '', date: a.getAttribute('data-date') || '',
                     img: a.getAttribute('data-image') || '',
                     icon: i ? i.className : 'fa-solid fa-file-lines', t: a.textContent.replace(/\s+/g, ' ').trim() };
          }) : []
        };
      });

      var view = null, els = {}, cur = { f: -1, page: 0, sheets: [] }, opener = null, closing = 0, timer = 0;

      files.forEach(function (f, i) {
        if (!f.spine) return;
        f.spine.addEventListener('click', function (e) { e.preventDefault(); open(i, f.spine); });
      });

      function build() {
        view = document.createElement('div');
        view.className = 'sh-bo';
        view.setAttribute('role', 'dialog');
        view.setAttribute('aria-modal', 'true');
        view.setAttribute('aria-label', 'ملف خاص');
        view.hidden = true;
        view.innerHTML =
          '<div class="sh-bo__veil" data-sh-bo-close></div>' +
          '<div class="sh-bo__frame">' +
            '<div class="sh-bo__bar">' +
              '<span class="sh-bo__brand"><span class="sh-mark"></span>ملف خاص</span>' +
              '<span class="sh-bo__name" data-sh-bo-name></span>' +
              '<span class="sh-bo__count" data-sh-bo-count></span>' +
              '<button type="button" class="sh-bo__close" data-sh-bo-close aria-label="إغلاق">&times;</button>' +
            '</div>' +
            /* RTL grid: the first column is the right one. Cover first, so it
               lies right of the spine and swings open toward the right, the
               way an Arabic binder does; the pages take the left column. */
            '<div class="sh-bo__book" data-sh-bo-book data-closed>' +
              '<div class="sh-bo__cover">' +
                '<div class="sh-bo__face sh-bo__cover-in" data-sh-bo-coverin></div>' +
                '<div class="sh-bo__face sh-bo__cover-out">' +
                  '<span class="sh-binder__window" data-sh-bo-window></span>' +
                  '<span class="sh-binder__rivet sh-binder__rivet--1"></span><span class="sh-binder__rivet sh-binder__rivet--2"></span>' +
                '</div>' +
              '</div>' +
              '<div class="sh-bo__spine"><span class="sh-bo__arch"></span><span class="sh-bo__ring sh-bo__ring--1"></span><span class="sh-bo__ring sh-bo__ring--2"></span></div>' +
              '<div class="sh-bo__pages" data-sh-bo-pages></div>' +
            '</div>' +
            '<div class="sh-bo__foot">' +
              '<button type="button" class="sh-bo__turn" data-sh-bo-prev><i class="fa-solid fa-chevron-right" aria-hidden="true"></i>الورقة السابقة</button>' +
              '<span class="sh-bo__pos" data-sh-bo-pos></span>' +
              '<button type="button" class="sh-bo__turn" data-sh-bo-next>الورقة التالية<i class="fa-solid fa-chevron-left" aria-hidden="true"></i></button>' +
              '<a class="sh-more" href="files.html" data-sh-bo-all>افتح الملف كاملًا <span class="sh-more__arrow sh-more__arrow--16"></span></a>' +
            '</div>' +
          '</div>';
        document.body.appendChild(view);
        var q = function (s) { return view.querySelector(s); };
        els = { frame: q('.sh-bo__frame'), book: q('[data-sh-bo-book]'), pages: q('[data-sh-bo-pages]'), coverin: q('[data-sh-bo-coverin]'),
                win: q('[data-sh-bo-window]'), name: q('[data-sh-bo-name]'), count: q('[data-sh-bo-count]'), pos: q('[data-sh-bo-pos]'),
                prev: q('[data-sh-bo-prev]'), next: q('[data-sh-bo-next]'), close: q('.sh-bo__close'), all: q('[data-sh-bo-all]') };
        [].slice.call(view.querySelectorAll('[data-sh-bo-close]')).forEach(function (b) { b.addEventListener('click', close); });
        els.next.addEventListener('click', function () { turn(cur.page + 1); });
        els.prev.addEventListener('click', function () { turn(cur.page - 1); });
        // a sheet turns when you click it, too -- forward on the left pile, back on the right
        els.pages.addEventListener('click', function (e) {
          if (e.target.closest('a, button')) return;
          var sheet = e.target.closest('.sh-bo__sheet');
          if (!sheet) return;
          var k = +sheet.getAttribute('data-k');
          if (sheet.hasAttribute('data-turned')) turn(k); else turn(k + 1);
        });
        document.addEventListener('keydown', function (e) {
          if (view.hidden) return;
          if (e.key === 'Escape') { e.preventDefault(); close(); }
          else if (e.key === 'ArrowLeft') { e.preventDefault(); turn(cur.page + 1); }   // RTL: forward is leftward
          else if (e.key === 'ArrowRight') { e.preventDefault(); turn(cur.page - 1); }
          else if (e.key === 'Tab') trap(e);
        });
      }
      function trap(e) {
        var f = [].slice.call(view.querySelectorAll('button, a[href]')).filter(function (n) { return n.offsetParent !== null && !n.disabled && n.tabIndex !== -1; });
        if (!f.length) return;
        var first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }

      function sheet(k, n, inner, f) {
        return '<div class="sh-bo__sheet" data-k="' + k + '" style="--k:' + k + '">' +
          '<div class="sh-bo__sheet-front">' +
            '<div class="sh-bo__sheet-head"><b>ملف ' + esc(f.no) + ' — ' + esc(f.title) + '</b><span>' + two(k + 1) + ' / ' + two(n) + '</span></div>' +
            inner +
          '</div>' +
          '<div class="sh-bo__sheet-back"><span>' + two(k + 1) + ' / ' + two(n) + '</span></div>' +
        '</div>';
      }

      function open(i, from) {
        if (!view) build();
        if (from) opener = from;
        var f = files[i];
        cur.f = i;
        // colours ride on the same modifier class the shelf binder carries
        els.book.className = 'sh-bo__book ' + f.color;
        els.book.setAttribute('data-closed', '');
        els.name.textContent = f.title;
        els.count.textContent = docsWord(f.docs.length);
        els.win.textContent = 'ملف خاص · ' + f.no;
        // a file that has its own page on the site opens there, in a new tab
        els.all.setAttribute('href', f.href || 'files.html');
        if (f.href) { els.all.setAttribute('target', '_blank'); els.all.setAttribute('rel', 'noopener'); }
        else { els.all.removeAttribute('target'); els.all.removeAttribute('rel'); }
        els.coverin.innerHTML =
          '<span class="sh-bo__watermark"><span class="sh-mark"></span>شهاب · ملفات خاصة</span>' +
          (f.stateText ? '<span class="sh-bo__stamp' + (f.state === 'live' ? ' sh-bo__stamp--live' : '') + '">' + esc(f.stateText) + '</span>' : '') +
          '<div class="sh-bo__pocket"><div class="sh-bo__slip"><span class="sh-mark"></span>' +
            '<span class="sh-bo__slip-no">' + esc(f.no) + '</span>' +
            '<span class="sh-bo__slip-name">' + esc(f.title) + '</span>' +
            '<span class="sh-bo__slip-meta">' + docsWord(f.docs.length) + '</span>' +
          '</div></div>';
        // sheets: the card, then the documents
        var n = 1 + Math.ceil(f.docs.length / PER), html = '';
        html += sheet(0, n, '<div class="sh-bo__card">' +
          '<span class="sh-bo__card-no">' + esc(f.no) + '</span>' +
          '<h3 class="sh-bo__card-title">' + esc(f.title) + '</h3>' +
          '<p class="sh-bo__card-desc">' + f.desc + '</p>' +
          '<dl class="sh-bo__facts">' + f.facts + '</dl>' +
          '<div class="sh-bo__card-foot"><span>' + docsWord(f.docs.length) + ' في هذا الملف</span></div>' +
          (f.cover ? '<span class="sh-bo__card-photo"><img src="' + esc(f.cover) + '" alt="" decoding="async"></span>' : '') +
        '</div>', f);
        for (var p = 0; p < n - 1; p++) {
          var chunk = f.docs.slice(p * PER, p * PER + PER);
          html += sheet(p + 1, n,
            '<ol class="sh-bo__docs">' + chunk.map(function (d, j) {
              return '<li class="sh-bo__doc' + (d.img ? '' : ' sh-bo__doc--noimg') + '"><i class="' + esc(d.icon) + '" aria-hidden="true"></i>' +
                (d.img ? '<img class="sh-bo__doc-thumb" src="' + esc(d.img) + '" alt="" loading="lazy" decoding="async">' : '') + '<span>' +
                '<a href="' + esc(d.href) + '">' + esc(d.t) + '</a>' +
                '<span class="sh-bo__doc-meta">' + (d.type ? '<b>' + esc(d.type) + '</b>' : '') + (d.date ? '<span>' + esc(d.date) + '</span>' : '') + '</span>' +
              '</span></li>';
            }).join('') + '</ol>' +
            '<div class="sh-bo__sheet-foot"><span>' + esc(f.no) + '</span><span>' + two(p + 1) + ' / ' + two(n - 1) + '</span></div>', f);
        }
        els.pages.innerHTML = html;
        cur.sheets = [].slice.call(els.pages.children);
        // painted last-to-first so the first sheet sits on top of the pile
        cur.sheets.slice().reverse().forEach(function (s) { els.pages.appendChild(s); });
        cur.page = 0;
        setPage(0);
        f.spine.setAttribute('aria-expanded', 'true');

        // off the shelf and into the middle: the frame starts where the spine is
        view.hidden = false;
        view.removeAttribute('data-closing');
        document.documentElement.setAttribute('data-sh-bo-open', '');
        if (!reduce && from) {
          var a = from.getBoundingClientRect(), b = els.frame.getBoundingClientRect();
          var sx = Math.max(.12, a.width / b.width), sy = Math.max(.12, a.height / b.height);
          var s = Math.min(sx, sy);
          var dx = (a.left + a.width / 2) - (b.left + b.width / 2), dy = (a.top + a.height / 2) - (b.top + b.height / 2);
          els.frame.style.transition = 'none';
          els.frame.style.transform = 'translate(' + dx + 'px,' + dy + 'px) scale(' + s.toFixed(3) + ')';
          els.frame.style.opacity = '0';
          void els.frame.offsetWidth;
          els.frame.style.transition = '';
          els.frame.style.transform = '';
          els.frame.style.opacity = '';
        }
        els.close.focus();
        clearTimeout(timer);
        // the cover swings open once the binder has landed
        timer = setTimeout(function () { els.book.removeAttribute('data-closed'); }, reduce ? 0 : 420);
      }

      function setPage(p) {
        var n = cur.sheets.length;
        cur.page = p;
        cur.sheets.forEach(function (s, k) {
          if (k < p) s.setAttribute('data-turned', ''); else s.removeAttribute('data-turned');
          if (k === p) s.setAttribute('data-current', ''); else s.removeAttribute('data-current');
          s.setAttribute('aria-hidden', String(k !== p));
          s.style.zIndex = String(k < p ? k + 1 : n - k + n);   // turned sheets pile up on the right, later ones on top
          [].slice.call(s.querySelectorAll('a')).forEach(function (a) { a.tabIndex = k === p ? 0 : -1; });
        });
        els.pos.innerHTML = 'الورقة <span>' + two(p + 1) + '</span> من <span>' + two(n) + '</span>';
        els.prev.disabled = p === 0;
        els.next.disabled = p >= n - 1;
      }
      function turn(p) {
        if (p < 0 || p >= cur.sheets.length || p === cur.page) return;
        setPage(p);
      }
      function close() {
        if (!view || view.hidden || closing) return;
        closing = 1;
        clearTimeout(timer);
        els.book.setAttribute('data-closed', '');          // the cover shuts first
        setTimeout(function () {
          view.setAttribute('data-closing', '');
          setTimeout(function () {
            view.hidden = true;
            view.removeAttribute('data-closing');
            document.documentElement.removeAttribute('data-sh-bo-open');
            els.pages.innerHTML = '';
            cur = { f: -1, page: 0, sheets: [] };
            files.forEach(function (f) { if (f.spine) f.spine.setAttribute('aria-expanded', 'false'); });
            closing = 0;
            if (opener && opener.focus) opener.focus();
          }, reduce ? 0 : 260);
        }, reduce ? 0 : 520);
      }
    });
  }

  function init() {
    paintDate(); ticker(); tabs(); galleries(); menus(); hero();
    lightbox(); player(); loadMore(); pager(); files(); filters(); hubs(); binders(); transition();
    setInterval(paintDate, 60000);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
