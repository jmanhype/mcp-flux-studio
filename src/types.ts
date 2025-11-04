/**
 * Type definitions for Flux MCP Server
 */

/**
 * Flux model identifiers
 */
export type FluxModel =
  | 'flux.1.1-pro'
  | 'flux.1-pro'
  | 'flux.1-dev'
  | 'flux.1.1-ultra';

/**
 * Aspect ratio options for image generation
 */
export type AspectRatio = '1:1' | '4:3' | '3:4' | '16:9' | '9:16';

/**
 * Control type options
 */
export type ControlType = 'canny' | 'depth' | 'pose';

/**
 * Mask shape options for inpainting
 */
export type MaskShape = 'circle' | 'rectangle';

/**
 * Mask position options for inpainting
 */
export type MaskPosition = 'center' | 'ground';

/**
 * Arguments for the generate tool
 */
export interface GenerateArgs {
  prompt: string;
  model?: FluxModel;
  aspect_ratio?: AspectRatio;
  width?: number;
  height?: number;
  output?: string;
}

/**
 * Arguments for the img2img tool
 */
export interface Img2ImgArgs {
  image: string;
  prompt: string;
  name: string;
  model?: FluxModel;
  strength?: number;
  width?: number;
  height?: number;
  output?: string;
}

/**
 * Arguments for the inpaint tool
 */
export interface InpaintArgs {
  image: string;
  prompt: string;
  mask_shape?: MaskShape;
  position?: MaskPosition;
  output?: string;
}

/**
 * Arguments for the control tool
 */
export interface ControlArgs {
  type: ControlType;
  image: string;
  prompt: string;
  steps?: number;
  guidance?: number;
  output?: string;
}

/**
 * Configuration for the Flux server
 */
export interface FluxServerConfig {
  fluxPath?: string;
  pythonPath?: string;
}

/**
 * Error response from tool execution
 */
export interface ToolErrorResponse {
  content: Array<{ type: 'text'; text: string }>;
  isError: true;
}

/**
 * Success response from tool execution
 */
export interface ToolSuccessResponse {
  content: Array<{ type: 'text'; text: string }>;
  isError?: false;
}

export type ToolResponse = ToolSuccessResponse | ToolErrorResponse;
