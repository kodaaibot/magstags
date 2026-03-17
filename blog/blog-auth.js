// Blog — Clerk auth gate (mags.sikora@gmail.com only)
(function () {
  var PK = 'pk_live_Y2xlcmsubWFnc3RhZ3MuY29tJA';
  var ALLOWED = ['mags.sikora@gmail.com'];

  function isAllowed(user) {
    if (!user) return false;
    return user.emailAddresses.some(function (ea) {
      return ALLOWED.indexOf(ea.emailAddress) > -1;
    });
  }

  function runBlogMode() {
    var content = document.getElementById('blog-content');
    var gate    = document.getElementById('blog-gate');
    if (!content || !gate) return;

    var clerk = new Clerk(PK);
    clerk.load().then(function () {
      var user = clerk.user;
      var msg  = document.getElementById('blog-gate-msg');
      var btn  = document.getElementById('blog-gate-btn');

      if (!user) {
        if (msg) msg.textContent = 'Sign in with mags.sikora@gmail.com to continue.';
        if (btn) { btn.textContent = 'Sign in'; btn.onclick = function () { clerk.openSignIn(); }; }
        gate.style.display = 'flex';
        return;
      }

      if (!isAllowed(user)) {
        var email = user.primaryEmailAddress && user.primaryEmailAddress.emailAddress;
        if (msg) msg.textContent = 'Access restricted. Signed in as ' + email + '.';
        if (btn) {
          btn.textContent = 'Switch account';
          btn.onclick = function () { clerk.signOut().then(function () { clerk.openSignIn(); }); };
        }
        gate.style.display = 'flex';
        return;
      }

      // Authorised
      gate.style.display = 'none';
      content.style.display = '';

      // Inject sign-out link
      var so = document.getElementById('blog-signout');
      if (so) {
        so.style.display = '';
        so.onclick = function () { clerk.signOut().then(function () { location.reload(); }); };
      }
    });
  }

  window.BlogAuth = { run: runBlogMode };
})();
