/* شهاب — البحث الفوري من الهيدر (Phase 3).

   The masthead's search form gets a panel under it: recent searches and the
   sections while empty, live results from api/search?q= while typing
   (debounced 150ms, previous request aborted), keyboard navigation
   (ArrowUp/Down, Enter, Escape), and «كل النتائج» to search.html. Below
   900px the field is hidden, so the search button opens the same panel as a
   full-screen sheet with its own input.

   Backend contract: GET api/search?q=<text>&limit=8 → {q, hits:[{t, href,
   cat, type, at|ago}], total}. Locally serve.py answers from
   data/search-index.json (built by tools/search_index.py); in production
   Laravel Scout + Meilisearch answers the same shape. */
(function () {
  'use strict';
  var form = document.querySelector('[data-sh-search-form]');
  if (!form || !/^https?:$/.test(location.protocol)) return;
  var input = form.querySelector('[data-sh-search-input]');
  var compact = window.matchMedia('(max-width: 900px)');
  var TYPES = { news: 'خبر', report: 'تقرير', video: 'فيديو', photo: 'صور', file: 'ملف', coverage: 'تغطية', analysis: 'تحليل' };
  var SECTIONS = ['غزة', 'الضفة', 'القدس', 'الأسرى', 'عربي', 'دولي', 'إسرائيلي', 'رياضة'];
  function store(k, v) { try { if (v === undefined) return JSON.parse(localStorage.getItem(k)); localStorage.setItem(k, JSON.stringify(v)); } catch (e) { return null; } }

  /* ---- the panel ---- */
  var box = document.createElement('div');
  box.className = 'sh-searchbox';
  box.hidden = true;
  box.innerHTML =
    '<div class="sh-searchbox__sheethead"><label class="sr-only" for="sh-sheet-q">ابحث في شهاب</label>' +
    '<input id="sh-sheet-q" class="sh-searchbox__input" type="search" placeholder="ابحث في شهاب" autocomplete="off" data-sh-sheet-input>' +
    '<button type="button" class="sh-searchbox__close" data-sh-sheet-close aria-label="إغلاق">' + ShUI.icon('xmark') + '</button></div>' +
    '<div class="sh-searchbox__body" role="listbox" id="sh-searchbox-list" aria-label="نتائج البحث الفورية"></div>';
  form.appendChild(box);
  var list = box.querySelector('.sh-searchbox__body');
  var sheetInput = box.querySelector('[data-sh-sheet-input]');
  var active = -1, hits = [], q = '', ctrl = null, timer = null, open = false;

  input.setAttribute('role', 'combobox');
  input.setAttribute('aria-autocomplete', 'list');
  input.setAttribute('aria-expanded', 'false');
  input.setAttribute('aria-controls', 'sh-searchbox-list');
  sheetInput.setAttribute('role', 'combobox');
  sheetInput.setAttribute('aria-autocomplete', 'list');
  sheetInput.setAttribute('aria-controls', 'sh-searchbox-list');

  function field() { return compact.matches ? sheetInput : input; }
  function esc(s) { return ShUI.esc(s); }

  function show() {
    if (open) return;
    open = true;
    box.hidden = false;
    document.documentElement.toggleAttribute('data-searchbox', compact.matches);
    input.setAttribute('aria-expanded', 'true');
    if (compact.matches) { sheetInput.value = input.value; sheetInput.focus(); }
    render();
  }
  function hide() {
    if (!open) return;
    open = false;
    box.hidden = true;
    document.documentElement.removeAttribute('data-searchbox');
    input.setAttribute('aria-expanded', 'false');
    active = -1;
  }

  /* ---- content ---- */
  function recent() { return store('sh-recent') || []; }
  function remember(term) {
    var r = recent().filter(function (x) { return x !== term; });
    r.unshift(term); if (r.length > 6) r.length = 6;
    store('sh-recent', r);
  }
  function option(html, i, href) {
    return '<a class="sh-searchbox__opt" role="option" id="sh-opt-' + i + '" href="' + esc(href) + '" aria-selected="' + (i === active) + '" data-i="' + i + '">' + html + '</a>';
  }
  function render() {
    var term = field().value.trim();
    var out = [];
    if (!term) {
      var r = recent();
      if (r.length) {
        out.push('<div class="sh-searchbox__h">بحثت مؤخرًا</div>');
        r.forEach(function (x, i) { out.push(option(ShUI.icon('clock-rotate-left') + '<span>' + esc(x) + '</span>', i, 'search.html?q=' + encodeURIComponent(x))); });
      }
      out.push('<div class="sh-searchbox__h">الأقسام</div><div class="sh-searchbox__chips">' +
        SECTIONS.map(function (s) { return '<a class="sh-searchbox__chip" href="category.html">' + esc(s) + '</a>'; }).join('') + '</div>');
      hits = r.map(function (x) { return { href: 'search.html?q=' + encodeURIComponent(x) }; });
    } else if (hits.length) {
      hits.forEach(function (h, i) {
        var when = h.at ? ShUI.relTime(new Date(h.at)) : (h.ago != null ? ShUI.relTime(new Date(Date.now() - h.ago * 60000)) : '');
        out.push(option('<span class="sh-searchbox__kicker">' + esc(TYPES[h.type] || 'خبر') + (h.cat ? ' — ' + esc(h.cat) : '') + '</span>' +
          '<span class="sh-searchbox__t">' + mark(h.t, term) + '</span>' + (when ? '<span class="sh-searchbox__time">' + esc(when) + '</span>' : ''), i, h.href));
      });
      out.push('<a class="sh-searchbox__all" href="search.html?q=' + encodeURIComponent(term) + '">كل النتائج لـ «' + esc(term) + '»' + ShUI.icon('arrow-left') + '</a>');
    } else {
      out.push('<div class="sh-searchbox__empty">' + (q === term ? 'لا نتائج مطابقة لـ «' + esc(term) + '»' : 'جارٍ البحث…') + '</div>');
      out.push('<a class="sh-searchbox__all" href="search.html?q=' + encodeURIComponent(term) + '">ابحث في كل الأرشيف' + ShUI.icon('arrow-left') + '</a>');
    }
    list.innerHTML = out.join('');
  }
  function mark(t, term) {
    var s = esc(t);
    var words = term.split(/\s+/).filter(function (w) { return w.length > 1; }).map(function (w) { return w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); });
    if (!words.length) return s;
    return s.replace(new RegExp('(' + words.join('|') + ')', 'g'), '<mark>$1</mark>');
  }
  function fetchHits(term) {
    if (ctrl) ctrl.abort();
    ctrl = new AbortController();
    q = '';
    fetch('api/search?q=' + encodeURIComponent(term) + '&limit=8', { signal: ctrl.signal, headers: { Accept: 'application/json' } })
      .then(function (r) { return r.ok ? r.json() : { hits: [] }; })
      .then(function (d) { q = term; hits = (d && d.hits) || []; active = -1; render(); })
      .catch(function (err) { if (err.name !== 'AbortError') { q = term; hits = []; render(); } });
  }
  function onInput() {
    var term = field().value.trim();
    if (compact.matches) input.value = term;
    show();
    clearTimeout(timer);
    if (!term) { hits = []; render(); return; }
    render();
    timer = setTimeout(function () { fetchHits(term); }, 150);
  }
  function move(delta) {
    var opts = list.querySelectorAll('[role="option"]');
    if (!opts.length) return;
    active = (active + delta + opts.length) % opts.length;
    opts.forEach(function (o, i) { o.setAttribute('aria-selected', String(i === active)); });
    field().setAttribute('aria-activedescendant', opts[active].id);
    opts[active].scrollIntoView({ block: 'nearest' });
  }
  function onKey(e) {
    if (!open && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) { show(); }
    if (e.key === 'ArrowDown') { e.preventDefault(); move(1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); move(-1); }
    else if (e.key === 'Escape') { hide(); field().blur(); }
    else if (e.key === 'Enter') {
      var opts = list.querySelectorAll('[role="option"]');
      if (active >= 0 && opts[active]) { e.preventDefault(); remember(field().value.trim() || opts[active].textContent.trim()); location.href = opts[active].getAttribute('href'); return; }
      var term = field().value.trim();
      if (!term) { e.preventDefault(); return; }
      remember(term);
      if (compact.matches) { e.preventDefault(); location.href = 'search.html?q=' + encodeURIComponent(term); }
    }
  }
  [input, sheetInput].forEach(function (el) {
    el.addEventListener('input', onInput);
    el.addEventListener('keydown', onKey);
    el.addEventListener('focus', function () { if (!compact.matches || el === sheetInput) show(); });
  });
  form.addEventListener('submit', function (e) {
    var term = input.value.trim();
    if (compact.matches) { e.preventDefault(); show(); return; }
    if (!term) { e.preventDefault(); input.focus(); return; }
    remember(term);
  });
  list.addEventListener('click', function (e) {
    var a = e.target.closest('[role="option"]');
    if (a) remember(field().value.trim() || a.textContent.trim());
  });
  box.querySelector('[data-sh-sheet-close]').addEventListener('click', hide);
  document.addEventListener('click', function (e) { if (open && !form.contains(e.target)) hide(); });
  document.addEventListener('keydown', function (e) {
    // "/" focuses the search anywhere on the page, like every newsroom tool
    if (e.key === '/' && !/^(INPUT|TEXTAREA|SELECT)$/.test((e.target || {}).tagName || '') && !e.ctrlKey && !e.metaKey) { e.preventDefault(); if (compact.matches) show(); else input.focus(); }
  });
})();
