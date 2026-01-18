/**
 * Image generation with Aurora (Grok's image model)
 *
 * Run: bun examples/xai/image-generation.ts
 *
 * Requires: XAI_API_KEY environment variable
 */

import OpenAI from "openai"

const client = new OpenAI({
  apiKey: process.env.XAI_API_KEY,
  baseURL: "https://api.x.ai/v1",
})

async function main() {
  console.log("Generating image...")

  const response = await client.images.generate({
    model: "grok-2-image",
    prompt: "A futuristic cityscape at sunset with flying cars, digital art style",
    n: 1,
    size: "1024x1024",
  })

  console.log("\n✓ Image generated")
  console.log("URL:", response.data[0].url)
  console.log("\nNote: URL expires after a short period. Download if needed.")
}

main().catch(console.error)
