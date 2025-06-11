# MCP Flux Studio

A minimal Model Context Protocol (MCP) server for [Black Forest Labs](https://bfl.ai) Flux models.  
This project provides two tools powered by the Flux **flux.1 Kontext** API:

- **generateImage** – generate an image from a text prompt.
- **editImage** – edit an existing image using a prompt and optional mask.

The server is written in TypeScript and uses the official [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk).

## Quick start

```bash
npm install
npm run build
node build/index.js
```

## Configuration

The server requires a Black Forest Labs API key to be configured in your MCP client settings.  
The server exposes MCP tools over stdio and can be used with any IDE that supports MCP, including Claude Desktop, Cursor and Windsurf.

### Client Setup

#### Claude Desktop
1. Open the MCP settings and add a new server
2. Command: `node /path/to/mcp-flux-studio/build/index.js`
3. In the configuration panel:
   - Click on the "Configuration" tab
   - Enter your API key in the `apiKey` field
   - Click "Save" to apply the configuration

#### Cursor
1. Go to Settings → Features → MCP
2. Add a new server with the same command as above
3. In the configuration panel:
   - Click on the "Configuration" tab
   - Enter your API key in the `apiKey` field
   - Click "Save" to apply the configuration

#### Windsurf
1. Edit `~/.codeium/windsurf/mcp_config.json` and add:
```json
{
  "servers": [
    {
      "name": "Flux MCP Server",
      "command": "node",
      "args": ["/path/to/mcp-flux-studio/build/index.js"],
      "config": {
        "apiKey": "your_api_key"
      }
    }
  ]
}
```
2. Save the file and refresh

### Full Configuration Examples

#### Claude Desktop
```json
{
  "servers": [
    {
      "name": "Flux MCP Server",
      "command": "node",
      "args": ["/path/to/mcp-flux-studio/build/index.js"],
      "config": {
        "apiKey": "your_api_key"
      }
    }
  ]
}
```

#### Cursor
```json
{
  "servers": [
    {
      "name": "Flux MCP Server",
      "command": "node",
      "args": ["/path/to/mcp-flux-studio/build/index.js"],
      "config": {
        "apiKey": "your_api_key"
      }
    }
  ]
}
```

#### Windsurf
```json
{
  "servers": [
    {
      "name": "Flux MCP Server",
      "command": "node",
      "args": ["/path/to/mcp-flux-studio/build/index.js"],
      "config": {
        "apiKey": "your_api_key"
      }
    }
  ]
}
```

### Verifying Configuration

To verify that your configuration is working:
1. Open your IDE's MCP tools panel
2. Look for the "Flux Kontext" tools
3. Try generating a simple image with a basic prompt
4. If you see an error about missing API key, double-check your configuration

## API Reference

### generateImage
Generate an image from a text prompt.

**Parameters**
- `prompt` (string, required) – text describing the desired image.
- `negative_prompt` (string, optional) – undesirable elements to avoid.
- `width` (number, optional, default 1024)
- `height` (number, optional, default 1024)
- `steps` (number, optional, default 30) – number of diffusion steps.
- `guidance_scale` (number, optional, default 7.5)

Returns the URL of the generated image.

### editImage
Edit an existing image using a prompt and optional mask.

**Parameters**
- `image` (string, required) – path to the base image or base64 data URL.
- `mask` (string, optional) – path or base64 mask image.
- `prompt` (string, required) – text describing the desired changes.
- `negative_prompt` (string, optional)
- `width` (number, optional, default 1024)
- `height` (number, optional, default 1024)
- `steps` (number, optional, default 30)
- `guidance_scale` (number, optional, default 7.5)

Returns the URL of the edited image.

## License

MIT
