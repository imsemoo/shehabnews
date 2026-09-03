/* شهاب — موجز اليوم (AI briefing player).

   The masthead's «موجز اليوم» button opens a briefing that reads the day's
   items aloud with the browser's own speech engine. No backend, no API key,
   no network call -- it works from file:// and will keep working when this
   theme is ported to Blade.

   TWO MODES, ONE EXPERIENCE. Arabic text-to-speech is not installed on every
   machine (Windows needs the Arabic language pack; some Chrome builds ship no
   Arabic voice at all). So the player never depends on it:

     voiced     an ar-* voice exists -> speechSynthesis reads each item, and
                the waveform is driven by real onboundary events.
     read-along no ar-* voice        -> the brief still runs, timed from the
                word count at a news-reading pace, and says so plainly rather
                than pretending to speak.

   CONTENT. The default edition below is the fallback. Any page may override it
   with a JSON payload on [data-sh-brief] -- the same pattern the ticker already
   uses for data-items -- which is where a CMS will inject the real brief:

     <span data-sh-brief='{"edition":"...","items":[...]}' hidden></span>

   Each item carries `t` (the headline as displayed) and `say` (the sentence as
   spoken). Keeping them apart is the whole point: a headline is written to be
   scanned, a briefing line is written to be heard. */
(function () {
  'use strict';

  /* ---------------------------------------------------------------- data -- */
  var EDITION = {
    edition: 'موجز اليوم',
    items: [
      { c: 'الضفة', time: '10:32 م', href: 'article.html',
        t: 'قوات الاحتلال تقتحم بلدة دير الغصون شمال طولكرم',
        say: 'نبدأ من الضفة الغربية. اقتحمت قوات الاحتلال بلدة دير الغصون شمال طولكرم، وسط انتشار واسع في محيط البلدة.' },
      { c: 'غزة', time: '10:13 م', href: 'article.html',
        t: 'إطلاق نار من طائرة مُسيّرة في السطر الغربي ومحيط مدرسة الأقصى بخانيونس',
        say: 'وفي غزة، أفاد مراسل شهاب بإطلاق نار من طائرة مسيرة من نوع كواد كابتر في منطقة السطر الغربي ومحيط مدرسة الأقصى شمال غربي خانيونس.' },
      { c: 'غزة', time: '08:51 م', href: 'article.html',
        t: 'أربعة شهداء وإصابات بقصف الاحتلال في جباليا شمال القطاع',
        say: 'وارتقى أربعة شهداء وأصيب آخرون في قصف للاحتلال استهدف جباليا شمال قطاع غزة.' },
      { c: 'القدس', time: '09:05 م', href: 'article.html',
        t: 'قنابل الغاز في شارع المعهد بمحيط مخيم قلنديا شمال القدس',
        say: 'وفي القدس المحتلة، أطلقت قوات الاحتلال قنابل الغاز خلال اقتحام شارع المعهد في محيط مخيم قلنديا شمال المدينة.' },
      { c: 'فلسطين', time: '09:56 م', href: 'article.html',
        t: 'الأوقاف: الاحتلال يدمر ثلاثة مساجد في يومين ليصل العدد إلى 1244 مسجدًا',
        say: 'وقالت وزارة الأوقاف إن الاحتلال دمر ثلاثة مساجد خلال يومين، ليرتفع العدد إلى ألف ومئتين وأربعة وأربعين مسجدًا في غزة.' },
      { c: 'إسرائيلي', time: '09:31 م', href: 'article.html',
        t: 'قناة عبرية: وفد أمريكي يوبخ مسؤولًا إسرائيليًا بسبب عنف المستوطنين',
        say: 'وعلى الصعيد الإسرائيلي، ذكرت قناة عبرية أن وفدًا أمريكيًا وبّخ مسؤولًا إسرائيليًا بسبب تصاعد عنف المستوطنين في الضفة.' },
      { c: 'دولي', time: '09:07 م', href: 'article.html',
        t: 'نائب وزير خارجية إيران: لدينا أساليبنا لمواجهة أي سيناريو أمريكي',
        say: 'وختامًا، قال نائب وزير الخارجية الإيراني إن بلاده تملك أساليبها لمواجهة أي سيناريو أمريكي، بما في ذلك التصعيد والعقوبات.' }
    ]
  };

  var WAVE_N = 27;         // diamonds in the visualiser
  var RATES = [1, 1.15, 1.3, 0.85];
  var WORD_MS = 380;       // read-along pace, per word, at rate 1

  /* --------------------------------------------------------------- setup -- */
  var btn = document.querySelector('a[href="newsletter.html"]');
  if (!btn || !document.body) return;
  if (!/موجز/.test(btn.textContent)) return;      // not the briefing entry point

  var data = EDITION;
  var src = document.querySelector('[data-sh-brief]');
  if (src) {
    try {
      var parsed = JSON.parse(src.getAttribute('data-sh-brief'));
      if (parsed && parsed.items && parsed.items.length) data = parsed;
    } catch (e) { /* malformed payload: keep the built-in edition */ }
  }
  var items = data.items;

  var synth = window.speechSynthesis || null;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* -------------------------------------------------------------- markup -- */
  var ui = document.createElement('div');
  ui.setAttribute('data-sh-brief-ui', '');
  ui.innerHTML =
    '<div class="sh-brief" role="dialog" aria-modal="true" aria-label="موجز شهاب">' +
      '<span class="sh-brief-rule sh-brief-rule-a"></span>' +
      '<span class="sh-brief-rule sh-brief-rule-b"></span>' +
      '<span class="sh-brief-arc"></span>' +
      '<img class="sh-brief-mark" src="assets/images/logo-white.png" alt="">' +

      '<div class="sh-brief-head">' +
        '<span class="sh-brief-dia"></span>' +
        '<span class="sh-brief-title">موجز شهاب</span>' +
        '<span class="sh-brief-chip"><i></i><span data-sh-mode>صوت آلي</span></span>' +
        '<span class="sh-brief-edition" data-sh-edition></span>' +
        '<button type="button" class="sh-brief-x" data-sh-close aria-label="إغلاق الموجز">' +
          '<svg viewBox="0 0 14 14"><path d="M1 1l12 12M13 1L1 13"/></svg></button>' +
      '</div>' +

      '<div class="sh-brief-stage">' +
        '<div class="sh-brief-wave" data-sh-wave aria-hidden="true"></div>' +
        '<span class="sh-brief-cat"><s></s><span data-sh-cat></span><u data-sh-time></u></span>' +
        '<h2 class="sh-brief-line" data-sh-line aria-live="polite"></h2>' +
        '<p class="sh-brief-say" data-sh-say></p>' +
      '</div>' +

      '<div class="sh-brief-track">' +
        '<span class="sh-brief-fill" data-sh-fill></span>' +
        '<span class="sh-brief-nib" data-sh-nib></span>' +
      '</div>' +

      '<div class="sh-brief-foot">' +
        '<span class="sh-brief-dots" data-sh-dots></span>' +
        '<span class="sh-brief-btns">' +
          '<button type="button" class="sh-brief-rate" data-sh-rate aria-label="سرعة القراءة">×1</button>' +
          '<button type="button" class="sh-brief-b" data-sh-prev aria-label="الخبر السابق">' +
            '<svg viewBox="0 0 16 16"><path d="M3 2h2.2v5L13 2v12L5.2 9v5H3z"/></svg></button>' +
          '<button type="button" class="sh-brief-b sh-brief-b-main" data-sh-play aria-label="تشغيل الموجز">' +
            '<svg viewBox="0 0 16 16" data-sh-icon><path d="M3 1.6l11 6.4-11 6.4z"/></svg></button>' +
          '<button type="button" class="sh-brief-b" data-sh-next aria-label="الخبر التالي">' +
            '<svg viewBox="0 0 16 16"><path d="M13 2h-2.2v5L3 2v12l7.8-5v5H13z"/></svg></button>' +
        '</span>' +
      '</div>' +

      '<ol class="sh-brief-list" data-sh-list></ol>' +
      '<p class="sh-brief-note" data-sh-note></p>' +
    '</div>';
  document.body.appendChild(ui);

  var $ = function (k) { return ui.querySelector('[data-sh-' + k + ']'); };
  var panel = ui.firstElementChild;
  var elWave = $('wave'), elCat = $('cat'), elTime = $('time'), elLine = $('line'),
      elSay = $('say'), elFill = $('fill'), elNib = $('nib'), elDots = $('dots'),
      elList = $('list'), elNote = $('note'), elMode = $('mode'), elEdition = $('edition'),
      elPlay = $('play'), elIcon = $('icon'), elRate = $('rate');

  elEdition.textContent = data.edition || 'موجز اليوم';

  var bars = [];
  for (var w = 0; w < WAVE_N; w++) {
    var b = document.createElement('b');
    elWave.appendChild(b);
    bars.push(b);
  }

  var dots = items.map(function (it, i) {
    var d = document.createElement('b');
    d.setAttribute('role', 'button');
    d.setAttribute('tabindex', '0');
    d.setAttribute('aria-label', 'الخبر ' + (i + 1));
    d.addEventListener('click', function () { go(i, playing); });
    elDots.appendChild(d);
    return d;
  });

  var rows = items.map(function (it, i) {
    var li = document.createElement('li');
    var b = document.createElement('button');
    b.type = 'button';
    b.innerHTML = '<i>' + (i + 1 < 10 ? '0' : '') + (i + 1) + '</i><span></span><em></em>';
    b.children[1].textContent = it.t;
    b.children[2].textContent = it.time || '';
    b.addEventListener('click', function () { go(i, true); });
    li.appendChild(b);
    elList.appendChild(li);
    return b;
  });

  /* ---------------------------------------------------------------- voice -- */
  var voice = null, voiceReady = false;

  function pickVoice() {
    if (!synth) return null;
    var all = synth.getVoices() || [];
    var ar = all.filter(function (v) { return /^ar\b|^ar-/i.test(v.lang); });
    if (!ar.length) return null;
    // a local voice is instant and works offline; prefer it, then Egyptian/MSA
    var score = function (v) {
      var s = v.localService ? 2 : 0;
      if (/ar-EG|ar-SA|ar-001|ar_/i.test(v.lang)) s += 1;
      return s;
    };
    return ar.sort(function (a, b) { return score(b) - score(a); })[0];
  }

  function refreshVoice() {
    voice = pickVoice();
    voiceReady = true;
    if (voice) {
      elMode.textContent = 'صوت آلي';
      elNote.innerHTML = 'يُقرأ آليًا بصوت <b>' + voice.name.replace(/[<>&]/g, '') +
        '</b> من محرك النطق في متصفحك — لا يُرسَل أي نص إلى خادم خارجي.';
    } else {
      elMode.textContent = 'وضع القراءة';
      elNote.innerHTML = 'لا يوجد <b>صوت عربي</b> مثبَّت في هذا المتصفح، فيعمل الموجز ' +
        'بوضع القراءة: يتقدّم تلقائيًا بإيقاع نشرة إخبارية. لتشغيل الصوت ثبِّت حزمة ' +
        'اللغة العربية في نظامك ثم أعد فتح الصفحة.';
    }
  }

  if (synth) {
    refreshVoice();
    // Chrome populates the list asynchronously, sometimes more than once
    if (typeof synth.onvoiceschanged !== 'undefined') {
      synth.addEventListener('voiceschanged', refreshVoice);
    }
    setTimeout(refreshVoice, 900);
  } else {
    voiceReady = true;
    elMode.textContent = 'وضع القراءة';
    elNote.textContent = 'متصفحك لا يدعم النطق الآلي، فيعمل الموجز بوضع القراءة.';
  }

  /* ------------------------------------------------------------- playback -- */
  var idx = 0, playing = false, rateI = 0, timer = null, utter = null;
  var level = 0, raf = null, started = 0, spanMs = 0, done = false;

  function words(s) { return (s || '').trim().split(/\s+/).length; }
  function itemMs(i) { return Math.max(2600, words(items[i].say || items[i].t) * WORD_MS) / RATES[rateI]; }

  function paint() {
    var it = items[idx];
    elCat.textContent = it.c || '';
    elTime.textContent = it.time ? '· ' + it.time : '';
    elLine.textContent = it.t;
    elSay.textContent = it.say || '';
    dots.forEach(function (d, i) {
      d.toggleAttribute('data-done', i < idx);
      d.toggleAttribute('data-now', i === idx);
    });
    rows.forEach(function (r, i) { r.toggleAttribute('data-now', i === idx); });
    var cur = rows[idx];
    if (cur && elList.scrollHeight > elList.clientHeight) {
      var top = cur.offsetTop - elList.clientHeight / 2 + cur.offsetHeight / 2;
      elList.scrollTo({ top: top, behavior: reduce ? 'auto' : 'smooth' });
    }
    progress(0);
  }

  function progress(frac) {
    var whole = (idx + Math.max(0, Math.min(1, frac))) / items.length;
    var pct = (whole * 100).toFixed(2) + '%';
    elFill.style.width = pct;
    elNib.style.insetInlineStart = pct;
  }

  function setPlayIcon(on) {
    elIcon.innerHTML = on
      ? '<path d="M3 1.8h3.6v12.4H3zM9.4 1.8H13v12.4H9.4z"/>'   // pause
      : '<path d="M3 1.6l11 6.4-11 6.4z"/>';                     // play
    elPlay.setAttribute('aria-label', on ? 'إيقاف مؤقت' : 'تشغيل الموجز');
  }

  /* The visualiser is driven by the speech itself where the engine reports
     word boundaries, and by a steady breath where it does not. Either way it
     is never random noise: a fixed centre-weighted profile keeps the shape
     stable so it reads as one voice speaking. */
  var profile = bars.map(function (_, i) {
    var d = Math.abs(i - (WAVE_N - 1) / 2) / ((WAVE_N - 1) / 2);
    return 0.35 + 0.65 * Math.cos(d * 1.35);
  });

  function tick(now) {
    raf = requestAnimationFrame(tick);
    level *= 0.90;
    if (playing && level < 0.18) level = 0.18;
    var t = now / 260;
    for (var i = 0; i < bars.length; i++) {
      var breath = 0.5 + 0.5 * Math.sin(t + i * 0.55);
      var s = 1 + level * profile[i] * (0.55 + breath * 2.4);
      bars[i].style.transform = 'rotate(45deg) scaleY(' + s.toFixed(3) + ')';
    }
    if (playing && !utter && spanMs) {           // read-along: drive progress
      progress((performance.now() - started) / spanMs);
    }
  }

  function startLoop() { if (!raf && !reduce) raf = requestAnimationFrame(tick); }
  function stopLoop() {
    if (raf) { cancelAnimationFrame(raf); raf = null; }
    bars.forEach(function (b) { b.style.transform = 'rotate(45deg)'; });
  }

  function clearTimer() { if (timer) { clearTimeout(timer); timer = null; } }
  function silence() {
    clearTimer();
    if (synth) { try { synth.cancel(); } catch (e) {} }
    utter = null;
  }

  function speak(i) {
    var it = items[i];
    var text = it.say || it.t;

    if (voice && synth) {
      var u = new SpeechSynthesisUtterance(text);
      u.voice = voice;
      u.lang = voice.lang;
      u.rate = RATES[rateI];
      u.pitch = 1;
      var n = words(text), seen = 0;
      u.onboundary = function () { seen++; level = 1; progress(Math.min(1, seen / n)); };
      u.onend = function () { if (utter === u) { utter = null; advance(); } };
      u.onerror = function () { if (utter === u) { utter = null; fallbackTiming(i); } };
      utter = u;
      spanMs = 0;
      try { synth.speak(u); return; } catch (e) { utter = null; }
    }
    fallbackTiming(i);
  }

  // read-along: hold the item for a realistic reading span, then move on
  function fallbackTiming(i) {
    spanMs = itemMs(i);
    started = performance.now();
    level = 1;
    clearTimer();
    timer = setTimeout(advance, spanMs);
  }

  function advance() {
    if (idx + 1 < items.length) { go(idx + 1, true); }
    else { progress(1); done = true; stop(true); }
  }

  function go(i, autoplay) {
    silence();
    done = false;
    idx = Math.max(0, Math.min(items.length - 1, i));
    paint();
    if (autoplay) { playing = true; setPlayIcon(true); startLoop(); speak(idx); }
  }

  function play() {
    if (!items.length) return;
    // the brief ran to the end: play restarts it rather than repeating the last item
    if (done) { done = false; idx = 0; paint(); }
    playing = true; setPlayIcon(true); startLoop(); speak(idx);
  }

  function stop(ended) {
    playing = false; setPlayIcon(false); silence();
    level = 0;
    if (ended) { stopLoop(); }
  }

  function toggle() { playing ? stop(false) : play(); }

  /* --------------------------------------------------------------- wiring -- */
  $('prev').addEventListener('click', function () { go(idx - 1, playing); });
  $('next').addEventListener('click', function () { go(idx + 1, playing); });
  elPlay.addEventListener('click', toggle);
  elRate.addEventListener('click', function () {
    rateI = (rateI + 1) % RATES.length;
    elRate.textContent = '×' + RATES[rateI];
    if (playing) go(idx, true);          // re-utter at the new rate
  });

  /* ----------------------------------------------------------- open/close -- */
  var lastFocus = null;

  function open() {
    lastFocus = document.activeElement;
    ui.setAttribute('data-on', '');
    btn.setAttribute('aria-expanded', 'true');
    document.documentElement.style.overflow = 'hidden';
    idx = 0; rateI = 0; elRate.textContent = '×1';
    paint(); setPlayIcon(false);
    elWave.setAttribute('data-live', '');
    startLoop();
    // a gesture opened this, so autoplay is allowed; give voices a beat to load
    setTimeout(function () { if (ui.hasAttribute('data-on')) play(); }, voiceReady ? 260 : 700);
    setTimeout(function () { elPlay.focus(); }, 320);
  }

  function close() {
    stop(true);
    ui.removeAttribute('data-on');
    elWave.removeAttribute('data-live');
    btn.setAttribute('aria-expanded', 'false');
    document.documentElement.style.overflow = '';
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  $('close').addEventListener('click', close);
  ui.addEventListener('mousedown', function (e) { if (e.target === ui) close(); });

  document.addEventListener('keydown', function (e) {
    if (!ui.hasAttribute('data-on')) return;
    if (e.key === 'Escape') { e.preventDefault(); close(); return; }
    if (e.key === ' ' || e.key === 'k') {
      if (/^(INPUT|TEXTAREA|SELECT)$/.test((e.target || {}).tagName || '')) return;
      e.preventDefault(); toggle(); return;
    }
    // RTL: ArrowLeft moves forward through the brief
    if (e.key === 'ArrowLeft') { e.preventDefault(); go(idx + 1, playing); }
    if (e.key === 'ArrowRight') { e.preventDefault(); go(idx - 1, playing); }
    if (e.key === 'Tab') {                                   // keep focus inside
      var f = panel.querySelectorAll('button, [tabindex="0"]');
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  /* The listener sits on the button, not on document. js/app.js has a
     document-level click handler that turns any internal .html link into a
     page transition, and it registered first -- but the event reaches this
     element before it reaches document, so preventDefault() here makes that
     handler skip the click via its own defaultPrevented check. The href stays
     as the no-JS fallback. */
  btn.setAttribute('data-sh-brief-open', '');
  btn.setAttribute('role', 'button');
  btn.setAttribute('aria-haspopup', 'dialog');
  btn.setAttribute('aria-expanded', 'false');
  btn.addEventListener('click', function (e) {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button > 0) return;   // let it open the page
    e.preventDefault();
    ui.hasAttribute('data-on') ? close() : open();
  });

  // leaving the page must never keep a voice talking
  window.addEventListener('pagehide', function () { silence(); });
  window.addEventListener('beforeunload', function () { silence(); });
})();
