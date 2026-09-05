/* شهاب — القناة الحية (ShFeed): Server-Sent Events على EventSource.

   قناة واحدة (/api/events) بأنواع أحداث، والصفحة تشترك فيها مرة وتوزّع:

     ticker      {t, href, at}                  شريط العاجل (js/chrome.js بيسمع sh-feed:ticker)
     update      {id, t, cat, href, at, breaking?} عناصر جديدة فوق كل [data-sh-feed="updates"]
     breaking    {id, t, href, at}              شريط الاستحواذ الأحمر + توست + إعلان صوتي
     top         {items:[{t, href}]}            «الأبرز الآن» [data-sh-feed="top"]
     live-state  {on_air, viewers, title, href} زر البث والشريط المرصوف + صفحة البث
     story       {id, t, at}                    بانر «تحدّث هذا الخبر» في [data-sh-story=id]
     hello       {now, on_air, viewers}         أول رسالة بعد الاتصال

   كل حدث بيتبعت كمان كـ CustomEvent('sh-feed:<type>', {detail}) على document،
   فأي سكربت صفحة (live.js، now.js…) يقدر يسمع من غير ما يعرف القناة.

   السلوك التحريري (نمط BBC Live): لو قائمة التحديثات ظاهرة على الشاشة، العنصر
   الجديد بيتحط فوق فورًا بتمييز. لو القارئ نازل تحت، العناصر بتتجمّع ورا زر
   «٣ تحديثات جديدة» فوق القائمة ومش بتنطّ الصفحة تحت إيده.

   الحالة: [data-sh-feed-status] بتقول «متصل · آخر تحديث منذ …» أو «انقطع
   الاتصال…». الصفحة المُسبقة (prerender) ما بتفتحش القناة لحد ما تتعرض.
   من file:// أو لو EventSource مش موجود: ولا حاجة بتحصل. */
