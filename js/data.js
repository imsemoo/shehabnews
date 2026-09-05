/* شهاب — مكتب البيانات (data.html, Phase 4).

   Renders data/figures.json into [data-sh-figures]: one section per group,
   one card per figure (value, delta, sparkline drawn as inline SVG, source,
   copy-link). Everything is vanilla; the same JSON feeds [data-sh-figure]
   spans elsewhere through js/figures.js. */
(function () {
  'use strict';
  var host = document.querySelector('[data-sh-figures]');
  if (!host || !window.ShFigures) return;
  var esc = ShUI.esc;

  function spark(series, color) {
    if (!series || series.length < 2) return '';
    var w = 120, h = 34, min = Math.min.apply(null, series), max = Math.max.apply(null, series);
    var span = max - min || 1;
    var pts = series.map(function (v, i) { return [(i / (series.length - 1)) * w, h - 3 - ((v - min) / span) * (h - 6)]; });
    var d = pts.map(function (p, i) { return (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1); }).join(' ');
    var last = pts[pts.length - 1];
    return '<svg class="sh-fig__spark" viewBox="0 0 ' + w + ' ' + h + '" aria-hidden="true" focusable="false"><path d="' + d + ' L' + w + ' ' + h + ' L0 ' + h + ' Z" fill="' + color + '" fill-opacity=".12"/><path d="' + d + '" fill="none" stroke="' + color + '" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/><circle cx="' + last[0].toFixed(1) + '" cy="' + last[1].toFixed(1) + '" r="3" fill="' + color + '"/></svg>';
  }

  function card(key, fig, data) {
    var v = data.value(fig);
    var color = fig.delta > 0 ? '#bf2f32' : fig.delta < 0 ? '#5f6b3a' : '#1b5aa6';
    var unit = fig.unit || '';
    return '<article class="sh-fig" id="fig-' + esc(key) + '" data-sh-fig="' + esc(key) + '">' +
      '<div class="sh-fig__top"><span class="sh-fig__value sh-tnum">' + esc(data.fmt(v)) + (unit ? '<small>' + esc(unit) + '</small>' : '') + '</span>' +
      (typeof fig.delta === 'number' ? '<span class="sh-fig__delta" data-dir="' + (fig.delta > 0 ? 'up' : fig.delta < 0 ? 'down' : 'flat') + '">' + (fig.delta > 0 ? '+' : '') + esc(data.fmt(fig.delta)) + ' <em>' + esc(fig.deltaLabel || 'منذ أمس') + '</em></span>' : '') + '</div>' +
      '<h3 class="sh-fig__label">' + esc(fig.label) + '</h3>' +
      spark(fig.series, color) +
      '<div class="sh-fig__foot"><span class="sh-fig__src">' + esc(fig.source || '') + (fig.asOf ? ' · ' + esc(fig.asOf) : '') + '</span>' +
      '<button type="button" class="sh-fig__copy" data-sh-fig-copy="' + esc(key) + '" aria-label="نسخ رابط الرقم">' + ShUI.icon('link') + '</button></div>' +
      '</article>';
  }

  ShFigures.ready.then(function (data) {
    if (!data) { host.innerHTML = '<p class="sh-fig__err">تعذّر تحميل الأرقام الآن.</p>'; return; }
    var figs = data.figures || {};
    host.innerHTML = (data.groups || []).map(function (g) {
      return '<section class="sh-fig-group" aria-labelledby="fg-' + esc(g.title) + '"><h2 class="sh-section__title sh-section__title--md" id="fg-' + esc(g.title) + '"><span class="sh-mark sh-mark--md"></span>' + esc(g.title) + '</h2>' +
        '<div class="sh-fig-grid">' + g.keys.filter(function (k) { return figs[k]; }).map(function (k) { return card(k, figs[k], data); }).join('') + '</div></section>';
    }).join('');
    if (data.demo) {
      var note = document.querySelector('[data-sh-figures-note]');
      if (note) { note.hidden = false; note.textContent = data._note || ''; }
    }
    var m = /(?:^#|[#&])fig=([a-z0-9_]+)/.exec(location.hash);
    if (m) { var el = document.getElementById('fig-' + m[1]); if (el) { el.setAttribute('data-hit', ''); el.scrollIntoView({ block: 'center' }); } }
  });

  host.addEventListener('click', function (e) {
    var b = e.target.closest('[data-sh-fig-copy]');
    if (!b) return;
    var url = location.href.replace(/#.*$/, '') + '#fig=' + b.getAttribute('data-sh-fig-copy');
    var done = function () { ShUI.toast('اتنسخ رابط الرقم'); };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(url).then(done, function () { ShUI.toast(url); });
    else ShUI.toast(url);
  });
})();
