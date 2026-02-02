import { describe, it, expect } from 'vitest';
import { Progress, ProgressStyles, createProgress } from './progress';

describe('Progress', () => {
  describe('createProgress', () => {
    it('should create with default options', () => {
      const progress = createProgress();
      expect(progress.progress).toBe(0);
      expect(progress.width).toBe(40);
      expect(progress.showPercent).toBe(true);
    });

    it('should create with custom options', () => {
      const progress = createProgress({
        width: 20,
        style: 'ascii',
        showPercent: false,
      });
      expect(progress.width).toBe(20);
      expect(progress.chars).toBe(ProgressStyles.ascii);
      expect(progress.showPercent).toBe(false);
    });

    it('should accept custom characters', () => {
      const progress = createProgress({
        chars: { full: '*', empty: '.' },
      });
      expect(progress.chars.full).toBe('*');
      expect(progress.chars.empty).toBe('.');
    });
  });

  describe('setProgress', () => {
    it('should set progress value', () => {
      const progress = createProgress();
      const updated = Progress.set(progress, 0.5);
      expect(updated.progress).toBe(0.5);
    });

    it('should clamp to 0-1 range', () => {
      const progress = createProgress();

      const over = Progress.set(progress, 1.5);
      expect(over.progress).toBe(1);

      const under = Progress.set(progress, -0.5);
      expect(under.progress).toBe(0);
    });
  });

  describe('setPercent', () => {
    it('should set progress from percentage', () => {
      const progress = createProgress();
      const updated = Progress.setPercent(progress, 75);
      expect(updated.progress).toBe(0.75);
    });
  });

  describe('increment/decrement', () => {
    it('should increment by default amount', () => {
      let progress = createProgress();
      progress = Progress.set(progress, 0.5);
      progress = Progress.increment(progress);
      expect(progress.progress).toBe(0.51);
    });

    it('should decrement by specified amount', () => {
      let progress = createProgress();
      progress = Progress.set(progress, 0.5);
      progress = Progress.decrement(progress, 0.1);
      expect(progress.progress).toBeCloseTo(0.4);
    });
  });

  describe('reset/complete', () => {
    it('should reset to 0', () => {
      let progress = createProgress();
      progress = Progress.set(progress, 0.5);
      progress = Progress.reset(progress);
      expect(progress.progress).toBe(0);
    });

    it('should complete to 1', () => {
      const progress = createProgress();
      const completed = Progress.complete(progress);
      expect(completed.progress).toBe(1);
    });
  });

  describe('view', () => {
    it('should render progress bar with percentage', () => {
      let progress = createProgress({ width: 10, showPercent: true });
      progress = Progress.set(progress, 0.5);

      const view = Progress.view(progress);
      expect(view).toContain('50%');
      expect(view).toContain('█'.repeat(5));
      expect(view).toContain('░'.repeat(5));
    });

    it('should render without percentage', () => {
      let progress = createProgress({ width: 10, showPercent: false });
      progress = Progress.set(progress, 0.5);

      const view = Progress.view(progress);
      expect(view).not.toContain('%');
    });

    it('should render with brackets', () => {
      let progress = createProgress({
        width: 10,
        showPercent: false,
        leftBracket: '[',
        rightBracket: ']',
      });
      progress = Progress.set(progress, 0.5);

      const view = Progress.view(progress);
      expect(view.startsWith('[')).toBe(true);
      expect(view.endsWith(']')).toBe(true);
    });
  });

  describe('render', () => {
    it('should render a simple progress bar', () => {
      const view = Progress.render(0.5, { width: 10, showPercent: false });
      expect(view).toBe('█████░░░░░');
    });
  });

  describe('ProgressStyles', () => {
    it('should have built-in styles', () => {
      expect(ProgressStyles.default).toBeDefined();
      expect(ProgressStyles.ascii).toBeDefined();
      expect(ProgressStyles.dots).toBeDefined();
      expect(ProgressStyles.blocks).toBeDefined();
    });
  });
});
