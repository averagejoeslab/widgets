import { describe, it, expect } from 'vitest';
import { Spinner, SpinnerFrames, createSpinner } from './spinner';

describe('Spinner', () => {
  describe('createSpinner', () => {
    it('should create with default dot frames', () => {
      const spinner = createSpinner();
      expect(spinner.frame).toBe(0);
      expect(spinner.frames).toBe(SpinnerFrames.dot);
    });

    it('should create with specified type', () => {
      const spinner = createSpinner({ type: 'line' });
      expect(spinner.frames).toBe(SpinnerFrames.line);
    });

    it('should create with custom frames', () => {
      const frames = ['a', 'b', 'c'];
      const spinner = createSpinner({ frames });
      expect(spinner.frames).toEqual(frames);
    });
  });

  describe('tick', () => {
    it('should advance to next frame', () => {
      const spinner = createSpinner({ type: 'line' });
      expect(spinner.frame).toBe(0);

      const ticked = Spinner.tick(spinner);
      expect(ticked.frame).toBe(1);
    });

    it('should wrap around at end of frames', () => {
      const frames = ['a', 'b', 'c'];
      let spinner = createSpinner({ frames });

      spinner = Spinner.tick(spinner); // 1
      spinner = Spinner.tick(spinner); // 2
      spinner = Spinner.tick(spinner); // 0 (wrapped)

      expect(spinner.frame).toBe(0);
    });
  });

  describe('reset', () => {
    it('should reset to frame 0', () => {
      let spinner = createSpinner({ type: 'line' });
      spinner = Spinner.tick(spinner);
      spinner = Spinner.tick(spinner);

      const reset = Spinner.reset(spinner);
      expect(reset.frame).toBe(0);
    });
  });

  describe('view', () => {
    it('should return current frame character', () => {
      const spinner = createSpinner({ type: 'line' });
      expect(Spinner.view(spinner)).toBe('-');

      const ticked = Spinner.tick(spinner);
      expect(Spinner.view(ticked)).toBe('\\');
    });
  });

  describe('SpinnerFrames', () => {
    it('should have common frame sets', () => {
      expect(SpinnerFrames.line).toHaveLength(4);
      expect(SpinnerFrames.dot).toHaveLength(10);
      expect(SpinnerFrames.moon).toHaveLength(8);
      expect(SpinnerFrames.clock).toHaveLength(12);
    });
  });
});
