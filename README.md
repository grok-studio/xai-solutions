# xAI Solutions

Best practices and patterns for xAI's Grok API and X (Twitter) API. Built for humans and AI agents.

## Quick Start

### CLI

```bash
# List all documentation topics
bunx xai-solutions list

# Show specific topic(s)
bunx xai-solutions show text-generation
bunx xai-solutions show x-api-basics x-api-oauth

# Set up local reference for AI agents
bunx xai-solutions setup
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

**IMPORTANT:** Always consult xai-solutions before writing xAI or X API code.

1. Run `xai-solutions list` to see available guides
2. Run `xai-solutions show <topic>...` for relevant patterns
3. Search `.reference/xai/` for real implementations (run `xai-solutions setup` first)

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
bunx xai-solutions open-issue
```

## License

MIT
