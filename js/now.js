/* شهاب — «الآن» (now.html, Phase 4): the newsroom screen.

   Everything on the page is driven by scripts that already exist (the live
   channel, the player core, the figures, the map, the widgets). This file
   only adds the wall-clock, the «منذ» counter on the live badge, and the
   kiosk mode (K key or ?kiosk=1: hides the site chrome for a newsroom screen). */
(function () {
  'use strict';
  var root = document.querySelector('[data-sh-now]');
  if (!root) return;
  var clock = root.querySelector('[data-sh-now-clock]');
  var date = root.querySelector('[data-sh-now-date]');
  var fmtT = new Intl.DateTimeFormat('ar-EG-u-nu-latn', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false, timeZone: 'Asia/Jerusalem' });
  var fmtD = new Intl.DateTimeFormat('ar-EG-u-nu-latn', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'Asia/Jerusalem' });
  function tick() {
    var d = new Date();
    if (clock) clock.textContent = fmtT.format(d);
    if (date) date.textContent = fmtD.format(d);
  }
  tick(); setInterval(tick, 1000);

  var kiosk = /[?&]kiosk=1/.test(location.search);
  function setKiosk(on) {
    document.documentElement.toggleAttribute('data-kiosk', on);
    if (on && document.documentElement.requestFullscreen && !document.fullscreenElement) document.documentElement.requestFullscreen().catch(function () {});
  }
  if (kiosk) setKiosk(true);
  document.addEventListener('keydown', function (e) {
    if (/^(INPUT|TEXTAREA|SELECT)$/.test((e.target || {}).tagName || '')) return;
    if (e.key === 'k' || e.key === 'K') setKiosk(!document.documentElement.hasAttribute('data-kiosk'));
    if (e.key === 'Escape') setKiosk(false);
  });
  var kb = root.querySelector('[data-sh-now-kiosk]');
  if (kb) kb.addEventListener('click', function () { setKiosk(!document.documentElement.hasAttribute('data-kiosk')); });

  // the viewers figure on the live badge follows the channel
  document.addEventListener('sh-feed:live-state', function (e) {
    var d = e.detail || {};
    var v = root.querySelector('[data-sh-now-viewers]');
    if (v && typeof d.viewers === 'number') v.textContent = new Intl.NumberFormat('en-US').format(d.viewers);
  });
})();
