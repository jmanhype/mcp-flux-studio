import type {
  FluxModel,
  AspectRatio,
  ControlType,
  MaskShape,
  MaskPosition,
  GenerateArgs,
  Img2ImgArgs,
  InpaintArgs,
  ControlArgs,
} from '../src/types.js';

describe('Type Definitions', () => {
  describe('GenerateArgs', () => {
    it('should accept valid generate arguments', () => {
      const validArgs: GenerateArgs = {
        prompt: 'A beautiful landscape',
        model: 'flux.1.1-pro',
        aspect_ratio: '16:9',
        output: 'output.jpg',
      };

      expect(validArgs.prompt).toBe('A beautiful landscape');
      expect(validArgs.model).toBe('flux.1.1-pro');
    });

    it('should accept minimal required arguments', () => {
      const minimalArgs: GenerateArgs = {
        prompt: 'Test prompt',
      };

      expect(minimalArgs.prompt).toBe('Test prompt');
    });
  });

  describe('Img2ImgArgs', () => {
    it('should accept valid img2img arguments', () => {
      const validArgs: Img2ImgArgs = {
        image: 'input.jpg',
        prompt: 'Transform this',
        name: 'transformation',
        model: 'flux.1-dev',
        strength: 0.8,
      };

      expect(validArgs.image).toBe('input.jpg');
      expect(validArgs.strength).toBe(0.8);
    });
  });

  describe('InpaintArgs', () => {
    it('should accept valid inpaint arguments', () => {
      const validArgs: InpaintArgs = {
        image: 'input.jpg',
        prompt: 'Add flowers',
        mask_shape: 'circle',
        position: 'center',
      };

      expect(validArgs.mask_shape).toBe('circle');
      expect(validArgs.position).toBe('center');
    });
  });

  describe('ControlArgs', () => {
    it('should accept valid control arguments', () => {
      const validArgs: ControlArgs = {
        type: 'canny',
        image: 'control.jpg',
        prompt: 'Generate with edges',
        steps: 50,
        guidance: 7.5,
      };

      expect(validArgs.type).toBe('canny');
      expect(validArgs.steps).toBe(50);
    });
  });

  describe('Type Guards', () => {
    it('should validate FluxModel types', () => {
      const validModels: FluxModel[] = [
        'flux.1.1-pro',
        'flux.1-pro',
        'flux.1-dev',
        'flux.1.1-ultra',
      ];

      expect(validModels).toHaveLength(4);
    });

    it('should validate AspectRatio types', () => {
      const validRatios: AspectRatio[] = [
        '1:1',
        '4:3',
        '3:4',
        '16:9',
        '9:16',
      ];

      expect(validRatios).toHaveLength(5);
    });

    it('should validate ControlType types', () => {
      const validTypes: ControlType[] = ['canny', 'depth', 'pose'];

      expect(validTypes).toHaveLength(3);
    });
  });
});
