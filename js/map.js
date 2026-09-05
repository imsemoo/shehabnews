/* شهاب — خريطة الخروقات (Phase 4) على Leaflet 1.9.4 المحلي.

   [data-sh-map] container (dir=ltr for the map itself, the panels stay RTL):
     data-sh-map-src      GeoJSON (default data/incidents.geojson)
     data-sh-map-mini     a compact map: no list, no filters, click → map.html
   Full page hooks: [data-sh-map-list], [data-sh-map-filter="period|type|area"],
   [data-sh-map-count], [data-sh-map-legend], [data-sh-map-empty],
   [data-sh-map-locate] (fly to the reader's area), #inc=<id> deep link.

   Tiles: OpenStreetMap standard tiles for the prototype; production points
   TILES at self-hosted tiles (Protomaps / OpenFreeMap) for Arabic labels and
   no third-party usage policy. Markers are CSS circles coloured by type. */
(function () {
  'use strict';
  var roots = [].slice.call(document.querySelectorAll('[data-sh-map]'));
  if (!roots.length || !window.L) return;
  var TILES = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
  var ATTR = '© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>';
  var COLOR = { 'قصف': '#e0302f', 'إطلاق نار': '#e08a1e', 'اقتحام': '#0f2a4f', 'اعتقال': '#5d6b7d', 'هدم': '#7c4a2d', 'استيطان': '#5f6b3a' };
  var ICON = { 'قصف': 'fire', 'إطلاق نار': 'crosshairs', 'اقتحام': 'person-walking', 'اعتقال': 'lock', 'هدم': 'house', 'استيطان': 'layer-group' };
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var esc = ShUI.esc;

  roots.forEach(function (root) { build(root); });

  function build(root) {
    var mini = root.hasAttribute('data-sh-map-mini');
    var src = root.getAttribute('data-sh-map-src') || 'data/incidents.geojson';
    var page = root.closest('[data-sh-map-page]') || document;
    var list = page.querySelector('[data-sh-map-list]');
    var count = page.querySelector('[data-sh-map-count]');
    var empty = page.querySelector('[data-sh-map-empty]');
    var legend = page.querySelector('[data-sh-map-legend]');
    var filter = { period: 'all', type: 'all', area: 'all' };
    var features = [], layer = null, markers = {};
    root.setAttribute('dir', 'ltr');

    var map = L.map(root, { zoomControl: !mini, attributionControl: true, scrollWheelZoom: !mini, dragging: !mini || !L.Browser.mobile, tap: !mini });
    L.tileLayer(TILES, { maxZoom: 17, attribution: ATTR }).addTo(map);
    map.fitBounds([[31.2, 34.2], [32.6, 35.6]], { padding: [10, 10] });
    if (mini) root.addEventListener('click', function () { location.href = 'map.html'; });

    if (legend) legend.innerHTML = Object.keys(COLOR).map(function (k) {
      return '<span class="sh-map__lg"><i style="background:' + COLOR[k] + '"></i>' + esc(k) + '</span>';
    }).join('');

    fetch(src, { headers: { Accept: 'application/json' } }).then(function (r) { return r.json(); }).then(function (geo) {
      features = (geo.features || []).slice();
      apply();
      var m = /(?:^#|[#&])inc=([a-z0-9]+)/.exec(location.hash);
      if (m && markers[m[1]]) openOne(m[1], true);
    }).catch(function () { if (count) count.textContent = 'تعذّر تحميل البيانات'; });

    function ageMs(f) { return Date.now() - new Date(f.properties.at).getTime(); }
    function passes(f) {
      var p = f.properties;
      var lim = filter.period === '24h' ? 864e5 : filter.period === '7d' ? 7 * 864e5 : filter.period === '30d' ? 30 * 864e5 : Infinity;
      return ageMs(f) <= lim && (filter.type === 'all' || p.type === filter.type) && (filter.area === 'all' || p.area === filter.area);
    }
    function popup(p) {
      return '<div class="sh-map__pop" dir="rtl">' +
        '<span class="sh-map__pop-type" style="color:' + COLOR[p.type] + '">' + ShUI.icon(ICON[p.type] || 'circle-dot') + esc(p.type) + ' · ' + esc(p.area) + '</span>' +
        '<a class="sh-map__pop-t" href="' + esc(p.href || 'article.html') + '">' + esc(p.t) + '</a>' +
        '<span class="sh-map__pop-meta">' + esc(p.place) + ' · ' + esc(ShUI.relTime(new Date(p.at))) + ' · ' + esc(p.source) + '</span>' +
        (p.casualties ? '<span class="sh-map__pop-c">' + esc(String(p.casualties)) + ' ' + (p.casualties === 1 ? 'شهيد' : p.casualties === 2 ? 'شهيدان' : 'شهداء') + '</span>' : '') +
        '</div>';
    }
    function apply() {
      if (layer) map.removeLayer(layer);
      markers = {};
      var shown = features.filter(passes);
      layer = L.geoJSON({ type: 'FeatureCollection', features: shown }, {
        pointToLayer: function (f, latlng) {
          var p = f.properties, fresh = ageMs(f) < 864e5;
          var mk = L.circleMarker(latlng, { radius: mini ? 5 : (fresh ? 8 : 6), color: '#fff', weight: 1.5, fillColor: COLOR[p.type] || '#1b5aa6', fillOpacity: fresh ? .95 : .7, className: fresh && !reduce ? 'sh-map__pin sh-map__pin--fresh' : 'sh-map__pin' });
          markers[p.id] = mk;
          if (!mini) {
            mk.bindPopup(popup(p), { maxWidth: 300, closeButton: true });
            mk.on('click', function () { history.replaceState(null, '', location.pathname + location.search + '#inc=' + p.id); highlight(p.id); });
          }
          return mk;
        }
      }).addTo(map);
      if (count) count.textContent = shown.length ? (shown.length === 1 ? 'خرق واحد' : shown.length === 2 ? 'خرقان' : shown.length <= 10 ? shown.length + ' خروقات' : shown.length + ' خرقًا') : 'لا خروقات';
      if (empty) empty.hidden = shown.length > 0;
      if (list) renderList(shown);
      document.querySelectorAll('[data-sh-map-total]').forEach(function (el) { el.textContent = String(features.length); });
      document.querySelectorAll('[data-sh-map-24h]').forEach(function (el) { el.textContent = String(features.filter(function (f) { return ageMs(f) < 864e5; }).length); });
    }
    function renderList(shown) {
      list.innerHTML = shown.map(function (f) {
        var p = f.properties;
        return '<a class="sh-map__row" href="#inc=' + esc(p.id) + '" data-sh-inc="' + esc(p.id) + '">' +
          '<span class="sh-map__row-dot" style="background:' + COLOR[p.type] + '"></span>' +
          '<span class="sh-map__row-body"><span class="sh-map__row-k">' + esc(p.type) + ' · ' + esc(p.place) + '</span>' +
          '<span class="sh-map__row-t">' + esc(p.t) + '</span>' +
          '<time class="sh-map__row-time" datetime="' + esc(p.at) + '"></time></span></a>';
      }).join('');
      ShUI.paintTimes(list);
    }
    function highlight(id) {
      if (!list) return;
      [].forEach.call(list.querySelectorAll('[data-sh-inc]'), function (a) { a.toggleAttribute('aria-current', a.getAttribute('data-sh-inc') === id); });
    }
    function openOne(id, fly) {
      var mk = markers[id];
      if (!mk) return;
      if (fly) map.flyTo(mk.getLatLng(), Math.max(map.getZoom(), 11), { animate: !reduce, duration: .8 });
      mk.openPopup();
      highlight(id);
    }
    if (list) list.addEventListener('click', function (e) {
      var a = e.target.closest('[data-sh-inc]');
      if (!a) return;
      e.preventDefault();
      history.replaceState(null, '', location.pathname + location.search + '#inc=' + a.getAttribute('data-sh-inc'));
      openOne(a.getAttribute('data-sh-inc'), true);
      if (window.matchMedia('(max-width: 900px)').matches) root.scrollIntoView({ block: 'start', behavior: reduce ? 'auto' : 'smooth' });
    });
    page.addEventListener('click', function (e) {
      var b = e.target.closest('[data-sh-map-filter]');
      if (!b) return;
      e.preventDefault();
      var k = b.getAttribute('data-sh-map-filter'), v = b.getAttribute('data-sh-map-value') || 'all';
      filter[k] = v;
      [].forEach.call(page.querySelectorAll('[data-sh-map-filter="' + k + '"]'), function (x) { x.setAttribute('aria-pressed', String(x === b)); });
      apply();
    });
    var locate = page.querySelector('[data-sh-map-locate]');
    if (locate) locate.addEventListener('click', function () {
      if (!navigator.geolocation) { ShUI.toast('المتصفح لا يدعم تحديد الموقع'); return; }
      navigator.geolocation.getCurrentPosition(function (pos) {
        map.flyTo([pos.coords.latitude, pos.coords.longitude], 12, { animate: !reduce });
      }, function () { ShUI.toast('تعذّر تحديد موقعك'); }, { timeout: 8000 });
    });
    // new incidents from the live channel land on the map too
    document.addEventListener('sh-feed:incident', function (e) {
      var f = e.detail;
      if (!f || !f.geometry) return;
      features.unshift(f);
      apply();
    });
    window.addEventListener('resize', function () { map.invalidateSize(); });
    if ('IntersectionObserver' in window) new IntersectionObserver(function (en) { if (en[0].isIntersecting) map.invalidateSize(); }, { threshold: .1 }).observe(root);
  }
})();
