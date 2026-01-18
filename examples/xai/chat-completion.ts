/**
 * Basic chat completion with Grok
 *
 * Run: bun examples/xai/chat-completion.ts
 *
 * Requires: XAI_API_KEY environment variable
 */

import OpenAI from "openai"

const client = new OpenAI({
  apiKey: process.env.XAI_API_KEY,
  baseURL: "https://api.x.ai/v1",
})

async function main() {
  const completion = await client.chat.completions.create({
    model: "grok-3-latest",
    messages: [
      { role: "system", content: "You are a helpful assistant. Be concise." },
      { role: "user", content: "What is the capital of France?" },
    ],
  })

  console.log("Response:", completion.choices[0].message.content)
  console.log("\nUsage:", {
    promptTokens: completion.usage?.prompt_tokens,
    completionTokens: completion.usage?.completion_tokens,
    totalTokens: completion.usage?.total_tokens,
  })
}

main().catch(console.error)
