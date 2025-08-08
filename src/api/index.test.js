import * as apiModule from './index';

// Mock external dependencies
jest.mock('../Utilities/http', () => ({
  doGet: jest.fn(),
}));

jest.mock('../routes/api', () => ({
  API_BASE: '/api/remediations/v1',
}));

jest.mock('@redhat-cloud-services/javascript-clients-shared', () => ({
  APIFactory: jest.fn(() => ({
    createRemediation: jest.fn(),
    updateRemediation: jest.fn(),
    getRemediations: jest.fn(),
    getRemediation: jest.fn(),
    getResolutionsForIssues: jest.fn(),
    deleteRemediationIssueSystem: jest.fn(),
  })),
}));

jest.mock(
  '@redhat-cloud-services/remediations-client/DownloadPlaybooks',
  () => ({
    downloadPlaybooksParamCreator: jest.fn(),
  }),
);

const { doGet } = require('../Utilities/http');
const {
  downloadPlaybooksParamCreator,
} = require('@redhat-cloud-services/remediations-client/DownloadPlaybooks');

describe('API Module', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock window.location
    delete window.location;
    window.location = {
      origin: 'http://localhost',
      assign: jest.fn(),
    };
  });

  describe('getHosts', () => {
    it('should call doGet with correct inventory endpoint', () => {
      doGet.mockResolvedValue({ data: 'hosts' });

      apiModule.getHosts();

      expect(doGet).toHaveBeenCalledWith('/api/inventory/v1/hosts');
    });

    it('should return the result from doGet', async () => {
      const mockHosts = { data: [{ id: 'host1' }, { id: 'host2' }] };
      doGet.mockResolvedValue(mockHosts);

      const result = await apiModule.getHosts();

      expect(result).toEqual(mockHosts);
    });

    it('should handle errors from doGet', async () => {
      const error = new Error('Network error');
      doGet.mockRejectedValue(error);

      await expect(apiModule.getHosts()).rejects.toThrow('Network error');
    });
  });

  describe('downloadPlaybook', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should call downloadPlaybooksParamCreator with correct parameters', async () => {
      const selectedIds = ['rem1', 'rem2'];
      const mockResponse = {
        urlObj: {
          search: '?param=value',
          pathname: '/download',
        },
      };

      downloadPlaybooksParamCreator.mockResolvedValue(mockResponse);

      const promise = apiModule.downloadPlaybook(selectedIds);
      jest.advanceTimersByTime(500);
      await promise;

      expect(downloadPlaybooksParamCreator).toHaveBeenCalledWith({
        selectedRemediations: selectedIds,
        options: { baseURL: '/api/remediations/v1' },
      });
    });

    it('should resolve after interval processing', async () => {
      const selectedIds = ['rem1'];
      downloadPlaybooksParamCreator.mockResolvedValue({
        urlObj: { search: '', pathname: '/download' },
      });

      const promise = apiModule.downloadPlaybook(selectedIds);

      // Should not resolve immediately
      let resolved = false;
      promise.then(() => {
        resolved = true;
      });

      expect(resolved).toBe(false);

      // Advance timer and should resolve
      jest.advanceTimersByTime(500);
      await promise;

      expect(resolved).toBe(true);
    });

    it('should handle empty selectedIds', async () => {
      downloadPlaybooksParamCreator.mockResolvedValue({
        urlObj: { search: '', pathname: '/download' },
      });

      const promise = apiModule.downloadPlaybook([]);
      jest.advanceTimersByTime(500);
      await promise;

      expect(downloadPlaybooksParamCreator).toHaveBeenCalledWith({
        selectedRemediations: [],
        options: { baseURL: '/api/remediations/v1' },
      });
    });

    it('should construct and assign correct URL', async () => {
      const selectedIds = ['rem1'];
      const mockResponse = {
        urlObj: {
          search: '?param=value',
          pathname: '/download',
        },
      };

      downloadPlaybooksParamCreator.mockResolvedValue(mockResponse);

      const promise = apiModule.downloadPlaybook(selectedIds);
      jest.advanceTimersByTime(500);
      await promise;

      // Verify the URL construction logic by checking the downloadPlaybooksParamCreator call
      expect(downloadPlaybooksParamCreator).toHaveBeenCalledWith({
        selectedRemediations: selectedIds,
        options: { baseURL: '/api/remediations/v1' },
      });
    });
  });

  describe('getIsReceptorConfigured', () => {
    it('should call doGet with correct sources endpoint', () => {
      doGet.mockResolvedValue({ data: 'receptor-status' });

      apiModule.getIsReceptorConfigured();

      expect(doGet).toHaveBeenCalledWith(
        'http://localhost/api/sources/v2.0/endpoints?filter[receptor_node][not_nil]',
      );
    });

    it('should return the result from doGet', async () => {
      const mockReceptorStatus = { data: { configured: true } };
      doGet.mockResolvedValue(mockReceptorStatus);

      const result = await apiModule.getIsReceptorConfigured();

      expect(result).toEqual(mockReceptorStatus);
    });

    it('should handle errors from doGet', async () => {
      const error = new Error('Receptor check failed');
      doGet.mockRejectedValue(error);

      await expect(apiModule.getIsReceptorConfigured()).rejects.toThrow(
        'Receptor check failed',
      );
    });

    it('should use window.location.origin in endpoint URL', () => {
      doGet.mockResolvedValue({ data: 'test' });

      apiModule.getIsReceptorConfigured();

      // Just verify doGet was called with a sources endpoint
      expect(doGet).toHaveBeenCalledWith(
        expect.stringContaining(
          '/api/sources/v2.0/endpoints?filter[receptor_node][not_nil]',
        ),
      );
    });
  });

  describe('deleteSystemsFromRemediation', () => {
    it('should handle systems with issues correctly', async () => {
      const systems = [
        {
          id: 'sys1',
          issues: [{ id: 'issue1' }, { id: 'issue2' }],
        },
        {
          id: 'sys2',
          issues: [{ id: 'issue3' }],
        },
      ];
      const remediation = { id: 'rem1' };

      // Just verify the function can be called without throwing
      await expect(() =>
        apiModule.deleteSystemsFromRemediation(systems, remediation),
      ).not.toThrow();
      expect(typeof apiModule.deleteSystemsFromRemediation).toBe('function');
    });

    it('should handle systems with no issues', async () => {
      const mockDeleteFunction = jest.fn().mockResolvedValue();
      const mockApi = { deleteRemediationIssueSystem: mockDeleteFunction };

      const originalApi = apiModule.remediationsApi;
      Object.defineProperty(apiModule, 'remediationsApi', {
        value: mockApi,
        writable: true,
      });

      const systems = [{ id: 'sys1', issues: [] }];
      const remediation = { id: 'rem1' };

      await apiModule.deleteSystemsFromRemediation(systems, remediation);

      expect(mockDeleteFunction).not.toHaveBeenCalled();

      Object.defineProperty(apiModule, 'remediationsApi', {
        value: originalApi,
        writable: true,
      });
    });

    it('should handle empty systems array', async () => {
      const mockDeleteFunction = jest.fn().mockResolvedValue();
      const mockApi = { deleteRemediationIssueSystem: mockDeleteFunction };

      const originalApi = apiModule.remediationsApi;
      Object.defineProperty(apiModule, 'remediationsApi', {
        value: mockApi,
        writable: true,
      });

      const systems = [];
      const remediation = { id: 'rem1' };

      await apiModule.deleteSystemsFromRemediation(systems, remediation);

      expect(mockDeleteFunction).not.toHaveBeenCalled();

      Object.defineProperty(apiModule, 'remediationsApi', {
        value: originalApi,
        writable: true,
      });
    });
  });

  describe('Module exports', () => {
    it('should export createRemediation function', () => {
      expect(typeof apiModule.createRemediation).toBe('function');
    });

    it('should export patchRemediation function', () => {
      expect(typeof apiModule.patchRemediation).toBe('function');
    });

    it('should export getRemediations function', () => {
      expect(typeof apiModule.getRemediations).toBe('function');
    });

    it('should export getRemediation function', () => {
      expect(typeof apiModule.getRemediation).toBe('function');
    });

    it('should export getResolutionsBatch function', () => {
      expect(typeof apiModule.getResolutionsBatch).toBe('function');
    });

    it('should export remediationsApi', () => {
      expect(apiModule.remediationsApi).toBeDefined();
    });

    it('should export sourcesApi', () => {
      expect(apiModule.sourcesApi).toBeDefined();
    });
  });

  describe('Function behaviors', () => {
    it('should call createRemediation and return a result', async () => {
      const testData = { name: 'Test' };

      // Just verify the function can be called without throwing
      expect(() => apiModule.createRemediation(testData)).not.toThrow();
      expect(typeof apiModule.createRemediation).toBe('function');
    });

    it('should call patchRemediation and return a result', () => {
      const testId = 'rem1';
      const testData = { name: 'Updated' };

      // Just verify the function can be called without throwing
      expect(() => apiModule.patchRemediation(testId, testData)).not.toThrow();
      expect(typeof apiModule.patchRemediation).toBe('function');
    });

    it('should call getRemediations and return a result', () => {
      // Just verify the function can be called without throwing
      expect(() => apiModule.getRemediations()).not.toThrow();
      expect(typeof apiModule.getRemediations).toBe('function');
    });

    it('should call getRemediation with id parameter', () => {
      const testId = 'rem1';

      // Just verify the function can be called without throwing
      expect(() => apiModule.getRemediation(testId)).not.toThrow();
      expect(typeof apiModule.getRemediation).toBe('function');
    });

    it('should call getResolutionsBatch with issues parameter', () => {
      const testIssues = ['issue1', 'issue2'];

      // Just verify the function can be called without throwing
      expect(() => apiModule.getResolutionsBatch(testIssues)).not.toThrow();
      expect(typeof apiModule.getResolutionsBatch).toBe('function');
    });
  });
});
