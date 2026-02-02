/**
 * Progress bar widget - displays progress indicators
 */

/**
 * Progress bar styles
 */
export const ProgressStyles = {
  default: {
    full: '█',
    empty: '░',
  },
  ascii: {
    full: '#',
    empty: '-',
  },
  dots: {
    full: '●',
    empty: '○',
  },
  blocks: {
    full: '▓',
    empty: '░',
  },
  line: {
    full: '━',
    empty: '─',
  },
  thick: {
    full: '█',
    empty: '▁',
  },
} as const;

/**
 * Progress style name
 */
export type ProgressStyleName = keyof typeof ProgressStyles;

/**
 * Progress bar characters
 */
export interface ProgressChars {
  full: string;
  empty: string;
}

/**
 * Progress bar options
 */
export interface ProgressOptions {
  /** Total width of the progress bar */
  width?: number;
  /** Style to use */
  style?: ProgressStyleName;
  /** Custom characters */
  chars?: ProgressChars;
  /** Show percentage text */
  showPercent?: boolean;
  /** Percentage format function */
  formatPercent?: (percent: number) => string;
  /** Left bracket character */
  leftBracket?: string;
  /** Right bracket character */
  rightBracket?: string;
}

/**
 * Progress bar model
 */
export interface ProgressModel {
  /** Current progress (0-1) */
  progress: number;
  /** Bar width */
  width: number;
  /** Progress characters */
  chars: ProgressChars;
  /** Show percentage */
  showPercent: boolean;
  /** Format function */
  formatPercent: (percent: number) => string;
  /** Left bracket */
  leftBracket: string;
  /** Right bracket */
  rightBracket: string;
}

/**
 * Default percent formatter
 */
function defaultFormatPercent(percent: number): string {
  return ` ${Math.round(percent * 100)}%`;
}

/**
 * Create a new progress bar model
 */
export function createProgress(options: ProgressOptions = {}): ProgressModel {
  const chars = options.chars ?? ProgressStyles[options.style ?? 'default'];
  return {
    progress: 0,
    width: options.width ?? 40,
    chars,
    showPercent: options.showPercent ?? true,
    formatPercent: options.formatPercent ?? defaultFormatPercent,
    leftBracket: options.leftBracket ?? '',
    rightBracket: options.rightBracket ?? '',
  };
}

/**
 * Set the progress value (0-1)
 */
export function setProgress(model: ProgressModel, progress: number): ProgressModel {
  return {
    ...model,
    progress: Math.max(0, Math.min(1, progress)),
  };
}

/**
 * Set the progress from a percentage (0-100)
 */
export function setPercent(model: ProgressModel, percent: number): ProgressModel {
  return setProgress(model, percent / 100);
}

/**
 * Increment progress by a given amount
 */
export function increment(model: ProgressModel, amount: number = 0.01): ProgressModel {
  return setProgress(model, model.progress + amount);
}

/**
 * Decrement progress by a given amount
 */
export function decrement(model: ProgressModel, amount: number = 0.01): ProgressModel {
  return setProgress(model, model.progress - amount);
}

/**
 * Reset progress to zero
 */
export function reset(model: ProgressModel): ProgressModel {
  return setProgress(model, 0);
}

/**
 * Complete progress (set to 100%)
 */
export function complete(model: ProgressModel): ProgressModel {
  return setProgress(model, 1);
}

/**
 * Render the progress bar
 */
export function view(model: ProgressModel): string {
  const { progress, width, chars, showPercent, formatPercent, leftBracket, rightBracket } = model;

  const filledWidth = Math.round(progress * width);
  const emptyWidth = width - filledWidth;

  const filled = chars.full.repeat(filledWidth);
  const empty = chars.empty.repeat(emptyWidth);

  let result = leftBracket + filled + empty + rightBracket;

  if (showPercent) {
    result += formatPercent(progress);
  }

  return result;
}

/**
 * Render a simple progress bar without a model
 */
export function render(progress: number, options: ProgressOptions = {}): string {
  const model = createProgress(options);
  return view(setProgress(model, progress));
}

/**
 * Progress bar widget namespace
 */
export const Progress = {
  create: createProgress,
  set: setProgress,
  setPercent,
  increment,
  decrement,
  reset,
  complete,
  view,
  render,
  Styles: ProgressStyles,
};
