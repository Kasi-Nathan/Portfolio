const crypto = require("node:crypto");

module.exports = function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "GET") {
    return res.status(405).send("Method not allowed");
  }

  const { GITHUB_CLIENT_ID, SITE_URL } = process.env;

  if (!GITHUB_CLIENT_ID || !SITE_URL) {
    return res.status(500).send("Missing authentication configuration");
  }

  const origin = new URL(SITE_URL).origin;
  const state = crypto.randomBytes(32).toString("hex");
  const verifier = crypto.randomBytes(32).toString("base64url");
  const challenge = crypto
    .createHash("sha256")
    .update(verifier)
    .digest("base64url");

  res.setHeader("Set-Cookie", [
    `__Host-cms_state=${state}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=600`,
    `__Host-cms_verifier=${verifier}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=600`,
  ]);

  const url = new URL("https://github.com/login/oauth/authorize");
  url.search = new URLSearchParams({
    client_id: GITHUB_CLIENT_ID,
    redirect_uri: `${origin}/api/callback`,
    scope: "public_repo",
    state,
    code_challenge: challenge,
    code_challenge_method: "S256",
    allow_signup: "false",
  }).toString();

  res.setHeader("Location", url.toString());
  return res.status(302).end();
};