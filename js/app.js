/* Shehab News — front-end behaviours for the static build.
   The markup is a rendered snapshot; this file re-attaches the live bits. */
(function () {
  'use strict';

  /* Loader veil markup — generated from partials/loader-veil.html, which is
     itself cut verbatim from loader.html. Kept inline so the transition works
     from file:// too, where fetch() of a sibling file is blocked. */
  var LOADER_VEIL = "<div class=\"sh-anim\" style=\"position:absolute;inset:0;background:#0a1a33;display:flex;align-items:center;justify-content:center;animation:none\">\n      <span style=\"position:absolute;top:0;bottom:0;right:22%;width:1px;background:rgba(126,168,221,.1)\"></span>\n      <span style=\"position:absolute;top:0;bottom:0;left:22%;width:1px;background:rgba(126,168,221,.1)\"></span>\n      <span style=\"position:absolute;top:-170px;left:-130px;width:480px;height:480px;border:1px solid rgba(126,168,221,.1);border-radius:50%;pointer-events:none\"></span>\n\n      <div style=\"position:relative;display:flex;flex-direction:column;align-items:center;gap:22px;animation:none\">\n        <!-- 01 seed diamond (center) → hands over to the nib -->\n        <span class=\"sh-hide-static\" style=\"position:absolute;top:calc(50% - 40px);width:12px;height:12px;background:#1b5aa6;opacity:0;animation:sh-seed .42s cubic-bezier(.2,.7,.2,1) forwards, sh-fade .28s .5s reverse forwards\"></span>\n\n        <!-- 02–03 the mark draws itself along its own calligraphic stroke -->\n        <span style=\"position:relative;width:300px;aspect-ratio:583/377\">\n          <svg viewBox=\"0 0 583 377\" style=\"position:absolute;inset:0;width:100%;height:100%;overflow:visible\">\n            <defs>\n              <mask id=\"mFinal\" maskUnits=\"userSpaceOnUse\" x=\"-60\" y=\"-60\" width=\"703\" height=\"497\">\n                <path class=\"sh-static\" pathLength=\"1000\" d=\"M 505 28 C 530 60, 470 88, 452 118 C 432 150, 470 170, 440 205 C 405 245, 360 225, 335 195 C 305 160, 300 110, 275 100 C 268 170, 282 250, 300 320 C 330 342, 360 300, 330 268 C 280 215, 190 280, 120 300 C 55 315, 20 270, 22 200 C 25 120, 90 55, 170 42 C 205 38, 235 45, 262 60\" fill=\"none\" stroke=\"#fff\" stroke-width=\"118\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-dasharray=\"1000\" stroke-dashoffset=\"1000\" style=\"animation:sh-draw 1.35s cubic-bezier(.45,0,.2,1) .4s forwards\"></path>\n                <rect class=\"sh-static\" x=\"-60\" y=\"-60\" width=\"703\" height=\"497\" fill=\"#fff\" opacity=\"0\" style=\"animation:sh-fade .35s ease 1.55s forwards\"></rect>\n              </mask>\n            </defs>\n            <image href=\"assets/images/logo-white.png\" width=\"583\" height=\"377\" mask=\"url(#mFinal)\"></image>\n          </svg>\n          <span class=\"sh-hide-static\" style=\"position:absolute;top:0;left:0;width:15px;height:15px;background:#1b5aa6;transform:rotate(45deg);offset-path:path('M 259.9 14.4 C 272.7 30.9, 241.9 45.3, 232.6 60.7 C 222.3 77.2, 241.9 87.5, 226.4 105.5 C 208.4 126.1, 185.2 115.8, 172.4 100.3 C 156.9 82.3, 154.4 56.6, 141.5 51.5 C 137.9 87.5, 145.1 128.6, 154.4 164.7 C 169.8 176.0, 185.2 154.4, 169.8 137.9 C 144.1 110.6, 97.8 144.1, 61.7 154.4 C 28.3 162.1, 10.3 138.9, 11.3 102.9 C 12.9 61.7, 46.3 28.3, 87.5 21.6 C 105.5 19.6, 120.9 23.2, 134.8 30.9');offset-rotate:0deg;opacity:0;animation:sh-nib-travel 1.35s cubic-bezier(.45,0,.2,1) .4s forwards\"></span>\n          <!-- 06 one light sweep once the mark is complete -->\n          <span class=\"sh-hide-static\" style=\"position:absolute;top:-10%;bottom:-10%;left:0;width:14%;background:#fff;opacity:0;mix-blend-mode:overlay;animation:sh-sweep .9s cubic-bezier(.45,0,.2,1) 1.9s forwards\"></span>\n        </span>\n\n        <!-- 04–05 wordline rises, softer tagline fades -->\n        <span style=\"display:flex;flex-direction:column;align-items:center;gap:8px\">\n          <span class=\"sh-static\" style=\"display:flex;align-items:center;gap:10px;font-family:'Almarai',sans-serif;font-size:12px;font-weight:800;letter-spacing:.22em;color:#fff;opacity:0;animation:sh-rise .55s cubic-bezier(.2,.7,.2,1) 1.75s forwards\"><span style=\"width:16px;height:1px;background:#1b5aa6\"></span>وكالة شهاب للأنباء<span style=\"width:16px;height:1px;background:#1b5aa6\"></span></span>\n          <span class=\"sh-static\" style=\"font-family:'Noto Naskh Arabic',serif;font-size:12.5px;color:#7ea8dd;opacity:0;animation:sh-fade .8s ease 2.15s forwards\">نرصد اللحظة ونحفظ أثرها</span>\n        </span>\n\n        <!-- 07 loading indicator: three diamonds — the only element that loops -->\n        <span class=\"sh-hide-static\" style=\"display:flex;align-items:center;gap:9px;margin-top:6px;opacity:0;animation:sh-fade .5s ease 2.5s forwards\">\n          <span style=\"width:7px;height:7px;background:#1b5aa6;animation:sh-dots 1.1s ease-in-out infinite\"></span>\n          <span style=\"width:7px;height:7px;background:#1b5aa6;animation:sh-dots 1.1s ease-in-out infinite .18s\"></span>\n          <span style=\"width:7px;height:7px;background:#1b5aa6;animation:sh-dots 1.1s ease-in-out infinite .36s\"></span>\n        </span>\n      </div>\n      <!-- exit: the diamond leaves first -->\n      <span style=\"position:absolute;bottom:18%;width:10px;height:10px;background:#1b5aa6;transform:rotate(45deg);opacity:0;animation:none\"></span>\n    </div>";

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
      var STYLE_ON = on.getAttribute('style');
      var STYLE_OFF = off ? off.getAttribute('style') : STYLE_ON;

      // The panels carry an inline display (grid), which beats the [hidden]
      // attribute's UA display:none — so visibility has to be driven through
      // that same inline display. The markup ships the inactive panels with
      // display:none already, so read the live value off the visible one.
      var live = panels.filter(function (p) { return !p.hidden; })[0] || panels[0];
      var DISPLAY = live.style.display && live.style.display !== 'none' ? live.style.display : '';

      function select(btn) {
        var val = btn.getAttribute('data-sh-tab');
        btns.forEach(function (b) {
          var active = b === btn;
          b.setAttribute('aria-selected', String(active));
          b.setAttribute('style', active ? STYLE_ON : STYLE_OFF);
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
      panels.forEach(function (p, i) { if (p.style.flexGrow === '1') open = i; });
      var closed = open === 0 ? 1 : 0;

      var snap = function (p) {
        return [].slice.call(p.children).map(function (c) {
          return { opacity: c.style.opacity, transform: c.style.transform };
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
      if (!box || box.style.display === 'none') return;
      if (e.key === 'Escape') { e.preventDefault(); close(); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); go(idx + 1); }   // RTL: left = forward
      else if (e.key === 'ArrowRight') { e.preventDefault(); go(idx - 1); }
      else if (e.key === 'Tab') {                                            // keep focus inside
        var f = [closeEl, prevEl, nextEl].concat(storyEl.style.display !== 'none' ? [storyEl] : []);
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
      var shown = pages.filter(function (p) { return p.style.display !== 'none'; })[0] || pages[0];
      var DISPLAY = shown.style.display && shown.style.display !== 'none' ? shown.style.display : '';

      var nums = [].slice.call(nav.querySelectorAll('[data-sh-goto]'));
      var prev = nav.querySelector('[data-sh-prev-page]');
      var next = nav.querySelector('[data-sh-next-page]');

      // read the three states the design already ships
      var ON = nums[0].getAttribute('style');
      var OFF = (nums[1] || nums[0]).getAttribute('style');
      var DEAD = OFF.replace('color:#4a5568', 'color:#c3cbd7') + ';cursor:default';
      var LINK_ON = next ? next.getAttribute('style') : '';
      var LINK_OFF = prev ? prev.getAttribute('style') : '';

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
          a.setAttribute('style', v === page ? ON : (real ? OFF : DEAD));
          a.setAttribute('aria-current', v === page ? 'page' : 'false');
          if (!real) a.setAttribute('aria-disabled', 'true');
        });
        var i = available.indexOf(page);
        if (prev) {
          var canPrev = i > 0;
          prev.setAttribute('style', canPrev ? LINK_ON.replace('#1b5aa6', '#1b5aa6') : LINK_OFF);
          prev.setAttribute('aria-disabled', String(!canPrev));
        }
        if (next) {
          var canNext = i < available.length - 1;
          next.setAttribute('style', canNext ? LINK_ON : LINK_OFF);
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
      var spines = [].slice.call(shelf.querySelectorAll('[data-sh-file]'));
      if (spines.length < 2) return;
      var keys = spines.map(function (s) { return s.getAttribute('data-sh-file'); });

      // the open and closed spine colours, read off the markup as shipped
      var read = function (el, prop) { return el.style[prop]; };
      var OPEN_BG = read(spines[0], 'background') || '#1b5aa6';
      var SHUT_BG = read(spines[1], 'background') || '#0f2a4f';
      var current = null;

      function partsOf(k) {
        return [].slice.call(shelf.querySelectorAll('[data-sh-file-part="' + k + '"]'));
      }

      function replay(el) {
        var anim = [el].concat([].slice.call(el.querySelectorAll('*')))
          .filter(function (n) { return n.style && n.style.animation; });
        anim.forEach(function (n) { n.__anim = n.style.animation; n.style.animation = 'none'; });
        void el.offsetWidth;
        anim.forEach(function (n) { n.style.animation = n.__anim; });
      }

      function open(k, animate) {
        if (k === current || keys.indexOf(k) === -1) return;
        current = k;
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
            if (o.__op === undefined) o.__op = o.style.opacity || '1';
            o.style.transition = 'opacity .2s ease';
            o.style.opacity = on ? '0' : o.__op;
          });
        });
        keys.forEach(function (key) {
          partsOf(key).forEach(function (p) {
            p.style.display = key === k ? '' : 'none';
            p.setAttribute('aria-hidden', String(key !== k));
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
      var STYLE_ON = on.getAttribute('style');
      var STYLE_OFF = off ? off.getAttribute('style') : STYLE_ON;

      items.forEach(function (it) {
        it.__display = it.style.display || '';
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
          a.setAttribute('style', active ? STYLE_ON : STYLE_OFF);
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

  function init() {
    paintDate(); ticker(); tabs(); galleries(); menus(); hero();
    lightbox(); player(); loadMore(); pager(); files(); filters(); transition();
    setInterval(paintDate, 60000);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
