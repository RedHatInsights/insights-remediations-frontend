import { renderHook } from '@testing-library/react';
import useRemediationsApi from './useRemediationsApi';
import { APIFactory } from '@redhat-cloud-services/javascript-clients-shared';
import * as remediationsApi from '@redhat-cloud-services/remediations-client';
import { useAxiosWithPlatformInterceptors } from '@redhat-cloud-services/frontend-components-utilities/interceptors';

jest.mock('@redhat-cloud-services/javascript-clients-shared', () => ({
  APIFactory: jest.fn(),
}));

jest.mock('@redhat-cloud-services/remediations-client', () => ({
  getRemediations: jest.fn(),
  getRemediation: jest.fn(),
  deleteRemediation: jest.fn(),
  updateRemediation: jest.fn(),
}));

jest.mock(
  '@redhat-cloud-services/frontend-components-utilities/interceptors',
  () => ({
    useAxiosWithPlatformInterceptors: jest.fn(),
  }),
);

describe('useRemediationsApi', () => {
  const mockAxios = { get: jest.fn(), post: jest.fn(), delete: jest.fn() };
  const mockApiInstance = {
    getRemediations: jest.fn(),
    getRemediation: jest.fn(),
    deleteRemediation: jest.fn(),
    updateRemediation: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    useAxiosWithPlatformInterceptors.mockReturnValue(mockAxios);
    APIFactory.mockReturnValue(mockApiInstance);
  });

  describe('hook initialization', () => {
    it('should return full API instance when no endpoint specified', () => {
      const { result } = renderHook(() => useRemediationsApi());

      expect(useAxiosWithPlatformInterceptors).toHaveBeenCalled();
      expect(APIFactory).toHaveBeenCalledWith(
        '/api/remediations',
        remediationsApi,
        mockAxios,
      );
      expect(result.current).toBe(mockApiInstance);
    });

    it('should return specific endpoint function when endpoint specified', () => {
      const { result } = renderHook(() =>
        useRemediationsApi('getRemediations'),
      );

      expect(APIFactory).toHaveBeenCalledWith(
        '/api/remediations',
        remediationsApi,
        mockAxios,
      );
      expect(result.current).toBe(mockApiInstance.getRemediations);
    });

    it('should use correct base URL', () => {
      renderHook(() => useRemediationsApi());

      expect(APIFactory).toHaveBeenCalledWith(
        '/api/remediations',
        expect.any(Object),
        expect.any(Object),
      );
    });

    it('should use axios with platform interceptors', () => {
      renderHook(() => useRemediationsApi());

      expect(useAxiosWithPlatformInterceptors).toHaveBeenCalled();
      expect(APIFactory).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(Object),
        mockAxios,
      );
    });
  });

  describe('endpoint validation', () => {
    it('should handle valid endpoints', () => {
      const { result } = renderHook(() => useRemediationsApi('getRemediation'));

      expect(result.current).toBe(mockApiInstance.getRemediation);
    });

    it('should warn and throw for invalid endpoints', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      // Mock APIFactory to return an instance without the invalid endpoint
      const incompleteApiInstance = {
        getRemediations: jest.fn(),
        // missing 'invalidEndpoint'
      };
      APIFactory.mockReturnValue(incompleteApiInstance);

      expect(() => {
        renderHook(() => useRemediationsApi('invalidEndpoint'));
      }).toThrow('Endpoint invalidEndpoint does not exist!');

      expect(consoleSpy).toHaveBeenCalledWith(
        'Available endpoints:',
        expect.arrayContaining([
          'getRemediations',
          'getRemediation',
          'deleteRemediation',
          'updateRemediation',
        ]),
      );

      consoleSpy.mockRestore();
    });

    it('should not throw when endpoint exists', () => {
      expect(() => {
        renderHook(() => useRemediationsApi('getRemediations'));
      }).not.toThrow();
    });
  });

  describe('memoization', () => {
    it('should memoize API instance based on axios and endpoint', () => {
      const { result, rerender } = renderHook(
        ({ endpoint }) => useRemediationsApi(endpoint),
        { initialProps: { endpoint: 'getRemediations' } },
      );

      const firstResult = result.current;

      // Re-render with same endpoint
      rerender({ endpoint: 'getRemediations' });
      expect(result.current).toBe(firstResult);

      // APIFactory should only be called once due to memoization
      expect(APIFactory).toHaveBeenCalledTimes(1);
    });

    it('should create new API instance when endpoint changes', () => {
      const { result, rerender } = renderHook(
        ({ endpoint }) => useRemediationsApi(endpoint),
        { initialProps: { endpoint: 'getRemediations' } },
      );

      const firstResult = result.current;

      // Change endpoint
      rerender({ endpoint: 'getRemediation' });
      expect(result.current).not.toBe(firstResult);
      expect(result.current).toBe(mockApiInstance.getRemediation);
    });

    it('should create new API instance when axios changes', () => {
      const { result, rerender } = renderHook(() => useRemediationsApi());

      // Change axios instance
      const newMockAxios = { get: jest.fn(), post: jest.fn() };
      useAxiosWithPlatformInterceptors.mockReturnValue(newMockAxios);

      rerender();
      expect(result.current).toBe(mockApiInstance); // Should be same reference since APIFactory returns same mock
      expect(APIFactory).toHaveBeenCalledWith(
        '/api/remediations',
        remediationsApi,
        newMockAxios,
      );
    });
  });

  describe('different endpoint types', () => {
    it('should handle CRUD operations endpoints', () => {
      const endpoints = [
        'getRemediations',
        'getRemediation',
        'deleteRemediation',
        'updateRemediation',
      ];

      endpoints.forEach((endpoint) => {
        const { result } = renderHook(() => useRemediationsApi(endpoint));
        expect(result.current).toBe(mockApiInstance[endpoint]);
      });
    });

    it('should return full API when endpoint is undefined', () => {
      const { result } = renderHook(() => useRemediationsApi(undefined));
      expect(result.current).toBe(mockApiInstance);
    });

    it('should return full API when endpoint is null', () => {
      const { result } = renderHook(() => useRemediationsApi(null));
      expect(result.current).toBe(mockApiInstance);
    });

    it('should return full API when endpoint is empty string', () => {
      const { result } = renderHook(() => useRemediationsApi(''));
      expect(result.current).toBe(mockApiInstance);
    });
  });

  describe('integration scenarios', () => {
    it('should work with realistic remediations API usage', () => {
      // Simulate getting the getRemediations endpoint
      const { result: getRemediationsResult } = renderHook(() =>
        useRemediationsApi('getRemediations'),
      );

      // Simulate getting a specific remediation endpoint
      const { result: getRemediationResult } = renderHook(() =>
        useRemediationsApi('getRemediation'),
      );

      expect(getRemediationsResult.current).toBe(
        mockApiInstance.getRemediations,
      );
      expect(getRemediationResult.current).toBe(mockApiInstance.getRemediation);
    });

    it('should handle component re-renders efficiently', () => {
      const { rerender } = renderHook(
        ({ endpoint }) => useRemediationsApi(endpoint),
        { initialProps: { endpoint: 'getRemediations' } },
      );

      // Multiple re-renders with same endpoint
      rerender({ endpoint: 'getRemediations' });
      rerender({ endpoint: 'getRemediations' });
      rerender({ endpoint: 'getRemediations' });

      // APIFactory should only be called once due to memoization
      expect(APIFactory).toHaveBeenCalledTimes(1);
    });
  });

  describe('error handling', () => {
    it('should throw descriptive error for non-existent endpoint', () => {
      // Create a mock that returns undefined for the non-existent endpoint
      const mockApiWithMissingEndpoint = {
        getRemediations: jest.fn(),
        nonExistentEndpoint: undefined,
      };
      APIFactory.mockReturnValue(mockApiWithMissingEndpoint);

      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      expect(() => {
        renderHook(() => useRemediationsApi('nonExistentEndpoint'));
      }).toThrow('Endpoint nonExistentEndpoint does not exist!');

      consoleSpy.mockRestore();
    });

    it('should provide available endpoints in warning', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      const mockApiWithMissingEndpoint = {
        getRemediations: jest.fn(),
      };
      APIFactory.mockReturnValue(mockApiWithMissingEndpoint);

      try {
        renderHook(() => useRemediationsApi('missingEndpoint'));
      } catch {
        // Expected to throw
      }

      expect(consoleSpy).toHaveBeenCalledWith(
        'Available endpoints:',
        Object.keys(remediationsApi),
      );

      consoleSpy.mockRestore();
    });
  });
});
