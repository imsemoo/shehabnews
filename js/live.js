/* شهاب — البث المباشر (live.html) على نواة المشغّل js/player.js.

   المشغّل Vidstack بمزوّد HLS (hls.js محلي) وstream-type="live:dvr"، ومصادره
   سلسلة بدائل في data-sh-sources: بث حقيقي أول، وبديل تاني، وآخر واحد إعادة
   محلية لو البث كله وقع (النواة بتبدّل وبتبعت sh-vs-fallback). الملف ده طبقة
   الصفحة بس:

     - شارة «مباشر» فوق الصورة: حمرا على حافة البث، رمادي «متأخر عن البث» لما
       المشاهد يرجّع، وزرار «العودة إلى البث الحي» (seekToLiveEdge).
     - لو وصلنا للبديل الأخير (الإعادة المحلية): نشيل نوع البث عشان الشريط
       يتعامل معاها كتسجيل، ونعرض تنويه، والحالة «إعادة البث».
     - شريط الحالة: المشاهدون (عدّاد توضيحي بيتحرّك)، «بدأ منذ» بيعدّ من
       data-sh-live-started-min، والجودة الحالية من المشغّل.
     - جدول اليوم: الأوقات محسوبة من data-sh-offset (بالدقايق من دلوقتي) و
       data-sh-len، والحالة past / now / next بتتحدّث كل دقيقة.
     - نسخ رابط البث.

   الخطافات: [data-sh-live] القسم، [data-sh-live-player]، [data-sh-live-badge] +
   [data-sh-live-badge-text]، [data-sh-live-edge]، [data-sh-live-notice]،
   [data-sh-live-state]، [data-sh-live-viewers]، [data-sh-live-elapsed]،
   [data-sh-live-quality]، [data-sh-live-sched] > [data-sh-offset]، [data-sh-live-copy]. */
(function () {
  'use strict';
  var root = document.querySelector('[data-sh-live]');
  if (!root || !window.ShPlayer) return;
  var player = root.querySelector('[data-sh-live-player]');
  if (!player) return;

  var badgeText = root.querySelector('[data-sh-live-badge-text]');
  var edgeBtn = root.querySelector('[data-sh-live-edge]');
  var notice = root.querySelector('[data-sh-live-notice]');
  var stateEl = root.querySelector('[data-sh-live-state]');
  var viewersEl = root.querySelector('[data-sh-live-viewers]');
  var elapsedEl = root.querySelector('[data-sh-live-elapsed]');
  var qualityEl = root.querySelector('[data-sh-live-quality]');
  var sched = root.querySelector('[data-sh-live-sched]');
  var copy = document.querySelector('[data-sh-live-copy]');
  var replay = false;

  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function hhmm(d) { return pad(d.getHours()) + ':' + pad(d.getMinutes()); }
  function fmtInt(n) { return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ','); }

  /* ------------------------------------------------ schedule (no player needed) */
  function paintSchedule() {
    if (!sched) return;
    var now = new Date(), nextDone = false;
    [].forEach.call(sched.querySelectorAll('[data-sh-offset]'), function (li) {
      var off = parseInt(li.getAttribute('data-sh-offset'), 10) || 0;
      var len = parseInt(li.getAttribute('data-sh-len'), 10) || 60;
      var start = new Date(now.getTime() + off * 60000), end = new Date(start.getTime() + len * 60000);
      var t = li.querySelector('[data-sh-time]'), tag = li.querySelector('.sh-live-sched__tag');
      if (t) t.textContent = hhmm(start);
      var state = end <= now ? 'past' : start <= now ? 'now' : (!nextDone ? 'next' : 'later');
      if (state === 'next') nextDone = true;
      li.setAttribute('data-state', state);
      if (tag) tag.textContent = state === 'past' ? 'انتهى' : state === 'now' ? 'الآن' : state === 'next' ? 'التالي' : '';
    });
  }
  paintSchedule();
  setInterval(paintSchedule, 60000);

  /* ------------------------------------------------ elapsed since start */
  var startedMin = parseInt(root.getAttribute('data-sh-live-started-min'), 10) || 0;
  var startedAt = Date.now() - startedMin * 60000;
  function paintElapsed() {
    if (!elapsedEl) return;
    var m = Math.max(0, Math.floor((Date.now() - startedAt) / 60000));
    var h = Math.floor(m / 60), r = m % 60;
    elapsedEl.textContent = h ? (h === 1 ? 'ساعة' : h === 2 ? 'ساعتين' : h + ' ساعات') + (r ? ' و' + r + ' د' : '') : r + ' دقيقة';
  }
  paintElapsed();
  setInterval(paintElapsed, 30000);

  /* ------------------------------------------------ viewers: only what the feed reports */
  var viewersWrap = root.querySelector('[data-sh-live-viewers-wrap]');
  document.addEventListener('sh-feed:live-state', function (e) {
    var d = e.detail || {};
    if (viewersEl && typeof d.viewers === 'number') { viewersEl.textContent = fmtInt(d.viewers); if (viewersWrap) viewersWrap.hidden = false; }
  });

  /* ------------------------------------------------ player-bound UI */
  ShPlayer.ready.then(function () {
    function paintEdge() {
      var s = player.state;
      if (replay) return;
      var behind = s.live && !s.liveEdge && s.canSeek;
      root.toggleAttribute('data-behind', behind);
      if (badgeText) badgeText.textContent = behind ? 'متأخر عن البث' : 'مباشر';
      if (stateEl) stateEl.textContent = behind ? 'تشاهد تسجيلًا متأخرًا' : 'على الهواء';
      if (edgeBtn) edgeBtn.hidden = !behind;
    }
    ['live-change', 'live-edge-change', 'can-play', 'seeked', 'play'].forEach(function (ev) { player.addEventListener(ev, paintEdge); });
    if (edgeBtn) edgeBtn.addEventListener('click', function () {
      player.seekToLiveEdge();
      var p = player.play(); if (p && p.catch) p.catch(function () {});
    });

    function paintQuality() {
      if (!qualityEl) return;
      var s = player.state, q = s.quality;
      qualityEl.textContent = s.autoQuality ? ('تلقائي' + (q ? ' · ' + q.height + 'p' : '')) : (q ? q.height + 'p' : '—');
    }
    ['quality-change', 'auto-quality-change', 'qualities-change', 'can-play'].forEach(function (ev) { player.addEventListener(ev, paintQuality); });

    player.addEventListener('sh-vs-fallback', function (e) {
      if (!e.detail || !e.detail.last) return;
      replay = true;
      player.removeAttribute('stream-type');
      root.removeAttribute('data-behind');
      root.setAttribute('data-replay', '');
      if (badgeText) badgeText.textContent = 'إعادة';
      if (stateEl) stateEl.textContent = 'البث متوقف مؤقتًا — تُعرض إعادة';
      if (edgeBtn) edgeBtn.hidden = true;
      if (notice) notice.hidden = false;
    });

    paintEdge();
    paintQuality();
  });
})();
