/* شهاب — موجز اليوم.

   The masthead's «موجز اليوم» button starts a briefing that reads the day's
   items aloud with the browser's own speech engine. No backend, no API key, no
   network call: it works from file:// and survives the port to Blade.

   IT TRAVELS WITH THE READER. A browser cancels speech on every navigation and
   throws away the page's JS, so a player that lives only in one document dies
   at the first link. This one keeps its state in sessionStorage and rebuilds
   itself on the next page, which is why the surface that persists is a docked
   companion bar rather than a modal.

   Resume is sentence-level, not item-level. Each item's spoken copy is split
   into sentences and the index of the one in progress is part of the saved
   state, so crossing a page boundary re-reads at most the current sentence
   instead of starting the item again.

   TWO MODES. Arabic text-to-speech is not installed everywhere (Windows needs
   the Arabic language pack; some Chrome builds ship no Arabic voice at all), so
   the brief never depends on it:

     voiced      an ar-* voice exists -> speechSynthesis reads each sentence.
     read-along  no ar-* voice        -> the brief still advances, timed from
                 the word count at a news-reading pace, and says so plainly
                 rather than pretending to speak.

   CONTENT. The edition below is the fallback. Any page may override it with a
   JSON payload on [data-sh-brief], the same pattern the ticker already uses for
   data-items, which is where a CMS will inject the real brief:

     <span data-sh-brief='{"edition":"...","items":[...]}' hidden></span>

   Each item carries `t`, the headline as displayed, and `say`, the copy as
   spoken. They are written differently on purpose: a headline is built to be
   scanned, a briefing line to be heard. */
