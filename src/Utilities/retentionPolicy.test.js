import {
  DEFAULT_RETENTION_DAYS,
  DEFAULT_WARNING_DAYS,
  formatDuration,
  getValidWarningOptions,
  normalizeRetentionDays,
  normalizeWarningDays,
} from './retentionPolicy';

describe('retentionPolicy utilities', () => {
  describe('formatDuration', () => {
    it('returns the label for known durations', () => {
      expect(formatDuration(120)).toBe('4 months');
      expect(formatDuration(30)).toBe('30 days');
    });

    it('falls back to days for unknown values', () => {
      expect(formatDuration(45)).toBe('45 days');
    });
  });

  describe('getValidWarningOptions', () => {
    it('only returns warning options shorter than retention', () => {
      const options = getValidWarningOptions(30);
      expect(options.every((option) => option.value < 30)).toBe(true);
      expect(options.map((option) => option.value)).toEqual([3, 7, 14]);
    });
  });

  describe('normalizeRetentionDays', () => {
    it('returns the default for unknown values', () => {
      expect(normalizeRetentionDays(999)).toBe(DEFAULT_RETENTION_DAYS);
    });
  });

  describe('normalizeWarningDays', () => {
    it('returns the highest valid warning below retention', () => {
      expect(normalizeWarningDays(150, 30)).toBe(14);
    });

    it('returns the default warning when the value is valid', () => {
      expect(normalizeWarningDays(DEFAULT_WARNING_DAYS, 120)).toBe(
        DEFAULT_WARNING_DAYS,
      );
    });
  });
});
