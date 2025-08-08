import { renderHook, act } from '@testing-library/react';
import useRunSystems from './useRunSystems';

describe('useRunSystems Hook', () => {
  let mockFetchSystems;

  beforeEach(() => {
    mockFetchSystems = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const createMockRun = (overrides = {}) => ({
    id: 'run-123',
    status: 'success',
    executors: [
      { executor_id: 'run-123', executor_name: 'rhc' },
      { executor_id: 'other-run', executor_name: 'ansible' },
    ],
    ...overrides,
  });

  const createMockSystemsData = () => [
    {
      system_id: 'sys1',
      system_name: 'System 1',
      playbook_run_executor_id: 'run-123',
      status: 'success',
    },
    {
      system_id: 'sys2',
      system_name: 'System 2',
      playbook_run_executor_id: 'run-123',
      status: 'failure',
    },
    {
      system_id: 'sys3',
      system_name: 'System 3',
      playbook_run_executor_id: 'other-run', // Different executor
      status: 'success',
    },
  ];

  describe('Initial render and basic functionality', () => {
    it('should return initial state', () => {
      const { result } = renderHook(() =>
        useRunSystems(null, false, 'rem-123', mockFetchSystems),
      );

      expect(result.current.systems).toBeUndefined();
      expect(result.current.loading).toBe(false);
    });

    it('should not fetch when shouldFetch is false', () => {
      const run = createMockRun();

      renderHook(() => useRunSystems(run, false, 'rem-123', mockFetchSystems));

      expect(mockFetchSystems).not.toHaveBeenCalled();
    });

    it('should not fetch when run is null', () => {
      renderHook(() => useRunSystems(null, true, 'rem-123', mockFetchSystems));

      expect(mockFetchSystems).not.toHaveBeenCalled();
    });

    it('should not fetch when run is undefined', () => {
      renderHook(() =>
        useRunSystems(undefined, true, 'rem-123', mockFetchSystems),
      );

      expect(mockFetchSystems).not.toHaveBeenCalled();
    });
  });

  describe('Initial fetch behavior', () => {
    it('should fetch systems on initial render when conditions are met', async () => {
      const run = createMockRun();
      const mockData = createMockSystemsData();

      mockFetchSystems.mockResolvedValue({ data: mockData });

      const { result } = renderHook(() =>
        useRunSystems(run, true, 'rem-123', mockFetchSystems),
      );

      expect(mockFetchSystems).toHaveBeenCalledWith({
        remId: 'rem-123',
        playbook_run_id: 'run-123',
      });

      // Should be loading initially
      expect(result.current.loading).toBe(true);
      expect(result.current.systems).toBeUndefined();

      // Wait for promise resolution
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      expect(result.current.loading).toBe(false);
      expect(result.current.systems).toHaveLength(2); // Only systems matching run.id
      expect(result.current.systems[0]).toEqual({
        system_id: 'sys1',
        system_name: 'System 1',
        playbook_run_executor_id: 'run-123',
        status: 'success',
        executor_name: 'rhc',
      });
    });

    it('should handle fetch failure gracefully', async () => {
      const run = createMockRun();

      mockFetchSystems.mockRejectedValue(new Error('Fetch failed'));

      const { result } = renderHook(() =>
        useRunSystems(run, true, 'rem-123', mockFetchSystems),
      );

      expect(result.current.loading).toBe(true);

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      expect(result.current.loading).toBe(false);
      expect(result.current.systems).toBeUndefined();
    });

    it('should handle null data response', async () => {
      const run = createMockRun();

      mockFetchSystems.mockResolvedValue({ data: null });

      const { result } = renderHook(() =>
        useRunSystems(run, true, 'rem-123', mockFetchSystems),
      );

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      expect(result.current.loading).toBe(false);
      expect(result.current.systems).toEqual([]);
    });

    it('should handle undefined data response', async () => {
      const run = createMockRun();

      mockFetchSystems.mockResolvedValue({ data: undefined });

      const { result } = renderHook(() =>
        useRunSystems(run, true, 'rem-123', mockFetchSystems),
      );

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      expect(result.current.loading).toBe(false);
      expect(result.current.systems).toEqual([]);
    });

    it('should only fetch once on multiple renders', async () => {
      const run = createMockRun();
      const mockData = createMockSystemsData();

      mockFetchSystems.mockResolvedValue({ data: mockData });

      const { rerender } = renderHook(() =>
        useRunSystems(run, true, 'rem-123', mockFetchSystems),
      );

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      // Re-render the hook
      rerender();
      rerender();

      // Should only have been called once
      expect(mockFetchSystems).toHaveBeenCalledTimes(1);
    });
  });

  describe('Data filtering and mapping', () => {
    it('should filter systems by playbook_run_executor_id', async () => {
      const run = createMockRun();
      const mockData = createMockSystemsData();

      mockFetchSystems.mockResolvedValue({ data: mockData });

      const { result } = renderHook(() =>
        useRunSystems(run, true, 'rem-123', mockFetchSystems),
      );

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      // Should only include systems with matching playbook_run_executor_id
      expect(result.current.systems).toHaveLength(2);
      expect(
        result.current.systems.every(
          (s) => s.playbook_run_executor_id === 'run-123',
        ),
      ).toBe(true);
    });

    it('should add executor_name from run.executors', async () => {
      const run = createMockRun();
      const mockData = createMockSystemsData();

      mockFetchSystems.mockResolvedValue({ data: mockData });

      const { result } = renderHook(() =>
        useRunSystems(run, true, 'rem-123', mockFetchSystems),
      );

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      expect(result.current.systems[0].executor_name).toBe('rhc');
      expect(result.current.systems[1].executor_name).toBe('rhc');
    });

    it('should handle missing executor gracefully', async () => {
      const run = createMockRun({
        executors: [{ executor_id: 'different-id', executor_name: 'other' }],
      });
      const mockData = createMockSystemsData();

      mockFetchSystems.mockResolvedValue({ data: mockData });

      const { result } = renderHook(() =>
        useRunSystems(run, true, 'rem-123', mockFetchSystems),
      );

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      expect(result.current.systems[0].executor_name).toBeUndefined();
    });

    it('should handle empty executors array', async () => {
      const run = createMockRun({ executors: [] });
      const mockData = createMockSystemsData();

      mockFetchSystems.mockResolvedValue({ data: mockData });

      const { result } = renderHook(() =>
        useRunSystems(run, true, 'rem-123', mockFetchSystems),
      );

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      expect(result.current.systems[0].executor_name).toBeUndefined();
    });
  });

  describe('Status change refetch behavior', () => {
    it('should refetch when status changes from running to non-running', async () => {
      const mockData = createMockSystemsData();
      mockFetchSystems.mockResolvedValue({ data: mockData });

      let run = createMockRun({ status: 'running' });

      const { rerender } = renderHook(
        ({ run, shouldFetch, remId, fetchSystems }) =>
          useRunSystems(run, shouldFetch, remId, fetchSystems),
        {
          initialProps: {
            run,
            shouldFetch: true,
            remId: 'rem-123',
            fetchSystems: mockFetchSystems,
          },
        },
      );

      // Wait for initial fetch
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      expect(mockFetchSystems).toHaveBeenCalledTimes(1);

      // Change status from running to success
      run = createMockRun({ status: 'success' });

      rerender({
        run,
        shouldFetch: true,
        remId: 'rem-123',
        fetchSystems: mockFetchSystems,
      });

      // Wait for refetch
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      expect(mockFetchSystems).toHaveBeenCalledTimes(2);
    });

    it('should not refetch when status changes from non-running to non-running', async () => {
      const mockData = createMockSystemsData();
      mockFetchSystems.mockResolvedValue({ data: mockData });

      let run = createMockRun({ status: 'success' });

      const { rerender } = renderHook(
        ({ run, shouldFetch, remId, fetchSystems }) =>
          useRunSystems(run, shouldFetch, remId, fetchSystems),
        {
          initialProps: {
            run,
            shouldFetch: true,
            remId: 'rem-123',
            fetchSystems: mockFetchSystems,
          },
        },
      );

      // Wait for initial fetch
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      expect(mockFetchSystems).toHaveBeenCalledTimes(1);

      // Change status from success to failure (both non-running)
      run = createMockRun({ status: 'failure' });

      rerender({
        run,
        shouldFetch: true,
        remId: 'rem-123',
        fetchSystems: mockFetchSystems,
      });

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      // Should not refetch
      expect(mockFetchSystems).toHaveBeenCalledTimes(1);
    });

    it('should not refetch when shouldFetch becomes false', async () => {
      const mockData = createMockSystemsData();
      mockFetchSystems.mockResolvedValue({ data: mockData });

      let run = createMockRun({ status: 'running' });

      const { rerender } = renderHook(
        ({ run, shouldFetch, remId, fetchSystems }) =>
          useRunSystems(run, shouldFetch, remId, fetchSystems),
        {
          initialProps: {
            run,
            shouldFetch: true,
            remId: 'rem-123',
            fetchSystems: mockFetchSystems,
          },
        },
      );

      // Wait for initial fetch
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      // Change status and shouldFetch
      run = createMockRun({ status: 'success' });

      rerender({
        run,
        shouldFetch: false, // shouldFetch is now false
        remId: 'rem-123',
        fetchSystems: mockFetchSystems,
      });

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      // Should not refetch because shouldFetch is false
      expect(mockFetchSystems).toHaveBeenCalledTimes(1);
    });
  });

  describe('Edge cases and parameter changes', () => {
    it('should handle remId parameter change', async () => {
      const run = createMockRun();
      const mockData = createMockSystemsData();

      mockFetchSystems.mockResolvedValue({ data: mockData });

      const { rerender } = renderHook(
        ({ run, shouldFetch, remId, fetchSystems }) =>
          useRunSystems(run, shouldFetch, remId, fetchSystems),
        {
          initialProps: {
            run,
            shouldFetch: true,
            remId: 'rem-123',
            fetchSystems: mockFetchSystems,
          },
        },
      );

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      expect(mockFetchSystems).toHaveBeenCalledWith({
        remId: 'rem-123',
        playbook_run_id: 'run-123',
      });

      // Change remId - should trigger new fetch due to useEffect dependency
      rerender({
        run,
        shouldFetch: true,
        remId: 'rem-456',
        fetchSystems: mockFetchSystems,
      });

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      expect(mockFetchSystems).toHaveBeenCalledWith({
        remId: 'rem-456',
        playbook_run_id: 'run-123',
      });
    });

    it('should handle fetchSystems function change', async () => {
      const run = createMockRun();
      const mockData = createMockSystemsData();

      const newMockFetchSystems = jest
        .fn()
        .mockResolvedValue({ data: mockData });
      mockFetchSystems.mockResolvedValue({ data: mockData });

      const { rerender } = renderHook(
        ({ run, shouldFetch, remId, fetchSystems }) =>
          useRunSystems(run, shouldFetch, remId, fetchSystems),
        {
          initialProps: {
            run,
            shouldFetch: true,
            remId: 'rem-123',
            fetchSystems: mockFetchSystems,
          },
        },
      );

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      expect(mockFetchSystems).toHaveBeenCalledTimes(1);

      // Change fetchSystems function
      rerender({
        run,
        shouldFetch: true,
        remId: 'rem-123',
        fetchSystems: newMockFetchSystems,
      });

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      expect(newMockFetchSystems).toHaveBeenCalledWith({
        remId: 'rem-123',
        playbook_run_id: 'run-123',
      });
    });

    it('should handle run object change', async () => {
      const mockData = createMockSystemsData();
      mockFetchSystems.mockResolvedValue({ data: mockData });

      let run = createMockRun({ id: 'run-123' });

      const { rerender } = renderHook(
        ({ run, shouldFetch, remId, fetchSystems }) =>
          useRunSystems(run, shouldFetch, remId, fetchSystems),
        {
          initialProps: {
            run,
            shouldFetch: true,
            remId: 'rem-123',
            fetchSystems: mockFetchSystems,
          },
        },
      );

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      expect(mockFetchSystems).toHaveBeenCalledTimes(1);

      // Change run object (different id)
      run = createMockRun({ id: 'run-456' });

      rerender({
        run,
        shouldFetch: true,
        remId: 'rem-123',
        fetchSystems: mockFetchSystems,
      });

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      expect(mockFetchSystems).toHaveBeenCalledWith({
        remId: 'rem-123',
        playbook_run_id: 'run-456',
      });
    });

    it('should handle loading state correctly during concurrent fetches', async () => {
      const run = createMockRun({ status: 'running' });
      let resolvePromise;
      const promise = new Promise((resolve) => {
        resolvePromise = resolve;
      });

      mockFetchSystems.mockReturnValue(promise);

      const { result, rerender } = renderHook(() =>
        useRunSystems(run, true, 'rem-123', mockFetchSystems),
      );

      expect(result.current.loading).toBe(true);

      // Change status to trigger refetch while first fetch is still pending
      createMockRun({ status: 'success' });
      rerender();

      expect(result.current.loading).toBe(true);

      // Resolve the promise
      act(() => {
        resolvePromise({ data: createMockSystemsData() });
      });

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      expect(result.current.loading).toBe(false);
    });
  });
});