(function () {
  'use strict';

  /* ---------------------------------------------------------------- data -- */
  var EDITION = {
    edition: 'نشرة 3 سبتمبر',
    items: [
      { c: 'الضفة', time: '10:32 م', href: 'article.html',
        t: 'قوات الاحتلال تقتحم بلدة دير الغصون شمال طولكرم',
        say: 'نبدأ من الضفة الغربية. اقتحمت قوات الاحتلال بلدة دير الغصون شمال طولكرم، وسط انتشار واسع في محيط البلدة.' },
      { c: 'غزة', time: '10:13 م', href: 'article.html',
        t: 'إطلاق نار من طائرة مُسيّرة في السطر الغربي ومحيط مدرسة الأقصى بخانيونس',
        say: 'وفي غزة، أفاد مراسل شهاب بإطلاق نار من طائرة مسيرة في منطقة السطر الغربي. وامتد إطلاق النار إلى محيط مدرسة الأقصى شمال غربي خانيونس.' },
      { c: 'غزة', time: '08:51 م', href: 'article.html',
        t: 'أربعة شهداء وإصابات بقصف الاحتلال في جباليا شمال القطاع',
        say: 'وارتقى أربعة شهداء وأصيب آخرون في قصف للاحتلال استهدف جباليا شمال قطاع غزة.' },
      { c: 'القدس', time: '09:05 م', href: 'article.html',
        t: 'قنابل الغاز في شارع المعهد بمحيط مخيم قلنديا شمال القدس',
        say: 'وفي القدس المحتلة، أطلقت قوات الاحتلال قنابل الغاز خلال اقتحام شارع المعهد في محيط مخيم قلنديا.' },
      { c: 'فلسطين', time: '09:56 م', href: 'article.html',
        t: 'الأوقاف: الاحتلال يدمر ثلاثة مساجد في يومين ليصل العدد إلى 1244 مسجدًا',
        say: 'وقالت وزارة الأوقاف إن الاحتلال دمر ثلاثة مساجد خلال يومين. وبذلك يرتفع العدد إلى ألف ومئتين وأربعة وأربعين مسجدًا في غزة.' },
      { c: 'إسرائيلي', time: '09:31 م', href: 'article.html',
        t: 'قناة عبرية: وفد أمريكي يوبخ مسؤولًا إسرائيليًا بسبب عنف المستوطنين',
        say: 'وعلى الصعيد الإسرائيلي، ذكرت قناة عبرية أن وفدًا أمريكيًا وبّخ مسؤولًا إسرائيليًا بسبب تصاعد عنف المستوطنين في الضفة.' },
      { c: 'دولي', time: '09:07 م', href: 'article.html',
        t: 'نائب وزير خارجية إيران: لدينا أساليبنا لمواجهة أي سيناريو أمريكي',
        say: 'وختامًا، قال نائب وزير الخارجية الإيراني إن بلاده تملك أساليبها لمواجهة أي سيناريو أمريكي، بما في ذلك التصعيد والعقوبات.' }
    ]
  };

  var KEY = 'sh-brief-state';
  var RATES = [1, 1.15, 1.3, 0.85];
  var WORD_MS = 375;          // read-along pace per word at rate 1
  /* The theme sets every numeral in Latin digits -- "03 / 01", "10:32 م",
     "1244 مسجدًا" -- so the player does too. Arabic-Indic numerals here would
     read as a different product. */
  function pad2(n) {
    n = String(n);
    return n.length < 2 ? '0' + n : n;
  }
  function clock(ms) {
    var s = Math.round(ms / 1000);
    return pad2(Math.floor(s / 60)) + ':' + pad2(s % 60);
  }

  /* --------------------------------------------------------------- setup -- */
  var btn = document.querySelector('a[href="newsletter.html"]');
  var hasBtn = btn && /موجز/.test(btn.textContent);
  if (!document.body) return;

  var data = EDITION;
  var src = document.querySelector('[data-sh-brief]');
  if (src) {
    try {
      var p = JSON.parse(src.getAttribute('data-sh-brief'));
      if (p && p.items && p.items.length) data = p;
    } catch (e) { /* malformed payload: keep the built-in edition */ }
  }
  var items, TOTAL_MS, EID;
  function prepare(d) {
    // sentences are the resume unit, so split once up front
    d.items.forEach(function (it) {
      var txt = (it.say || it.t).trim();
      it.parts = txt.split(/(?<=[.!؟])\s+/).filter(Boolean);
      if (!it.parts.length) it.parts = [txt];
      it.words = txt.trim().split(/\s+/).length;
    });
    data = d; items = d.items;
    TOTAL_MS = items.reduce(function (a, it) { return a + it.words * WORD_MS; }, 0);
    EID = d.id || ('edition:' + (d.edition || ''));
  }
  prepare(data);

  var synth = window.speechSynthesis || null;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* --------------------------------------------------------------- state -- */
  var st = { on: false, i: 0, s: 0, playing: false, rate: 0, mode: 'bar' };
  try {
    var saved = JSON.parse(sessionStorage.getItem(KEY) || 'null');
    if (saved && saved.n === items.length && (!saved.eid || saved.eid === EID)) {   // a topic thread is page-local
      st.on = !!saved.on; st.i = saved.i | 0; st.s = saved.s | 0;
      st.playing = !!saved.playing; st.rate = saved.rate | 0;
      st.mode = saved.mode === 'panel' ? 'panel' : 'bar';
    }
  } catch (e) { /* private mode */ }
  if (st.i < 0 || st.i >= items.length) st.i = 0;

  function save() {
    try {
      sessionStorage.setItem(KEY, JSON.stringify({
        n: items.length, on: st.on, i: st.i, s: st.s, eid: EID,
        playing: st.playing, rate: st.rate, mode: st.mode
      }));
    } catch (e) {}
  }
  function forget() { try { sessionStorage.removeItem(KEY); } catch (e) {} }

  /* -------------------------------------------------------------- markup -- */
  var SVG = {
    play:  '<path d="M3 1.6l11 6.4-11 6.4z"/>',
    pause: '<path d="M3 1.8h3.6v12.4H3zM9.4 1.8H13v12.4H9.4z"/>',
    prev:  '<path d="M3 2h2.2v5L13 2v12L5.2 9v5H3z"/>',
    next:  '<path d="M13 2h-2.2v5L3 2v12l7.8-5v5H13z"/>',
    up:    '<path d="M8 2.6l6 6-1.5 1.5L8 5.6 3.5 10.1 2 8.6z"/>',
    down:  '<path d="M8 13.4l-6-6L3.5 5.9 8 10.4l4.5-4.5L14 7.4z"/>',
    x:     '<path d="M2 2l12 12M14 2L2 14" stroke="currentColor" stroke-width="1.7" fill="none"/>'
  };
  function b(cls, key, icon, label) {
    return '<button type="button" class="' + cls + '" data-bf-' + key +
           ' aria-label="' + label + '"><svg viewBox="0 0 16 16">' + icon + '</svg></button>';
  }

  var root = document.createElement('div');
  root.setAttribute('data-bf', '');
  root.hidden = true;
  root.innerHTML =
    '<div class="bf-scrim" data-bf-scrim></div>' +

    '<div class="bf-bar">' +
      '<span class="bf-rail"><span class="bf-rail-on" data-bf-rail></span>' +
        '<span class="sh-mark bf-rail-nib" data-bf-railnib></span></span>' +
      '<span class="bf-id"><span class="sh-mark"></span>' +
        '<span class="bf-num" data-bf-barnum></span></span>' +
      '<span class="bf-now">' +
        '<span class="bf-now-cat" data-bf-barcat></span>' +
        '<span class="bf-now-t" data-bf-bart></span>' +
      '</span>' +
      '<span class="bf-bar-ctl">' +
        b('bf-b bf-b-sm', 'play2', SVG.play, 'تشغيل') +
        b('bf-b bf-b-sm', 'next2', SVG.next, 'المادة التالية') +
        b('bf-b bf-b-sm', 'open', SVG.up, 'توسيع الموجز') +
        b('bf-b bf-b-sm', 'end', SVG.x, 'إنهاء الموجز') +
      '</span>' +
    '</div>' +

    '<div class="bf-panel" role="dialog" aria-modal="true" aria-label="موجز شهاب">' +
      '<span class="bf-rule bf-rule-a"></span><span class="bf-rule bf-rule-b"></span>' +

      '<div class="bf-head">' +
        '<span class="sh-mark"></span>' +
        '<span class="bf-wordmark">موجز شهاب</span>' +
        '<span class="bf-meta">' +
          '<span class="bf-live" data-bf-mode><i></i><span data-bf-modet></span></span>' +
          '<s></s><span data-bf-edition></span>' +
          '<s></s><span data-bf-len></span>' +
        '</span>' +
      '</div>' +

      '<div class="bf-stage">' +
        '<span class="bf-figure" data-bf-fig></span>' +
        '<span class="bf-kind"><span data-bf-cat></span><u data-bf-time></u></span>' +
        '<h2 class="bf-line" data-bf-line aria-live="polite"></h2>' +
        '<p class="bf-say" data-bf-say></p>' +
      '</div>' +

      '<ol class="bf-index" data-bf-index>' +
        '<span class="bf-spine"><span class="sh-mark bf-spine-nib" data-bf-spinenib></span></span>' +
      '</ol>' +

      '<div class="bf-foot">' +
        b('bf-b', 'prev', SVG.prev, 'المادة السابقة') +
        b('bf-b bf-b-go', 'play', SVG.play, 'تشغيل الموجز') +
        b('bf-b', 'next', SVG.next, 'المادة التالية') +
        '<button type="button" class="bf-rate" data-bf-rate aria-label="سرعة القراءة">×1</button>' +
        '<span class="bf-count" data-bf-count></span>' +
        b('bf-b', 'close', SVG.down, 'تصغير إلى الشريط') +
      '</div>' +

      '<p class="bf-note" data-bf-note></p>' +
    '</div>';
  document.body.appendChild(root);

  var $ = function (k) { return root.querySelector('[data-bf-' + k + ']'); };
  var elIndex = $('index'), elSpineNib = $('spinenib');

  var rows = [];
  function buildRows() {
    [].slice.call(elIndex.querySelectorAll('li')).forEach(function (li) { li.remove(); });
    rows = items.map(function (it, i) {
      var li = document.createElement('li');
      var bt = document.createElement('button');
      bt.type = 'button';
      bt.innerHTML = '<i></i><span></span><em></em>';
      bt.children[0].textContent = pad2(i + 1);
      bt.children[1].textContent = it.t;
      bt.children[2].textContent = it.time || '';
      bt.addEventListener('click', function () { go(i, true); });
      li.appendChild(bt);
      elIndex.appendChild(li);
      return bt;
    });
    $('edition').textContent = data.edition || '';
    $('len').textContent = items.length + ' مواد · ' + clock(TOTAL_MS);
  }
  buildRows();

  /* A page component (the topic threads under «المزيد من الأخبار») can hand
     the player a different edition at runtime and start it. */
  function setEdition(d) {
    if (!d || !d.items || !d.items.length) return;
    clearAll();
    prepare(d);
    st.i = 0; st.s = 0; st.playing = false;
    buildRows();
  }
  document.addEventListener('sh-brief:play', function (e) {
    setEdition(e.detail);
    dock(true); mode('panel'); play();
  });

  /* ---------------------------------------------------------------- voice -- */
  var voice = null;

  function pickVoice() {
    if (!synth) return null;
    var ar = (synth.getVoices() || []).filter(function (v) { return /^ar/i.test(v.lang); });
    if (!ar.length) return null;
    return ar.sort(function (a, b2) {
      var sc = function (v) { return (v.localService ? 2 : 0) + (/ar-EG|ar-SA|ar-001/i.test(v.lang) ? 1 : 0); };
      return sc(b2) - sc(a);
    })[0];
  }
  function refreshVoice() {
    voice = pickVoice();
    if (voice) {
      $('modet').textContent = 'صوت آلي';
      $('note').innerHTML = 'يُقرأ آليًا بصوت <b>' + voice.name.replace(/[<>&]/g, '') +
        '</b> من محرك النطق في متصفحك؛ لا يُرسَل أي نص إلى خادم خارجي. ' +
        'الموجز يكمل معك أثناء التنقل بين الصفحات.';
    } else {
      $('modet').textContent = 'وضع القراءة';
      $('note').innerHTML = 'لا يوجد <b>صوت عربي</b> مثبَّت في هذا المتصفح، فيعمل الموجز ' +
        'بوضع القراءة ويتقدّم بإيقاع نشرة إخبارية. لتشغيل الصوت ثبِّت حزمة اللغة ' +
        'العربية في نظامك. الموجز يكمل معك أثناء التنقل بين الصفحات.';
    }
  }
  if (synth) {
    refreshVoice();
    if (typeof synth.onvoiceschanged !== 'undefined') synth.addEventListener('voiceschanged', refreshVoice);
    setTimeout(refreshVoice, 900);
  } else {
    $('modet').textContent = 'وضع القراءة';
    $('note').textContent = 'متصفحك لا يدعم النطق الآلي، فيعمل الموجز بوضع القراءة.';
  }

  /* ------------------------------------------------------------- playback -- */
  var utter = null, timer = null, tick = null, started = 0, spanMs = 0, sawWord = false;

  function partMs(i, s) {
    var n = items[i].parts[s].trim().split(/\s+/).length;
    return Math.max(1400, n * WORD_MS) / RATES[st.rate];
  }
  function elapsedBefore(i, s) {
    var ms = 0, k;
    for (k = 0; k < i; k++) ms += items[k].words * WORD_MS;
    for (k = 0; k < s; k++) ms += items[i].parts[k].trim().split(/\s+/).length * WORD_MS;
    return ms;
  }

  function setIcon(on) {
    var m = on ? SVG.pause : SVG.play;
    $('play').querySelector('svg').innerHTML = m;
    $('play2').querySelector('svg').innerHTML = m;
    var lab = on ? 'إيقاف مؤقت' : 'تشغيل الموجز';
    $('play').setAttribute('aria-label', lab);
    $('play2').setAttribute('aria-label', lab);
  }

  function progress(frac) {
    var whole = (elapsedBefore(st.i, st.s) + frac * items[st.i].parts[st.s].trim().split(/\s+/).length * WORD_MS) / TOTAL_MS;
    whole = Math.max(0, Math.min(1, whole));
    var pct = (whole * 100).toFixed(2) + '%';
    $('rail').style.width = pct;
    $('railnib').style.insetInlineStart = pct;
  }

  function paint() {
    var it = items[st.i];
    $('fig').textContent = pad2(st.i + 1);
    $('cat').textContent = it.c || '';
    $('time').textContent = it.time || '';
    $('line').textContent = it.t;
    $('barcat').textContent = (it.c || '') + (it.time ? ' · ' + it.time : '');
    $('bart').textContent = it.t;
    $('barnum').textContent = pad2(st.i + 1) + ' / ' + pad2(items.length);
    $('count').textContent = pad2(st.i + 1) + ' / ' + pad2(items.length);
    $('rate').textContent = '×' + RATES[st.rate];

    // the sentence in progress is lifted out of the dimmed paragraph
    $('say').innerHTML = it.parts.map(function (p, k) {
      var esc = p.replace(/[<>&]/g, function (c) { return { '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c]; });
      return k === st.s ? '<b>' + esc + '</b>' : esc;
    }).join(' ');

    rows.forEach(function (r, i) {
      r.toggleAttribute('data-now', i === st.i);
      r.toggleAttribute('data-done', i < st.i);
    });
    $('prev').disabled = st.i === 0;

    var cur = rows[st.i];
    if (cur) {
      elSpineNib.style.top = (cur.offsetTop + cur.offsetHeight / 2 - 5.5) + 'px';
      if (elIndex.scrollHeight > elIndex.clientHeight) {
        elIndex.scrollTo({
          top: cur.offsetTop - elIndex.clientHeight / 2 + cur.offsetHeight / 2,
          behavior: reduce ? 'auto' : 'smooth'
        });
      }
    }
    progress(0);
  }

  function clearAll() {
    if (timer) { clearTimeout(timer); timer = null; }
    if (tick) { cancelAnimationFrame(tick); tick = null; }
    if (synth) { try { synth.cancel(); } catch (e) {} }
    utter = null;
  }

  function runClock() {
    if (tick) cancelAnimationFrame(tick);
    var step = function () {
      tick = requestAnimationFrame(step);
      if (st.playing && spanMs && !sawWord) progress((performance.now() - started) / spanMs);
    };
    tick = requestAnimationFrame(step);
  }

  function speak() {
    var it = items[st.i], text = it.parts[st.s];
    sawWord = false;
    spanMs = partMs(st.i, st.s);
    started = performance.now();

    if (voice && synth) {
      var u = new SpeechSynthesisUtterance(text);
      u.voice = voice; u.lang = voice.lang; u.rate = RATES[st.rate];
      var n = text.trim().split(/\s+/).length, seen = 0;
      u.onboundary = function () { sawWord = true; seen++; progress(Math.min(1, seen / n)); };
      u.onend = function () { if (utter === u) { utter = null; step(); } };
      u.onerror = function (e) {
        if (utter !== u) return;
        utter = null;
        if (e && e.error === 'interrupted') return;
        timed();                             // engine refused: keep it moving
      };
      utter = u;
      if (timer) clearTimeout(timer);
      // Chrome sometimes never fires onend; never strand the brief on one line
      timer = setTimeout(function () { if (utter === u) { utter = null; step(); } }, spanMs * 2.5 + 3000);
      try { synth.speak(u); runClock(); return; } catch (e) { utter = null; }
    }
    timed();
  }
  function timed() {
    if (timer) clearTimeout(timer);
    timer = setTimeout(step, spanMs);
    runClock();
  }

  function step() {
    var it = items[st.i];
    if (st.s + 1 < it.parts.length) { st.s++; paint(); save(); speak(); return; }
    if (st.i + 1 < items.length) { st.i++; st.s = 0; paint(); save(); speak(); return; }
    progress(1); st.playing = false; setIcon(false); clearAll(); save();
  }

  function play() {
    if (st.i >= items.length - 1 && st.s >= items[st.i].parts.length - 1 && !st.playing) {
      st.i = 0; st.s = 0;                    // finished: start the edition over
    }
    st.on = true; st.playing = true;
    setIcon(true); paint(); save(); speak();
  }
  function pause() { st.playing = false; setIcon(false); clearAll(); save(); }
  function toggle() { st.playing ? pause() : play(); }

  function go(i, autoplay) {
    clearAll();
    st.i = Math.max(0, Math.min(items.length - 1, i));
    st.s = 0;
    paint();
    if (autoplay) { st.playing = true; setIcon(true); save(); speak(); }
    else { save(); }
  }

  /* --------------------------------------------------------- open / close -- */
  function dock(on) {
    st.on = on;
    root.hidden = !on;
    document.documentElement.toggleAttribute('data-bf-docked', on);
    if (on) { root.setAttribute('data-on', ''); }
    else { root.removeAttribute('data-on'); }
    if (hasBtn) btn.setAttribute('aria-expanded', on && st.mode === 'panel' ? 'true' : 'false');
    save();
  }
  function mode(m) {
    st.mode = m;
    root.setAttribute('data-mode', m);
    document.documentElement.style.overflow = m === 'panel' ? 'hidden' : '';
    if (hasBtn) btn.setAttribute('aria-expanded', m === 'panel' ? 'true' : 'false');
    if (m === 'panel') setTimeout(function () { paint(); $('play').focus(); }, 60);
    save();
  }
  function end() {
    clearAll();
    st.playing = false; st.on = false; st.i = 0; st.s = 0;
    setIcon(false);
    mode('bar'); dock(false); forget();
    if (hasBtn) btn.focus();
  }

  /* --------------------------------------------------------------- wiring -- */
  $('play').addEventListener('click', toggle);
  $('play2').addEventListener('click', toggle);
  $('next').addEventListener('click', function () { go(st.i + 1, st.playing); });
  $('next2').addEventListener('click', function () { go(st.i + 1, st.playing); });
  $('prev').addEventListener('click', function () { go(st.i - 1, st.playing); });
  $('open').addEventListener('click', function () { mode('panel'); });
  $('close').addEventListener('click', function () { mode('bar'); });
  $('end').addEventListener('click', end);
  $('scrim').addEventListener('click', function () { mode('bar'); });
  $('rate').addEventListener('click', function () {
    st.rate = (st.rate + 1) % RATES.length;
    $('rate').textContent = '×' + RATES[st.rate];
    save();
    if (st.playing) { clearAll(); speak(); }
  });

  document.addEventListener('keydown', function (e) {
    if (!st.on) return;
    if (e.key === 'Escape' && st.mode === 'panel') { e.preventDefault(); mode('bar'); return; }
    if (st.mode !== 'panel') return;
    if (/^(INPUT|TEXTAREA|SELECT)$/.test((e.target || {}).tagName || '')) return;
    if (e.key === ' ' || e.key === 'k') { e.preventDefault(); toggle(); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); go(st.i + 1, st.playing); }   // RTL: forward
    if (e.key === 'ArrowRight') { e.preventDefault(); go(st.i - 1, st.playing); }
  });

  /* The handler sits on the button, not on document. js/app.js registered a
     document-level click handler first that turns any internal .html link into
     a page transition; the event reaches this element before document, so
     preventDefault() here makes that handler skip the click through its own
     defaultPrevented check. The href stays as the no-JS fallback. */
  if (hasBtn) {
    btn.setAttribute('data-sh-brief-open', '');
    btn.setAttribute('role', 'button');
    btn.setAttribute('aria-haspopup', 'dialog');
    btn.setAttribute('aria-expanded', 'false');
    btn.addEventListener('click', function (e) {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button > 0) return;
      e.preventDefault();
      if (st.mode === 'panel' && st.on) { mode('bar'); return; }
      dock(true); mode('panel');
      if (!st.playing) play();
    });
  }

  /* ------------------------------------------------------------- restore -- */
  // speech dies with the document, so pick the sentence back up on the new page
  if (st.on) {
    dock(true);
    /* Always come back as the bar, never as the panel. The reader followed a
       link because they wanted the page; restoring a full-height modal over it
       would block the thing they asked for -- and its overflow:hidden would
       lock the new page's scroll. The brief keeps playing either way. */
    mode('bar');
    paint();
    setIcon(st.playing);
    if (st.playing) {
      var kick = function () { if (st.on && st.playing) speak(); };
      if (voice || !synth) setTimeout(kick, 240);
      else setTimeout(kick, 700);            // give the voice list a beat to load
    }
  }

  window.addEventListener('pagehide', function () {
    save();
    if (synth) { try { synth.cancel(); } catch (e) {} }
  });
})();
