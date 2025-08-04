import { renderHook, act } from '@testing-library/react';
import useRemediationFetchExtras from './useRemediationFetchExtras';

// Mock p-all
jest.mock('p-all');
import pAll from 'p-all';

describe('useRemediationFetchExtras', () => {
  let mockFetch, mockFetchBatched;

  beforeEach(() => {
    jest.clearAllMocks();

    mockFetch = jest.fn();
    mockFetchBatched = jest.fn();

    // Default pAll implementation
    pAll.mockImplementation(async (tasks) => {
      return Promise.all(tasks.map((task) => task()));
    });
  });

  const renderFetchExtras = () => {
    return renderHook(() =>
      useRemediationFetchExtras({
        fetch: mockFetch,
        fetchBatched: mockFetchBatched,
      }),
    );
  };

  describe('exporter', () => {
    it('should call fetchBatched with correct parameters', async () => {
      const testData = { test: 'data' };
      mockFetchBatched.mockResolvedValue({ data: testData });

      const { result } = renderFetchExtras();

      await act(async () => {
        const exporterResult = await result.current.exporter({
          format: 'json',
        });
        expect(exporterResult).toEqual(testData);
      });

      expect(mockFetchBatched).toHaveBeenCalledWith({ format: 'json' });
    });

    it('should handle multiple export calls', async () => {
      const testData1 = { data: 'export1' };
      const testData2 = { data: 'export2' };
      mockFetchBatched
        .mockResolvedValueOnce({ data: testData1 })
        .mockResolvedValueOnce({ data: testData2 });

      const { result } = renderFetchExtras();

      await act(async () => {
        const result1 = await result.current.exporter({ format: 'json' });
        const result2 = await result.current.exporter({ format: 'csv' });

        expect(result1).toEqual(testData1);
        expect(result2).toEqual(testData2);
      });

      expect(mockFetchBatched).toHaveBeenCalledTimes(2);
      expect(mockFetchBatched).toHaveBeenCalledWith({ format: 'json' });
      expect(mockFetchBatched).toHaveBeenCalledWith({ format: 'csv' });
    });

    it('should handle export errors', async () => {
      const error = new Error('Export failed');
      mockFetchBatched.mockRejectedValue(error);

      const { result } = renderFetchExtras();

      await act(async () => {
        await expect(
          result.current.exporter({ format: 'json' }),
        ).rejects.toThrow('Export failed');
      });
    });
  });

  describe('fetchAllIds', () => {
    it('should fetch all IDs with correct parameters', async () => {
      const testData = [
        { id: 'id1', name: 'item1' },
        { id: 'id2', name: 'item2' },
        { id: 'id3', name: 'item3' },
      ];
      mockFetchBatched.mockResolvedValue({ data: testData });

      const { result } = renderFetchExtras();

      await act(async () => {
        const ids = await result.current.fetchAllIds({
          category: 'remediations',
        });
        expect(ids).toEqual(['id1', 'id2', 'id3']);
      });

      expect(mockFetchBatched).toHaveBeenCalledWith({
        idsOnly: true,
        fetchAllIdsParams: { category: 'remediations' },
      });
    });

    it('should handle empty results', async () => {
      mockFetchBatched.mockResolvedValue({ data: [] });

      const { result } = renderFetchExtras();

      await act(async () => {
        const ids = await result.current.fetchAllIds({ category: 'empty' });
        expect(ids).toEqual([]);
      });
    });

    it('should handle missing id field', async () => {
      const testData = [{ id: 'id1' }, { name: 'no-id' }, { id: 'id3' }];
      mockFetchBatched.mockResolvedValue({ data: testData });

      const { result } = renderFetchExtras();

      await act(async () => {
        const ids = await result.current.fetchAllIds({});
        expect(ids).toEqual(['id1', undefined, 'id3']);
      });
    });

    it('should handle fetchAllIds errors', async () => {
      const error = new Error('Fetch IDs failed');
      mockFetchBatched.mockRejectedValue(error);

      const { result } = renderFetchExtras();

      await act(async () => {
        await expect(result.current.fetchAllIds({})).rejects.toThrow(
          'Fetch IDs failed',
        );
      });
    });
  });

  describe('fetchNamedQueue', () => {
    it('should process named queue correctly', async () => {
      const queue = {
        remediations: { filter: 'active' },
        systems: { filter: 'connected' },
        issues: { filter: 'critical' },
      };

      mockFetch
        .mockResolvedValueOnce('remediations-result')
        .mockResolvedValueOnce('systems-result')
        .mockResolvedValueOnce('issues-result');

      pAll.mockImplementation(async (tasks) => {
        return Promise.all(tasks.map((task) => task()));
      });

      const { result } = renderFetchExtras();

      await act(async () => {
        const queueResult = await result.current.fetchQueue(queue);

        expect(queueResult).toEqual({
          remediations: 'remediations-result',
          systems: 'systems-result',
          issues: 'issues-result',
        });
      });

      expect(mockFetch).toHaveBeenCalledTimes(3);
      expect(mockFetch).toHaveBeenCalledWith({ filter: 'active' });
      expect(mockFetch).toHaveBeenCalledWith({ filter: 'connected' });
      expect(mockFetch).toHaveBeenCalledWith({ filter: 'critical' });
      expect(pAll).toHaveBeenCalledWith(expect.any(Array), { concurrency: 1 });
    });

    it('should handle empty named queue', async () => {
      const { result } = renderFetchExtras();

      await act(async () => {
        const queueResult = await result.current.fetchQueue({});
        expect(queueResult).toEqual({});
      });

      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('should handle named queue errors', async () => {
      const queue = {
        remediations: { filter: 'active' },
        systems: { filter: 'connected' },
      };

      mockFetch
        .mockResolvedValueOnce('remediations-result')
        .mockRejectedValueOnce(new Error('Systems fetch failed'));

      const { result } = renderFetchExtras();

      await act(async () => {
        await expect(result.current.fetchQueue(queue)).rejects.toThrow(
          'Systems fetch failed',
        );
      });
    });
  });

  describe('fetchQueue', () => {
    it('should process array queue correctly', async () => {
      const queue = [{ id: 'item1' }, { id: 'item2' }, { id: 'item3' }];

      mockFetch
        .mockResolvedValueOnce('result1')
        .mockResolvedValueOnce('result2')
        .mockResolvedValueOnce('result3');

      const { result } = renderFetchExtras();

      await act(async () => {
        const queueResult = await result.current.fetchQueue(queue);
        expect(Object.values(queueResult)).toEqual([
          'result1',
          'result2',
          'result3',
        ]);
      });

      expect(mockFetch).toHaveBeenCalledTimes(3);
      expect(pAll).toHaveBeenCalledWith(expect.any(Array), { concurrency: 1 });
    });

    it('should handle empty array queue', async () => {
      const { result } = renderFetchExtras();

      await act(async () => {
        const queueResult = await result.current.fetchQueue([]);
        expect(Object.values(queueResult)).toEqual([]);
      });

      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('should handle array queue errors', async () => {
      const queue = [{ id: 'item1' }, { id: 'item2' }];

      mockFetch
        .mockResolvedValueOnce('result1')
        .mockRejectedValueOnce(new Error('Item2 fetch failed'));

      const { result } = renderFetchExtras();

      await act(async () => {
        await expect(result.current.fetchQueue(queue)).rejects.toThrow(
          'Item2 fetch failed',
        );
      });
    });

    it('should respect concurrency limits for array queue', async () => {
      const queue = Array.from({ length: 10 }, (_, i) => ({ id: `item${i}` }));

      mockFetch.mockImplementation((params) =>
        Promise.resolve(`result-${params.id}`),
      );

      const { result } = renderFetchExtras();

      await act(async () => {
        await result.current.fetchQueue(queue);
      });

      expect(pAll).toHaveBeenCalledWith(expect.any(Array), { concurrency: 1 });
    });
  });

  describe('fetchBatchedNamedQueue', () => {
    it('should process batched named queue correctly', async () => {
      const queue = {
        batch1: { items: ['1', '2'] },
        batch2: { items: ['3', '4'] },
      };

      mockFetchBatched
        .mockResolvedValueOnce('batch1-result')
        .mockResolvedValueOnce('batch2-result');

      const { result } = renderFetchExtras();

      await act(async () => {
        const queueResult = await result.current.fetchBatchedQueue(queue);

        expect(queueResult).toEqual({
          batch1: 'batch1-result',
          batch2: 'batch2-result',
        });
      });

      expect(mockFetchBatched).toHaveBeenCalledTimes(2);
      expect(mockFetchBatched).toHaveBeenCalledWith({ items: ['1', '2'] });
      expect(mockFetchBatched).toHaveBeenCalledWith({ items: ['3', '4'] });
      expect(pAll).toHaveBeenCalledWith(expect.any(Array), { concurrency: 1 });
    });

    it('should handle batched named queue errors', async () => {
      const queue = {
        batch1: { items: ['1', '2'] },
        batch2: { items: ['3', '4'] },
      };

      mockFetchBatched
        .mockResolvedValueOnce('batch1-result')
        .mockRejectedValueOnce(new Error('Batch2 failed'));

      const { result } = renderFetchExtras();

      await act(async () => {
        await expect(result.current.fetchBatchedQueue(queue)).rejects.toThrow(
          'Batch2 failed',
        );
      });
    });
  });

  describe('fetchBatchedQueue', () => {
    it('should process batched array queue correctly', async () => {
      const queue = [
        { batch: ['1', '2'] },
        { batch: ['3', '4'] },
        { batch: ['5', '6'] },
      ];

      mockFetchBatched
        .mockResolvedValueOnce('batch-result1')
        .mockResolvedValueOnce('batch-result2')
        .mockResolvedValueOnce('batch-result3');

      const { result } = renderFetchExtras();

      await act(async () => {
        const queueResult = await result.current.fetchBatchedQueue(queue);
        expect(Object.values(queueResult)).toEqual([
          'batch-result1',
          'batch-result2',
          'batch-result3',
        ]);
      });

      expect(mockFetchBatched).toHaveBeenCalledTimes(3);
      expect(pAll).toHaveBeenCalledWith(expect.any(Array), { concurrency: 1 });
    });

    it('should handle empty batched queue', async () => {
      const { result } = renderFetchExtras();

      await act(async () => {
        const queueResult = await result.current.fetchBatchedQueue([]);
        expect(Object.values(queueResult)).toEqual([]);
      });

      expect(mockFetchBatched).not.toHaveBeenCalled();
    });

    it('should handle batched array queue errors', async () => {
      const queue = [{ batch: ['1', '2'] }, { batch: ['3', '4'] }];

      mockFetchBatched
        .mockResolvedValueOnce('batch-result1')
        .mockRejectedValueOnce(new Error('Batch2 failed'));

      const { result } = renderFetchExtras();

      await act(async () => {
        await expect(result.current.fetchBatchedQueue(queue)).rejects.toThrow(
          'Batch2 failed',
        );
      });
    });

    it('should respect concurrency limits for batched array queue', async () => {
      const queue = Array.from({ length: 5 }, (_, i) => ({
        batch: [`${i}1`, `${i}2`],
      }));

      mockFetchBatched.mockImplementation((params) =>
        Promise.resolve(`result-${params.batch.join('-')}`),
      );

      const { result } = renderFetchExtras();

      await act(async () => {
        await result.current.fetchBatchedQueue(queue);
      });

      expect(pAll).toHaveBeenCalledWith(expect.any(Array), { concurrency: 1 });
    });
  });

  describe('Integration Tests', () => {
    it('should handle mixed queue types correctly', async () => {
      const { result } = renderFetchExtras();

      // Test object queue (should use named queue)
      mockFetch.mockResolvedValue('named-result');
      await act(async () => {
        const namedResult = await result.current.fetchQueue({
          test: { id: 1 },
        });
        expect(namedResult).toEqual({ test: 'named-result' });
      });

      // Test array queue (should use array queue)
      mockFetch.mockResolvedValue('array-result');
      await act(async () => {
        const arrayResult = await result.current.fetchQueue([{ id: 1 }]);
        expect(Object.values(arrayResult)).toEqual(['array-result']);
      });
    });

    it('should handle all functions with complex data', async () => {
      const { result } = renderFetchExtras();

      // Test exporter
      mockFetchBatched.mockResolvedValue({ data: { exported: true } });
      await act(async () => {
        const exportResult = await result.current.exporter({ format: 'json' });
        expect(exportResult.exported).toBe(true);
      });

      // Test fetchAllIds
      mockFetchBatched.mockResolvedValue({
        data: [{ id: 'complex-1' }, { id: 'complex-2' }],
      });
      await act(async () => {
        const ids = await result.current.fetchAllIds({ complex: true });
        expect(ids).toEqual(['complex-1', 'complex-2']);
      });

      // Test queue functions
      mockFetch.mockResolvedValue('queue-result');
      mockFetchBatched.mockResolvedValue('batched-queue-result');

      await act(async () => {
        const queueResult = await result.current.fetchQueue([
          { complex: true },
        ]);
        const batchedResult = await result.current.fetchBatchedQueue([
          { complex: true },
        ]);

        expect(Object.values(queueResult)).toEqual(['queue-result']);
        expect(Object.values(batchedResult)).toEqual(['batched-queue-result']);
      });
    });

    it('should maintain function references across re-renders', () => {
      const { result, rerender } = renderFetchExtras();

      const initialFunctions = { ...result.current };

      rerender();

      const afterRerender = { ...result.current };

      // All functions should maintain their references due to useCallback
      expect(initialFunctions.exporter).toBe(afterRerender.exporter);
      expect(initialFunctions.fetchAllIds).toBe(afterRerender.fetchAllIds);
      expect(initialFunctions.fetchQueue).toBe(afterRerender.fetchQueue);
      expect(initialFunctions.fetchBatchedQueue).toBe(
        afterRerender.fetchBatchedQueue,
      );
    });
  });

  describe('Edge Cases', () => {
    it('should handle null/undefined parameters gracefully', async () => {
      const { result } = renderFetchExtras();

      // Test with null parameters
      mockFetchBatched.mockResolvedValue({ data: null });
      await act(async () => {
        const exportResult = await result.current.exporter(null);
        expect(exportResult).toBeNull();
      });

      // Test with undefined queue - should handle gracefully
      await act(async () => {
        await expect(result.current.fetchQueue(null)).rejects.toThrow();
      });
    });

    it('should handle concurrent requests correctly', async () => {
      const { result } = renderFetchExtras();

      mockFetch.mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(() => resolve('concurrent-result'), 10),
          ),
      );

      const promises = [];
      await act(async () => {
        // Start multiple concurrent requests
        for (let i = 0; i < 5; i++) {
          promises.push(result.current.fetchQueue([{ id: i }]));
        }

        const results = await Promise.all(promises);
        expect(results.length).toBe(5);
        results.forEach((result) => {
          expect(Object.values(result)).toEqual(['concurrent-result']);
        });
      });
    });

    it('should handle very large queues', async () => {
      const { result } = renderFetchExtras();

      const largeQueue = Array.from({ length: 100 }, (_, i) => ({ id: i }));
      mockFetch.mockImplementation((params) =>
        Promise.resolve(`result-${params.id}`),
      );

      await act(async () => {
        const queueResult = await result.current.fetchQueue(largeQueue);
        const results = Object.values(queueResult);
        expect(results.length).toBe(100);
        expect(results[0]).toBe('result-0');
        expect(results[99]).toBe('result-99');
      });

      // Should respect concurrency limit
      expect(pAll).toHaveBeenCalledWith(expect.any(Array), { concurrency: 1 });
    });
  });
});
