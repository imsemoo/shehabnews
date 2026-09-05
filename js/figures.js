/* شهاب — الأرقام المشتركة (Phase 4).

   Loads data/figures.json once and fills every [data-sh-figure="key"] on the
   page (the Gaza banner's day counter, the map's totals, the data desk's
   cards, the «الآن» screen). Numbers are Latin, grouped, tabular; a key with
   "since" is computed from that date; [data-sh-figure-delta] beside a figure
   gets its day-over-day change; [data-sh-figure-asof] the source line.

   window.ShFigures.ready resolves with the parsed JSON for page scripts. */
(function () {
  'use strict';
  var nf = new Intl.NumberFormat('en-US');
  function fmt(v) { return typeof v === 'number' ? nf.format(v) : (v == null ? '—' : String(v)); }
  function days(since) { return Math.max(0, Math.floor((Date.now() - new Date(since + 'T00:00:00').getTime()) / 864e5)); }

  function value(fig) {
    if (!fig) return null;
    if (fig.since) return days(fig.since);
    return fig.value;
  }

  function paint(data) {
    var figs = data.figures || {};
    document.querySelectorAll('[data-sh-figure]').forEach(function (el) {
      var fig = figs[el.getAttribute('data-sh-figure')];
      if (!fig) return;
      el.textContent = fmt(value(fig));
    });
    document.querySelectorAll('[data-sh-figure-delta]').forEach(function (el) {
      var fig = figs[el.getAttribute('data-sh-figure-delta')];
      if (!fig || typeof fig.delta !== 'number') { el.hidden = true; return; }
      el.textContent = (fig.delta > 0 ? '+' : '') + fmt(fig.delta) + ' ' + (fig.deltaLabel || 'منذ أمس');
      el.setAttribute('data-dir', fig.delta > 0 ? 'up' : fig.delta < 0 ? 'down' : 'flat');
    });
    document.querySelectorAll('[data-sh-figure-asof]').forEach(function (el) {
      var fig = figs[el.getAttribute('data-sh-figure-asof')];
      if (!fig) return;
      el.textContent = (fig.source || '') + (fig.asOf ? ' · ' + fig.asOf : '');
    });
    document.querySelectorAll('[data-sh-figures-updated]').forEach(function (el) {
      if (data.updated) { el.setAttribute('datetime', data.updated); ShUI.paintTimes(el.parentNode); }
    });
  }

  var ready = fetch('data/figures.json', { headers: { Accept: 'application/json' } })
    .then(function (r) { return r.json(); })
    .then(function (d) { d.value = value; d.fmt = fmt; paint(d); return d; })
    .catch(function () { return null; });

  window.ShFigures = { ready: ready, fmt: fmt, value: value };
})();
