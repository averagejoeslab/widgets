import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Timer, createTimer } from './timer';

describe('Timer', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('createTimer', () => {
    it('should create stopwatch by default', () => {
      const timer = createTimer();
      expect(timer.mode).toBe('stopwatch');
      expect(timer.state).toBe('idle');
      expect(timer.elapsed).toBe(0);
    });

    it('should create countdown', () => {
      const timer = Timer.createCountdown(5000);
      expect(timer.mode).toBe('countdown');
      expect(timer.duration).toBe(5000);
    });

    it('should auto start if specified', () => {
      const timer = createTimer({ autoStart: true });
      expect(timer.state).toBe('running');
    });
  });

  describe('start/pause/resume', () => {
    it('should start timer', () => {
      let timer = createTimer();
      timer = Timer.start(timer);
      expect(timer.state).toBe('running');
      expect(timer.startTime).not.toBeNull();
    });

    it('should pause timer', () => {
      let timer = createTimer();
      timer = Timer.start(timer);
      vi.advanceTimersByTime(1000);
      timer = Timer.pause(timer);
      expect(timer.state).toBe('paused');
      expect(timer.elapsed).toBeGreaterThan(0);
    });

    it('should resume timer', () => {
      let timer = createTimer();
      timer = Timer.start(timer);
      vi.advanceTimersByTime(1000);
      timer = Timer.pause(timer);
      timer = Timer.resume(timer);
      expect(timer.state).toBe('running');
    });
  });

  describe('toggle', () => {
    it('should toggle from idle to running', () => {
      let timer = createTimer();
      timer = Timer.toggle(timer);
      expect(timer.state).toBe('running');
    });

    it('should toggle from running to paused', () => {
      let timer = createTimer({ autoStart: true });
      timer = Timer.toggle(timer);
      expect(timer.state).toBe('paused');
    });

    it('should toggle from paused to running', () => {
      let timer = createTimer({ autoStart: true });
      timer = Timer.pause(timer);
      timer = Timer.toggle(timer);
      expect(timer.state).toBe('running');
    });
  });

  describe('stop/reset', () => {
    it('should stop and reset timer', () => {
      let timer = createTimer({ autoStart: true });
      vi.advanceTimersByTime(1000);
      timer = Timer.stop(timer);
      expect(timer.state).toBe('idle');
      expect(timer.elapsed).toBe(0);
    });

    it('should reset while keeping running state', () => {
      let timer = createTimer({ autoStart: true });
      vi.advanceTimersByTime(1000);
      timer = Timer.reset(timer);
      expect(timer.state).toBe('running');
      expect(timer.elapsed).toBe(0);
    });
  });

  describe('getElapsed', () => {
    it('should return elapsed time when running', () => {
      let timer = createTimer({ autoStart: true });
      vi.advanceTimersByTime(1500);
      const elapsed = Timer.getElapsed(timer);
      expect(elapsed).toBe(1500);
    });

    it('should return elapsed time when paused', () => {
      let timer = createTimer({ autoStart: true });
      vi.advanceTimersByTime(1000);
      timer = Timer.pause(timer);
      vi.advanceTimersByTime(1000); // Time passes but timer is paused
      const elapsed = Timer.getElapsed(timer);
      expect(elapsed).toBe(1000);
    });
  });

  describe('countdown', () => {
    it('should track remaining time', () => {
      let timer = Timer.createCountdown(5000, true);
      vi.advanceTimersByTime(2000);
      const remaining = Timer.getRemaining(timer);
      expect(remaining).toBe(3000);
    });

    it('should track progress', () => {
      let timer = Timer.createCountdown(10000, true);
      vi.advanceTimersByTime(5000);
      const progress = Timer.getProgress(timer);
      expect(progress).toBe(0.5);
    });

    it('should finish when elapsed >= duration', () => {
      let timer = Timer.createCountdown(1000, true);
      vi.advanceTimersByTime(1000);
      timer = Timer.tick(timer);
      expect(timer.state).toBe('finished');
    });

    it('should not exceed duration', () => {
      let timer = Timer.createCountdown(1000, true);
      vi.advanceTimersByTime(2000);
      timer = Timer.tick(timer);
      expect(Timer.getRemaining(timer)).toBe(0);
    });
  });

  describe('state checks', () => {
    it('should check running state', () => {
      let timer = createTimer({ autoStart: true });
      expect(Timer.isRunning(timer)).toBe(true);
      expect(Timer.isPaused(timer)).toBe(false);
      expect(Timer.isFinished(timer)).toBe(false);
    });

    it('should check paused state', () => {
      let timer = createTimer({ autoStart: true });
      timer = Timer.pause(timer);
      expect(Timer.isRunning(timer)).toBe(false);
      expect(Timer.isPaused(timer)).toBe(true);
    });

    it('should check finished state', () => {
      let timer = Timer.createCountdown(100, true);
      vi.advanceTimersByTime(100);
      timer = Timer.tick(timer);
      expect(Timer.isFinished(timer)).toBe(true);
    });
  });

  describe('formatTime', () => {
    it('should format seconds', () => {
      expect(Timer.formatTime(5000)).toBe('00:05');
    });

    it('should format minutes and seconds', () => {
      expect(Timer.formatTime(125000)).toBe('02:05');
    });

    it('should format hours', () => {
      expect(Timer.formatTime(3665000)).toBe('01:01:05');
    });

    it('should show milliseconds when requested', () => {
      expect(Timer.formatTime(1234, true)).toBe('00:01.23');
    });
  });

  describe('formatTimeCompact', () => {
    it('should format compact seconds', () => {
      expect(Timer.formatTimeCompact(45000)).toBe('45s');
    });

    it('should format compact minutes', () => {
      expect(Timer.formatTimeCompact(125000)).toBe('2m 5s');
    });

    it('should format compact hours', () => {
      expect(Timer.formatTimeCompact(3665000)).toBe('1h 1m');
    });
  });

  describe('view', () => {
    it('should view stopwatch time', () => {
      let timer = createTimer({ autoStart: true });
      vi.advanceTimersByTime(61000);
      const view = Timer.view(timer);
      expect(view).toBe('01:01');
    });

    it('should view countdown remaining time', () => {
      let timer = Timer.createCountdown(120000, true);
      vi.advanceTimersByTime(30000);
      const view = Timer.view(timer);
      expect(view).toBe('01:30');
    });
  });

  describe('viewWithState', () => {
    it('should show running indicator', () => {
      const timer = createTimer({ autoStart: true });
      const view = Timer.viewWithState(timer);
      expect(view).toContain('▶');
    });

    it('should show paused indicator', () => {
      let timer = createTimer({ autoStart: true });
      timer = Timer.pause(timer);
      const view = Timer.viewWithState(timer);
      expect(view).toContain('⏸');
    });

    it('should show finished indicator', () => {
      let timer = Timer.createCountdown(100, true);
      vi.advanceTimersByTime(100);
      timer = Timer.tick(timer);
      const view = Timer.viewWithState(timer);
      expect(view).toContain('✓');
    });

    it('should show idle indicator', () => {
      const timer = createTimer();
      const view = Timer.viewWithState(timer);
      expect(view).toContain('⏹');
    });
  });
});
