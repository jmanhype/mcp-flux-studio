# MCP Flux Studio

[![smithery badge](https://smithery.ai/badge/@jmanhype/mcp-flux-studio)](https://smithery.ai/server/@jmanhype/mcp-flux-studio)

A powerful Model Context Protocol (MCP) server that brings Flux's advanced image generation capabilities to your AI coding assistants. This server enables direct integration of Flux's image generation, manipulation, and control features into Cursor and Windsurf (Codeium) IDEs.

<a href="https://glama.ai/mcp/servers/@jmanhype/mcp-flux-studio">
  <img width="380" height="200" src="https://glama.ai/mcp/servers/@jmanhype/mcp-flux-studio/badge" alt="Flux Studio MCP server" />
</a>

## Overview

MCP Flux Studio bridges the gap between AI coding assistants and Flux's powerful image generation API, allowing seamless integration of image generation capabilities directly into your development workflow.

### Features

- **Image Generation**
  - Text-to-image generation with precise control
  - Multiple model support (flux.1.1-pro, flux.1-pro, flux.1-dev, flux.1.1-ultra)
  - Customizable aspect ratios and dimensions

- **Image Manipulation**
  - Image-to-image transformation
  - Inpainting with customizable masks
  - Resolution upscaling and enhancement

- **Advanced Controls**
  - Edge-based generation (canny)
  - Depth-aware generation
  - Pose-guided generation

- **IDE Integration**
  - Full support for Cursor (v0.45.7+)
  - Compatible with Windsurf/Codeium Cascade (Wave 3+)
  - Seamless tool invocation through AI assistants

## Quick Start

1. **Prerequisites**
   - Node.js 18+
   - Python 3.12+
   - Flux API key
   - Compatible IDE (Cursor or Windsurf)

2. **Installation**

### Installing via Smithery

To install Flux Studio for Claude Desktop automatically via [Smithery](https://smithery.ai/server/@jmanhype/mcp-flux-studio):

```bash
npx -y @smithery/cli install @jmanhype/mcp-flux-studio --client claude
```

### Manual Installation
   ```bash
   git clone https://github.com/jmanhype/mcp-flux-studio.git
   cd mcp-flux-studio
   npm install
   npm run build
   ```

3. **Basic Configuration**
   ```env
   BFL_API_KEY=your_flux_api_key
   FLUX_PATH=/path/to/flux/installation
   ```

For detailed setup instructions, including IDE-specific configuration and troubleshooting, see our [Installation Guide](docs/INSTALLATION.md).

## Documentation

- [Installation Guide](docs/INSTALLATION.md) - Comprehensive setup instructions
- [API Documentation](docs/API.md) - Detailed tool documentation
- [Example Usage](examples/tool-examples.md) - Real-world usage examples
- [Contributing Guidelines](docs/CONTRIBUTING.md) - How to contribute

## IDE Integration

### Cursor (v0.45.7+)

MCP Flux Studio integrates seamlessly with Cursor's AI assistant:

1. **Configuration**
   - Configure via Settings > Features > MCP
   - Supports both stdio and SSE connections
   - Environment variables can be set via wrapper scripts

2. **Usage**
   - Tools automatically available to Cursor's AI assistant
   - Tool invocations require user approval
   - Real-time feedback on generation progress

### Windsurf/Codeium (Wave 3+)

Integration with Windsurf's Cascade AI:

1. **Configuration**
   - Edit `~/.codeium/windsurf/mcp_config.json`
   - Supports process-based tool execution
   - Environment variables configured in JSON

2. **Usage**
   - Access tools through Cascade's MCP toolbar
   - Automatic tool discovery and loading
   - Integrated with Cascade's AI capabilities

For detailed IDE-specific setup instructions, see the [Installation Guide](docs/INSTALLATION.md).

## Usage

The server provides the following tools:

### generate
Generate an image from a text prompt.
```json
{
  "prompt": "A photorealistic cat",
  "model": "flux.1.1-pro",
  "aspect_ratio": "1:1",
  "output": "generated.jpg"
}
```

### img2img
Generate an image using another image as reference.
```json
{
  "image": "input.jpg",
  "prompt": "Convert to oil painting",
  "model": "flux.1.1-pro",
  "strength": 0.85,
  "output": "output.jpg",
  "name": "oil_painting"
}
```

### inpaint
Inpaint an image using a mask.
```json
{
  "image": "input.jpg",
  "prompt": "Add flowers",
  "mask_shape": "circle",
  "position": "center",
  "output": "inpainted.jpg"
}
```

### control
Generate an image using structural control.
```json
{
  "type": "canny",
  "image": "control.jpg",
  "prompt": "A realistic photo",
  "output": "controlled.jpg"
}
```

## Development

### Project Structure

```
flux-mcp-server/
├── src/
│   ├── index.ts          # Main server implementation
│   └── types.ts          # TypeScript type definitions
├── tests/
│   └── server.test.ts    # Server tests
├── docs/
│   ├── API.md           # API documentation
│   └── CONTRIBUTING.md  # Contribution guidelines
├── examples/
│   ├── generate.json    # Example tool usage
│   └── config.json      # Example configuration
├── package.json
├── tsconfig.json
└── README.md
```

### Running Tests

```bash
npm test
```

### Building

```bash
npm run build
```

## Contributing

Please read [CONTRIBUTING.md](docs/CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Model Context Protocol](https://github.com/modelcontextprotocol/mcp) - The protocol specification
- [Flux API](https://flux.ai) - The underlying image generation API