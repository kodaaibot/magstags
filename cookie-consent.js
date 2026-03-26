/* ── Cookie consent banner ────────────────────────────────────────────────
   SEO-safe: no overlay, no content hiding, no render-blocking.
   The banner is a fixed bottom bar that sits below page content.
   Googlebot sees all page content regardless of consent state.

   GA4 measurement ID: set window._ga4Id before this script loads,
   or replace 'G-XXXXXXXXXX' below with your actual ID.
   ──────────────────────────────────────────────────────────────────────── */
(function () {

  var STORAGE_KEY = 'cookie_consent';
  var GA4_ID = window._ga4Id || '';  // Set this when you have your GA4 ID

  // ── Already consented? Load analytics and stop ─────────────────────────
  var saved = localStorage.getItem(STORAGE_KEY);
  if (saved === 'accepted') { loadGA4(); return; }
  if (saved === 'declined') return;

  // ── CSS (inlined, matches MagsTags design system + dark mode) ──────────
  var css = [
    '.cc-bar{position:fixed;bottom:0;left:0;right:0;z-index:9999;background:var(--surface);border-top:1px solid var(--border);padding:14px 24px;display:flex;align-items:center;justify-content:center;gap:14px;flex-wrap:wrap;font-family:"Inter",system-ui,sans-serif;font-size:13px;color:var(--text-3);line-height:1.5;box-shadow:0 -2px 12px rgba(0,0,0,.06);transition:transform .3s ease}',
    '.cc-bar a{color:var(--teal);text-decoration:underline}',
    '.cc-text{max-width:620px;text-align:center}',
    '.cc-actions{display:flex;gap:8px;flex-shrink:0}',
    '.cc-btn{border:none;border-radius:99px;padding:8px 18px;font-size:12px;font-weight:600;font-family:"Inter",system-ui,sans-serif;cursor:pointer;transition:all .15s;line-height:1}',
    '.cc-btn-accept{background:var(--teal);color:#fff}',
    '.cc-btn-accept:hover{opacity:.9}',
    '.cc-btn-decline{background:transparent;color:var(--text-3);border:1px solid var(--border)}',
    '.cc-btn-decline:hover{border-color:var(--text-3)}',
    '.cc-bar.cc-hidden{transform:translateY(100%)}',
    '@media(max-width:600px){.cc-bar{flex-direction:column;padding:16px 16px 20px;gap:10px}.cc-text{font-size:12px}}'
  ].join('\n');

  var style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  // ── HTML ────────────────────────────────────────────────────────────────
  var html = [
    '<div class="cc-bar" role="dialog" aria-label="Cookie consent">',
    '  <span class="cc-text">This site uses cookies for analytics. No tracking happens without your say-so. <a href="/cookie-policy/">Cookie policy</a></span>',
    '  <div class="cc-actions">',
    '    <button class="cc-btn cc-btn-accept" data-cc="accept">Accept</button>',
    '    <button class="cc-btn cc-btn-decline" data-cc="decline">Decline</button>',
    '  </div>',
    '</div>'
  ].join('\n');

  // Insert at end of body (does NOT wrap or overlay any content)
  document.body.insertAdjacentHTML('beforeend', html);

  // ── Handlers ───────────────────────────────────────────────────────────
  var bar = document.querySelector('.cc-bar');

  bar.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-cc]');
    if (!btn) return;

    var choice = btn.getAttribute('data-cc');
    localStorage.setItem(STORAGE_KEY, choice === 'accept' ? 'accepted' : 'declined');

    bar.classList.add('cc-hidden');
    setTimeout(function () { bar.remove(); }, 350);

    if (choice === 'accept') loadGA4();
  });

  // ── GA4 loader (only fires after explicit consent) ─────────────────────
  function loadGA4() {
    if (!GA4_ID) return;  // No ID configured yet — skip silently
    if (document.querySelector('script[src*="googletagmanager.com/gtag"]')) return;

    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA4_ID;
    document.head.appendChild(s);

    window.dataLayer = window.dataLayer || [];
    function gtag() { dataLayer.push(arguments); }
    window.gtag = gtag;
    gtag('js', new Date());
    gtag('config', GA4_ID, { anonymize_ip: true });
  }

})();
