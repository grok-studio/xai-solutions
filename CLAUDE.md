# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

xAI Solutions is a documentation and CLI tool for xAI's Grok API and X (Twitter) API best practices. It's a Bun-powered TypeScript monorepo with a Fumadocs website and an Effect-based CLI.

## Architecture

```
xai-solutions/
├── apps/web/              # Fumadocs + TanStack Start documentation site
│   ├── content/docs/      # MDX documentation (shared with CLI)
│   └── src/routes/        # TanStack Start routes
├── packages/cli/          # CLI tool (published as xai-solutions)
│   └── src/               # Effect-based CLI implementation
├── examples/              # Runnable code examples
│   ├── xai/              # Grok API examples
│   └── x-api/            # X API examples
└── tests/                # Example validation tests
```

## Commands

### Development

```bash
bun install              # Install dependencies
bun run dev              # Start website at localhost:4000
bun run dev:cli          # Run CLI in dev mode
```

### CLI

```bash
bun --cwd packages/cli dev -- list              # List all topics
bun --cwd packages/cli dev -- show <topic>      # Show specific topic
bun --cwd packages/cli dev -- setup             # Clone examples to .reference/xai/
```

### Build

```bash
bun run build                    # Build all apps
bun run build:cli                # Build CLI with binaries
bun run generate:manifest        # Regenerate CLI docs manifest
```

## Technology Stack

| Component | Technology |
|-----------|------------|
| Runtime | Bun |
| Website | Fumadocs + TanStack Start |
| CLI | Effect + @effect/cli |
| Styling | Tailwind CSS v4 |
| Deployment | Alchemy + Cloudflare |

## Adding Documentation

1. Create new `.mdx` file in `apps/web/content/docs/`
2. Add frontmatter with `title`, `description`, and optionally `icon`
3. Run `bun run generate:manifest` to update CLI
4. Test with `bun run dev:cli -- list`

### MDX Frontmatter Format

```yaml
---
title: Your Topic Title
description: Brief description for listings
icon: IconName  # Lucide icon name
---
```

## CLI Manifest Generation

The CLI reads from the same docs as the website. When you add/modify MDX files:

```bash
bun --cwd packages/cli scripts/generate-manifest.ts
```

This generates `packages/cli/src/docs-manifest.ts` from `apps/web/content/docs/*.mdx`.

## Code Conventions

- Use Bun instead of Node.js/npm
- Follow existing patterns in Effect services
- Keep MDX files self-contained with code examples
- Test examples in `examples/` directory

<!-- xai-solutions:start -->
## xAI & X API Best Practices

**IMPORTANT:** Always consult xai-solutions before writing xAI or X API code.

1. Run `xai-solutions list` to see available guides
2. Run `xai-solutions show <topic>...` for relevant patterns (supports multiple topics)
3. Search `.reference/xai/` for real implementations (run `xai-solutions setup` first)

Topics: authentication, text-generation, image-generation, voice-agent, x-api-basics, x-api-oauth, x-search-tool, best-practices.

Never guess at API patterns - check the guide first.
<!-- xai-solutions:end -->
