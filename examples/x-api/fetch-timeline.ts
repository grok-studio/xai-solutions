/**
 * Fetch user timeline from X API
 *
 * Run: bun examples/x-api/fetch-timeline.ts
 *
 * Requires: X_BEARER_TOKEN environment variable
 */

const BEARER_TOKEN = process.env.X_BEARER_TOKEN

if (!BEARER_TOKEN) {
  console.error("Error: X_BEARER_TOKEN environment variable is required")
  process.exit(1)
}

async function getUserByUsername(username: string) {
  const params = new URLSearchParams({
    "user.fields": "id,name,username,description,public_metrics",
  })

  const response = await fetch(
    `https://api.twitter.com/2/users/by/username/${username}?${params}`,
    {
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN}`,
      },
    }
  )

  if (!response.ok) {
    throw new Error(`Failed to fetch user: ${response.status} ${response.statusText}`)
  }

  return response.json()
}

async function getUserTimeline(userId: string, maxResults: number = 5) {
  const params = new URLSearchParams({
    max_results: maxResults.toString(),
    "tweet.fields": "created_at,public_metrics,author_id",
  })

  const response = await fetch(
    `https://api.twitter.com/2/users/${userId}/tweets?${params}`,
    {
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN}`,
      },
    }
  )

  if (!response.ok) {
    throw new Error(`Failed to fetch timeline: ${response.status} ${response.statusText}`)
  }

  return response.json()
}

async function main() {
  const username = process.argv[2] || "xai"

  console.log(`Fetching timeline for @${username}...\n`)

  try {
    // First, get the user ID
    const userData = await getUserByUsername(username)
    const user = userData.data

    console.log("User:", user.name, `(@${user.username})`)
    console.log("Followers:", user.public_metrics?.followers_count)
    console.log("---")

    // Then, fetch their timeline
    const timelineData = await getUserTimeline(user.id)

    if (timelineData.data && timelineData.data.length > 0) {
      for (const tweet of timelineData.data) {
        console.log(`\n${tweet.text.slice(0, 100)}...`)
        console.log(`  ❤️ ${tweet.public_metrics?.like_count || 0}  🔁 ${tweet.public_metrics?.retweet_count || 0}`)
      }
    } else {
      console.log("No tweets found")
    }
  } catch (error) {
    console.error("Error:", error)
  }
}

main()
