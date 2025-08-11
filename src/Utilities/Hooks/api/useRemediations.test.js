import { renderHook } from '@testing-library/react';
import useRemediations from './useRemediations';
import useRemediationsQuery from '../../../api/useRemediationsQuery';

jest.mock('../../../api/useRemediationsQuery', () => ({
  __esModule: true,
  default: jest.fn(),
}));

describe('useRemediations', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should call useRemediationsQuery with correct parameters', () => {
    const mockOptions = { limit: 10, offset: 0 };
    const mockReturnValue = { data: [], isLoading: false };
    useRemediationsQuery.mockReturnValue(mockReturnValue);

    const { result } = renderHook(() => useRemediations(mockOptions));

    expect(useRemediationsQuery).toHaveBeenCalledWith('remediations', {
      ...mockOptions,
      convertToArray: expect.any(Function),
    });
    expect(result.current).toBe(mockReturnValue);
  });

  it('should work without options', () => {
    const mockReturnValue = { data: [], isLoading: false };
    useRemediationsQuery.mockReturnValue(mockReturnValue);

    const { result } = renderHook(() => useRemediations());

    expect(useRemediationsQuery).toHaveBeenCalledWith('remediations', {
      convertToArray: expect.any(Function),
    });
    expect(result.current).toBe(mockReturnValue);
  });

  it('should pass through all options and add convertToArray', () => {
    const mockOptions = {
      enabled: true,
      refetchOnWindowFocus: false,
      customOption: 'test',
    };
    useRemediationsQuery.mockReturnValue({ data: [] });

    renderHook(() => useRemediations(mockOptions));

    expect(useRemediationsQuery).toHaveBeenCalledWith('remediations', {
      enabled: true,
      refetchOnWindowFocus: false,
      customOption: 'test',
      convertToArray: expect.any(Function),
    });
  });

  describe('convertToArray function', () => {
    it('should return array as-is when params is already an array', () => {
      useRemediationsQuery.mockImplementation((key, options) => {
        // Test the convertToArray function
        const convertToArray = options.convertToArray;
        const params = ['test1', 'test2', 'test3'];
        const result = convertToArray(params);
        expect(result).toEqual(['test1', 'test2', 'test3']);
        return { data: [] };
      });

      renderHook(() => useRemediations());
    });

    it('should convert object params to array format', () => {
      useRemediationsQuery.mockImplementation((key, options) => {
        const convertToArray = options.convertToArray;
        const params = {
          policyId: 'policy123',
          tailoringId: 'tailoring456',
          assignRulesRequest: { rules: ['rule1'] },
        };
        const result = convertToArray(params);
        expect(result).toEqual([
          'policy123',
          'tailoring456',
          undefined, // xRHIDENTITY
          { rules: ['rule1'] },
        ]);
        return { data: [] };
      });

      renderHook(() => useRemediations());
    });

    it('should handle object params with missing properties', () => {
      useRemediationsQuery.mockImplementation((key, options) => {
        const convertToArray = options.convertToArray;
        const params = {
          policyId: 'policy123',
          // tailoringId is missing
          assignRulesRequest: { rules: ['rule1'] },
        };
        const result = convertToArray(params);
        expect(result).toEqual([
          'policy123',
          undefined, // missing tailoringId
          undefined, // xRHIDENTITY
          { rules: ['rule1'] },
        ]);
        return { data: [] };
      });

      renderHook(() => useRemediations());
    });

    it('should handle empty object params', () => {
      useRemediationsQuery.mockImplementation((key, options) => {
        const convertToArray = options.convertToArray;
        const params = {};
        const result = convertToArray(params);
        expect(result).toEqual([
          undefined, // policyId
          undefined, // tailoringId
          undefined, // xRHIDENTITY
          undefined, // assignRulesRequest
        ]);
        return { data: [] };
      });

      renderHook(() => useRemediations());
    });
  });
});
