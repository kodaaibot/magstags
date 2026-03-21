// Netlify serverless function — proxies XML sitemap fetches to avoid CORS
// Endpoint: /.netlify/functions/fetch-sitemap?url=https://example.com/sitemap.xml

export default async (req) => {
  const { searchParams } = new URL(req.url);
  const targetUrl = searchParams.get("url");

  // Validate
  if (!targetUrl) {
    return new Response(JSON.stringify({ error: "Missing ?url= parameter" }), {
      status: 400,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  }

  let parsed;
  try {
    parsed = new URL(targetUrl);
  } catch {
    return new Response(JSON.stringify({ error: "Invalid URL" }), {
      status: 400,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  }

  // Only allow http(s) and XML-like paths
  if (!["http:", "https:"].includes(parsed.protocol)) {
    return new Response(JSON.stringify({ error: "Only HTTP/HTTPS URLs are supported" }), {
      status: 400,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  }

  try {
    const resp = await fetch(targetUrl, {
      headers: {
        "User-Agent": "MagsTags-Sitemap-Counter/1.0 (+https://www.magstags.com/sitemap-counter/)",
        "Accept": "application/xml, text/xml, */*",
      },
      redirect: "follow",
      signal: AbortSignal.timeout(15000),
    });

    if (!resp.ok) {
      return new Response(
        JSON.stringify({ error: `HTTP ${resp.status} ${resp.statusText}` }),
        {
          status: 502,
          headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
        }
      );
    }

    const contentType = resp.headers.get("content-type") || "";
    const body = await resp.text();

    // Basic sanity check — should look like XML
    const trimmed = body.trimStart();
    if (!trimmed.startsWith("<?xml") && !trimmed.startsWith("<urlset") && !trimmed.startsWith("<sitemapindex")) {
      return new Response(
        JSON.stringify({ error: "Response does not appear to be XML sitemap content" }),
        {
          status: 422,
          headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
        }
      );
    }

    // Cap response size at 50 MB
    if (body.length > 50 * 1024 * 1024) {
      return new Response(
        JSON.stringify({ error: "Sitemap exceeds 50 MB limit" }),
        {
          status: 413,
          headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
        }
      );
    }

    return new Response(body, {
      status: 200,
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, max-age=300",
      },
    });
  } catch (err) {
    const msg = err.name === "TimeoutError" ? "Request timed out (15s)" : err.message;
    return new Response(JSON.stringify({ error: msg }), {
      status: 502,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  }
};
