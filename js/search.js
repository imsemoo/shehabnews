/* شهاب — البحث (search.html).

   Phase 1: the page works without a backend. The query comes from ?q=, the
   count is the real number of results on the page, the type filters, the sort
   and the advanced panel all filter/sort the static list in place, and the
   pager keeps its real ?page= links (js/app.js pager() drives the batches).

   Phase 3 adds the instant search layer (js/searchbox.js) and, when
   /api/search answers, replaces the static list with live results — the same
   render() below draws both.

   Hooks: [data-sh-search] the hero form, [data-sh-search-q] the input,
   [data-sh-search-term] the «نتائج البحث عن» strong, [data-sh-search-count],
   [data-sh-sfilter="all|news|report|analysis"], [data-sh-ssort],
   [data-sh-sadv] the <details>, [data-sh-sadv-section], [data-sh-sadv-period],
   [data-sh-pager-list] > [data-sh-page] > a.sh-search-search-body__a-1. */
(function () {
  'use strict';
  var root = document.querySelector('[data-sh-search-page]');
  if (!root) return;

  var params = new URLSearchParams(location.search);
  var q = (params.get('q') || '').trim();
  var input = root.querySelector('[data-sh-search-q]');
  var term = root.querySelector('[data-sh-search-term]');
  var count = root.querySelector('[data-sh-search-count]');
  var list = root.querySelector('[data-sh-pager-list]');
  var items = list ? [].slice.call(list.querySelectorAll('a.sh-search-search-body__a-1, a.sh-search-featured-result__a-1')) : [];
  var empty = root.querySelector('[data-sh-search-empty]');
  var filter = 'all', sort = 'new', section = '', period = '';

  if (input && q) input.value = q;
  if (term) term.textContent = '«' + (q || (input && input.value) || 'غزة') + '»';
  document.title = (q ? 'نتائج البحث عن «' + q + '»' : 'البحث') + ' | وكالة شهاب للأنباء';

  /* each result's kind comes from its own kicker («خبر — غزة», «تقرير — …») */
  function kindOf(a) {
    var k = (a.querySelector('.sh-link') || {}).textContent || '';
    if (/تقرير|قصة/.test(k)) return 'report';
    if (/تحليل|رأي/.test(k)) return 'analysis';
    return 'news';
  }
  function sectionOf(a) {
    var k = (a.querySelector('.sh-link') || {}).textContent || '';
    var m = /—\s*(.+)$/.exec(k);
    return (m ? m[1] : k).trim();
  }
  function ageOf(a) {
    var t = a.querySelector('time[datetime]');
    if (t) return Date.now() - new Date(t.getAttribute('datetime')).getTime();
    var s = a.querySelector('time[data-sh-ago]');
    return s ? parseFloat(s.getAttribute('data-sh-ago')) * 60000 : 9e12;
  }
  items.forEach(function (a) {
    a.setAttribute('data-sh-kind', kindOf(a));
    a.setAttribute('data-sh-section', sectionOf(a));
  });

  function apply() {
    var shown = 0, now = Date.now();
    var limit = period === 'day' ? 864e5 : period === 'week' ? 7 * 864e5 : period === 'month' ? 30 * 864e5 : Infinity;
    items.forEach(function (a) {
      var ok = (filter === 'all' || a.getAttribute('data-sh-kind') === filter)
        && (!section || a.getAttribute('data-sh-section') === section)
        && ageOf(a) <= limit;
      a.hidden = !ok;
      if (ok) shown++;
    });
    if (count) count.textContent = shown ? (shown === 1 ? 'نتيجة واحدة' : shown === 2 ? 'نتيجتان' : shown <= 10 ? shown + ' نتائج' : shown + ' نتيجة') : 'لا نتائج';
    if (empty) empty.hidden = shown > 0;
    // sort inside each page batch, keeping the featured result first
    if (list) {
      [].forEach.call(list.querySelectorAll('[data-sh-page]'), function (page) {
        var rows = [].slice.call(page.querySelectorAll('a.sh-search-search-body__a-1'));
        rows.sort(function (a, b) { return sort === 'new' ? ageOf(a) - ageOf(b) : ageOf(b) - ageOf(a); });
        rows.forEach(function (r) { page.appendChild(r); });
      });
    }
  }

  /* type filters */
  [].forEach.call(root.querySelectorAll('[data-sh-sfilter]'), function (b) {
    b.addEventListener('click', function (e) {
      e.preventDefault();
      filter = b.getAttribute('data-sh-sfilter') || 'all';
      [].forEach.call(root.querySelectorAll('[data-sh-sfilter]'), function (x) { x.setAttribute('aria-pressed', String(x === b)); });
      apply();
    });
  });
  /* sort toggle */
  var sortBtn = root.querySelector('[data-sh-ssort]');
  if (sortBtn) sortBtn.addEventListener('click', function (e) {
    e.preventDefault();
    sort = sort === 'new' ? 'old' : 'new';
    var lbl = sortBtn.querySelector('strong');
    if (lbl) lbl.textContent = sort === 'new' ? 'الأحدث' : 'الأقدم';
    apply();
  });
  /* advanced */
  var advSection = root.querySelector('[data-sh-sadv-section]');
  var advPeriod = root.querySelector('[data-sh-sadv-period]');
  if (advSection) {
    var seen = {};
    items.forEach(function (a) { var s = a.getAttribute('data-sh-section'); if (s && !seen[s]) { seen[s] = 1; var o = document.createElement('option'); o.value = s; o.textContent = s; advSection.appendChild(o); } });
    advSection.addEventListener('change', function () { section = advSection.value; apply(); });
  }
  if (advPeriod) advPeriod.addEventListener('change', function () { period = advPeriod.value; apply(); });

  /* the hero form: a real GET, but Enter on the same page just re-filters */
  var form = root.querySelector('[data-sh-search]');
  if (form) form.addEventListener('submit', function (e) {
    var v = (input && input.value || '').trim();
    if (!v) { e.preventDefault(); input && input.focus(); }
  });

  apply();
})();
