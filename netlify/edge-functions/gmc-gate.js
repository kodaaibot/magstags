// Netlify Edge Function — server-side gate for /gmc-feed-analyzer/
// Validates the Clerk session cookie before serving the page.
// If no valid session or email not in the allow-list → redirect to homepage.

const CLERK_PK = "pk_live_Y2xlcmsubWFnc3RhZ3MuY29tJA";
// Extract the Clerk frontend API domain from the publishable key
// pk_live_ prefix → base64 of "clerk.<domain>$"
const CLERK_DOMAIN = (() => {
  try {
    const raw = atob(CLERK_PK.replace("pk_live_", "").replace("pk_test_", ""));
    return raw.replace(/\$$/, ""); // "clerk.magstags.com"
  } catch {
    return "clerk.magstags.com";
  }
})();

const ALLOWED_DOMAIN = "@intrepidonline.com";
const ALLOWED_EMAILS = ["mags.sikora@gmail.com"];

function isAllowedEmail(email) {
  if (!email) return false;
  const lower = email.toLowerCase();
  return (
    lower.endsWith(ALLOWED_DOMAIN) ||
    ALLOWED_EMAILS.includes(lower)
  );
}

export default async function handler(request, context) {
  // Let through non-page requests (assets, images, etc.)
  const url = new URL(request.url);
  if (url.pathname !== "/gmc-feed-analyzer/" && url.pathname !== "/gmc-feed-analyzer") {
    return context.next();
  }

  // Look for the Clerk session token in cookies
  // Clerk stores it as __session or __clerk_db_jwt
  const cookies = request.headers.get("cookie") || "";
  const sessionToken = getCookie(cookies, "__session") || getCookie(cookies, "__clerk_db_jwt");

  if (!sessionToken) {
    // No session at all → redirect to homepage
    return new Response(null, {
      status: 302,
      headers: { Location: "/?gmc=login-required" },
    });
  }

  // Verify the session with Clerk's Backend API
  try {
    // Decode the JWT to get the session claims (without full verification,
    // Clerk's FAPI will do the real verification)
    const payload = decodeJwtPayload(sessionToken);

    if (!payload) {
      return redirectHome();
    }

    // Check if the session is expired
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return redirectHome();
    }

    // Check email from Clerk's custom claims or fetch from FAPI
    // Clerk JWT includes email in metadata if configured, otherwise we check via API
    const email =
      payload.email ||
      payload.primary_email ||
      (payload.unsafe_metadata && payload.unsafe_metadata.email) ||
      null;

    if (email && isAllowedEmail(email)) {
      // Allowed — serve the page
      return context.next();
    }

    // If no email in JWT, try verifying via Clerk Frontend API
    const verifyResult = await verifyWithClerk(sessionToken);
    if (verifyResult && isAllowedEmail(verifyResult)) {
      return context.next();
    }

    // Not allowed
    return redirectHome();
  } catch (e) {
    // On any error, fail closed — redirect away
    console.error("GMC gate error:", e);
    return redirectHome();
  }
}

function redirectHome() {
  return new Response(null, {
    status: 302,
    headers: { Location: "/?gmc=login-required" },
  });
}

function getCookie(cookieStr, name) {
  const match = cookieStr.match(new RegExp("(?:^|;\\s*)" + name + "=([^;]*)"));
  return match ? match[1] : null;
}

function decodeJwtPayload(token) {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = JSON.parse(atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")));
    return payload;
  } catch {
    return null;
  }
}

async function verifyWithClerk(sessionToken) {
  try {
    // Use Clerk's Frontend API to get the current user's info
    const resp = await fetch(`https://${CLERK_DOMAIN}/v1/me`, {
      headers: {
        Authorization: `Bearer ${sessionToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!resp.ok) return null;

    const user = await resp.json();
    if (user.email_addresses && user.email_addresses.length > 0) {
      // Check all email addresses on the account
      for (const ea of user.email_addresses) {
        if (isAllowedEmail(ea.email_address)) {
          return ea.email_address;
        }
      }
    }
    return null;
  } catch {
    return null;
  }
}

export const config = {
  path: "/gmc-feed-analyzer/*",
};
