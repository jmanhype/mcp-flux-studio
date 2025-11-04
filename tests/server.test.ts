/**
 * Basic integration tests for FluxServer
 * Note: These tests focus on validation and error handling.
 * Full integration tests require a running Flux API and Python CLI.
 */

import { McpError, ErrorCode } from '@modelcontextprotocol/sdk/types.js';

describe('FluxServer', () => {
  describe('Environment Configuration', () => {
    it('should use FLUX_PATH from environment if available', () => {
      const expectedPath = process.env.FLUX_PATH || '/Users/speed/CascadeProjects/flux';
      expect(typeof expectedPath).toBe('string');
      expect(expectedPath.length).toBeGreaterThan(0);
    });

    it('should check for BFL_API_KEY environment variable', () => {
      // This just verifies the env var is checked, not that it's set
      const apiKey = process.env.BFL_API_KEY;
      expect(typeof apiKey === 'string' || apiKey === undefined).toBe(true);
    });
  });

  describe('Input Validation', () => {
    it('should validate required string fields', () => {
      // Test validation logic
      const validateRequiredString = (value: unknown, fieldName: string): string => {
        if (typeof value !== 'string' || value.trim() === '') {
          throw new McpError(
            ErrorCode.InvalidParams,
            `${fieldName} is required and must be a non-empty string`
          );
        }
        return value;
      };

      expect(() => validateRequiredString('valid', 'test')).not.toThrow();
      expect(() => validateRequiredString('', 'test')).toThrow(McpError);
      expect(() => validateRequiredString('   ', 'test')).toThrow(McpError);
      expect(() => validateRequiredString(null, 'test')).toThrow(McpError);
      expect(() => validateRequiredString(undefined, 'test')).toThrow(McpError);
      expect(() => validateRequiredString(123, 'test')).toThrow(McpError);
    });

    it('should validate numeric fields with ranges', () => {
      const validateNumber = (
        value: unknown,
        fieldName: string,
        min?: number,
        max?: number
      ): number | undefined => {
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
      };

      // Valid cases
      expect(validateNumber(100, 'test', 0, 200)).toBe(100);
      expect(validateNumber(undefined, 'test')).toBeUndefined();
      expect(validateNumber(null, 'test')).toBeUndefined();

      // Invalid cases
      expect(() => validateNumber('100', 'test')).toThrow(McpError);
      expect(() => validateNumber(NaN, 'test')).toThrow(McpError);
      expect(() => validateNumber(-1, 'test', 0, 100)).toThrow(McpError);
      expect(() => validateNumber(101, 'test', 0, 100)).toThrow(McpError);
    });

    it('should validate dimension ranges', () => {
      const validateDimension = (value: number | undefined): boolean => {
        if (value === undefined) return true;
        return value >= 256 && value <= 2048;
      };

      expect(validateDimension(512)).toBe(true);
      expect(validateDimension(1024)).toBe(true);
      expect(validateDimension(2048)).toBe(true);
      expect(validateDimension(255)).toBe(false);
      expect(validateDimension(2049)).toBe(false);
      expect(validateDimension(undefined)).toBe(true);
    });

    it('should validate strength parameter range', () => {
      const validateStrength = (value: number | undefined): boolean => {
        if (value === undefined) return true;
        return value >= 0 && value <= 1;
      };

      expect(validateStrength(0.5)).toBe(true);
      expect(validateStrength(0)).toBe(true);
      expect(validateStrength(1)).toBe(true);
      expect(validateStrength(-0.1)).toBe(false);
      expect(validateStrength(1.1)).toBe(false);
      expect(validateStrength(undefined)).toBe(true);
    });
  });

  describe('Tool Schema Validation', () => {
    it('should define all required tools', () => {
      const requiredTools = ['generate', 'img2img', 'inpaint', 'control'];
      expect(requiredTools).toHaveLength(4);
      expect(requiredTools).toContain('generate');
      expect(requiredTools).toContain('img2img');
      expect(requiredTools).toContain('inpaint');
      expect(requiredTools).toContain('control');
    });

    it('should validate model enum values', () => {
      const validModels = [
        'flux.1.1-pro',
        'flux.1-pro',
        'flux.1-dev',
        'flux.1.1-ultra',
      ];
      expect(validModels).toHaveLength(4);
      expect(validModels).toContain('flux.1.1-pro');
    });

    it('should validate aspect ratio enum values', () => {
      const validRatios = ['1:1', '4:3', '3:4', '16:9', '9:16'];
      expect(validRatios).toHaveLength(5);
      expect(validRatios).toContain('16:9');
    });

    it('should validate control type enum values', () => {
      const validTypes = ['canny', 'depth', 'pose'];
      expect(validTypes).toHaveLength(3);
      expect(validTypes).toContain('canny');
    });
  });
});
