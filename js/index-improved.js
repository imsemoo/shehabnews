/* index-improved.html only — the mobile navigation affordance.
   Everything else on the page runs on js/app.js exactly as the original does. */
(function () {
  'use strict';

  var header = document.querySelector('header[data-screen-label="Header"]');
  var toggle = document.querySelector('[data-ux="nav-toggle"]');
  var nav = document.getElementById('sh-primary-nav');
  if (!header || !toggle || !nav) return;

  var compact = window.matchMedia('(max-width: 900px)');

  function setOpen(on) {
    header.toggleAttribute('data-nav-open', on);
    toggle.setAttribute('aria-expanded', String(on));
    if (on) {
      var first = nav.querySelector('a');
      if (first) first.focus({ preventScroll: true });
    }
  }

  toggle.addEventListener('click', function () {
    setOpen(!header.hasAttribute('data-nav-open'));
  });

  // On small screens a parent item first opens its group, then navigates.
  nav.querySelectorAll('.sh-menu > a').forEach(function (a) {
    a.addEventListener('click', function (e) {
      if (!compact.matches) return;
      var item = a.parentNode;
      if (!item.hasAttribute('data-open')) {
        e.preventDefault();
        nav.querySelectorAll('.sh-menu[data-open]').forEach(function (o) {
          if (o !== item) o.removeAttribute('data-open');
        });
        item.setAttribute('data-open', '');
        a.setAttribute('aria-expanded', 'true');
      }
    });
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && header.hasAttribute('data-nav-open')) {
      setOpen(false);
      toggle.focus();
    }
  });

  // leaving the compact range must never strand the page in menu state
  compact.addEventListener('change', function (e) { if (!e.matches) setOpen(false); });
})();
