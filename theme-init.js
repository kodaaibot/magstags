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
