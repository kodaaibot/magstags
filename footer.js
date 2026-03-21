/* ── Shared site footer ─────────────────────────────────────────────────── */
(function () {
  var linkStyle = 'color:inherit;text-decoration:none;opacity:.8';
  var links = [
    ['Contact', '/contact/'],
    ['About me', '/mags-sikora/'],
    ['Disclaimer', '/disclaimer/'],
    ['Privacy Policy', '/privacy-policy/'],
    ['Cookie Policy', '/cookie-policy/'],
    ['Terms of Service', '/terms-of-service/']
  ];

  var linkHtml = links.map(function (l) {
    return '<a href="' + l[1] + '" style="' + linkStyle + '">' + l[0] + '</a>';
  }).join(' &middot; ');

  var html = [
    '<footer>',
    '  <p>&copy; ' + new Date().getFullYear() + ' MagsTags &middot; ' + linkHtml + '</p>',
    '  <p style="font-size:11px;color:var(--text-4);margin-top:8px;text-align:center"><a href="/sitemap/" style="color:inherit;opacity:.7">Sitemap</a></p>',
    '</footer>'
  ].join('\n');

  /* Insert before </body> or after last element */
  document.body.insertAdjacentHTML('beforeend', html);
})();
