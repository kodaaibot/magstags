/* Theme initialisation — load in <head> before render to prevent flash.
   Supports both selectors during the redesign migration:
     html.dark                    (legacy pages)
     html[data-theme="dark"]      (redesigned pages)
   Reads both storage keys (mt-theme = new, theme = legacy) so the user's
   choice carries across page types. */
(function(){
  try {
    var saved = localStorage.getItem('mt-theme') || localStorage.getItem('theme');
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
