import { describe, it, expect } from 'vitest';
import { Viewport, createViewport } from './viewport';

describe('Viewport', () => {
  const testContent = 'Line 1\nLine 2\nLine 3\nLine 4\nLine 5\nLine 6\nLine 7\nLine 8\nLine 9\nLine 10';

  describe('createViewport', () => {
    it('should create with default options', () => {
      const viewport = createViewport();
      expect(viewport.content).toBe('');
      expect(viewport.height).toBe(10);
      expect(viewport.yOffset).toBe(0);
    });

    it('should create with content', () => {
      const viewport = createViewport({ content: testContent });
      expect(viewport.lines).toHaveLength(10);
    });

    it('should create with custom size', () => {
      const viewport = createViewport({ width: 80, height: 20 });
      expect(viewport.width).toBe(80);
      expect(viewport.height).toBe(20);
    });
  });

  describe('setContent', () => {
    it('should set new content', () => {
      const viewport = createViewport();
      const updated = Viewport.setContent(viewport, testContent);
      expect(updated.lines).toHaveLength(10);
    });

    it('should reset offset when content shrinks', () => {
      let viewport = createViewport({ content: testContent, height: 5 });
      viewport = Viewport.scrollToBottom(viewport);
      viewport = Viewport.setContent(viewport, 'Line 1\nLine 2');
      expect(viewport.yOffset).toBe(0);
    });
  });

  describe('scrolling', () => {
    it('should scroll down', () => {
      let viewport = createViewport({ content: testContent, height: 5 });
      viewport = Viewport.scrollDown(viewport);
      expect(viewport.yOffset).toBe(1);
    });

    it('should scroll up', () => {
      let viewport = createViewport({ content: testContent, height: 5 });
      viewport = Viewport.scrollDown(viewport, 3);
      viewport = Viewport.scrollUp(viewport);
      expect(viewport.yOffset).toBe(2);
    });

    it('should not scroll past top', () => {
      let viewport = createViewport({ content: testContent, height: 5 });
      viewport = Viewport.scrollUp(viewport);
      expect(viewport.yOffset).toBe(0);
    });

    it('should not scroll past bottom', () => {
      let viewport = createViewport({ content: testContent, height: 5 });
      viewport = Viewport.scrollDown(viewport, 100);
      expect(viewport.yOffset).toBe(5); // 10 lines - 5 height = 5 max offset
    });
  });

  describe('scrollToTop/scrollToBottom', () => {
    it('should scroll to top', () => {
      let viewport = createViewport({ content: testContent, height: 5 });
      viewport = Viewport.scrollDown(viewport, 5);
      viewport = Viewport.scrollToTop(viewport);
      expect(viewport.yOffset).toBe(0);
    });

    it('should scroll to bottom', () => {
      let viewport = createViewport({ content: testContent, height: 5 });
      viewport = Viewport.scrollToBottom(viewport);
      expect(viewport.yOffset).toBe(5);
    });
  });

  describe('pageUp/pageDown', () => {
    it('should scroll by page', () => {
      let viewport = createViewport({ content: testContent, height: 3 });
      viewport = Viewport.pageDown(viewport);
      expect(viewport.yOffset).toBe(3);
    });

    it('should half page scroll', () => {
      let viewport = createViewport({ content: testContent, height: 4 });
      viewport = Viewport.halfPageDown(viewport);
      expect(viewport.yOffset).toBe(2);
    });
  });

  describe('scrollToLine/scrollToCenter', () => {
    it('should scroll to specific line', () => {
      let viewport = createViewport({ content: testContent, height: 3 });
      viewport = Viewport.scrollToLine(viewport, 4);
      expect(viewport.yOffset).toBe(4);
    });

    it('should scroll to center a line', () => {
      let viewport = createViewport({ content: testContent, height: 5 });
      viewport = Viewport.scrollToCenter(viewport, 5);
      expect(viewport.yOffset).toBe(3); // 5 - floor(5/2) = 3
    });
  });

  describe('atTop/atBottom', () => {
    it('should detect top', () => {
      const viewport = createViewport({ content: testContent, height: 5 });
      expect(Viewport.atTop(viewport)).toBe(true);
      expect(Viewport.atBottom(viewport)).toBe(false);
    });

    it('should detect bottom', () => {
      let viewport = createViewport({ content: testContent, height: 5 });
      viewport = Viewport.scrollToBottom(viewport);
      expect(Viewport.atTop(viewport)).toBe(false);
      expect(Viewport.atBottom(viewport)).toBe(true);
    });
  });

  describe('getScrollPercent', () => {
    it('should return 0 at top', () => {
      const viewport = createViewport({ content: testContent, height: 5 });
      expect(Viewport.getScrollPercent(viewport)).toBe(0);
    });

    it('should return 100 at bottom', () => {
      let viewport = createViewport({ content: testContent, height: 5 });
      viewport = Viewport.scrollToBottom(viewport);
      expect(Viewport.getScrollPercent(viewport)).toBe(100);
    });

    it('should return 50 in middle', () => {
      let viewport = createViewport({ content: testContent, height: 6 });
      viewport = Viewport.scrollDown(viewport, 2);
      expect(Viewport.getScrollPercent(viewport)).toBe(50);
    });
  });

  describe('view', () => {
    it('should render visible lines', () => {
      const viewport = createViewport({ content: testContent, height: 3 });
      const view = Viewport.view(viewport);
      expect(view).toBe('Line 1\nLine 2\nLine 3');
    });

    it('should render scrolled content', () => {
      let viewport = createViewport({ content: testContent, height: 3 });
      viewport = Viewport.scrollDown(viewport, 2);
      const view = Viewport.view(viewport);
      expect(view).toBe('Line 3\nLine 4\nLine 5');
    });

    it('should pad to height', () => {
      const viewport = createViewport({ content: 'Line 1\nLine 2', height: 5 });
      const view = Viewport.view(viewport);
      const lines = view.split('\n');
      expect(lines).toHaveLength(5);
    });
  });

  describe('viewWithIndicators', () => {
    it('should show scroll indicator at top', () => {
      const viewport = createViewport({ content: testContent, height: 3 });
      const view = Viewport.viewWithIndicators(viewport);
      expect(view).toContain('↑');
      expect(view).toContain('0%');
    });

    it('should show scroll indicator at bottom', () => {
      let viewport = createViewport({ content: testContent, height: 3 });
      viewport = Viewport.scrollToBottom(viewport);
      const view = Viewport.viewWithIndicators(viewport);
      expect(view).toContain('↓');
      expect(view).toContain('100%');
    });
  });

  describe('horizontal scrolling', () => {
    it('should scroll right', () => {
      const content = 'A very long line that exceeds the viewport width';
      let viewport = createViewport({ content, width: 20 });
      viewport = Viewport.scrollRight(viewport, 5);
      expect(viewport.xOffset).toBe(5);
    });

    it('should scroll left', () => {
      const content = 'A very long line that exceeds the viewport width';
      let viewport = createViewport({ content, width: 20 });
      viewport = Viewport.scrollRight(viewport, 10);
      viewport = Viewport.scrollLeft(viewport, 3);
      expect(viewport.xOffset).toBe(7);
    });
  });
});
