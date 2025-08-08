import { renderHook } from '@testing-library/react';
import { useFeatureFlag } from './useFeatureFlag';

// Mock the Unleash hooks
jest.mock('@unleash/proxy-client-react', () => ({
  useFlag: jest.fn(),
  useFlagsStatus: jest.fn(),
}));

import { useFlag, useFlagsStatus } from '@unleash/proxy-client-react';

describe('useFeatureFlag', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return false when flags are not ready', () => {
    useFlagsStatus.mockReturnValue({ flagsReady: false });
    useFlag.mockReturnValue(true);

    const { result } = renderHook(() => useFeatureFlag('test-flag'));

    expect(result.current).toBe(false);
    expect(useFlag).toHaveBeenCalledWith('test-flag');
    expect(useFlagsStatus).toHaveBeenCalled();
  });

  it('should return flag value when flags are ready and flag is enabled', () => {
    useFlagsStatus.mockReturnValue({ flagsReady: true });
    useFlag.mockReturnValue(true);

    const { result } = renderHook(() => useFeatureFlag('test-flag'));

    expect(result.current).toBe(true);
    expect(useFlag).toHaveBeenCalledWith('test-flag');
    expect(useFlagsStatus).toHaveBeenCalled();
  });

  it('should return flag value when flags are ready and flag is disabled', () => {
    useFlagsStatus.mockReturnValue({ flagsReady: true });
    useFlag.mockReturnValue(false);

    const { result } = renderHook(() => useFeatureFlag('test-flag'));

    expect(result.current).toBe(false);
    expect(useFlag).toHaveBeenCalledWith('test-flag');
    expect(useFlagsStatus).toHaveBeenCalled();
  });

  it('should work with different flag names', () => {
    useFlagsStatus.mockReturnValue({ flagsReady: true });
    useFlag.mockReturnValue(true);

    const { result: result1 } = renderHook(() => useFeatureFlag('feature-1'));
    const { result: result2 } = renderHook(() => useFeatureFlag('feature-2'));

    expect(result1.current).toBe(true);
    expect(result2.current).toBe(true);
    expect(useFlag).toHaveBeenCalledWith('feature-1');
    expect(useFlag).toHaveBeenCalledWith('feature-2');
  });

  it('should handle flags becoming ready', () => {
    useFlagsStatus.mockReturnValue({ flagsReady: false });
    useFlag.mockReturnValue(true);

    const { result, rerender } = renderHook(() => useFeatureFlag('test-flag'));

    expect(result.current).toBe(false);

    // Simulate flags becoming ready
    useFlagsStatus.mockReturnValue({ flagsReady: true });
    rerender();

    expect(result.current).toBe(true);
  });

  it('should handle empty or undefined flag names', () => {
    useFlagsStatus.mockReturnValue({ flagsReady: true });
    useFlag.mockReturnValue(false);

    const { result: result1 } = renderHook(() => useFeatureFlag(''));
    const { result: result2 } = renderHook(() => useFeatureFlag(undefined));

    expect(result1.current).toBe(false);
    expect(result2.current).toBe(false);
    expect(useFlag).toHaveBeenCalledWith('');
    expect(useFlag).toHaveBeenCalledWith(undefined);
  });
});