(function () {
  'use strict';
  if (!('EventSource' in window) || !/^https?:$/.test(location.protocol)) return;
  var URL = 'api/events';
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var es = null, lastAt = 0, seen = {}, state = { on_air: false, viewers: null, title: '' };

  function esc(s) { return ShUI.esc(s); }
  function fill(tpl, d) {
    return tpl.replace(/\{(\w+)\}/g, function (_, k) {
      if (k === 'ago') return '';
      return esc(d[k] == null ? '' : d[k]);
    });
  }
  function timeAttr(d) { return d.at ? ' datetime="' + esc(d.at) + '"' : ' data-sh-ago="0"'; }

  /* ------------------------------------------------------------ status -- */
  function status(text, bad) {
    [].forEach.call(document.querySelectorAll('[data-sh-feed-status]'), function (el) {
      el.textContent = text;
      el.toggleAttribute('data-bad', !!bad);
    });
  }
  function tickStatus() {
    if (!es || es.readyState !== 1) return;
    status(lastAt ? 'متصل · آخر تحديث ' + ShUI.relTime(new Date(lastAt)) : 'متصل · بانتظار التحديثات');
  }
  setInterval(tickStatus, 30000);

  /* ------------------------------------------------------------ updates -- */
  var queues = [];   // one per [data-sh-feed="updates"] container
  function containers() {
    return [].slice.call(document.querySelectorAll('[data-sh-feed="updates"]'));
  }
  function inView(el) {
    var r = el.getBoundingClientRect();
    return r.top < innerHeight * 0.85 && r.bottom > 0;
  }
  function render(box, d) {
    var tpl = box.querySelector('template[data-sh-feed-tpl]');
    if (!tpl) return null;
    var html = fill(tpl.innerHTML, d).replace('data-sh-time-slot', timeAttr(d));
    var wrap = document.createElement('div');
    wrap.innerHTML = html.trim();
    var node = wrap.firstElementChild;
    if (!node) return null;
    node.setAttribute('data-new', '');
    if (d.breaking) node.setAttribute('data-breaking', '');
    return node;
  }
  function insert(box, node) {
    var after = box.querySelector('[data-sh-feed-head]');            // an optional fixed first row
    if (after) after.insertAdjacentElement('afterend', node); else box.insertBefore(node, box.firstElementChild);
    ShUI.paintTimes(node);
    var max = parseInt(box.getAttribute('data-sh-feed-max'), 10) || 0;
    if (max) {
      var rows = [].slice.call(box.children).filter(function (c) { return c.tagName !== 'TEMPLATE' && !c.hasAttribute('data-sh-feed-pill') && !c.hasAttribute('data-sh-feed-head'); });
      while (rows.length > max) rows.pop().remove();
    }
    setTimeout(function () { node.removeAttribute('data-new'); }, reduce ? 0 : 4000);
    var counter = box.getAttribute('data-sh-feed-count');
    if (counter) [].forEach.call(document.querySelectorAll(counter), function (c) { c.textContent = String((parseInt(c.textContent, 10) || 0) + 1); });
  }
  function pill(box) {
    var p = box.querySelector('[data-sh-feed-pill]');
    if (!p) {
      p = document.createElement('button');
      p.type = 'button';
      p.className = 'sh-feed-pill';
      p.setAttribute('data-sh-feed-pill', '');
      p.addEventListener('click', function () { flush(box, true); });
      box.insertBefore(p, box.firstElementChild);
    }
    return p;
  }
  function flush(box, scroll) {
    var q = box._shQueue || [];
    box._shQueue = [];
    var p = box.querySelector('[data-sh-feed-pill]');
    if (p) p.remove();
    q.reverse().forEach(function (node) { insert(box, node); });
    if (scroll && q.length) box.scrollIntoView({ block: 'start', behavior: reduce ? 'auto' : 'smooth' });
  }
  function onUpdate(d) {
    if (d.id && seen['u' + d.id]) return;
    if (d.id) seen['u' + d.id] = 1;
    containers().forEach(function (box) {
      var node = render(box, d);
      if (!node) return;
      if (inView(box)) { insert(box, node); return; }
      box._shQueue = box._shQueue || [];
      box._shQueue.push(node);
      var p = pill(box), n = box._shQueue.length;
      p.innerHTML = ShUI.icon('arrow-up') + (n === 1 ? 'تحديث جديد' : n === 2 ? 'تحديثان جديدان' : n + ' تحديثات جديدة') + ' — اعرضها';
    });
  }
  // when a container scrolls back into view, its queue drains on its own
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting && e.target._shQueue && e.target._shQueue.length) flush(e.target, false); });
    }, { threshold: [0.3] });
    containers().forEach(function (b) { io.observe(b); });
  }

  /* ------------------------------------------------------------ breaking -- */
  var bar = document.querySelector('[data-sh-breaking]');
  function onBreaking(d) {
    if (!d || !d.t) return;
    try { if (sessionStorage.getItem('sh-breaking-closed') === String(d.id)) return; } catch (e) {}
    if (bar) {
      var a = bar.querySelector('[data-sh-breaking-title]');
      var t = bar.querySelector('[data-sh-breaking-time]');
      if (a) { a.textContent = d.t; a.setAttribute('href', d.href || 'coverage.html'); }
      if (t) { if (d.at) t.setAttribute('datetime', d.at); else t.setAttribute('data-sh-ago', '0'); ShUI.paintTimes(bar); }
      bar.hidden = false;
      bar.setAttribute('data-id', d.id || '');
    }
    var live = document.querySelector('[data-sh-announce]');
    if (live) live.textContent = 'عاجل: ' + d.t;
    ShUI.toast('عاجل: ' + d.t, 4000);
    document.dispatchEvent(new CustomEvent('sh-feed:notify', { detail: d }));
  }
  if (bar) bar.addEventListener('click', function (e) {
    if (!e.target.closest('[data-sh-breaking-close]')) return;
    bar.hidden = true;
    try { sessionStorage.setItem('sh-breaking-closed', bar.getAttribute('data-id') || ''); } catch (err) {}
  });

  /* ------------------------------------------------------------- top -- */
  function onTop(d) {
    if (!d || !d.items) return;
    [].forEach.call(document.querySelectorAll('[data-sh-feed="top"]'), function (list) {
      var rows = [].slice.call(list.querySelectorAll('a'));
      d.items.slice(0, rows.length).forEach(function (it, i) {
        if (rows[i].textContent.trim() === it.t) return;
        rows[i].textContent = it.t;
        if (it.href) rows[i].setAttribute('href', it.href);
        rows[i].setAttribute('data-new', '');
        setTimeout(function () { rows[i].removeAttribute('data-new'); }, 4000);
      });
    });
  }

  /* ------------------------------------------------------- live state -- */
  function onLive(d) {
    if (!d) return;
    state.on_air = !!d.on_air;
    if (typeof d.viewers === 'number') state.viewers = d.viewers;
    if (d.title) state.title = d.title;
    document.documentElement.toggleAttribute('data-on-air', state.on_air);
    [].forEach.call(document.querySelectorAll('[data-sh-live-link]'), function (a) { a.toggleAttribute('data-on-air', state.on_air); });
    var dock = document.querySelector('[data-sh-livedock]');
    if (dock && !document.body.hasAttribute('data-sh-page-live')) {
      var closed = false;
      try { closed = sessionStorage.getItem('sh-livedock-closed') === '1'; } catch (e) {}
      dock.hidden = !state.on_air || closed;
      var t = dock.querySelector('[data-sh-livedock-title]');
      if (t && state.title) t.textContent = state.title;
      var v = dock.querySelector('[data-sh-livedock-viewers]');
      if (v && state.viewers != null) v.textContent = String(state.viewers).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }
  }
  var dock = document.querySelector('[data-sh-livedock]');
  if (dock) dock.addEventListener('click', function (e) {
    if (e.target.closest('[data-sh-livedock-close]')) {
      dock.hidden = true;
      try { sessionStorage.setItem('sh-livedock-closed', '1'); } catch (err) {}
    }
  });

  /* ------------------------------------------------------------ story -- */
  function onStory(d) {
    if (!d || !d.id) return;
    var art = document.querySelector('[data-sh-story="' + d.id + '"]');
    if (!art) return;
    var box = art.querySelector('[data-sh-story-updates]');
    if (!box) return;
    box.hidden = false;
    var list = box.querySelector('[data-sh-story-list]');
    var when = box.querySelector('[data-sh-story-time]');
    if (when) { if (d.at) when.setAttribute('datetime', d.at); else when.setAttribute('data-sh-ago', '0'); }
    if (list) {
      var li = document.createElement('li');
      li.innerHTML = '<time' + timeAttr(d) + ' data-sh-format="clock"></time><span>' + esc(d.t) + '</span>';
      li.setAttribute('data-new', '');
      list.insertBefore(li, list.firstChild);
      setTimeout(function () { li.removeAttribute('data-new'); }, 4000);
    }
    ShUI.paintTimes(box);
    var mod = document.querySelector('[data-sh-story-modified]');
    if (mod) { if (d.at) mod.setAttribute('datetime', d.at); else mod.setAttribute('data-sh-ago', '0'); ShUI.paintTimes(mod.parentNode); }
  }

  /* ---------------------------------------------------------- connect -- */
  function dispatch(type, d) {
    document.dispatchEvent(new CustomEvent('sh-feed:' + type, { detail: d }));
  }
  function handle(type, e) {
    var d = {};
    try { d = JSON.parse(e.data || '{}'); } catch (err) { return; }
    lastAt = Date.now();
    if (type === 'update') onUpdate(d);
    else if (type === 'breaking') { onBreaking(d); onUpdate(Object.assign({ breaking: true, cat: 'عاجل' }, d)); }
    else if (type === 'top') onTop(d);
    else if (type === 'live-state' || type === 'hello') onLive(d);
    else if (type === 'story') onStory(d);
    dispatch(type, d);
    tickStatus();
  }
  function connect() {
    es = new EventSource(URL);
    ['hello', 'ticker', 'update', 'breaking', 'top', 'live-state', 'story'].forEach(function (t) {
      es.addEventListener(t, function (e) { handle(t, e); });
    });
    es.onopen = function () { status('متصل · بانتظار التحديثات'); };
    es.onerror = function () { status('انقطع الاتصال، جارٍ إعادة المحاولة…', true); };
  }
  function start() {
    if (ShUI.prerendering()) { document.addEventListener('prerenderingchange', start, { once: true }); return; }
    connect();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();

  window.ShFeed = { state: state, get source() { return es; } };
})();
