/* شهاب — صفحة المشاهدة (video-watch.html) على نواة المشغّل js/player.js.

   المشغّل نفسه Vidstack بالـDefault Layout (جودات HLS، فصول على شريط
   التقدّم، ثمبنيلز، ترجمة، سرعة، PiP، ملء الشاشة، اختصارات كيبورد على مستوى
   الصفحة، وحفظ الصوت والموضع في storage). الملف ده بيضيف طبقة الصفحة فقط:

     - شرائح الفصول تحت المشغّل من مسار الفصول نفسه (مصدر واحد للحقيقة)،
       والشريحة الجارية معلّمة، والضغط بيقفز.
     - وضع المسرح: المشغّل بعرض الحاوية والقائمة تنزل تحته. محفوظ.
     - مشغّل مصغّر: لما المشغّل يخرج من الشاشة وهو شغّال بيتثبّت في الركن،
       بزر إغلاق (بيوقف) وزر رجوع (بيطلع لمكانه).
     - قائمة التشغيل: الضغط على عنصر بيبدّل المصدر والبوستر والعنوان والمسارات
       والثمبنيلز، وبيعلّم العنصر، وبيكتب #v=N في الرابط (رابط عميق يشتغل عند الفتح).
     - التشغيل التلقائي: عند النهاية عدّاد 5 ثوانٍ فوق الصورة مع «تشغيل الآن»
       و«إلغاء»، ومفتاح تبديل محفوظ.
     - Shift+N / Shift+P التالي والسابق. زر «نسخ الرابط» بينسخ رابط الفيديو.

   الخطافات: [data-sh-watch] الحاوية، [data-sh-watch-player] المشغّل،
   [data-sh-watch-frame] إطار النسبة، [data-sh-watch-item] عناصر القائمة
   (data-sh-src / -poster / -title / -chapters / -captions / -thumbs / -kicker)،
   [data-sh-watch-chapters] صف الشرائح، [data-sh-watch-theater]،
   [data-sh-watch-autoplay]، [data-sh-watch-duration]، [data-sh-watch-next]،
   [data-sh-watch-mini-close] / [data-sh-watch-mini-back]، [data-sh-watch-title]
   لكل عنوان في الصفحة بيتبع الفيديو الجاري، [data-sh-watch-kicker] للشريحة. */
