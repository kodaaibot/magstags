// GMC Feed Analyzer — Clerk auth gate
// Allowed: @intrepidonline.com + mags.sikora@gmail.com
(function () {
  var PK = 'pk_live_Y2xlcmsubWFnc3RhZ3MuY29tJA';
  var ALLOWED_EMAILS = ['mags.sikora@gmail.com'];
  var ALLOWED_DOMAIN = '@intrepidonline.com';

  function isAllowed(user) {
    if (!user) return false;
    return user.emailAddresses.some(function (ea) {
      return ALLOWED_EMAILS.indexOf(ea.emailAddress) > -1 ||
        ea.emailAddress.slice(-ALLOWED_DOMAIN.length) === ALLOWED_DOMAIN;
    });
  }

  function clerkReady() {
    return window.Clerk.load({ publishableKey: PK }).then(function () {
      return window.Clerk;
    });
  }

  // ── Listing page mode: hide/show GMC cards ──────────────────────────────
  function runListingMode() {
    var cards = document.querySelectorAll('a[href="/gmc-feed-analyzer/"]');
    cards.forEach(function (a) { a.style.display = 'none'; });

    clerkReady().then(function (clerk) {
      if (isAllowed(clerk.user)) {
        cards.forEach(function (a) { a.style.display = ''; });
      }
    });
  }

  // ── Tool page mode: full auth gate ──────────────────────────────────────
  function runToolMode() {
    var toolContent = document.getElementById('gmc-tool-content');
    var gateEl = document.getElementById('gmc-auth-gate');
    if (!toolContent || !gateEl) return;

    clerkReady().then(function (clerk) {
      var user = clerk.user;

      if (!user) {
        document.getElementById('gmc-gate-status').textContent = 'This tool is available to Intrepido team members.';
        document.getElementById('gmc-gate-btn').textContent = 'Sign in to continue';
        document.getElementById('gmc-gate-btn').onclick = function () { clerk.openSignIn(); };
        gateEl.style.display = 'flex';
        return;
      }

      if (!isAllowed(user)) {
        document.getElementById('gmc-gate-status').textContent =
          'Access is restricted to @intrepidonline.com accounts. You are signed in as ' +
          (user.primaryEmailAddress && user.primaryEmailAddress.emailAddress) + '.';
        document.getElementById('gmc-gate-btn').textContent = 'Sign in with a different account';
        document.getElementById('gmc-gate-btn').onclick = function () {
          clerk.signOut().then(function () { clerk.openSignIn(); });
        };
        gateEl.style.display = 'flex';
        return;
      }

      // Allowed — show tool
      gateEl.style.display = 'none';
      toolContent.style.display = '';
    });
  }

  window.GmcAuth = { runListingMode: runListingMode, runToolMode: runToolMode };
})();
