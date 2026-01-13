import {
  getIssuePrefix,
  getIssueApplication,
  getSystemName,
  formatUser,
  includesIgnoreCase,
  DATE_FORMAT,
} from './model';

describe('Model Utilities', () => {
  describe('getIssuePrefix', () => {
    it('should extract prefix from colon-separated id', () => {
      expect(getIssuePrefix('advisor:test-issue')).toBe('advisor');
      expect(getIssuePrefix('ssg:compliance-issue')).toBe('ssg');
      expect(getIssuePrefix('vulnerabilities:CVE-2021-1234')).toBe(
        'vulnerabilities',
      );
      expect(getIssuePrefix('patch-advisory:RHSA-2021:1234')).toBe(
        'patch-advisory',
      );
    });

    it('should handle ids with multiple colons', () => {
      expect(getIssuePrefix('advisor:category:specific-issue')).toBe('advisor');
      expect(getIssuePrefix('ssg:rule:security:test')).toBe('ssg');
    });

    it('should handle ids without colons', () => {
      expect(getIssuePrefix('simple-id')).toBe('simple-id');
      expect(getIssuePrefix('no-colon')).toBe('no-colon');
    });

    it('should handle empty strings', () => {
      expect(getIssuePrefix('')).toBe('');
    });

    it('should handle ids starting with colon', () => {
      expect(getIssuePrefix(':no-prefix')).toBe('');
    });

    it('should handle special characters', () => {
      expect(getIssuePrefix('special-chars:issue_123')).toBe('special-chars');
      expect(getIssuePrefix('with-numbers123:issue')).toBe('with-numbers123');
    });
  });

  describe('getIssueApplication', () => {
    it('should return correct application for advisor issues', () => {
      const issue = { id: 'advisor:test-issue' };
      expect(getIssueApplication(issue)).toBe('Advisor');
    });

    it('should return correct application for compliance issues', () => {
      const issue = { id: 'ssg:compliance-check' };
      expect(getIssueApplication(issue)).toBe('Compliance');
    });

    it('should return correct application for vulnerability issues', () => {
      const issue = { id: 'vulnerabilities:CVE-2021-1234' };
      expect(getIssueApplication(issue)).toBe('Vulnerability');
    });

    it('should return correct application for patch issues', () => {
      const issue = { id: 'patch-advisory:RHSA-2021:1234' };
      expect(getIssueApplication(issue)).toBe('Patch');
    });

    it('should return correct application for patch-package issues', () => {
      const issue = { id: 'patch-package:bind-export-libs-32:9.11.36-16.el8_10.6.x86_64' };
      expect(getIssueApplication(issue)).toBe('Patch');
    });

    it('should return Unknown for unrecognized prefixes', () => {
      const issue = { id: 'unknown-prefix:some-issue' };
      expect(getIssueApplication(issue)).toBe('Unknown');
    });

    it('should return Unknown for ids without prefixes', () => {
      const issue = { id: 'no-prefix-issue' };
      expect(getIssueApplication(issue)).toBe('Unknown');
    });

    it('should handle complex issue ids', () => {
      const advisorIssue = {
        id: 'advisor:category:subcategory:specific-issue',
      };
      expect(getIssueApplication(advisorIssue)).toBe('Advisor');

      const complianceIssue = { id: 'ssg:rule:security:test' };
      expect(getIssueApplication(complianceIssue)).toBe('Compliance');
    });

    it('should handle edge cases', () => {
      const emptyIssue = { id: '' };
      expect(getIssueApplication(emptyIssue)).toBe('Unknown');

      const colonOnlyIssue = { id: ':' };
      expect(getIssueApplication(colonOnlyIssue)).toBe('Unknown');
    });
  });

  describe('getSystemName', () => {
    it('should return display_name when available', () => {
      const system = {
        display_name: 'Production Server',
        hostname: 'prod-server-01',
        id: 'system-123',
      };
      expect(getSystemName(system)).toBe('Production Server');
    });

    it('should return hostname when display_name is not available', () => {
      const system = {
        hostname: 'prod-server-01',
        id: 'system-123',
      };
      expect(getSystemName(system)).toBe('prod-server-01');
    });

    it('should return id when neither display_name nor hostname is available', () => {
      const system = {
        id: 'system-123',
      };
      expect(getSystemName(system)).toBe('system-123');
    });

    it('should prioritize display_name over hostname', () => {
      const system = {
        display_name: 'Custom Name',
        hostname: 'hostname-01',
        id: 'system-123',
      };
      expect(getSystemName(system)).toBe('Custom Name');
    });

    it('should handle empty display_name', () => {
      const system = {
        display_name: '',
        hostname: 'hostname-01',
        id: 'system-123',
      };
      expect(getSystemName(system)).toBe('hostname-01');
    });

    it('should handle null display_name', () => {
      const system = {
        display_name: null,
        hostname: 'hostname-01',
        id: 'system-123',
      };
      expect(getSystemName(system)).toBe('hostname-01');
    });

    it('should handle empty hostname', () => {
      const system = {
        hostname: '',
        id: 'system-123',
      };
      expect(getSystemName(system)).toBe('system-123');
    });

    it('should handle null hostname', () => {
      const system = {
        hostname: null,
        id: 'system-123',
      };
      expect(getSystemName(system)).toBe('system-123');
    });

    it('should handle system with only id', () => {
      const system = { id: 'unique-system-id' };
      expect(getSystemName(system)).toBe('unique-system-id');
    });

    it('should handle system with whitespace-only values', () => {
      const system = {
        display_name: '   ',
        hostname: '  ',
        id: 'system-123',
      };
      expect(getSystemName(system)).toBe('   '); // display_name takes precedence even if whitespace
    });

    it('should handle special characters in names', () => {
      const system = {
        display_name: 'Server (Prod) - Main',
        hostname: 'server-prod-main.example.com',
        id: 'system-123',
      };
      expect(getSystemName(system)).toBe('Server (Prod) - Main');
    });
  });

  describe('formatUser', () => {
    it('should format user with first and last name', () => {
      const user = {
        first_name: 'John',
        last_name: 'Doe',
      };
      expect(formatUser(user)).toBe('John Doe');
    });

    it('should handle single character names', () => {
      const user = {
        first_name: 'J',
        last_name: 'D',
      };
      expect(formatUser(user)).toBe('J D');
    });

    it('should handle names with special characters', () => {
      const user = {
        first_name: 'John-Paul',
        last_name: "O'Connor",
      };
      expect(formatUser(user)).toBe("John-Paul O'Connor");
    });

    it('should handle names with multiple spaces', () => {
      const user = {
        first_name: 'Mary Jane',
        last_name: 'Smith Johnson',
      };
      expect(formatUser(user)).toBe('Mary Jane Smith Johnson');
    });

    it('should handle empty names', () => {
      const user = {
        first_name: '',
        last_name: '',
      };
      expect(formatUser(user)).toBe(' ');
    });

    it('should handle null names', () => {
      const user = {
        first_name: null,
        last_name: null,
      };
      expect(formatUser(user)).toBe('null null');
    });

    it('should handle undefined names', () => {
      const user = {
        first_name: undefined,
        last_name: undefined,
      };
      expect(formatUser(user)).toBe('undefined undefined');
    });

    it('should handle mixed case names', () => {
      const user = {
        first_name: 'john',
        last_name: 'DOE',
      };
      expect(formatUser(user)).toBe('john DOE');
    });
  });

  describe('includesIgnoreCase', () => {
    it('should return true for exact matches', () => {
      expect(includesIgnoreCase('hello world', 'hello')).toBe(true);
      expect(includesIgnoreCase('test string', 'test')).toBe(true);
    });

    it('should return true for case insensitive matches', () => {
      expect(includesIgnoreCase('Hello World', 'hello')).toBe(true);
      expect(includesIgnoreCase('TEST STRING', 'test')).toBe(true);
      expect(includesIgnoreCase('Mixed Case', 'mixed')).toBe(true);
    });

    it('should return true for partial matches', () => {
      expect(includesIgnoreCase('hello world', 'wor')).toBe(true);
      expect(includesIgnoreCase('testing', 'esti')).toBe(true);
    });

    it('should return false for non-matches', () => {
      expect(includesIgnoreCase('hello world', 'xyz')).toBe(false);
      expect(includesIgnoreCase('test', 'testing')).toBe(false);
    });

    it('should handle empty strings', () => {
      expect(includesIgnoreCase('', '')).toBe(true);
      expect(includesIgnoreCase('hello', '')).toBe(true);
      expect(includesIgnoreCase('', 'hello')).toBe(false);
    });

    it('should handle null text', () => {
      expect(includesIgnoreCase(null, 'test')).toBeUndefined();
      expect(includesIgnoreCase(null, '')).toBeUndefined();
    });

    it('should handle undefined text', () => {
      expect(includesIgnoreCase(undefined, 'test')).toBeUndefined();
      expect(includesIgnoreCase(undefined, '')).toBeUndefined();
    });

    it('should handle special characters', () => {
      expect(includesIgnoreCase('hello@world.com', '@world')).toBe(true);
      expect(includesIgnoreCase('test-string_123', 'string_')).toBe(true);
    });

    it('should handle numbers', () => {
      expect(includesIgnoreCase('version 1.2.3', '1.2')).toBe(true);
      expect(includesIgnoreCase('item123', '123')).toBe(true);
    });

    it('should handle unicode characters', () => {
      expect(includesIgnoreCase('café restaurant', 'café')).toBe(true);
      expect(includesIgnoreCase('naïve approach', 'naïve')).toBe(true);
    });

    it('should handle whitespace', () => {
      expect(includesIgnoreCase('hello world', 'lo wo')).toBe(true);
      expect(includesIgnoreCase('  spaced  ', 'spaced')).toBe(true);
    });
  });

  describe('DATE_FORMAT', () => {
    it('should be defined as expected format string', () => {
      expect(DATE_FORMAT).toBe('DD MMM YYYY, hh:mm UTC');
    });

    it('should be a string', () => {
      expect(typeof DATE_FORMAT).toBe('string');
    });

    it('should contain expected date format patterns', () => {
      expect(DATE_FORMAT).toContain('DD');
      expect(DATE_FORMAT).toContain('MMM');
      expect(DATE_FORMAT).toContain('YYYY');
      expect(DATE_FORMAT).toContain('hh:mm');
      expect(DATE_FORMAT).toContain('UTC');
    });
  });
});
