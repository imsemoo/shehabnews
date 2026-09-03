/* شهاب — responsive navigation (shared by every page).

   The exported header exposes its 5 secondary menus through `.sh-menu:hover >
   .sh-drop` only. A touch device cannot hover, so 14 destinations per page were
   unreachable on phones and tablets. Below 900px this turns the bar into a
   disclosure list: one tap opens a group, a second follows the parent link.

   The toggle button is injected here rather than added to 24 HTML files, so the
   markup stays exactly as the design tool exported it. Everything is a no-op
   above 900px and on pages without the standard header. */
(function () {
  'use strict';

  var header = document.querySelector('header[data-screen-label="Header"]');
  var nav = header && header.querySelector('nav');
  if (!header || !nav) return;                 // homepage-v2 has its own header

  var compact = window.matchMedia('(max-width: 900px)');

  /* ---- the toggle ------------------------------------------------------- */
  var toggle = header.querySelector('.sh-nav-toggle');
  if (!toggle) {
    toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'sh-nav-toggle';
    toggle.setAttribute('aria-label', 'القائمة');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.innerHTML = '<span></span><span></span><span></span>';

    if (!nav.id) nav.id = 'sh-primary-nav';
    toggle.setAttribute('aria-controls', nav.id);

    // sits with search in the masthead's trailing group; falls back to the nav
    var search = header.querySelector('a[href="search.html"]');
    var host = search && search.parentNode;
    if (host) host.insertBefore(toggle, search);
    else nav.parentNode.insertBefore(toggle, nav);
  }
  if (!nav.hasAttribute('aria-label')) nav.setAttribute('aria-label', 'القائمة الرئيسية');

  function setOpen(on) {
    header.toggleAttribute('data-nav-open', on);
    toggle.setAttribute('aria-expanded', String(on));
    if (!on) closeAllGroups();
  }

  toggle.addEventListener('click', function () {
    setOpen(!header.hasAttribute('data-nav-open'));
  });

  /* ---- dropdown groups become disclosures ------------------------------- */
  var groups = [].slice.call(nav.querySelectorAll('.sh-menu'));

  function closeAllGroups() {
    groups.forEach(function (g) {
      g.removeAttribute('data-open');
      var a = g.querySelector(':scope > a');
      if (a) a.setAttribute('aria-expanded', 'false');
    });
  }

  groups.forEach(function (group) {
    var link = group.querySelector(':scope > a');
    var drop = group.querySelector(':scope > .sh-drop');
    if (!link || !drop) return;

    link.setAttribute('aria-expanded', 'false');

    link.addEventListener('click', function (e) {
      if (!compact.matches) return;                       // desktop keeps hover
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button > 0) return;
      if (group.hasAttribute('data-open')) return;        // second tap navigates
      e.preventDefault();
      groups.forEach(function (g) {
        if (g === group) return;
        g.removeAttribute('data-open');
        var a = g.querySelector(':scope > a');
        if (a) a.setAttribute('aria-expanded', 'false');
      });
      group.setAttribute('data-open', '');
      link.setAttribute('aria-expanded', 'true');
    });
  });

  /* ---- housekeeping ----------------------------------------------------- */
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (header.hasAttribute('data-nav-open')) { setOpen(false); toggle.focus(); }
  });

  // crossing back to desktop must never leave the page in menu state
  var onChange = function (e) { if (!e.matches) setOpen(false); };
  if (compact.addEventListener) compact.addEventListener('change', onChange);
  else if (compact.addListener) compact.addListener(onChange);
})();
