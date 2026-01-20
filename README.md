# Build With X

Best practices and patterns for xAI's Grok API and X (Twitter) API. Built for humans and AI agents.

## Quick Start

### CLI

```bash
# List all documentation topics
bunx build-with-x list

# Show specific topic(s)
bunx build-with-x show text-generation
bunx build-with-x show x-api-basics x-api-oauth

# Set up local reference for AI agents
bunx build-with-x setup
```

### Website

Visit [xai.solutions](https://xai.solutions) for the full documentation.

## Topics

### xAI Grok API

| Topic | Description |
|-------|-------------|
| `authentication` | API keys, environment setup |
| `text-generation` | Chat completions, streaming, function calling |
| `image-generation` | Aurora image generation API |
| `voice-agent` | WebSocket-based text-to-speech |

### X (Twitter) API

| Topic | Description |
|-------|-------------|
| `x-api-basics` | Timeline fetching, posting tweets |
| `x-api-oauth` | OAuth 2.0 PKCE authentication |
| `x-search-tool` | Grok's x_search function |

### General

| Topic | Description |
|-------|-------------|
| `best-practices` | Error handling, rate limits, patterns |

## For AI Agents

Add this to your project's `CLAUDE.md` or equivalent:

```markdown
## xAI & X API Best Practices

**IMPORTANT:** Always consult build-with-x before writing xAI or X API code.

1. Run `build-with-x list` to see available guides
2. Run `build-with-x show <topic>...` for relevant patterns
3. Search `.reference/xai/` for real implementations (run `build-with-x setup` first)

Topics: authentication, text-generation, image-generation, voice-agent, x-api-basics, x-api-oauth, x-search-tool, best-practices.

Never guess at API patterns - check the guide first.
```

## Development

```bash
# Install dependencies
bun install

# Start website dev server
bun run dev

# Run CLI in dev mode
bun run dev:cli

# Build everything
bun run build
```

## Contributing

Open an issue for:
- **Topic Request**: New documentation topics
- **Fix**: Corrections to existing content
- **Improvement**: Better examples or explanations

```bash
bunx build-with-x open-issue
```

## License

MIT
