import { doGet, doPost, doPatch, doDelete } from './http';

// Mock fetch globally
global.fetch = jest.fn();

describe('HTTP Utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    fetch.mockClear();
  });

  describe('HttpError', () => {
    it('should create an HttpError with description', () => {
      // We need to import the HttpError class, but it's not exported
      // So we'll test it indirectly through the functions that use it
    });
  });

  describe('doGet', () => {
    it('should perform a GET request successfully', async () => {
      const mockResponse = { data: 'test data' };
      const mockFetch = jest.fn().mockResolvedValue({
        ok: true,
        headers: {
          get: jest.fn().mockReturnValue('application/json'),
        },
        json: jest.fn().mockResolvedValue(mockResponse),
      });
      global.fetch = mockFetch;

      const result = await doGet('https://example.com/api/test');

      expect(mockFetch).toHaveBeenCalledWith('https://example.com/api/test', {
        credentials: 'same-origin',
        method: 'GET',
      });
      expect(result).toEqual(mockResponse);
    });

    it('should handle URL objects', async () => {
      const mockResponse = { data: 'test data' };
      const mockFetch = jest.fn().mockResolvedValue({
        ok: true,
        headers: {
          get: jest.fn().mockReturnValue('application/json'),
        },
        json: jest.fn().mockResolvedValue(mockResponse),
      });
      global.fetch = mockFetch;

      const url = new URL('https://example.com/api/test');
      await doGet(url);

      expect(mockFetch).toHaveBeenCalledWith('https://example.com/api/test', {
        credentials: 'same-origin',
        method: 'GET',
      });
    });

    it('should throw HttpError for non-ok response', async () => {
      const mockFetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 404,
        headers: {
          get: jest.fn().mockReturnValue('text/html'),
        },
      });
      global.fetch = mockFetch;

      await expect(doGet('https://example.com/api/test')).rejects.toThrow(
        'Error communicating with the server',
      );
    });

    it('should handle JSON error responses with details', async () => {
      const errorResponse = {
        errors: [
          {
            title: 'Not Found',
            details: { name: 'Resource not found' },
          },
        ],
      };
      const mockFetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 404,
        headers: {
          get: jest.fn().mockReturnValue('application/json'),
        },
        json: jest.fn().mockResolvedValue(errorResponse),
      });
      global.fetch = mockFetch;

      await expect(doGet('https://example.com/api/test')).rejects.toThrow(
        'Error communicating with the server',
      );
    });

    it('should handle JSON error responses without details', async () => {
      const errorResponse = {
        errors: [{ title: 'Bad Request' }],
      };
      const mockFetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 400,
        headers: {
          get: jest.fn().mockReturnValue('application/json'),
        },
        json: jest.fn().mockResolvedValue(errorResponse),
      });
      global.fetch = mockFetch;

      await expect(doGet('https://example.com/api/test')).rejects.toThrow(
        'Error communicating with the server',
      );
    });

    it('should handle malformed JSON in error response', async () => {
      const mockFetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 500,
        headers: {
          get: jest.fn().mockReturnValue('application/json'),
        },
        json: jest.fn().mockRejectedValue(new Error('Invalid JSON')),
      });
      global.fetch = mockFetch;

      await expect(doGet('https://example.com/api/test')).rejects.toThrow(
        'Error communicating with the server',
      );
    });

    it('should handle non-JSON content type in response', async () => {
      const mockFetch = jest.fn().mockResolvedValue({
        ok: true,
        headers: {
          get: jest.fn().mockReturnValue('text/html'),
        },
        json: jest.fn().mockResolvedValue({}),
      });
      global.fetch = mockFetch;

      await expect(doGet('https://example.com/api/test')).rejects.toThrow(
        'Error communicating with the server',
      );
    });

    it('should handle empty response', async () => {
      const mockFetch = jest.fn().mockResolvedValue(null);
      global.fetch = mockFetch;

      await expect(doGet('https://example.com/api/test')).rejects.toThrow();
    });
  });

  describe('doPost', () => {
    it('should perform a POST request successfully', async () => {
      const mockResponse = { id: 123, name: 'Created' };
      const postData = { name: 'Test', description: 'Test description' };
      const mockFetch = jest.fn().mockResolvedValue({
        ok: true,
        headers: {
          get: jest.fn().mockReturnValue('application/json'),
        },
        json: jest.fn().mockResolvedValue(mockResponse),
      });
      global.fetch = mockFetch;

      const result = await doPost('https://example.com/api/test', postData);

      expect(mockFetch).toHaveBeenCalledWith('https://example.com/api/test', {
        credentials: 'same-origin',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
        body: JSON.stringify(postData),
      });
      expect(result).toEqual(mockResponse);
    });

    it('should handle POST without data', async () => {
      const mockResponse = { status: 'success' };
      const mockFetch = jest.fn().mockResolvedValue({
        ok: true,
        headers: {
          get: jest.fn().mockReturnValue('application/json'),
        },
        json: jest.fn().mockResolvedValue(mockResponse),
      });
      global.fetch = mockFetch;

      const result = await doPost('https://example.com/api/test', null);

      expect(mockFetch).toHaveBeenCalledWith('https://example.com/api/test', {
        credentials: 'same-origin',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
      });
      expect(result).toEqual(mockResponse);
    });

    it('should handle POST errors', async () => {
      const postData = { name: 'Test' };
      const mockFetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 422,
        headers: {
          get: jest.fn().mockReturnValue('text/html'),
        },
      });
      global.fetch = mockFetch;

      await expect(
        doPost('https://example.com/api/test', postData),
      ).rejects.toThrow('Error communicating with the server');
    });
  });

  describe('doPatch', () => {
    it('should perform a PATCH request successfully', async () => {
      const patchData = { name: 'Updated Name' };
      const mockFetch = jest.fn().mockResolvedValue({
        ok: true,
        headers: {
          get: jest.fn().mockReturnValue('application/json'),
        },
      });
      global.fetch = mockFetch;

      await doPatch('https://example.com/api/test/123', patchData);

      expect(mockFetch).toHaveBeenCalledWith(
        'https://example.com/api/test/123',
        {
          credentials: 'same-origin',
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
          },
          body: JSON.stringify(patchData),
        },
      );
    });

    it('should handle PATCH without data', async () => {
      const mockFetch = jest.fn().mockResolvedValue({
        ok: true,
        headers: {
          get: jest.fn().mockReturnValue('application/json'),
        },
      });
      global.fetch = mockFetch;

      await doPatch('https://example.com/api/test/123', null);

      expect(mockFetch).toHaveBeenCalledWith(
        'https://example.com/api/test/123',
        {
          credentials: 'same-origin',
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
          },
        },
      );
    });

    it('should handle PATCH errors', async () => {
      const patchData = { name: 'Updated' };
      const mockFetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 404,
        headers: {
          get: jest.fn().mockReturnValue('text/html'),
        },
      });
      global.fetch = mockFetch;

      await expect(
        doPatch('https://example.com/api/test/123', patchData),
      ).rejects.toThrow('Error communicating with the server');
    });
  });

  describe('doDelete', () => {
    it('should perform a DELETE request successfully', async () => {
      const mockFetch = jest.fn().mockResolvedValue({
        ok: true,
        headers: {
          get: jest.fn().mockReturnValue('application/json'),
        },
      });
      global.fetch = mockFetch;

      await doDelete('https://example.com/api/test/123');

      expect(mockFetch).toHaveBeenCalledWith(
        'https://example.com/api/test/123',
        {
          credentials: 'same-origin',
          method: 'DELETE',
        },
      );
    });

    it('should handle DELETE errors', async () => {
      const mockFetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 403,
        headers: {
          get: jest.fn().mockReturnValue('text/html'),
        },
      });
      global.fetch = mockFetch;

      await expect(
        doDelete('https://example.com/api/test/123'),
      ).rejects.toThrow('Error communicating with the server');
    });

    it('should handle network errors', async () => {
      const mockFetch = jest.fn().mockRejectedValue(new Error('Network error'));
      global.fetch = mockFetch;

      await expect(
        doDelete('https://example.com/api/test/123'),
      ).rejects.toThrow('Network error');
    });
  });

  describe('Edge cases and error scenarios', () => {
    it('should handle fetch rejection', async () => {
      const mockFetch = jest
        .fn()
        .mockRejectedValue(new Error('Network failure'));
      global.fetch = mockFetch;

      await expect(doGet('https://example.com/api/test')).rejects.toThrow(
        'Network failure',
      );
    });

    it('should handle response without content-type header', async () => {
      const mockFetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 500,
        headers: {
          get: jest.fn().mockReturnValue(null),
        },
      });
      global.fetch = mockFetch;

      await expect(doGet('https://example.com/api/test')).rejects.toThrow();
    });

    it('should handle response with empty errors array', async () => {
      const errorResponse = { errors: [] };
      const mockFetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 400,
        headers: {
          get: jest.fn().mockReturnValue('application/json'),
        },
        json: jest.fn().mockResolvedValue(errorResponse),
      });
      global.fetch = mockFetch;

      await expect(doGet('https://example.com/api/test')).rejects.toThrow(
        'Error communicating with the server',
      );
    });

    it('should handle response with null errors', async () => {
      const errorResponse = { errors: null };
      const mockFetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 400,
        headers: {
          get: jest.fn().mockReturnValue('application/json'),
        },
        json: jest.fn().mockResolvedValue(errorResponse),
      });
      global.fetch = mockFetch;

      await expect(doGet('https://example.com/api/test')).rejects.toThrow(
        'Error communicating with the server',
      );
    });
  });
});
