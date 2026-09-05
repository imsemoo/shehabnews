/* شهاب — تنبيهات العاجل (Phase 3).

   Opt-in after a gesture, never on load. The footer button [data-sh-push]
   appears only where notifications and a service worker exist.

     on   Notification.requestPermission → subscribe the SW to push with the
          VAPID key from api/push/key (empty locally, so the subscription is
          skipped) → POST api/push/subscribe → localStorage sh-notify=1
     off  unsubscribe + sh-notify removed

   Local mode: while sh-notify is on and the tab is hidden, a breaking event
   from the live channel (sh-feed:notify) shows a notification through the
   registration — the same notification the server would push. So the flow
   is testable without a push server. */
(function () {
  'use strict';
  if (!('serviceWorker' in navigator) || !('Notification' in window) || !/^https?:$/.test(location.protocol)) return;
  var btn = document.querySelector('[data-sh-push]');
  var label = btn && btn.querySelector('[data-sh-push-label]');

  function store(k, v) { try { if (v === undefined) return localStorage.getItem(k); if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch (e) { return null; } }
  function on() { return store('sh-notify') === '1' && Notification.permission === 'granted'; }
  function paint() {
    if (!btn) return;
    btn.hidden = Notification.permission === 'denied';
    if (label) label.textContent = on() ? 'إيقاف تنبيهات العاجل' : 'نبّهني بالعاجل';
    btn.setAttribute('aria-pressed', String(on()));
    ShUI.setIcon(btn.querySelector('.sh-i'), on() ? 'bell-slash' : 'bell');
  }
  function b64(s) {
    var pad = '='.repeat((4 - s.length % 4) % 4);
    var raw = atob((s + pad).replace(/-/g, '+').replace(/_/g, '/'));
    var out = new Uint8Array(raw.length);
    for (var i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
    return out;
  }
  function subscribe(reg) {
    return fetch('api/push/key', { headers: { Accept: 'application/json' } }).then(function (r) { return r.json(); }).catch(function () { return {}; })
      .then(function (k) {
        if (!k || !k.key || !reg.pushManager) return null;             // no VAPID key: local notifications only
        return reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: b64(k.key) })
          .then(function (sub) {
            return fetch('api/push/subscribe', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(sub) }).then(function () { return sub; });
          });
      });
  }
  function enable() {
    return Notification.requestPermission().then(function (perm) {
      if (perm !== 'granted') { ShUI.toast('لم يُسمح بالتنبيهات في المتصفح'); paint(); return; }
      return navigator.serviceWorker.ready.then(function (reg) {
        return subscribe(reg).catch(function () { return null; }).then(function () {
          store('sh-notify', '1');
          paint();
          reg.showNotification('تم تفعيل تنبيهات العاجل', { body: 'هتوصلك أخبار شهاب العاجلة أول بأول.', icon: 'assets/images/icon-192.png', badge: 'assets/images/icon-192.png', dir: 'rtl', lang: 'ar', tag: 'sh-welcome', data: { url: 'coverage.html' } });
        });
      });
    });
  }
  function disable() {
    store('sh-notify', null);
    paint();
    ShUI.toast('تم إيقاف تنبيهات العاجل');
    return navigator.serviceWorker.ready.then(function (reg) {
      return reg.pushManager && reg.pushManager.getSubscription().then(function (sub) {
        if (!sub) return;
        return fetch('api/push/unsubscribe', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ endpoint: sub.endpoint }) }).catch(function () {}).then(function () { return sub.unsubscribe(); });
      });
    }).catch(function () {});
  }
  if (btn) {
    btn.hidden = false;
    btn.addEventListener('click', function () { (on() ? disable() : enable()); });
    paint();
  }

  /* local delivery of the live channel's breaking events */
  document.addEventListener('sh-feed:notify', function (e) {
    var d = e.detail || {};
    if (!on() || !d.t || (!document.hidden && document.hasFocus())) return;
    navigator.serviceWorker.ready.then(function (reg) {
      reg.showNotification('عاجل | شهاب', { body: d.t, icon: 'assets/images/icon-192.png', badge: 'assets/images/icon-192.png', dir: 'rtl', lang: 'ar', tag: 'sh-breaking', renotify: true, data: { url: d.href || 'coverage.html' } });
    });
  });
})();
