import { formatUtc } from './helpers';

describe('ExecutionHistoryContent helpers', () => {
  describe('formatUtc', () => {
    it('should format a standard ISO date string correctly', () => {
      const result = formatUtc('2023-04-29T18:30:45.123Z');
      expect(result).toBe('29 Apr 2023 18:30 UTC');
    });

    it('should handle dates with single digit day', () => {
      const result = formatUtc('2023-04-01T09:05:00.000Z');
      expect(result).toBe('01 Apr 2023 09:05 UTC');
    });

    it('should handle dates with single digit hour and minute', () => {
      const result = formatUtc('2023-04-29T01:05:30.000Z');
      expect(result).toBe('29 Apr 2023 01:05 UTC');
    });

    it('should handle midnight (00:00)', () => {
      const result = formatUtc('2023-04-29T00:00:00.000Z');
      expect(result).toBe('29 Apr 2023 00:00 UTC');
    });

    it('should handle end of day (23:59)', () => {
      const result = formatUtc('2023-04-29T23:59:59.999Z');
      expect(result).toBe('29 Apr 2023 23:59 UTC');
    });

    it('should handle different months correctly', () => {
      expect(formatUtc('2023-01-15T12:00:00.000Z')).toBe(
        '15 Jan 2023 12:00 UTC',
      );
      expect(formatUtc('2023-02-28T12:00:00.000Z')).toBe(
        '28 Feb 2023 12:00 UTC',
      );
      expect(formatUtc('2023-03-31T12:00:00.000Z')).toBe(
        '31 Mar 2023 12:00 UTC',
      );
      expect(formatUtc('2023-05-01T12:00:00.000Z')).toBe(
        '01 May 2023 12:00 UTC',
      );
      expect(formatUtc('2023-06-15T12:00:00.000Z')).toBe(
        '15 Jun 2023 12:00 UTC',
      );
      expect(formatUtc('2023-07-04T12:00:00.000Z')).toBe(
        '04 Jul 2023 12:00 UTC',
      );
      expect(formatUtc('2023-08-20T12:00:00.000Z')).toBe(
        '20 Aug 2023 12:00 UTC',
      );
      expect(formatUtc('2023-09-11T12:00:00.000Z')).toBe(
        '11 Sep 2023 12:00 UTC',
      );
      expect(formatUtc('2023-10-31T12:00:00.000Z')).toBe(
        '31 Oct 2023 12:00 UTC',
      );
      expect(formatUtc('2023-11-25T12:00:00.000Z')).toBe(
        '25 Nov 2023 12:00 UTC',
      );
      expect(formatUtc('2023-12-25T12:00:00.000Z')).toBe(
        '25 Dec 2023 12:00 UTC',
      );
    });

    it('should handle leap year dates', () => {
      const result = formatUtc('2024-02-29T12:00:00.000Z');
      expect(result).toBe('29 Feb 2024 12:00 UTC');
    });

    it('should handle year boundaries', () => {
      expect(formatUtc('2022-12-31T23:59:59.999Z')).toBe(
        '31 Dec 2022 23:59 UTC',
      );
      expect(formatUtc('2023-01-01T00:00:00.000Z')).toBe(
        '01 Jan 2023 00:00 UTC',
      );
    });

    it('should handle different year formats', () => {
      expect(formatUtc('2000-06-15T12:00:00.000Z')).toBe(
        '15 Jun 2000 12:00 UTC',
      );
      expect(formatUtc('2099-06-15T12:00:00.000Z')).toBe(
        '15 Jun 2099 12:00 UTC',
      );
    });

    it('should handle ISO strings without milliseconds', () => {
      const result = formatUtc('2023-04-29T18:30:45Z');
      expect(result).toBe('29 Apr 2023 18:30 UTC');
    });

    it('should handle ISO strings with timezone offset (converts to UTC)', () => {
      // Note: The function will interpret this as UTC regardless of timezone info
      const result = formatUtc('2023-04-29T18:30:45+05:00');
      // JavaScript Date constructor will handle the timezone conversion
      const expectedDate = new Date('2023-04-29T18:30:45+05:00');
      const expectedDay = String(expectedDate.getUTCDate()).padStart(2, '0');
      const expectedMonth = expectedDate.toLocaleString('en-US', {
        month: 'short',
        timeZone: 'UTC',
      });
      const expectedYear = expectedDate.getUTCFullYear();
      const expectedHour = String(expectedDate.getUTCHours()).padStart(2, '0');
      const expectedMinute = String(expectedDate.getUTCMinutes()).padStart(
        2,
        '0',
      );
      expect(result).toBe(
        `${expectedDay} ${expectedMonth} ${expectedYear} ${expectedHour}:${expectedMinute} UTC`,
      );
    });

    it('should pad single digit values with zeros', () => {
      const result = formatUtc('2023-04-09T03:05:00.000Z');
      expect(result).toBe('09 Apr 2023 03:05 UTC');

      // Verify padding is applied correctly
      expect(result).toMatch(/^\d{2} \w{3} \d{4} \d{2}:\d{2} UTC$/);
    });

    it('should maintain consistent format structure', () => {
      const result = formatUtc('2023-04-29T18:30:45.123Z');

      // Should follow the pattern: DD MMM YYYY HH:mm UTC
      expect(result).toMatch(/^\d{2} \w{3} \d{4} \d{2}:\d{2} UTC$/);
      expect(result).toContain(' UTC');
      expect(result.split(' ')).toHaveLength(5); // DD, MMM, YYYY, HH:mm, UTC
    });

    it('should handle Date object input (if passed)', () => {
      const date = new Date('2023-04-29T18:30:45.123Z');
      const result = formatUtc(date);
      expect(result).toBe('29 Apr 2023 18:30 UTC');
    });

    it('should handle timestamp input (if passed)', () => {
      const timestamp = new Date('2023-04-29T18:30:45.123Z').getTime();
      const result = formatUtc(timestamp);
      expect(result).toBe('29 Apr 2023 18:30 UTC');
    });

    it('should produce valid output for all months', () => {
      const months = [
        { month: '01', name: 'Jan' },
        { month: '02', name: 'Feb' },
        { month: '03', name: 'Mar' },
        { month: '04', name: 'Apr' },
        { month: '05', name: 'May' },
        { month: '06', name: 'Jun' },
        { month: '07', name: 'Jul' },
        { month: '08', name: 'Aug' },
        { month: '09', name: 'Sep' },
        { month: '10', name: 'Oct' },
        { month: '11', name: 'Nov' },
        { month: '12', name: 'Dec' },
      ];

      months.forEach(({ month, name }) => {
        const result = formatUtc(`2023-${month}-15T12:00:00.000Z`);
        expect(result).toContain(name);
        expect(result).toBe(`15 ${name} 2023 12:00 UTC`);
      });
    });
  });
});
