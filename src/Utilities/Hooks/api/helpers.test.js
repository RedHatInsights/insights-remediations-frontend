import { compileResult, fetchResult } from './helpers';

//TODO: This is overkill, we should just test the functions that implement the logic more intensily
describe('API helpers', () => {
  describe('compileResult', () => {
    it('should extract data from nested structure', () => {
      const fetchResult = {
        data: {
          data: ['item1', 'item2'],
          meta: { total: 2, count: 2 },
        },
      };
      const params = { limit: 10, offset: 0 };

      const result = compileResult(fetchResult, params);

      expect(result).toEqual({
        data: ['item1', 'item2'],
        meta: {
          limit: 10,
          offset: 0,
          total: 2,
          count: 2,
        },
      });
    });

    it('should use data directly if no nested structure', () => {
      const fetchResult = {
        data: ['item1', 'item2'],
      };
      const params = { limit: 5 };

      const result = compileResult(fetchResult, params);

      expect(result).toEqual({
        data: ['item1', 'item2'],
        meta: {
          limit: 5,
        },
      });
    });

    it('should handle missing meta in nested structure', () => {
      const fetchResult = {
        data: {
          data: 'test-data',
        },
      };
      const params = { page: 1 };

      const result = compileResult(fetchResult, params);

      expect(result).toEqual({
        data: 'test-data',
        meta: {
          page: 1,
        },
      });
    });

    it('should handle empty params', () => {
      const fetchResult = {
        data: {
          data: 'test',
          meta: { count: 1 },
        },
      };
      const params = {};

      const result = compileResult(fetchResult, params);

      expect(result).toEqual({
        data: 'test',
        meta: {
          count: 1,
        },
      });
    });

    it('should handle null fetchResult.data', () => {
      const fetchResult = { data: null };
      const params = { test: true };

      const result = compileResult(fetchResult, params);

      expect(result).toEqual({
        data: null,
        meta: {
          test: true,
        },
      });
    });
  });

  describe('fetchResult', () => {
    const mockFn = jest.fn();

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should call function with array params when convertToArray is not provided', async () => {
      const params = ['param1', 'param2'];
      const mockResult = { data: 'test' };
      mockFn.mockResolvedValue(mockResult);

      const result = await fetchResult(mockFn, params);

      expect(mockFn).toHaveBeenCalledWith('param1', 'param2');
      expect(result).toBe(mockResult);
    });

    it('should call function with object params when not array', async () => {
      const params = { id: 123, name: 'test' };
      const mockResult = { data: 'test-object' };
      mockFn.mockResolvedValue(mockResult);

      const result = await fetchResult(mockFn, params);

      expect(mockFn).toHaveBeenCalledWith(params);
      expect(result).toBe(mockResult);
    });

    it('should use convertToArray function when provided', async () => {
      const params = { limit: 10, offset: 0 };
      const convertToArray = jest.fn().mockReturnValue([10, 0]);
      const mockResult = { data: 'converted' };
      mockFn.mockResolvedValue(mockResult);

      const result = await fetchResult(mockFn, params, convertToArray);

      expect(convertToArray).toHaveBeenCalledWith(params);
      expect(mockFn).toHaveBeenCalledWith(10, 0);
      expect(result).toBe(mockResult);
    });

    it('should not convert array params even with convertToArray', async () => {
      const params = ['already', 'array'];
      const convertToArray = jest.fn();
      const mockResult = { data: 'array-data' };
      mockFn.mockResolvedValue(mockResult);

      const result = await fetchResult(mockFn, params, convertToArray);

      expect(convertToArray).not.toHaveBeenCalled();
      expect(mockFn).toHaveBeenCalledWith('already', 'array');
      expect(result).toBe(mockResult);
    });

    it('should use custom compileResult function', async () => {
      const params = { test: true };
      const mockResult = { data: 'raw' };
      const customCompileResult = jest.fn().mockReturnValue({ compiled: true });
      mockFn.mockResolvedValue(mockResult);

      const result = await fetchResult(
        mockFn,
        params,
        null,
        customCompileResult,
      );

      expect(mockFn).toHaveBeenCalledWith(params);
      expect(customCompileResult).toHaveBeenCalledWith(mockResult, params);
      expect(result).toEqual({ compiled: true });
    });

    it('should handle null params with convertToArray', async () => {
      const params = null;
      const convertToArray = jest.fn().mockReturnValue([]);
      const mockResult = { data: 'null-params' };
      mockFn.mockResolvedValue(mockResult);

      const result = await fetchResult(mockFn, params, convertToArray);

      expect(convertToArray).toHaveBeenCalledWith(null);
      expect(mockFn).toHaveBeenCalledWith();
      expect(result).toBe(mockResult);
    });

    it('should handle undefined params', async () => {
      const params = undefined;
      const mockResult = { data: 'undefined-params' };
      mockFn.mockResolvedValue(mockResult);

      const result = await fetchResult(mockFn, params);

      expect(mockFn).toHaveBeenCalledWith();
      expect(result).toBe(mockResult);
    });

    it('should handle async errors from function', async () => {
      const params = { test: true };
      const error = new Error('Async error');
      mockFn.mockRejectedValue(error);

      await expect(fetchResult(mockFn, params)).rejects.toThrow('Async error');
    });
  });
});
