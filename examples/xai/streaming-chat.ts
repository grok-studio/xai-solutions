/**
 * Streaming chat completion with Grok
 *
 * Run: bun examples/xai/streaming-chat.ts
 *
 * Requires: XAI_API_KEY environment variable
 */

import OpenAI from "openai"

const client = new OpenAI({
  apiKey: process.env.XAI_API_KEY,
  baseURL: "https://api.x.ai/v1",
})

async function main() {
  console.log("Streaming response:\n")

  const stream = await client.chat.completions.create({
    model: "grok-3-latest",
    messages: [{ role: "user", content: "Write a haiku about TypeScript." }],
    stream: true,
  })

  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content
    if (content) {
      process.stdout.write(content)
    }
  }

  console.log("\n\n✓ Stream complete")
}

main().catch(console.error)
