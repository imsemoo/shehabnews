/* شهاب — language switch (js/lang.js).

   The choice lives in localStorage['sh-lang'] ('ar' | 'en'). A tiny prelude
   in <head> (written by tools/chrome.py) applies it before paint so the page
   never flashes the other direction:
       html[lang="en"][dir="ltr"]  →  css/ltr.css mirrors every RTL-bound rule.

   This file wires the two buttons in the topbar, and in English mode swaps
   the strings of the shared chrome (header, ticker, footer) through
   data-i18n / data-i18n-placeholder / data-i18n-aria keys. Page content is
   the agency's Arabic demo copy and stays as it is; the production build
   renders English content from the CMS and needs only the same keys.

   Switching reloads the page: Swiper and the players read dir at start, so a
   reload is the honest way to remount them in the other direction. */
(function () {
  'use strict';
  var KEY = 'sh-lang';
  var html = document.documentElement;

  var EN = {
    // topbar
    'lang.rss': 'RSS feed', 'lang.group': 'Language', 'skip': 'Skip to content', 'logo.alt': 'Shehab',
    // masthead
    'live': 'Live',
    'now': 'Now',
    'brief': 'Audio brief',
    'search.ph': 'Search Shehab',
    'search.btn': 'Search',
    'logo': 'Shehab — Home',
    // nav
    'nav.home': 'Home', 'nav.palestine': 'Palestine', 'nav.gaza': 'Gaza', 'nav.westbank': 'West Bank', 'nav.jerusalem': 'Jerusalem',
    'nav.prisoners': 'Prisoners', 'nav.inside': '48 Palestinians', 'nav.statements': 'Exclusive statements', 'nav.reports': 'Special reports',
    'nav.arab': 'Arab', 'nav.world': 'World', 'nav.israeli': 'Israeli', 'nav.translations': 'Translations', 'nav.shlomo': 'Shlomo News',
    'nav.sport': 'Sport', 'nav.opinion': 'Opinion', 'nav.media': 'Media', 'nav.video': 'Video', 'nav.livestream': 'Live stream',
    'nav.reels': 'Shehab Reels', 'nav.shorts': 'Shorts', 'nav.photos': 'Photos', 'nav.infographics': 'Infographics', 'nav.files': 'Shehab Files',
    'nav.data': 'Data', 'nav.datadesk': 'Data desk', 'nav.map': 'Violations map', 'nav.coverage': 'Live coverage', 'nav.agency': 'The agency',
    'nav.about': 'About us', 'nav.sections': 'Sections', 'nav.authors': 'Writers', 'nav.archive': 'Archive', 'nav.newsletter': 'Newsletter',
    'nav.saved': 'Saved', 'nav.contact': 'Contact us', 'nav.more': 'More', 'nav.search': 'Search', 'nav.tag': 'Tag page', 'nav.watch': 'Watch a video',
    'nav.privacy': 'Privacy policy', 'nav.terms': 'Terms of use', 'nav.states': 'Site states', 'nav.404': 'Page not found', 'nav.offline': 'Offline',
    'nav.systemstates': 'System states', 'nav.menu': 'Sections',
    // ticker
    'ticker.tag': 'Breaking', 'brief.len': '3 min', 'ticker.prev': 'Previous', 'ticker.pause': 'Pause', 'ticker.next': 'Next', 'ticker.close': 'Close',
    // footer
    'foot.tagline': 'A Palestinian news agency working around the clock to bring the picture from the Palestinian, Arab and international scenes.',
    'foot.play': 'Shehab on Google Play', 'foot.install': 'Install Shehab on your device',
    'foot.sections': 'Sections', 'foot.content': 'Content', 'foot.agency': 'The agency', 'foot.newsletter': 'Newsletter',
    'foot.coverages': 'Live coverages', 'foot.editorial': 'Editorial policy', 'foot.team': 'Editorial team', 'foot.rss': 'RSS',
    'foot.nl.text': 'The latest news and the top files in your inbox every morning.', 'foot.nl.ph': 'Your email', 'foot.nl.btn': 'Subscribe',
    'foot.telegram': 'Telegram channel', 'foot.whatsapp': 'WhatsApp channel', 'foot.push': 'Breaking alerts', 'foot.always': 'Continuous coverage around the clock',
    'foot.copy': 'Shehab News Agency © ', 'foot.rights': ' — All rights reserved', 'foot.english': 'عربي',
    'foot.facebook': 'Facebook', 'foot.x': 'X', 'foot.instagram': 'Instagram', 'foot.youtube': 'YouTube', 'foot.tiktok': 'TikTok',
    'foot.tg': 'Telegram', 'foot.wa': 'WhatsApp',
    'dock.live': 'Live', 'dock.onair': 'On air now', 'dock.title': 'Shehab Live — from Gaza', 'dock.watching': ' watching · ', 'dock.watch': 'Watch',
    'dock.aria': 'Live stream now', 'totop': 'Back to top',
    'consent.title': 'Privacy on Shehab',
    'consent.text': 'We use the cookies the site needs to run, and optional ones for statistics and advertising. You can change your choice any time from the',
    'consent.link': 'privacy policy', 'consent.essential': 'Essential only', 'consent.all': 'Accept all'
  };

  function current() {
    try { return localStorage.getItem(KEY) === 'en' ? 'en' : 'ar'; } catch (e) { return 'ar'; }
  }

  function firstText(el) {
    for (var i = 0; i < el.childNodes.length; i++) {
      var n = el.childNodes[i];
      if (n.nodeType === 3 && n.nodeValue.trim()) return n;
    }
    return null;
  }

  function apply(lang) {
    var en = lang === 'en';
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var key = el.getAttribute('data-i18n');
      var t = firstText(el);
      if (!t) return;
      if (!el.hasAttribute('data-ar')) el.setAttribute('data-ar', t.nodeValue);
      var v = en ? EN[key] : el.getAttribute('data-ar');
      if (v != null) t.nodeValue = v;
    });
    ['placeholder', 'aria-label', 'title', 'alt'].forEach(function (attr) {
      var dataName = 'data-i18n-' + (attr === 'aria-label' ? 'aria' : attr);
      document.querySelectorAll('[' + dataName + ']').forEach(function (el) {
        var key = el.getAttribute(dataName);
        var cache = 'data-ar-' + (attr === 'aria-label' ? 'aria' : attr);
        if (!el.hasAttribute(cache)) el.setAttribute(cache, el.getAttribute(attr) || '');
        var v = en ? EN[key] : el.getAttribute(cache);
        if (v != null) el.setAttribute(attr, v);
      });
    });
    document.querySelectorAll('[data-sh-lang]').forEach(function (b) {
      var on = b.getAttribute('data-sh-lang') === lang;
      b.classList.toggle('sh-lang__opt--on', on);
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
  }

  function set(lang) {
    try { localStorage.setItem(KEY, lang); } catch (e) {}
    html.lang = lang;
    html.dir = lang === 'en' ? 'ltr' : 'rtl';
    location.reload();
  }

  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('[data-sh-lang]');
    if (!b) return;
    e.preventDefault();
    var lang = b.getAttribute('data-sh-lang');
    if (lang !== current()) set(lang);
  });

  function start() { apply(current()); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();

  window.ShLang = { get: current, set: set, apply: apply, EN: EN };
})();
