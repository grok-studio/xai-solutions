/**
 * Post a tweet using X API
 *
 * Run: bun examples/x-api/post-tweet.ts "Your tweet text here"
 *
 * Requires: OAuth 2.0 access token (see oauth-pkce-flow.ts)
 *
 * Note: This example shows the API structure. You need to implement
 * OAuth 2.0 PKCE flow first to get a valid access token.
 */

async function postTweet(text: string, accessToken: string) {
  const response = await fetch("https://api.twitter.com/2/tweets", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(`Failed to post tweet: ${JSON.stringify(error)}`)
  }

  return response.json()
}

async function _replyToTweet(text: string, replyToId: string, accessToken: string) {
  const response = await fetch("https://api.twitter.com/2/tweets", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      text,
      reply: {
        in_reply_to_tweet_id: replyToId,
      },
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(`Failed to reply: ${JSON.stringify(error)}`)
  }

  return response.json()
}

async function main() {
  const tweetText = process.argv[2]

  if (!tweetText) {
    console.error('Usage: bun examples/x-api/post-tweet.ts "Your tweet text"')
    process.exit(1)
  }

  const accessToken = process.env.X_ACCESS_TOKEN

  if (!accessToken) {
    console.error("Error: X_ACCESS_TOKEN environment variable is required")
    console.error("Run oauth-pkce-flow.ts first to get an access token")
    process.exit(1)
  }

  console.log("Posting tweet:", tweetText)

  try {
    const result = await postTweet(tweetText, accessToken)
    console.log("\n✓ Tweet posted successfully!")
    console.log("Tweet ID:", result.data.id)
    console.log("URL:", `https://twitter.com/i/web/status/${result.data.id}`)
  } catch (error) {
    console.error("Error:", error)
  }
}

main()
