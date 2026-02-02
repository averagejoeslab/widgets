/**
 * Timer widget - countdown and stopwatch functionality
 */

/**
 * Timer mode
 */
export type TimerMode = 'countdown' | 'stopwatch';

/**
 * Timer state
 */
export type TimerState = 'idle' | 'running' | 'paused' | 'finished';

/**
 * Timer options
 */
export interface TimerOptions {
  /** Timer mode */
  mode?: TimerMode;
  /** Duration in milliseconds (for countdown) */
  duration?: number;
  /** Initial elapsed time */
  elapsed?: number;
  /** Auto start */
  autoStart?: boolean;
}

/**
 * Timer model
 */
export interface TimerModel {
  /** Timer mode */
  mode: TimerMode;
  /** Duration in ms (for countdown) */
  duration: number;
  /** Elapsed time in ms */
  elapsed: number;
  /** Timer state */
  state: TimerState;
  /** Start timestamp */
  startTime: number | null;
  /** Pause timestamp */
  pauseTime: number | null;
}

/**
 * Create a new timer model
 */
export function createTimer(options: TimerOptions = {}): TimerModel {
  const model: TimerModel = {
    mode: options.mode ?? 'stopwatch',
    duration: options.duration ?? 0,
    elapsed: options.elapsed ?? 0,
    state: 'idle',
    startTime: null,
    pauseTime: null,
  };

  if (options.autoStart) {
    return start(model);
  }

  return model;
}

/**
 * Create a countdown timer
 */
export function createCountdown(durationMs: number, autoStart: boolean = false): TimerModel {
  return createTimer({
    mode: 'countdown',
    duration: durationMs,
    autoStart,
  });
}

/**
 * Create a stopwatch
 */
export function createStopwatch(autoStart: boolean = false): TimerModel {
  return createTimer({
    mode: 'stopwatch',
    autoStart,
  });
}

/**
 * Start the timer
 */
export function start(model: TimerModel): TimerModel {
  if (model.state === 'running') return model;
  if (model.state === 'finished') return model;

  return {
    ...model,
    state: 'running',
    startTime: Date.now(),
    pauseTime: null,
  };
}

/**
 * Pause the timer
 */
export function pause(model: TimerModel): TimerModel {
  if (model.state !== 'running') return model;

  const now = Date.now();
  const additionalElapsed = model.startTime ? now - model.startTime : 0;

  return {
    ...model,
    state: 'paused',
    elapsed: model.elapsed + additionalElapsed,
    startTime: null,
    pauseTime: now,
  };
}

/**
 * Resume the timer
 */
export function resume(model: TimerModel): TimerModel {
  if (model.state !== 'paused') return model;

  return {
    ...model,
    state: 'running',
    startTime: Date.now(),
    pauseTime: null,
  };
}

/**
 * Toggle between start/pause
 */
export function toggle(model: TimerModel): TimerModel {
  switch (model.state) {
    case 'idle':
      return start(model);
    case 'running':
      return pause(model);
    case 'paused':
      return resume(model);
    case 'finished':
      return model;
  }
}

/**
 * Stop and reset the timer
 */
export function stop(model: TimerModel): TimerModel {
  return {
    ...model,
    state: 'idle',
    elapsed: 0,
    startTime: null,
    pauseTime: null,
  };
}

/**
 * Reset the timer (keeps running if was running)
 */
export function reset(model: TimerModel): TimerModel {
  const wasRunning = model.state === 'running';

  const reset: TimerModel = {
    ...model,
    elapsed: 0,
    startTime: wasRunning ? Date.now() : null,
    pauseTime: null,
    state: wasRunning ? 'running' : 'idle',
  };

  return reset;
}

/**
 * Update the timer (call on each tick)
 */
export function tick(model: TimerModel): TimerModel {
  if (model.state !== 'running') return model;

  const now = Date.now();
  const totalElapsed = model.elapsed + (model.startTime ? now - model.startTime : 0);

  // Check if countdown finished
  if (model.mode === 'countdown' && totalElapsed >= model.duration) {
    return {
      ...model,
      state: 'finished',
      elapsed: model.duration,
      startTime: null,
    };
  }

  return model;
}

/**
 * Get current elapsed time in ms
 */
export function getElapsed(model: TimerModel): number {
  if (model.state === 'running' && model.startTime) {
    return model.elapsed + (Date.now() - model.startTime);
  }
  return model.elapsed;
}

/**
 * Get remaining time in ms (for countdown)
 */
export function getRemaining(model: TimerModel): number {
  if (model.mode !== 'countdown') return 0;
  return Math.max(0, model.duration - getElapsed(model));
}

/**
 * Get progress (0-1) for countdown
 */
export function getProgress(model: TimerModel): number {
  if (model.mode !== 'countdown' || model.duration === 0) return 0;
  return Math.min(1, getElapsed(model) / model.duration);
}

/**
 * Check if timer is finished
 */
export function isFinished(model: TimerModel): boolean {
  return model.state === 'finished';
}

/**
 * Check if timer is running
 */
export function isRunning(model: TimerModel): boolean {
  return model.state === 'running';
}

/**
 * Check if timer is paused
 */
export function isPaused(model: TimerModel): boolean {
  return model.state === 'paused';
}

/**
 * Format time as HH:MM:SS
 */
export function formatTime(ms: number, showMs: boolean = false): string {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const milliseconds = ms % 1000;

  let result = '';

  if (hours > 0) {
    result += String(hours).padStart(2, '0') + ':';
  }

  result += String(minutes).padStart(2, '0') + ':';
  result += String(seconds).padStart(2, '0');

  if (showMs) {
    result += '.' + String(Math.floor(milliseconds / 10)).padStart(2, '0');
  }

  return result;
}

/**
 * Format time compact (e.g., "1h 23m" or "45s")
 */
export function formatTimeCompact(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }
  return `${seconds}s`;
}

/**
 * Render the timer
 */
export function view(model: TimerModel, showMs: boolean = false): string {
  if (model.mode === 'countdown') {
    return formatTime(getRemaining(model), showMs);
  }
  return formatTime(getElapsed(model), showMs);
}

/**
 * Render with state indicator
 */
export function viewWithState(model: TimerModel, showMs: boolean = false): string {
  const time = view(model, showMs);
  const stateIndicator = {
    idle: '⏹',
    running: '▶',
    paused: '⏸',
    finished: '✓',
  }[model.state];

  return `${stateIndicator} ${time}`;
}

/**
 * Timer widget namespace
 */
export const Timer = {
  create: createTimer,
  createCountdown,
  createStopwatch,
  start,
  pause,
  resume,
  toggle,
  stop,
  reset,
  tick,
  getElapsed,
  getRemaining,
  getProgress,
  isFinished,
  isRunning,
  isPaused,
  formatTime,
  formatTimeCompact,
  view,
  viewWithState,
};
