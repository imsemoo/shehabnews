/* شهاب — PWA plumbing (Phase 3).

     register   sw.js on http(s) only; the dev server and production both
                qualify, file:// never does
     update     a new worker waiting → one bar «نسخة جديدة من شهاب — حدّث»;
                accepting posts SKIP_WAITING and reloads on controllerchange
     install    beforeinstallprompt is kept and the footer button
                [data-sh-install] shows; appinstalled hides it again
     data-saver <html data-save-data> when the connection asks for it, so the
                stylesheets can drop ambient video and heavy imagery */
(function () {
  'use strict';
  var html = document.documentElement;
  var conn = navigator.connection || {};
  if (conn.saveData || /(^|[^0-9])2g/.test(conn.effectiveType || '')) html.setAttribute('data-save-data', '');

  if (!('serviceWorker' in navigator) || !/^https?:$/.test(location.protocol)) return;

  var refreshing = false;
  navigator.serviceWorker.addEventListener('controllerchange', function () {
    if (refreshing) return;
    refreshing = true;
    location.reload();
  });

  function offerUpdate(reg) {
    if (document.querySelector('.sh-update')) return;
    var bar = document.createElement('div');
    bar.className = 'sh-update';
    bar.setAttribute('role', 'status');
    bar.innerHTML = '<span>نسخة جديدة من شهاب جاهزة</span><button type="button" class="sh-update__btn">حدّث الآن</button><button type="button" class="sh-update__x" aria-label="لاحقًا">' + ShUI.icon('xmark') + '</button>';
    bar.querySelector('.sh-update__btn').addEventListener('click', function () {
      if (reg.waiting) reg.waiting.postMessage({ type: 'SKIP_WAITING' });
    });
    bar.querySelector('.sh-update__x').addEventListener('click', function () { bar.remove(); });
    document.body.appendChild(bar);
  }

  window.addEventListener('load', function () {
    navigator.serviceWorker.register('sw.js').then(function (reg) {
      if (reg.waiting && navigator.serviceWorker.controller) offerUpdate(reg);
      reg.addEventListener('updatefound', function () {
        var w = reg.installing;
        if (!w) return;
        w.addEventListener('statechange', function () {
          if (w.state === 'installed' && navigator.serviceWorker.controller) offerUpdate(reg);
        });
      });
    }).catch(function () {});
  });

  /* ---- install ---- */
  var deferred = null;
  var btn = document.querySelector('[data-sh-install]');
  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault();
    deferred = e;
    if (btn) btn.hidden = false;
  });
  if (btn) btn.addEventListener('click', function () {
    if (!deferred) return;
    deferred.prompt();
    deferred.userChoice.then(function (r) {
      if (r && r.outcome === 'accepted') ShUI.toast('تم تثبيت شهاب على جهازك');
      deferred = null;
      btn.hidden = true;
    });
  });
  window.addEventListener('appinstalled', function () { if (btn) btn.hidden = true; });
})();
