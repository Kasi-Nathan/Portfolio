const crypto = require("node:crypto");

module.exports = async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Referrer-Policy", "no-referrer");
  res.setHeader("X-Content-Type-Options", "nosniff");

  if (req.method !== "GET") {
    return res.status(405).send("Method not allowed");
  }

  const {
    GITHUB_CLIENT_ID,
    GITHUB_CLIENT_SECRET,
    SITE_URL,
    GITHUB_ALLOWED_USER,
  } = process.env;

  if (
    !GITHUB_CLIENT_ID ||
    !GITHUB_CLIENT_SECRET ||
    !SITE_URL ||
    !GITHUB_ALLOWED_USER
  ) {
    return res.status(500).send("Missing authentication configuration");
  }

  const origin = new URL(SITE_URL).origin;
  const cookies = Object.fromEntries(
    (req.headers.cookie || "")
      .split(";")
      .map((part) => part.trim().split("="))
      .filter(([key, value]) => key && value)
  );

  const expectedState = cookies.portfolio_oauth_state;
  const verifier = cookies.portfolio_oauth_verifier;
  const { code, state } = req.query;

  // Remove the temporary cookies, including on failed attempts.
  const clearOptions =
    "HttpOnly; Secure; SameSite=Lax; Path=/api; Max-Age=0";

  res.setHeader("Set-Cookie", [
    `portfolio_oauth_state=; ${clearOptions}`,
    `portfolio_oauth_verifier=; ${clearOptions}`,
  ]);

  if (
    typeof code !== "string" ||
    typeof state !== "string" ||
    !expectedState ||
    !verifier
  ) {
    return res.status(400).send("Invalid login attempt. Please log in again.");
  }

  const actual = Buffer.from(state);
  const expected = Buffer.from(expectedState);

  if (
    actual.length !== expected.length ||
    !crypto.timingSafeEqual(actual, expected)
  ) {
    return res.status(400).send("Login verification failed. Please try again.");
  }

  try {
    const tokenResponse = await fetch(
      "https://github.com/login/oauth/access_token",
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          client_id: GITHUB_CLIENT_ID,
          client_secret: GITHUB_CLIENT_SECRET,
          code,
          redirect_uri: `${origin}/api/callback`,
          code_verifier: verifier,
        }),
        signal: AbortSignal.timeout(10000),
      }
    );

    const result = await tokenResponse.json();

    if (!tokenResponse.ok || !result.access_token) {
      return res.status(401).send("GitHub authentication failed.");
    }

    const userResponse = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${result.access_token}`,
        Accept: "application/vnd.github+json",
        "User-Agent": "Kasi-Portfolio-Admin",
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!userResponse.ok) {
      return res.status(401).send("Could not verify your GitHub account.");
    }

    const user = await userResponse.json();

    if (
      typeof user.login !== "string" ||
      user.login.toLowerCase() !== GITHUB_ALLOWED_USER.toLowerCase()
    ) {
      return res.status(403).send("This account cannot access the editor.");
    }

    // Escape values before embedding them inside an HTML script.
    const safeJson = (value) =>
      JSON.stringify(value).replace(/</g, "\\u003c");

    const message = `authorization:github:success:${JSON.stringify({
      token: result.access_token,
      provider: "github",
    })}`;

    const nonce = crypto.randomBytes(16).toString("base64");

    res.setHeader(
      "Content-Security-Policy",
      `default-src 'none'; script-src 'nonce-${nonce}'; frame-ancestors 'none'; base-uri 'none'`
    );
    res.setHeader("Content-Type", "text/html; charset=utf-8");

    return res.status(200).send(`<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><title>Portfolio login</title></head>
<body>
<p>Completing login. This window will close automatically.</p>
<script nonce="${nonce}">
  const origin = ${safeJson(origin)};
  const message = ${safeJson(message)};

  if (!window.opener) {
    document.querySelector("p").textContent =
      "Open login from the portfolio admin page.";
  } else {
    function receiveMessage(event) {
      if (event.origin !== origin || event.source !== window.opener) return;
      if (event.data !== "authorizing:github") return;

      window.removeEventListener("message", receiveMessage);
      window.opener.postMessage(message, origin);
      window.close();
    }

    window.addEventListener("message", receiveMessage);
    window.opener.postMessage("authorizing:github", origin);
  }
</script>
</body>
</html>`);
  } catch {
    return res.status(502).send("Login service unavailable. Please try again.");
  }
};