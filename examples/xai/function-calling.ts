/**
 * Function calling with Grok
 *
 * Run: bun examples/xai/function-calling.ts
 *
 * Requires: XAI_API_KEY environment variable
 */

import OpenAI from "openai"

const client = new OpenAI({
  apiKey: process.env.XAI_API_KEY,
  baseURL: "https://api.x.ai/v1",
})

const tools: OpenAI.ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "get_weather",
      description: "Get the current weather for a location",
      parameters: {
        type: "object",
        properties: {
          location: {
            type: "string",
            description: "City name (e.g., 'Tokyo', 'New York')",
          },
          unit: {
            type: "string",
            enum: ["celsius", "fahrenheit"],
            description: "Temperature unit",
          },
        },
        required: ["location"],
      },
    },
  },
]

// Simulated weather function
function getWeather(location: string, unit: string = "celsius"): string {
  // In a real app, this would call a weather API
  const temp = unit === "celsius" ? "22°C" : "72°F"
  return `Weather in ${location}: ${temp}, partly cloudy`
}

async function main() {
  console.log("Asking Grok about the weather...\n")

  const response = await client.chat.completions.create({
    model: "grok-3-latest",
    messages: [{ role: "user", content: "What's the weather like in Tokyo?" }],
    tools,
    tool_choice: "auto",
  })

  const message = response.choices[0].message

  if (message.tool_calls && message.tool_calls.length > 0) {
    const toolCall = message.tool_calls[0]
    console.log("Tool called:", toolCall.function.name)

    const args = JSON.parse(toolCall.function.arguments)
    console.log("Arguments:", args)

    // Execute the function
    const result = getWeather(args.location, args.unit)
    console.log("\nFunction result:", result)

    // Send the result back to Grok
    const finalResponse = await client.chat.completions.create({
      model: "grok-3-latest",
      messages: [
        { role: "user", content: "What's the weather like in Tokyo?" },
        message,
        {
          role: "tool",
          tool_call_id: toolCall.id,
          content: result,
        },
      ],
    })

    console.log("\nGrok's response:", finalResponse.choices[0].message.content)
  } else {
    console.log("Grok's response:", message.content)
  }
}

main().catch(console.error)
