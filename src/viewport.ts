/**
 * Viewport widget - scrollable content area
 */

/**
 * Viewport options
 */
export interface ViewportOptions {
  /** Content to display */
  content?: string;
  /** Viewport width (0 = auto) */
  width?: number;
  /** Viewport height */
  height?: number;
  /** Initial horizontal offset */
  xOffset?: number;
  /** Initial vertical offset */
  yOffset?: number;
  /** Horizontal scroll speed */
  xScrollSpeed?: number;
  /** Vertical scroll speed */
  yScrollSpeed?: number;
}

/**
 * Viewport model
 */
export interface ViewportModel {
  /** Content to display */
  content: string;
  /** Content lines (cached) */
  lines: string[];
  /** Viewport width (0 = auto based on content) */
  width: number;
  /** Viewport height */
  height: number;
  /** Horizontal scroll offset */
  xOffset: number;
  /** Vertical scroll offset */
  yOffset: number;
  /** Horizontal scroll speed */
  xScrollSpeed: number;
  /** Vertical scroll speed */
  yScrollSpeed: number;
}

/**
 * Create a new viewport model
 */
export function createViewport(options: ViewportOptions = {}): ViewportModel {
  const content = options.content ?? '';
  const lines = content.split('\n');

  return {
    content,
    lines,
    width: options.width ?? 0,
    height: options.height ?? 10,
    xOffset: options.xOffset ?? 0,
    yOffset: options.yOffset ?? 0,
    xScrollSpeed: options.xScrollSpeed ?? 1,
    yScrollSpeed: options.yScrollSpeed ?? 1,
  };
}

/**
 * Set the content
 */
export function setContent(model: ViewportModel, content: string): ViewportModel {
  const lines = content.split('\n');
  return {
    ...model,
    content,
    lines,
    // Reset offset if content is smaller
    yOffset: Math.min(model.yOffset, Math.max(0, lines.length - model.height)),
  };
}

/**
 * Set viewport dimensions
 */
export function setSize(model: ViewportModel, width: number, height: number): ViewportModel {
  return {
    ...model,
    width,
    height,
    yOffset: Math.min(model.yOffset, Math.max(0, model.lines.length - height)),
  };
}

/**
 * Scroll up
 */
export function scrollUp(model: ViewportModel, lines?: number): ViewportModel {
  const amount = lines ?? model.yScrollSpeed;
  return {
    ...model,
    yOffset: Math.max(0, model.yOffset - amount),
  };
}

/**
 * Scroll down
 */
export function scrollDown(model: ViewportModel, lines?: number): ViewportModel {
  const amount = lines ?? model.yScrollSpeed;
  const maxOffset = Math.max(0, model.lines.length - model.height);
  return {
    ...model,
    yOffset: Math.min(maxOffset, model.yOffset + amount),
  };
}

/**
 * Scroll left
 */
export function scrollLeft(model: ViewportModel, cols?: number): ViewportModel {
  const amount = cols ?? model.xScrollSpeed;
  return {
    ...model,
    xOffset: Math.max(0, model.xOffset - amount),
  };
}

/**
 * Scroll right
 */
export function scrollRight(model: ViewportModel, cols?: number): ViewportModel {
  const amount = cols ?? model.xScrollSpeed;
  // Find max line width
  const maxWidth = model.lines.reduce((max, line) => Math.max(max, line.length), 0);
  const effectiveWidth = model.width > 0 ? model.width : maxWidth;
  const maxOffset = Math.max(0, maxWidth - effectiveWidth);
  return {
    ...model,
    xOffset: Math.min(maxOffset, model.xOffset + amount),
  };
}

/**
 * Scroll to top
 */
export function scrollToTop(model: ViewportModel): ViewportModel {
  return {
    ...model,
    yOffset: 0,
  };
}

/**
 * Scroll to bottom
 */
export function scrollToBottom(model: ViewportModel): ViewportModel {
  const maxOffset = Math.max(0, model.lines.length - model.height);
  return {
    ...model,
    yOffset: maxOffset,
  };
}

/**
 * Scroll by page
 */
export function pageUp(model: ViewportModel): ViewportModel {
  return scrollUp(model, model.height);
}

/**
 * Scroll by page
 */
export function pageDown(model: ViewportModel): ViewportModel {
  return scrollDown(model, model.height);
}

/**
 * Scroll by half page
 */
export function halfPageUp(model: ViewportModel): ViewportModel {
  return scrollUp(model, Math.floor(model.height / 2));
}

/**
 * Scroll by half page
 */
export function halfPageDown(model: ViewportModel): ViewportModel {
  return scrollDown(model, Math.floor(model.height / 2));
}

/**
 * Scroll to a specific line
 */
export function scrollToLine(model: ViewportModel, line: number): ViewportModel {
  const maxOffset = Math.max(0, model.lines.length - model.height);
  const targetOffset = Math.max(0, Math.min(maxOffset, line));
  return {
    ...model,
    yOffset: targetOffset,
  };
}

/**
 * Scroll to center a specific line
 */
export function scrollToCenter(model: ViewportModel, line: number): ViewportModel {
  const targetOffset = Math.max(0, line - Math.floor(model.height / 2));
  return scrollToLine(model, targetOffset);
}

/**
 * Get scroll percentage (0-100)
 */
export function getScrollPercent(model: ViewportModel): number {
  const maxOffset = Math.max(0, model.lines.length - model.height);
  if (maxOffset === 0) return 100;
  return Math.round((model.yOffset / maxOffset) * 100);
}

/**
 * Check if at top
 */
export function atTop(model: ViewportModel): boolean {
  return model.yOffset === 0;
}

/**
 * Check if at bottom
 */
export function atBottom(model: ViewportModel): boolean {
  const maxOffset = Math.max(0, model.lines.length - model.height);
  return model.yOffset >= maxOffset;
}

/**
 * Get visible lines
 */
export function getVisibleLines(model: ViewportModel): string[] {
  return model.lines.slice(model.yOffset, model.yOffset + model.height);
}

/**
 * Get total line count
 */
export function getLineCount(model: ViewportModel): number {
  return model.lines.length;
}

/**
 * Render the viewport
 */
export function view(model: ViewportModel): string {
  const visibleLines = getVisibleLines(model);

  // Apply horizontal scrolling and width limit
  const processedLines = visibleLines.map(line => {
    let result = line;

    // Apply horizontal offset
    if (model.xOffset > 0) {
      result = result.slice(model.xOffset);
    }

    // Apply width limit
    if (model.width > 0 && result.length > model.width) {
      result = result.slice(0, model.width);
    }

    return result;
  });

  // Pad to height if needed
  while (processedLines.length < model.height) {
    processedLines.push('');
  }

  return processedLines.join('\n');
}

/**
 * Render with scroll indicators
 */
export function viewWithIndicators(model: ViewportModel): string {
  const content = view(model);
  const percent = getScrollPercent(model);
  const indicator = atTop(model) ? '↑' : atBottom(model) ? '↓' : '↕';

  return `${content}\n${indicator} ${percent}%`;
}

/**
 * Viewport widget namespace
 */
export const Viewport = {
  create: createViewport,
  setContent,
  setSize,
  scrollUp,
  scrollDown,
  scrollLeft,
  scrollRight,
  scrollToTop,
  scrollToBottom,
  pageUp,
  pageDown,
  halfPageUp,
  halfPageDown,
  scrollToLine,
  scrollToCenter,
  getScrollPercent,
  atTop,
  atBottom,
  getVisibleLines,
  getLineCount,
  view,
  viewWithIndicators,
};
