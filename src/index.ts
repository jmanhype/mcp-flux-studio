#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ErrorCode, ListToolsRequestSchema, McpError, } from '@modelcontextprotocol/sdk/types.js';
import { spawn } from 'child_process';
import type {
  GenerateArgs,
  Img2ImgArgs,
  InpaintArgs,
  ControlArgs,
  FluxServerConfig,
  ToolResponse
} from './types.js';

class FluxServer {
    private server: Server;
    private fluxPath: string;

    constructor(config?: FluxServerConfig) {
        this.server = new Server({
            name: 'flux-server',
            version: '0.1.0',
        }, {
            capabilities: {
                tools: {},
            },
        });
        // Path to Flux installation
        this.fluxPath = config?.fluxPath || process.env.FLUX_PATH || '/Users/speed/CascadeProjects/flux';

        // Validate configuration
        if (!process.env.BFL_API_KEY) {
            console.error('[Warning] BFL_API_KEY environment variable not set');
        }

        this.setupToolHandlers();
        // Error handling
        this.server.onerror = (error) => console.error('[MCP Error]', error);
        process.on('SIGINT', async () => {
            await this.server.close();
            process.exit(0);
        });
    }

    private async runPythonCommand(args: string[]): Promise<string> {
        return new Promise((resolve, reject) => {
            // Validate arguments
            if (!args || args.length === 0) {
                reject(new Error('No command arguments provided'));
                return;
            }

            // Use python from virtual environment if available
            const pythonPath = process.env.VIRTUAL_ENV ?
                `${process.env.VIRTUAL_ENV}/bin/python` : 'python3';

            const childProcess = spawn(pythonPath, ['fluxcli.py', ...args], {
                cwd: this.fluxPath,
                env: process.env, // Pass through all environment variables
            });

            let output = '';
            let errorOutput = '';

            childProcess.stdout?.on('data', (data) => {
                output += data.toString();
            });

            childProcess.stderr?.on('data', (data) => {
                errorOutput += data.toString();
            });

            childProcess.on('error', (error) => {
                reject(new Error(`Failed to spawn Python process: ${error.message}`));
            });

            childProcess.on('close', (code) => {
                if (code === 0) {
                    resolve(output);
                } else {
                    reject(new Error(`Flux command failed (exit code ${code}): ${errorOutput}`));
                }
            });
        });
    }

    /**
     * Validates that a required string parameter is provided
     */
    private validateRequiredString(value: unknown, fieldName: string): string {
        if (typeof value !== 'string' || value.trim() === '') {
            throw new McpError(
                ErrorCode.InvalidParams,
                `${fieldName} is required and must be a non-empty string`
            );
        }
        return value;
    }

    /**
     * Validates numeric parameters within acceptable ranges
     */
    private validateNumber(value: unknown, fieldName: string, min?: number, max?: number): number | undefined {
        if (value === undefined || value === null) {
            return undefined;
        }
        if (typeof value !== 'number' || isNaN(value)) {
            throw new McpError(
                ErrorCode.InvalidParams,
                `${fieldName} must be a valid number`
            );
        }
        if (min !== undefined && value < min) {
            throw new McpError(
                ErrorCode.InvalidParams,
                `${fieldName} must be at least ${min}`
            );
        }
        if (max !== undefined && value > max) {
            throw new McpError(
                ErrorCode.InvalidParams,
                `${fieldName} must be at most ${max}`
            );
        }
        return value;
    }

