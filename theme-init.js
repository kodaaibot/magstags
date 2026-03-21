/* Theme initialisation — load in <head> before render to prevent flash */
(function(){
  var s = localStorage.getItem('theme');
  if (s === 'dark' || (!s && matchMedia('(prefers-color-scheme:dark)').matches))
    document.documentElement.classList.add('dark');
})();
