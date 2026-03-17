/* ── Shared site header ─────────────────────────────────────────────────── */
(function () {

  // ── CSS ──────────────────────────────────────────────────────────────────
  var css = [
    'header{background:var(--surface);border-bottom:1px solid var(--border);padding:0;height:56px;display:flex;align-items:center;position:sticky;top:0;z-index:100}',
    '.header-inner{max-width:1320px;margin:0 auto;width:100%;padding:0 36px;display:flex;align-items:center;justify-content:space-between}',
    '.logo{display:flex;align-items:center;gap:10px;text-decoration:none}',
    '.logo-name{font-family:"DM Serif Display",Georgia,serif;font-size:28px;font-weight:400;color:#000;margin:0 0 8px;letter-spacing:-.02em;padding-top:20px;padding-bottom:10px}',
    'html.dark .logo-name{color:#fff}',
    '.logo-lab{display:inline-block}',
    '.logo-lab .ls1{font-size:.72em;color:var(--teal);vertical-align:top;margin-top:-3px;margin-left:0;line-height:1}',
    '.logo-lab .ls2{font-size:.38em;color:var(--teal);vertical-align:top;margin-top:0;margin-left:1px;line-height:1}',
    '.header-right{display:flex;align-items:center;gap:10px}',
    /* Coffee nav button */
    '.coffee-nav-btn{display:flex;align-items:center;justify-content:center;width:32px;height:32px;border-radius:99px;background:var(--bg2);border:1px solid var(--border);cursor:pointer;text-decoration:none;transition:all .15s}',
    '.coffee-nav-btn:hover{border-color:var(--teal)}',
    '.coffee-nav-btn svg{color:var(--text-3)}',
    /* CSS-driven theme icon visibility */
    'html.dark .theme-show-light{display:none!important}',
    'html:not(.dark) .theme-show-dark{display:none!important}',
    /* Theme toggle pill (used on homepage hero area) */
    '.theme-toggle-pill{display:inline-flex;align-items:center;gap:6px;padding:6px 14px;border-radius:99px;background:var(--surface);border:1px solid var(--border);cursor:pointer;font-size:12px;font-weight:500;color:var(--text-3);font-family:"Inter",sans-serif;transition:all .15s}',
    '.theme-toggle-pill:hover{border-color:var(--teal);color:var(--text-2)}',
    '.theme-toggle-pill svg{color:var(--text-3);flex-shrink:0}',
    '.skip-link{position:absolute;top:-40px;left:16px;background:var(--teal);color:#fff;padding:8px 16px;border-radius:6px;font-size:13px;font-weight:600;text-decoration:none;z-index:9999;transition:top .15s}',
    '.skip-link:focus{top:8px}',
    ':focus-visible{outline:2px solid var(--teal);outline-offset:2px;border-radius:3px}',
    'button:focus-visible,a:focus-visible{outline:2px solid var(--teal);outline-offset:2px}',
  ].join('\n');

  var style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  // ── HTML ─────────────────────────────────────────────────────────────────
  var coffeeUrl = window._coffeeUrl || 'https://buy.stripe.com/cNi5kD9LsgHK54D80gasg01';
  var html = [
    '<a href="#main-content" class="skip-link">Skip to content</a>',
    '<header>',
    '  <div class="header-inner">',
    '    <a href="/" class="logo">',
    '      <span class="logo-name">mags [tags] <span class="logo-lab"><span class="ls1">\u2726</span><span class="ls2">\u2726</span></span></span>',
    '    </a>',
    '    <div class="header-right">',
    '      <a class="coffee-nav-btn" href="' + coffeeUrl + '" target="_blank" rel="noopener" title="Buy me a coffee" aria-label="Buy me a coffee">',
    '        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">',
    '          <path d="M18 8h1a4 4 0 0 1 0 8h-1"/>',
    '          <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/>',
    '          <line x1="6" y1="1" x2="6" y2="4"/>',
    '          <line x1="10" y1="1" x2="10" y2="4"/>',
    '          <line x1="14" y1="1" x2="14" y2="4"/>',
    '        </svg>',
    '      </a>',
    '      <button class="theme-toggle-pill" onclick="toggleTheme()" aria-label="Toggle light/dark mode">',
    '        <svg class="theme-show-light" xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>',
    '        <span class="theme-show-light">Dark</span>',
    '        <svg class="theme-show-dark" xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>',
    '        <span class="theme-show-dark">Light</span>',
    '      </button>',
    '    </div>',
    '  </div>',
    '</header>',
  ].join('\n');

  document.body.insertAdjacentHTML('afterbegin', html);

  // ── Theme ────────────────────────────────────────────────────────────────
  var _dark = localStorage.getItem('theme') === 'dark';
  if (_dark) document.documentElement.classList.add('dark');

  window.toggleTheme = function () {
    _dark = !_dark;
    document.documentElement.classList.toggle('dark', _dark);
    localStorage.setItem('theme', _dark ? 'dark' : 'light');
  };

})();