    setupToolHandlers() {
        this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
            tools: [
                {
                    name: 'generate',
                    description: 'Generate an image from a text prompt',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            prompt: {
                                type: 'string',
                                description: 'Text prompt for image generation',
                            },
                            model: {
                                type: 'string',
                                description: 'Model to use for generation',
                                enum: ['flux.1.1-pro', 'flux.1-pro', 'flux.1-dev', 'flux.1.1-ultra'],
                                default: 'flux.1.1-pro',
                            },
                            aspect_ratio: {
                                type: 'string',
                                description: 'Aspect ratio of the output image',
                                enum: ['1:1', '4:3', '3:4', '16:9', '9:16'],
                            },
                            width: {
                                type: 'number',
                                description: 'Image width (ignored if aspect-ratio is set)',
                            },
                            height: {
                                type: 'number',
                                description: 'Image height (ignored if aspect-ratio is set)',
                            },
                            output: {
                                type: 'string',
                                description: 'Output filename',
                                default: 'generated.jpg',
                            },
                        },
                        required: ['prompt'],
                    },
                },
                {
                    name: 'img2img',
                    description: 'Generate an image using another image as reference',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            image: {
                                type: 'string',
                                description: 'Input image path',
                            },
                            prompt: {
                                type: 'string',
                                description: 'Text prompt for generation',
                            },
                            model: {
                                type: 'string',
                                description: 'Model to use for generation',
                                enum: ['flux.1.1-pro', 'flux.1-pro', 'flux.1-dev', 'flux.1.1-ultra'],
                                default: 'flux.1.1-pro',
                            },
                            strength: {
                                type: 'number',
                                description: 'Generation strength',
                                default: 0.85,
                            },
                            width: {
                                type: 'number',
                                description: 'Output image width',
                            },
                            height: {
                                type: 'number',
                                description: 'Output image height',
                            },
                            output: {
                                type: 'string',
                                description: 'Output filename',
                                default: 'outputs/generated.jpg',
                            },
                            name: {
                                type: 'string',
                                description: 'Name for the generation',
                            },
                        },
                        required: ['image', 'prompt', 'name'],
                    },
                },
                {
                    name: 'inpaint',
                    description: 'Inpaint an image using a mask',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            image: {
                                type: 'string',
                                description: 'Input image path',
                            },
                            prompt: {
                                type: 'string',
                                description: 'Text prompt for inpainting',
                            },
                            mask_shape: {
                                type: 'string',
                                description: 'Shape of the mask',
                                enum: ['circle', 'rectangle'],
                                default: 'circle',
                            },
                            position: {
                                type: 'string',
                                description: 'Position of the mask',
                                enum: ['center', 'ground'],
                                default: 'center',
                            },
                            output: {
                                type: 'string',
                                description: 'Output filename',
                                default: 'inpainted.jpg',
                            },
                        },
                        required: ['image', 'prompt'],
                    },
                },
                {
                    name: 'control',
                    description: 'Generate an image using structural control',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            type: {
                                type: 'string',
                                description: 'Type of control to use',
                                enum: ['canny', 'depth', 'pose'],
                            },
                            image: {
                                type: 'string',
                                description: 'Input control image path',
                            },
                            prompt: {
                                type: 'string',
                                description: 'Text prompt for generation',
                            },
                            steps: {
                                type: 'number',
                                description: 'Number of inference steps',
                                default: 50,
                            },
                            guidance: {
                                type: 'number',
                                description: 'Guidance scale',
                            },
                            output: {
                                type: 'string',
                                description: 'Output filename',
                            },
                        },
                        required: ['type', 'image', 'prompt'],
                    },
                },
            ],
        }));

        this.server.setRequestHandler(CallToolRequestSchema, async (request): Promise<ToolResponse> => {
            try {
                switch (request.params.name) {
                    case 'generate': {
                        const args = request.params.arguments as GenerateArgs;
                        // Validate required fields
                        const prompt = this.validateRequiredString(args.prompt, 'prompt');

                        // Validate optional numeric fields
                        const width = this.validateNumber(args.width, 'width', 256, 2048);
                        const height = this.validateNumber(args.height, 'height', 256, 2048);

                        const cmdArgs = ['generate'];
                        cmdArgs.push('--prompt', prompt);
                        if (args.model) cmdArgs.push('--model', args.model);
                        if (args.aspect_ratio) cmdArgs.push('--aspect-ratio', args.aspect_ratio);
                        if (width) cmdArgs.push('--width', width.toString());
                        if (height) cmdArgs.push('--height', height.toString());
                        if (args.output) cmdArgs.push('--output', args.output);

                        const output = await this.runPythonCommand(cmdArgs);
                        return {
                            content: [{ type: 'text', text: output }],
                        };
                    }
                    case 'img2img': {
                        const args = request.params.arguments as Img2ImgArgs;
                        // Validate required fields
                        const image = this.validateRequiredString(args.image, 'image');
                        const prompt = this.validateRequiredString(args.prompt, 'prompt');
                        const name = this.validateRequiredString(args.name, 'name');

                        // Validate optional numeric fields
                        const strength = this.validateNumber(args.strength, 'strength', 0, 1);
                        const width = this.validateNumber(args.width, 'width', 256, 2048);
                        const height = this.validateNumber(args.height, 'height', 256, 2048);

                        const cmdArgs = ['img2img'];
                        cmdArgs.push('--image', image);
                        cmdArgs.push('--prompt', prompt);
                        cmdArgs.push('--name', name);
                        if (args.model) cmdArgs.push('--model', args.model);
                        if (strength !== undefined) cmdArgs.push('--strength', strength.toString());
                        if (width) cmdArgs.push('--width', width.toString());
                        if (height) cmdArgs.push('--height', height.toString());
                        if (args.output) cmdArgs.push('--output', args.output);

                        const output = await this.runPythonCommand(cmdArgs);
                        return {
                            content: [{ type: 'text', text: output }],
                        };
                    }
                    case 'inpaint': {
                        const args = request.params.arguments as InpaintArgs;
                        // Validate required fields
                        const image = this.validateRequiredString(args.image, 'image');
                        const prompt = this.validateRequiredString(args.prompt, 'prompt');

                        const cmdArgs = ['inpaint'];
                        cmdArgs.push('--image', image);
                        cmdArgs.push('--prompt', prompt);
                        if (args.mask_shape) cmdArgs.push('--mask-shape', args.mask_shape);
                        if (args.position) cmdArgs.push('--position', args.position);
                        if (args.output) cmdArgs.push('--output', args.output);

                        const output = await this.runPythonCommand(cmdArgs);
                        return {
                            content: [{ type: 'text', text: output }],
                        };
                    }
                    case 'control': {
                        const args = request.params.arguments as ControlArgs;
                        // Validate required fields
                        const type = this.validateRequiredString(args.type, 'type') as ControlType;
                        const image = this.validateRequiredString(args.image, 'image');
                        const prompt = this.validateRequiredString(args.prompt, 'prompt');

                        // Validate optional numeric fields
                        const steps = this.validateNumber(args.steps, 'steps', 1, 100);
                        const guidance = this.validateNumber(args.guidance, 'guidance', 0, 100);

                        const cmdArgs = ['control'];
                        cmdArgs.push('--type', type);
                        cmdArgs.push('--image', image);
                        cmdArgs.push('--prompt', prompt);
                        if (steps) cmdArgs.push('--steps', steps.toString());
                        if (guidance !== undefined) cmdArgs.push('--guidance', guidance.toString());
                        if (args.output) cmdArgs.push('--output', args.output);

                        const output = await this.runPythonCommand(cmdArgs);
                        return {
                            content: [{ type: 'text', text: output }],
                        };
                    }
                    default:
                        throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${request.params.name}`);
                }
            } catch (error) {
                // Handle McpError differently - rethrow to let SDK handle it
                if (error instanceof McpError) {
                    throw error;
                }

                // Log detailed error for debugging
                console.error('[Tool Execution Error]', error);

                return {
                    content: [
                        {
                            type: 'text',
                            text: `Error: ${error instanceof Error ? error.message : String(error)}`,
                        },
                    ],
                    isError: true,
                };
            }
        });
    }

    async run() {
        const transport = new StdioServerTransport();
        await this.server.connect(transport);
        console.error('Flux MCP server running on stdio');
    }
}

const server = new FluxServer();
server.run().catch(console.error);
