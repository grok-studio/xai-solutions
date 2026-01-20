/**
 * Search recent tweets using X API
 *
 * Run: bun examples/x-api/search-tweets.ts "typescript"
 *
 * Requires: X_BEARER_TOKEN environment variable
 */

const BEARER_TOKEN = process.env.X_BEARER_TOKEN

if (!BEARER_TOKEN) {
  console.error("Error: X_BEARER_TOKEN environment variable is required")
  process.exit(1)
}

async function searchTweets(query: string, maxResults = 10) {
  const params = new URLSearchParams({
    query,
    max_results: maxResults.toString(),
    "tweet.fields": "created_at,public_metrics,author_id",
    expansions: "author_id",
    "user.fields": "name,username",
  })

  const response = await fetch(`https://api.twitter.com/2/tweets/search/recent?${params}`, {
    headers: {
      Authorization: `Bearer ${BEARER_TOKEN}`,
    },
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(`Search failed: ${JSON.stringify(error)}`)
  }

  return response.json()
}

async function main() {
  const query = process.argv[2]

  if (!query) {
    console.error('Usage: bun examples/x-api/search-tweets.ts "your search query"')
    console.error("\nExamples:")
    console.error('  bun examples/x-api/search-tweets.ts "typescript"')
    console.error('  bun examples/x-api/search-tweets.ts "AI lang:en -is:retweet"')
    process.exit(1)
  }

  console.log(`Searching for: "${query}"\n`)

  try {
    const data = await searchTweets(query)

    if (!data.data || data.data.length === 0) {
      console.log("No tweets found")
      return
    }

    // Build user lookup for names
    const users: Record<string, { name: string; username: string }> = {}
    if (data.includes?.users) {
      for (const user of data.includes.users) {
        users[user.id] = { name: user.name, username: user.username }
      }
    }

    console.log(`Found ${data.data.length} tweets:\n`)

    for (const tweet of data.data) {
      const user = users[tweet.author_id]
      const username = user ? `@${user.username}` : tweet.author_id

      console.log(`${username}:`)
      console.log(`  ${tweet.text.slice(0, 120)}${tweet.text.length > 120 ? "..." : ""}`)
      console.log(`  ❤️ ${tweet.public_metrics?.like_count || 0}  🔁 ${tweet.public_metrics?.retweet_count || 0}`)
      console.log()
    }

    console.log(`---\nMeta: ${data.meta?.result_count} results, next_token: ${data.meta?.next_token || "none"}`)
  } catch (error) {
    console.error("Error:", error)
  }
}

main()
