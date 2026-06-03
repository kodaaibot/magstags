/* Theme initialisation — load in <head> before render to prevent flash.
   Supports both selectors during the redesign migration:
     html.dark                    (legacy pages)
     html[data-theme="dark"]      (redesigned pages)
   Storage key is `mt-theme` (new). Legacy `theme` is read once and migrated. */
(function(){
  try {
    var legacy = localStorage.getItem('theme');
    var current = localStorage.getItem('mt-theme');
    if (legacy && !current) {
      localStorage.setItem('mt-theme', legacy);
      current = legacy;
    }
    var saved = current || legacy;
    var dark  = saved === 'dark' || (!saved && window.matchMedia && matchMedia('(prefers-color-scheme:dark)').matches);
    var html  = document.documentElement;
    if (dark) {
      html.classList.add('dark');
      html.setAttribute('data-theme', 'dark');
    } else {
      html.setAttribute('data-theme', 'light');
    }
  } catch (e) {}
})();

/* DOM-ready phase — wire aria-pressed on theme toggle + inject hamburger nav */
document.addEventListener('DOMContentLoaded', function() {
  // 1. aria-pressed on every theme toggle on the page
  function syncTogglePressed() {
    var isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    document.querySelectorAll('.theme-toggle').forEach(function(btn) {
      btn.setAttribute('aria-pressed', isDark ? 'true' : 'false');
    });
  }
  syncTogglePressed();

  // Wrap any existing window.toggleTheme to also sync aria-pressed.
  var origToggle = typeof window.toggleTheme === 'function' ? window.toggleTheme : null;
  window.toggleTheme = function() {
    if (origToggle) {
      origToggle();
    } else {
      var cur = document.documentElement.getAttribute('data-theme');
      var next = cur === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      document.documentElement.classList.toggle('dark', next === 'dark');
      try { localStorage.setItem('mt-theme', next); } catch (e) {}
    }
    syncTogglePressed();
  };

  // 2. Hamburger nav for < 800px (visible via CSS @media)
  var siteInner = document.querySelector('header.site .site-inner');
  var primary = siteInner && siteInner.querySelector('nav.primary');
  if (!siteInner || !primary) return;
  // Don't double-inject
  if (siteInner.querySelector('.nav-hamburger')) return;

  // Build hamburger button
  var hamburger = document.createElement('button');
  hamburger.className = 'nav-hamburger';
  hamburger.type = 'button';
  hamburger.setAttribute('aria-label', 'Open menu');
  hamburger.setAttribute('aria-expanded', 'false');
  hamburger.setAttribute('aria-controls', 'nav-overlay');
  hamburger.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>';

  // Insert hamburger before theme toggle (or append if no toggle)
  var themeBtn = primary.querySelector('.theme-toggle');
  if (themeBtn) primary.insertBefore(hamburger, themeBtn);
  else primary.appendChild(hamburger);

  // Build overlay menu
  var overlay = document.createElement('div');
  overlay.id = 'nav-overlay';
  overlay.className = 'nav-overlay';
  overlay.setAttribute('aria-hidden', 'true');

  var closeBtn = document.createElement('button');
  closeBtn.className = 'nav-overlay-close';
  closeBtn.type = 'button';
  closeBtn.setAttribute('aria-label', 'Close menu');
  closeBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
  overlay.appendChild(closeBtn);

  var overlayNav = document.createElement('nav');
  overlayNav.setAttribute('aria-label', 'Mobile primary');
  // Clone links from the desktop nav (excluding the theme toggle)
  primary.querySelectorAll('a').forEach(function(a) {
    var clone = a.cloneNode(true);
    overlayNav.appendChild(clone);
  });
  overlay.appendChild(overlayNav);
  document.body.appendChild(overlay);

  function openMenu() {
    overlay.classList.add('is-open');
    overlay.setAttribute('aria-hidden', 'false');
    hamburger.setAttribute('aria-expanded', 'true');
    document.body.classList.add('nav-locked');
    closeBtn.focus();
  }
  function closeMenu() {
    overlay.classList.remove('is-open');
    overlay.setAttribute('aria-hidden', 'true');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('nav-locked');
    hamburger.focus();
  }
  hamburger.addEventListener('click', openMenu);
  closeBtn.addEventListener('click', closeMenu);
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && overlay.classList.contains('is-open')) closeMenu();
  });
  overlayNav.querySelectorAll('a').forEach(function(a) {
    a.addEventListener('click', closeMenu);
  });
});
