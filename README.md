# mcp-flux-studio

[![smithery badge](https://smithery.ai/badge/@jmanhype/mcp-flux-studio)](https://smithery.ai/server/@jmanhype/mcp-flux-studio)

MCP server that wraps the Flux image generation API. Exposes text-to-image, image-to-image, inpainting, and structural control (canny/depth/pose) as MCP tools over stdio. The server itself is TypeScript; it shells out to a Python CLI (`fluxcli.py`) for actual API calls.

## What It Does

Receives MCP tool calls, builds command-line arguments, spawns `python3 fluxcli.py <subcommand> ...` against a local Flux installation, and returns the output. Requires a `BFL_API_KEY` for the Flux API and a local copy of the Flux CLI.

## Status

| Area | State |
|------|-------|
| MCP transport | stdio |
| Language | TypeScript (server) + Python (CLI wrapper) |
| Flux models | flux.1.1-pro, flux.1-pro, flux.1-dev, flux.1.1-ultra |
| Tests | Jest, 2 test files |
| IDE tested | Cursor v0.45.7+, Windsurf/Codeium Wave 3+ |
| npm package | `flux-mcp-server` v1.0.0 |
| License | MIT |

## MCP Tools

| Tool | Required Params | Optional Params | Output |
|------|----------------|-----------------|--------|
| `generate` | `prompt` | `model`, `aspect_ratio`, `width`, `height`, `output` | Generated image path |
| `img2img` | `image`, `prompt`, `name` | `model`, `strength` (0-1), `width`, `height`, `output` | Transformed image path |
| `inpaint` | `image`, `prompt` | `mask_shape` (circle/rectangle), `position` (center/ground), `output` | Inpainted image path |
| `control` | `type` (canny/depth/pose), `image`, `prompt` | `steps` (1-100), `guidance`, `output` | Controlled image path |

Width and height are validated to 256-2048 range.

## Setup

### Via Smithery

```bash
npx -y @smithery/cli install @jmanhype/mcp-flux-studio --client claude
```

### Manual

```bash
git clone https://github.com/jmanhype/mcp-flux-studio.git
cd mcp-flux-studio
npm install
npm run build
npm start
```

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `BFL_API_KEY` | Yes | Flux API key |
| `FLUX_PATH` | No | Path to Flux CLI installation (default: `/Users/speed/CascadeProjects/flux`) |
| `VIRTUAL_ENV` | No | If set, uses `$VIRTUAL_ENV/bin/python` instead of `python3` |

### IDE Configuration

**Cursor**: Settings > Features > MCP. Supports stdio and SSE.

**Windsurf/Codeium**: Edit `~/.codeium/windsurf/mcp_config.json`.

## Architecture

```
src/
  index.ts   — MCP server, tool handlers, Python process spawning
  types.ts   — TypeScript interfaces for tool arguments
  cli/
    fluxcli.py — Python CLI that calls the Flux API (not in this repo's src)
tests/
  server.test.ts
  types.test.ts
```

## Limitations

- Shells out to Python for every tool call; each call spawns a new process
- The default `FLUX_PATH` is hardcoded to a local directory
- No connection pooling or request queuing for the Flux API
- No image previews returned in MCP responses — only file paths
- The `ControlType` type is referenced but not imported in `index.ts`
- No progress reporting during generation

## Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `@modelcontextprotocol/sdk` | ^0.1.0 | MCP server protocol |
| `dotenv` | ^16.0.3 | Environment variable loading |
| `typescript` | ^5.0.3 | Build toolchain |
| `jest` | ^29.5.0 | Test runner |

## License

MIT