(function () {
  'use strict';
  var root = document.querySelector('[data-sh-watch]');
  if (!root || !window.ShPlayer) return;

  var player = root.querySelector('[data-sh-watch-player]');
  var frame = root.querySelector('[data-sh-watch-frame]');
  var chaptersBox = root.querySelector('[data-sh-watch-chapters]');
  var theaterBtn = root.querySelector('[data-sh-watch-theater]');
  var autoplayInput = root.querySelector('[data-sh-watch-autoplay]');
  var durationEl = root.querySelector('[data-sh-watch-duration]');
  var nextBox = root.querySelector('[data-sh-watch-next]');
  var miniClose = root.querySelector('[data-sh-watch-mini-close]');
  var miniBack = root.querySelector('[data-sh-watch-mini-back]');
  var items = [].slice.call(root.querySelectorAll('[data-sh-watch-item]'));
  var titles = [].slice.call(document.querySelectorAll('[data-sh-watch-title]'));
  var kickers = [].slice.call(document.querySelectorAll('[data-sh-watch-kicker]'));
  if (!player) return;

  var reduce = ShPlayer.reduceMotion;
  var fmt = ShPlayer.fmt;
  var store = {
    get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  };
  var current = Math.max(0, items.findIndex(function (it) { return it.getAttribute('aria-current') === 'true'; }));

  ShPlayer.ready.then(init);

  function init() {
    var layout = player.querySelector('media-video-layout');

    /* ------------------------------------------------ 1. chapter chips */
    var activeCue = null;
    function renderChapters(track) {
      if (!chaptersBox) return;
      var cues = track ? track.cues : [];
      chaptersBox.innerHTML = '';
      chaptersBox.hidden = !cues.length;
      cues.forEach(function (cue) {
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'sh-watch__chip';
        b.setAttribute('data-start', String(cue.startTime));
        b.innerHTML = '<span class="sh-watch__chip-t sh-tnum">' + fmt(cue.startTime) + '</span><span class="sh-watch__chip-l"></span>';
        b.querySelector('.sh-watch__chip-l').textContent = cue.text;
        b.addEventListener('click', function () {
          player.currentTime = cue.startTime + 0.01;
          var p = player.play(); if (p && p.catch) p.catch(function () {});
        });
        chaptersBox.appendChild(b);
      });
      paintChapter();
    }
    function paintChapter() {
      if (!chaptersBox) return;
      var t = player.state.currentTime;
      var chips = chaptersBox.children, on = null;
      for (var i = chips.length - 1; i >= 0; i--) {
        if (t >= parseFloat(chips[i].getAttribute('data-start'))) { on = chips[i]; break; }
      }
      if (on === activeCue) return;
      activeCue = on;
      [].forEach.call(chips, function (c) { c.setAttribute('aria-current', c === on ? 'true' : 'false'); });
    }
    function hookChapters(track) {
      if (!track || track.kind !== 'chapters') return;
      if (track.mode === 'disabled') track.mode = 'hidden';
      if (track.readyState === 2) renderChapters(track);
      else track.addEventListener('load', function () { renderChapters(track); });
    }
    player.textTracks.addEventListener('add', function (e) { hookChapters(e.detail); });
    var existing = player.textTracks.getByKind('chapters');
    if (existing.length) hookChapters(existing[0]);
    player.addEventListener('time-update', paintChapter);

    /* ------------------------------------------------ 2. duration */
    player.addEventListener('duration-change', function () {
      if (durationEl) durationEl.textContent = fmt(player.state.duration);
    });

    /* ------------------------------------------------ 3. theater */
    function theater(on) {
      root.toggleAttribute('data-theater', on);
      if (theaterBtn) {
        theaterBtn.setAttribute('aria-pressed', String(on));
        var t = theaterBtn.querySelector('[data-label]');
        if (t) t.textContent = on ? 'الوضع العادي' : 'وضع المسرح';
      }
      store.set('sh-watch-theater', on ? '1' : '0');
    }
    if (theaterBtn) {
      theaterBtn.addEventListener('click', function () { theater(!root.hasAttribute('data-theater')); });
      if (store.get('sh-watch-theater') === '1') theater(true);
    }
    document.addEventListener('keydown', function (e) {
      if (e.key === 't' && !e.ctrlKey && !e.metaKey && !e.altKey && !typing(e)) { e.preventDefault(); theater(!root.hasAttribute('data-theater')); }
    });

    /* ------------------------------------------------ 4. mini player */
    var miniOn = false, away = false;
    function mini(on) {
      if (on === miniOn) return;
      miniOn = on;
      root.toggleAttribute('data-mini', on);
      if (miniClose) miniClose.hidden = !on;
      if (miniBack) miniBack.hidden = !on;
    }
    if (frame && 'IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        away = entries[0].intersectionRatio < 0.3;
        if (!away) mini(false);
        else if (!player.state.paused && !document.fullscreenElement && !player.state.pictureInPicture) mini(true);
      }, { threshold: [0, 0.3, 0.6, 1] });
      io.observe(frame);
      player.addEventListener('play', function () { if (away) mini(true); });
      player.addEventListener('playing', function () { if (away) mini(true); });
      /* on pause it stays docked until it scrolls back or gets closed */
    }
    if (miniClose) miniClose.addEventListener('click', function () { player.pause(); mini(false); });
    if (miniBack) miniBack.addEventListener('click', function () {
      mini(false);
      frame.scrollIntoView({ block: 'start', behavior: reduce ? 'auto' : 'smooth' });
    });

    /* ------------------------------------------------ 5. playlist */
    function itemData(it) {
      return {
        src: it.getAttribute('data-sh-src') || '',
        poster: it.getAttribute('data-sh-poster') || '',
        title: it.getAttribute('data-sh-title') || (it.querySelector('.sh-video-watch-player__span-20') || it).textContent.replace(/\s+/g, ' ').trim(),
        chapters: it.getAttribute('data-sh-chapters') || '',
        captions: it.getAttribute('data-sh-captions') || '',
        thumbs: it.getAttribute('data-sh-thumbs') || '',
        kicker: it.getAttribute('data-sh-kicker') || ''
      };
    }
    function setTracks(d) {
      var list = player.textTracks;
      [].slice.call(list).forEach(function (t) { list.remove(t); });
      if (d.chapters) list.add({ src: d.chapters, kind: 'chapters', language: 'ar', label: 'الفصول', default: true });
      if (d.captions) list.add({ src: d.captions, kind: 'subtitles', language: 'ar', label: 'العربية' });
      if (!d.chapters) renderChapters(null);
    }
    function select(i, play, silent) {
      if (!items[i]) return;
      current = i;
      var d = itemData(items[i]);
      hideNext();
      items.forEach(function (it, k) { it.setAttribute('aria-current', k === i ? 'true' : 'false'); });
      if (d.poster) player.setAttribute('poster', d.poster); else player.removeAttribute('poster');
      player.setAttribute('title', d.title);
      if (layout) layout.thumbnails = d.thumbs || '';
      setTracks(d);
      if (player.state.source.src !== d.src) player.src = d.src;
      titles.forEach(function (el) { el.textContent = d.title; });
      if (d.kicker) kickers.forEach(function (el) { el.textContent = d.kicker; });
      if (!silent) history.replaceState(null, '', location.pathname + location.search + '#v=' + (i + 1));
      if (play) {
        var p = player.play(); if (p && p.catch) p.catch(function () {});
        if (frame && frame.getBoundingClientRect().top < 0 && !miniOn) frame.scrollIntoView({ block: 'start', behavior: reduce ? 'auto' : 'smooth' });
      }
    }
    items.forEach(function (it, i) {
      it.addEventListener('click', function (e) {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.button > 0) return;   // a new tab still gets the page
        e.preventDefault();
        select(i, true);
      });
    });
    var m = /(?:^#|[#&])v=(\d+)/.exec(location.hash);
    if (m && items[parseInt(m[1], 10) - 1] && parseInt(m[1], 10) - 1 !== current) select(parseInt(m[1], 10) - 1, false, true);

    /* ------------------------------------------------ 6. autoplay next */
    var timer = null, left = 5;
    function autoplayOn() { return autoplayInput ? autoplayInput.checked : true; }
    if (autoplayInput) {
      var saved = store.get('sh-watch-autoplay');
      if (saved !== null) autoplayInput.checked = saved === '1';
      autoplayInput.addEventListener('change', function () { store.set('sh-watch-autoplay', autoplayInput.checked ? '1' : '0'); if (!autoplayInput.checked) hideNext(); });
    }
    function hideNext() {
      clearInterval(timer); timer = null;
      if (nextBox) nextBox.hidden = true;
      player.removeAttribute('data-sh-next');
    }
    function showNext(i) {
      if (!nextBox) { select(i, true); return; }
      var d = itemData(items[i]);
      var img = nextBox.querySelector('[data-next-poster]'), t = nextBox.querySelector('[data-next-title]'), n = nextBox.querySelector('[data-next-count]');
      if (img) img.style.backgroundImage = d.poster ? 'url("' + d.poster + '")' : '';
      if (t) t.textContent = d.title;
      left = 5;
      if (n) n.textContent = String(left);
      nextBox.hidden = false;
      player.setAttribute('data-sh-next', '');
      clearInterval(timer);
      timer = setInterval(function () {
        left -= 1;
        if (n) n.textContent = String(Math.max(0, left));
        if (left <= 0) { hideNext(); select(i, true); }
      }, 1000);
      var go = nextBox.querySelector('[data-next-go]'), cancel = nextBox.querySelector('[data-next-cancel]');
      if (go) go.onclick = function () { hideNext(); select(i, true); };
      if (cancel) cancel.onclick = function () { hideNext(); };
    }
    // Vidstack بيبعت `end` بعد `ended` بـtick، ومش في كل الحالات — نسمع للاتنين بحارس
    function onEnd() {
      if (!autoplayOn() || items.length < 2 || (nextBox && !nextBox.hidden)) return;
      showNext((current + 1) % items.length);
    }
    player.addEventListener('end', onEnd);
    player.addEventListener('ended', onEnd);
    player.addEventListener('play', hideNext);

    /* ------------------------------------------------ 7. keys + share */
    function typing(e) {
      var t = e.target; var tag = t && t.tagName;
      return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || (t && t.isContentEditable);
    }
    document.addEventListener('keydown', function (e) {
      if (!e.shiftKey || e.ctrlKey || e.metaKey || e.altKey || typing(e) || items.length < 2) return;
      if (e.key === 'N') { e.preventDefault(); select((current + 1) % items.length, true); }
      else if (e.key === 'P') { e.preventDefault(); select((current - 1 + items.length) % items.length, true); }
    });
    var copy = document.querySelector('[data-sh-watch-copy]');
    if (copy) copy.addEventListener('click', function (e) {
      e.preventDefault();
      var url = location.href.replace(/#.*$/, '') + '#v=' + (current + 1);
      var done = function () { toast('اتنسخ رابط الفيديو'); };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(url).then(done, function () { toast(url); });
      else toast(url);
    });
    function toast(text) {
      var t = document.querySelector('.sh-watch__toast');
      if (!t) { t = document.createElement('span'); t.className = 'sh-watch__toast'; t.setAttribute('role', 'status'); document.body.appendChild(t); }
      t.textContent = text;
      t.setAttribute('data-on', '');
      clearTimeout(t._h);
      t._h = setTimeout(function () { t.removeAttribute('data-on'); }, 1600);
    }
  }
})();
