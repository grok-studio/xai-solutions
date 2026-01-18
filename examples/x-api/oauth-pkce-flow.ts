/**
 * OAuth 2.0 PKCE authentication flow for X API
 *
 * Run: bun examples/x-api/oauth-pkce-flow.ts
 *
 * Requires: X_CLIENT_ID environment variable
 *
 * This starts a local server at http://localhost:3000
 * Visit http://localhost:3000/login to start the OAuth flow
 */

import crypto from "crypto"

const CLIENT_ID = process.env.X_CLIENT_ID
const REDIRECT_URI = "http://localhost:3000/callback"
const SCOPES = "tweet.read tweet.write users.read offline.access"

if (!CLIENT_ID) {
  console.error("Error: X_CLIENT_ID environment variable is required")
  console.error("Get your client ID from https://developer.x.com/")
  process.exit(1)
}

// Generate PKCE challenge
function generatePKCE() {
  const codeVerifier = crypto.randomBytes(32).toString("base64url")
  const codeChallenge = crypto.createHash("sha256").update(codeVerifier).digest("base64url")
  return { codeVerifier, codeChallenge }
}

// In-memory session store (use Redis in production)
const sessions = new Map<string, { codeVerifier: string; state: string }>()

function getAuthorizationUrl(codeChallenge: string, state: string): string {
  const params = new URLSearchParams({
    response_type: "code",
    client_id: CLIENT_ID!,
    redirect_uri: REDIRECT_URI,
    scope: SCOPES,
    state,
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
  })

  return `https://twitter.com/i/oauth2/authorize?${params}`
}

async function exchangeCodeForTokens(code: string, codeVerifier: string) {
  const response = await fetch("https://api.twitter.com/2/oauth2/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      code,
      grant_type: "authorization_code",
      client_id: CLIENT_ID!,
      redirect_uri: REDIRECT_URI,
      code_verifier: codeVerifier,
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(`Token exchange failed: ${JSON.stringify(error)}`)
  }

  return response.json()
}

// Using Bun's built-in server
const server = Bun.serve({
  port: 3000,
  async fetch(req) {
    const url = new URL(req.url)

    if (url.pathname === "/login") {
      const { codeVerifier, codeChallenge } = generatePKCE()
      const state = crypto.randomBytes(16).toString("hex")

      sessions.set(state, { codeVerifier, state })

      const authUrl = getAuthorizationUrl(codeChallenge, state)

      return Response.redirect(authUrl)
    }

    if (url.pathname === "/callback") {
      const code = url.searchParams.get("code")
      const state = url.searchParams.get("state")
      const error = url.searchParams.get("error")

      if (error) {
        return new Response(`Authorization error: ${error}`, { status: 400 })
      }

      if (!code || !state) {
        return new Response("Missing code or state", { status: 400 })
      }

      const session = sessions.get(state)
      if (!session) {
        return new Response("Invalid state - session not found", { status: 400 })
      }

      try {
        const tokens = await exchangeCodeForTokens(code, session.codeVerifier)
        sessions.delete(state)

        const html = `
<!DOCTYPE html>
<html>
<head>
  <title>OAuth Success</title>
  <style>
    body { font-family: system-ui; max-width: 800px; margin: 40px auto; padding: 20px; }
    pre { background: #f5f5f5; padding: 20px; overflow-x: auto; }
    .warning { background: #fff3cd; padding: 10px; border-radius: 4px; margin: 20px 0; }
  </style>
</head>
<body>
  <h1>✓ OAuth Success!</h1>
  <p>You can now use these tokens with the X API:</p>
  <pre>${JSON.stringify(tokens, null, 2)}</pre>
  <div class="warning">
    <strong>Important:</strong> Save the refresh_token securely. Access tokens expire in ${tokens.expires_in} seconds.
  </div>
  <p>Set the access token as an environment variable:</p>
  <pre>export X_ACCESS_TOKEN="${tokens.access_token}"</pre>
</body>
</html>
`
        return new Response(html, {
          headers: { "Content-Type": "text/html" },
        })
      } catch (err) {
        return new Response(`Token exchange error: ${err}`, { status: 500 })
      }
    }

    if (url.pathname === "/") {
      return new Response(
        `
<!DOCTYPE html>
<html>
<head>
  <title>X API OAuth</title>
  <style>
    body { font-family: system-ui; max-width: 600px; margin: 40px auto; padding: 20px; }
    a { display: inline-block; background: #1DA1F2; color: white; padding: 12px 24px; border-radius: 4px; text-decoration: none; }
    a:hover { background: #1991db; }
  </style>
</head>
<body>
  <h1>X API OAuth 2.0 PKCE</h1>
  <p>Click below to authenticate with X and get an access token:</p>
  <p><a href="/login">Login with X</a></p>
</body>
</html>
`,
        { headers: { "Content-Type": "text/html" } }
      )
    }

    return new Response("Not found", { status: 404 })
  },
})

console.log("OAuth server running at http://localhost:3000")
console.log("Visit http://localhost:3000/login to start the OAuth flow")
