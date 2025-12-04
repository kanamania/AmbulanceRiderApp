import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { formatters } from '../formatters';

describe('formatters', () => {
  describe('formatPhone', () => {
    it('should format 10-digit phone numbers', () => {
      expect(formatters.formatPhone('1234567890')).toBe('(123) 456-7890');
    });

    it('should format 11-digit phone numbers with country code', () => {
      expect(formatters.formatPhone('11234567890')).toBe('+1 (123) 456-7890');
    });

    it('should return original for other formats', () => {
      expect(formatters.formatPhone('+255123456')).toBe('+255123456');
      expect(formatters.formatPhone('12345')).toBe('12345');
    });

    it('should strip non-numeric characters before formatting', () => {
      expect(formatters.formatPhone('(123) 456-7890')).toBe('(123) 456-7890');
    });
  });

  describe('formatDate', () => {
    it('should format date string to readable format', () => {
      const result = formatters.formatDate('2025-12-04');
      expect(result).toContain('December');
      expect(result).toContain('4');
      expect(result).toContain('2025');
    });

    it('should format Date object', () => {
      const date = new Date('2025-06-15');
      const result = formatters.formatDate(date);
      expect(result).toContain('June');
      expect(result).toContain('15');
      expect(result).toContain('2025');
    });
  });

  describe('formatDateTime', () => {
    it('should format date and time', () => {
      const result = formatters.formatDateTime('2025-12-04T14:30:00');
      expect(result).toContain('Dec');
      expect(result).toContain('4');
      expect(result).toContain('2025');
    });
  });

  describe('formatTimeAgo', () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2025-12-04T12:00:00'));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should return "just now" for recent times', () => {
      const result = formatters.formatTimeAgo('2025-12-04T11:59:30');
      expect(result).toBe('just now');
    });

    it('should return minutes ago', () => {
      const result = formatters.formatTimeAgo('2025-12-04T11:55:00');
      expect(result).toBe('5 minutes ago');
    });

    it('should return singular minute', () => {
      const result = formatters.formatTimeAgo('2025-12-04T11:59:00');
      expect(result).toBe('1 minute ago');
    });

    it('should return hours ago', () => {
      const result = formatters.formatTimeAgo('2025-12-04T09:00:00');
      expect(result).toBe('3 hours ago');
    });

    it('should return singular hour', () => {
      const result = formatters.formatTimeAgo('2025-12-04T11:00:00');
      expect(result).toBe('1 hour ago');
    });

    it('should return days ago', () => {
      const result = formatters.formatTimeAgo('2025-12-01T12:00:00');
      expect(result).toBe('3 days ago');
    });

    it('should return formatted date for old dates', () => {
      const result = formatters.formatTimeAgo('2025-10-01T12:00:00');
      expect(result).toContain('October');
    });
  });

  describe('capitalizeWords', () => {
    it('should capitalize first letter of each word', () => {
      expect(formatters.capitalizeWords('hello world')).toBe('Hello World');
      expect(formatters.capitalizeWords('john doe')).toBe('John Doe');
    });

    it('should handle single word', () => {
      expect(formatters.capitalizeWords('hello')).toBe('Hello');
    });

    it('should handle already capitalized text', () => {
      expect(formatters.capitalizeWords('Hello World')).toBe('Hello World');
    });
  });

  describe('truncate', () => {
    it('should truncate long strings with ellipsis', () => {
      expect(formatters.truncate('Hello World', 8)).toBe('Hello...');
    });

    it('should not truncate short strings', () => {
      expect(formatters.truncate('Hello', 10)).toBe('Hello');
    });

    it('should handle exact length', () => {
      expect(formatters.truncate('Hello', 5)).toBe('Hello');
    });
  });

  describe('formatFileSize', () => {
    it('should format bytes', () => {
      expect(formatters.formatFileSize(0)).toBe('0 Bytes');
      expect(formatters.formatFileSize(500)).toBe('500 Bytes');
    });

    it('should format kilobytes', () => {
      expect(formatters.formatFileSize(1024)).toBe('1 KB');
      expect(formatters.formatFileSize(2048)).toBe('2 KB');
    });

    it('should format megabytes', () => {
      expect(formatters.formatFileSize(1048576)).toBe('1 MB');
      expect(formatters.formatFileSize(5242880)).toBe('5 MB');
    });

    it('should format gigabytes', () => {
      expect(formatters.formatFileSize(1073741824)).toBe('1 GB');
    });
  });

  describe('formatCurrency', () => {
    it('should format USD by default', () => {
      const result = formatters.formatCurrency(1234.56);
      expect(result).toBe('$1,234.56');
    });

    it('should format other currencies', () => {
      const result = formatters.formatCurrency(1234.56, 'EUR');
      expect(result).toContain('1,234.56');
    });

    it('should handle zero', () => {
      expect(formatters.formatCurrency(0)).toBe('$0.00');
    });
  });

  describe('formatDistance', () => {
    it('should format meters in metric', () => {
      expect(formatters.formatDistance(500, 'metric')).toBe('500 m');
      expect(formatters.formatDistance(999, 'metric')).toBe('999 m');
    });

    it('should format kilometers in metric', () => {
      expect(formatters.formatDistance(1000, 'metric')).toBe('1.0 km');
      expect(formatters.formatDistance(2500, 'metric')).toBe('2.5 km');
    });

    it('should format feet in imperial for short distances', () => {
      expect(formatters.formatDistance(100, 'imperial')).toBe('328 ft');
    });

    it('should format miles in imperial', () => {
      expect(formatters.formatDistance(1609, 'imperial')).toBe('1.0 mi');
      expect(formatters.formatDistance(8046, 'imperial')).toBe('5.0 mi');
    });

    it('should default to metric', () => {
      expect(formatters.formatDistance(1500)).toBe('1.5 km');
    });
  });
});
