import urijs from 'urijs';
import { getIssuePrefix } from './model';
import {
  getGroup,
  getInventoryTabForIssue,
  inventoryUrlBuilder,
  buildIssueUrl,
  appUrl,
} from './urls';

// Mock urijs
jest.mock('urijs');

// Mock model functions
jest.mock('./model', () => ({
  getIssuePrefix: jest.fn(),
}));

// Mock document.baseURI
Object.defineProperty(document, 'baseURI', {
  value: 'https://console.redhat.com/',
  configurable: true,
});

describe('urls utilities', () => {
  let originalLocation;

  beforeAll(() => {
    // Store original location and replace with mock
    originalLocation = window.location;
    delete window.location;
    window.location = {
      pathname: '/insights/remediations',
      href: 'https://console.redhat.com/insights/remediations',
      origin: 'https://console.redhat.com',
      protocol: 'https:',
      host: 'console.redhat.com',
      hostname: 'console.redhat.com',
      port: '',
      search: '',
      hash: '',
    };
  });

  afterAll(() => {
    // Restore original location
    window.location = originalLocation;
  });

  beforeEach(() => {
    jest.clearAllMocks();

    // Reset location to default
    window.location.pathname = '/insights/remediations';

    // Setup urijs mock to return a chainable object
    const mockUriChain = {
      segment: jest.fn().mockReturnThis(),
      toString: jest
        .fn()
        .mockReturnValue('https://console.redhat.com/insights/advisor'),
    };
    urijs.mockReturnValue(mockUriChain);
  });

  describe('getGroup', () => {
    it('should handle root path', () => {
      window.location.pathname = '/';

      const result = getGroup();

      expect(result).toBe('');
    });
  });

  describe('getInventoryTabForIssue', () => {
    it('should return advisor tab for advisor issues', () => {
      getIssuePrefix.mockReturnValue('advisor');

      const result = getInventoryTabForIssue({ id: 'advisor:test-issue' });

      expect(result).toBe('advisor');
      expect(getIssuePrefix).toHaveBeenCalledWith('advisor:test-issue');
    });

    it('should return vulnerabilities tab for vulnerability issues', () => {
      getIssuePrefix.mockReturnValue('vulnerabilities');

      const result = getInventoryTabForIssue({
        id: 'vulnerabilities:CVE-2021-1234',
      });

      expect(result).toBe('vulnerabilities');
    });

    it('should return compliance tab for ssg issues', () => {
      getIssuePrefix.mockReturnValue('ssg');

      const result = getInventoryTabForIssue({ id: 'ssg:compliance-rule' });

      expect(result).toBe('compliance');
    });

    it('should return patch tab for patch-advisory issues', () => {
      getIssuePrefix.mockReturnValue('patch-advisory');

      const result = getInventoryTabForIssue({
        id: 'patch-advisory:RHSA-2021:1234',
      });

      expect(result).toBe('patch');
    });

    it('should return patch tab for patch-package issues', () => {
      getIssuePrefix.mockReturnValue('patch-package');

      const result = getInventoryTabForIssue({
        id: 'patch-package:bind-export-libs-32:9.11.36-16.el8_10.6.x86_64',
      });

      expect(result).toBe('patch');
    });

    it('should return general_information for unknown issue types', () => {
      getIssuePrefix.mockReturnValue('unknown');

      const result = getInventoryTabForIssue({ id: 'unknown:some-issue' });

      expect(result).toBe('general_information');
    });

    it('should handle null/undefined prefix', () => {
      getIssuePrefix.mockReturnValue(null);

      const result = getInventoryTabForIssue({ id: 'malformed-id' });

      expect(result).toBe('general_information');
    });
  });

  describe('inventoryUrlBuilder', () => {
    it('should return a function that builds inventory URLs', () => {
      getIssuePrefix.mockReturnValue('advisor');
      const mockUriChain = {
        segment: jest.fn().mockReturnThis(),
        toString: jest
          .fn()
          .mockReturnValue('https://console.redhat.com/insights/inventory'),
      };
      urijs.mockReturnValue(mockUriChain);

      const issue = { id: 'advisor:test-issue' };
      const urlBuilder = inventoryUrlBuilder(issue);

      expect(typeof urlBuilder).toBe('function');

      const url = urlBuilder('system-123');
      expect(url).toBe(
        'https://console.redhat.com/insights/inventory/system-123?appName=advisor',
      );
    });

    it('should build URLs with different app names based on issue type', () => {
      getIssuePrefix.mockReturnValue('vulnerabilities');
      const mockUriChain = {
        segment: jest.fn().mockReturnThis(),
        toString: jest
          .fn()
          .mockReturnValue('https://console.redhat.com/insights/inventory'),
      };
      urijs.mockReturnValue(mockUriChain);

      const issue = { id: 'vulnerabilities:CVE-2021-1234' };
      const urlBuilder = inventoryUrlBuilder(issue);
      const url = urlBuilder('system-456');

      expect(url).toBe(
        'https://console.redhat.com/insights/inventory/system-456?appName=vulnerabilities',
      );
    });

    it('should handle compliance issues', () => {
      getIssuePrefix.mockReturnValue('ssg');
      const mockUriChain = {
        segment: jest.fn().mockReturnThis(),
        toString: jest
          .fn()
          .mockReturnValue('https://console.redhat.com/insights/inventory'),
      };
      urijs.mockReturnValue(mockUriChain);

      const issue = { id: 'ssg:compliance-rule' };
      const urlBuilder = inventoryUrlBuilder(issue);
      const url = urlBuilder('system-789');

      expect(url).toBe(
        'https://console.redhat.com/insights/inventory/system-789?appName=compliance',
      );
    });
  });

  describe('buildIssueUrl', () => {
    beforeEach(() => {
      const mockUriChain = {
        segment: jest.fn().mockReturnThis(),
        toString: jest
          .fn()
          .mockReturnValue('https://console.redhat.com/app/url'),
      };
      urijs.mockReturnValue(mockUriChain);
    });

    it('should build advisor recommendation URLs', () => {
      const id = 'advisor:recommendation-123';

      const result = buildIssueUrl(id);

      expect(result).toBe('https://console.redhat.com/app/url');
      expect(urijs).toHaveBeenCalled();
    });

    it('should build vulnerability CVE URLs', () => {
      const id = 'vulnerabilities:CVE-2021-1234';

      const result = buildIssueUrl(id);

      expect(result).toBe('https://console.redhat.com/app/url');
    });

    it('should build patch advisory URLs with colon in advisory ID', () => {
      const id = 'patch-advisory:RHSA:2021-1234';

      const result = buildIssueUrl(id);

      expect(result).toBe('https://console.redhat.com/app/url');
    });

    it('should build patch package URLs', () => {
      const id = 'patch-package:bind-export-libs-32:9.11.36-16.el8_10.6.x86_64';

      const result = buildIssueUrl(id);

      expect(result).toBe('https://console.redhat.com/app/url');
    });

    it('should return null for unknown issue types', () => {
      const id = 'unknown:some-issue';

      const result = buildIssueUrl(id);

      expect(result).toBeNull();
    });

    it('should handle malformed IDs gracefully', () => {
      const id = 'malformed-id-without-colon';

      const result = buildIssueUrl(id);

      expect(result).toBeNull();
    });

    it('should handle empty ID', () => {
      const id = '';

      const result = buildIssueUrl(id);

      expect(result).toBeNull();
    });

    it('should handle IDs with multiple colons', () => {
      const id = 'patch-advisory:RHSA:2021:1234:extra';

      const result = buildIssueUrl(id);

      expect(result).toBe('https://console.redhat.com/app/url');
    });
  });

  describe('appUrl', () => {
    beforeEach(() => {
      const mockUriChain = {
        segment: jest.fn().mockReturnThis(),
        toString: jest
          .fn()
          .mockReturnValue('https://console.redhat.com/app/url'),
      };
      urijs.mockReturnValue(mockUriChain);
    });

    it('should build advisor app URL', () => {
      const result = appUrl('advisor');

      expect(result.toString()).toBe('https://console.redhat.com/app/url');
      expect(urijs).toHaveBeenCalledWith(document.baseURI);
    });

    it('should build vulnerabilities app URL', () => {
      const result = appUrl('vulnerabilities');

      expect(result.toString()).toBe('https://console.redhat.com/app/url');
    });

    it('should build compliance app URL', () => {
      const result = appUrl('compliance');

      expect(result.toString()).toBe('https://console.redhat.com/app/url');
    });

    it('should build compliance app URL for ssg', () => {
      const result = appUrl('ssg');

      expect(result.toString()).toBe('https://console.redhat.com/app/url');
    });

    it('should build inventory app URL using getGroup', () => {
      window.location.pathname = '/insights/remediations';

      const result = appUrl('inventory');

      expect(result.toString()).toBe('https://console.redhat.com/app/url');
    });

    it('should build patch app URL', () => {
      const result = appUrl('patch-advisory');

      expect(result.toString()).toBe('https://console.redhat.com/app/url');
    });

    it('should throw error for unknown app', () => {
      expect(() => appUrl('unknown-app')).toThrow('Unknown app: unknown-app');
    });

    it('should handle null app', () => {
      expect(() => appUrl(null)).toThrow('Unknown app: null');
    });

    it('should handle undefined app', () => {
      expect(() => appUrl(undefined)).toThrow('Unknown app: undefined');
    });

    it('should handle empty string app', () => {
      expect(() => appUrl('')).toThrow('Unknown app: ');
    });
  });

  describe('integration scenarios', () => {
    it('should work together to build complete workflow URLs', () => {
      getIssuePrefix.mockReturnValue('advisor');
      window.location.pathname = '/insights/remediations';

      const mockUriChain = {
        segment: jest.fn().mockReturnThis(),
        toString: jest
          .fn()
          .mockReturnValue('https://console.redhat.com/insights/advisor'),
      };
      urijs.mockReturnValue(mockUriChain);

      const issue = { id: 'advisor:recommendation-123' };

      // Test tab detection
      const tab = getInventoryTabForIssue(issue);
      expect(tab).toBe('advisor');

      // Test URL building
      const urlBuilder = inventoryUrlBuilder(issue);
      const inventoryUrl = urlBuilder('system-123');
      expect(inventoryUrl).toBe(
        'https://console.redhat.com/insights/advisor/system-123?appName=advisor',
      );

      // Test issue URL building
      const issueUrl = buildIssueUrl(issue.id);
      expect(issueUrl).toBe('https://console.redhat.com/insights/advisor');
    });
  });
});
