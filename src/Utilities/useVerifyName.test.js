import { renderHook, act } from '@testing-library/react';
import { useVerifyName } from './useVerifyName';

describe('useVerifyName', () => {
  beforeEach(() => {
    jest.clearAllTimers();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('should be defined and be a function', () => {
    expect(useVerifyName).toBeDefined();
    expect(typeof useVerifyName).toBe('function');
  });

  it('should return initial state correctly', () => {
    const { result } = renderHook(() => useVerifyName('test-name', []));
    const [isVerifying, isDuplicate] = result.current;

    expect(typeof isVerifying).toBe('boolean');
    expect(typeof isDuplicate).toBe('boolean');
    expect(isVerifying).toBe(false);
    expect(isDuplicate).toBe(false);
  });

  it('should detect duplicate names', async () => {
    const remediationsList = [
      { name: 'existing-remediation' },
      { name: 'another-remediation' },
    ];

    const { result, rerender } = renderHook(
      ({ name, list }) => useVerifyName(name, list),
      {
        initialProps: { name: 'test-name', list: remediationsList },
      },
    );

    // Change to a duplicate name
    rerender({ name: 'existing-remediation', list: remediationsList });

    // Should start verifying
    expect(result.current[0]).toBe(true);

    // Fast-forward the timer
    act(() => {
      jest.advanceTimersByTime(500);
    });

    // Should detect duplicate
    expect(result.current[0]).toBe(false);
    expect(result.current[1]).toBe(true);
  });

  it('should not detect duplicate for unique names', async () => {
    const remediationsList = [
      { name: 'existing-remediation' },
      { name: 'another-remediation' },
    ];

    const { result, rerender } = renderHook(
      ({ name, list }) => useVerifyName(name, list),
      {
        initialProps: { name: 'test-name', list: remediationsList },
      },
    );

    // Change to a unique name
    rerender({ name: 'unique-name', list: remediationsList });

    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(result.current[0]).toBe(false);
    expect(result.current[1]).toBe(false);
  });

  it('should handle empty remediation list', () => {
    const { result, rerender } = renderHook(
      ({ name, list }) => useVerifyName(name, list),
      {
        initialProps: { name: 'test-name', list: [] },
      },
    );

    rerender({ name: 'any-name', list: [] });

    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(result.current[1]).toBe(false);
  });

  it('should handle names with whitespace', () => {
    const remediationsList = [{ name: 'test-name' }];

    const { result, rerender } = renderHook(
      ({ name, list }) => useVerifyName(name, list),
      {
        initialProps: { name: 'test-name', list: remediationsList },
      },
    );

    // Test with whitespace that should be trimmed to match
    rerender({ name: '  test-name  ', list: remediationsList });

    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(result.current[1]).toBe(true);
  });

  it('should handle invalid patterns', () => {
    const remediationsList = [{ name: ' invalid-leading-space' }];

    const { result, rerender } = renderHook(
      ({ name, list }) => useVerifyName(name, list),
      {
        initialProps: { name: 'test-name', list: remediationsList },
      },
    );

    // Test name that starts with space (invalid pattern)
    rerender({ name: ' invalid-leading-space', list: remediationsList });

    act(() => {
      jest.advanceTimersByTime(500);
    });

    // Should not detect as duplicate due to invalid pattern
    expect(result.current[1]).toBe(false);
  });

  it('should clear timers when name changes quickly', () => {
    const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout');
    const remediationsList = [{ name: 'test' }];

    const { rerender } = renderHook(
      ({ name, list }) => useVerifyName(name, list),
      {
        initialProps: { name: 'initial', list: remediationsList },
      },
    );

    // Change name multiple times quickly
    rerender({ name: 'name1', list: remediationsList });
    rerender({ name: 'name2', list: remediationsList });
    rerender({ name: 'name3', list: remediationsList });

    expect(clearTimeoutSpy).toHaveBeenCalled();
    clearTimeoutSpy.mockRestore();
  });

  it('should only return duplicate status for current name', () => {
    const remediationsList = [{ name: 'duplicate-name' }];

    const { result, rerender } = renderHook(
      ({ name, list }) => useVerifyName(name, list),
      {
        initialProps: { name: 'initial', list: remediationsList },
      },
    );

    // First change to duplicate name
    rerender({ name: 'duplicate-name', list: remediationsList });

    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(result.current[1]).toBe(true);

    // Then change to different name before timeout
    rerender({ name: 'different-name', list: remediationsList });

    // Should not show duplicate for the new name even though previous check was duplicate
    expect(result.current[1]).toBe(false);
  });

  it('should handle remediation list changes', () => {
    const initialList = [{ name: 'existing' }];
    const updatedList = [{ name: 'existing' }, { name: 'new-item' }];

    const { result, rerender } = renderHook(
      ({ name, list }) => useVerifyName(name, list),
      {
        initialProps: { name: 'new-item', list: initialList },
      },
    );

    // Initially should not be duplicate
    act(() => {
      jest.advanceTimersByTime(500);
    });
    expect(result.current[1]).toBe(false);

    // Update list to include the name
    rerender({ name: 'new-item', list: updatedList });

    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(result.current[1]).toBe(true);
  });
});
