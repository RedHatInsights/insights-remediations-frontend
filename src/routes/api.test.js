import { remediationsApi } from '../api';
import { API_BASE } from '../constants';
import {
  deleteRemediationSystems,
  deleteRemediationSystemsBatched,
  getRemediationPlaybookSystemsList,
  getPlaybookLogs,
  updateRemediationWrapper,
} from './api';
import axiosInstance from '@redhat-cloud-services/frontend-components-utilities/interceptors';

// Mock the remediations API
jest.mock('../api', () => ({
  remediationsApi: {
    getPlaybookRunSystems: jest.fn(),
    getPlaybookRunSystemDetails: jest.fn(),
    updateRemediation: jest.fn(),
  },
}));

// Mock axios instance
jest.mock(
  '@redhat-cloud-services/frontend-components-utilities/interceptors',
  () => ({
    __esModule: true,
    default: {
      delete: jest.fn(),
    },
  }),
);

describe('Routes API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('constants', () => {
    it('should export correct API_BASE', () => {
      expect(API_BASE).toBe('/api/remediations/v1');
    });
  });

  describe('deleteRemediationSystems', () => {
    it('should call axios delete with correct URL and data', async () => {
      const systems = [{ id: 'system-1' }, { id: 'system-2' }];
      const remediation = { id: 'remediation-123' };
      const mockResponse = { success: true };
      axiosInstance.delete.mockResolvedValue(mockResponse);

      const result = await deleteRemediationSystems(systems, remediation);

      expect(axiosInstance.delete).toHaveBeenCalledWith(
        '/api/remediations/v1/remediations/remediation-123/systems',
        {
          data: { system_ids: ['system-1', 'system-2'] },
        },
      );
      expect(result).toBe(mockResponse);
    });

    it('should handle empty systems array', async () => {
      const systems = [];
      const remediation = { id: 'remediation-123' };
      const mockResponse = { success: true };
      axiosInstance.delete.mockResolvedValue(mockResponse);

      await deleteRemediationSystems(systems, remediation);

      expect(axiosInstance.delete).toHaveBeenCalledWith(
        '/api/remediations/v1/remediations/remediation-123/systems',
        {
          data: { system_ids: [] },
        },
      );
    });
  });

  describe('deleteRemediationSystemsBatched', () => {
    const remediation = { id: 'remediation-123' };

    beforeEach(() => {
      jest.useFakeTimers();
      axiosInstance.delete.mockReset();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should throttle batches of 100 with a 250 ms delay', async () => {
      const systems = Array.from({ length: 250 }, (_, i) => ({
        id: `sys-${i}`,
      }));
      axiosInstance.delete.mockResolvedValue({ success: true });

      const deletion = deleteRemediationSystemsBatched(systems, remediation);

      expect(axiosInstance.delete).toHaveBeenCalledTimes(1);
      await jest.advanceTimersByTimeAsync(249);
      expect(axiosInstance.delete).toHaveBeenCalledTimes(1);
      await jest.advanceTimersByTimeAsync(1);
      expect(axiosInstance.delete).toHaveBeenCalledTimes(2);
      await jest.advanceTimersByTimeAsync(249);
      expect(axiosInstance.delete).toHaveBeenCalledTimes(2);
      await jest.advanceTimersByTimeAsync(1);

      const result = await deletion;

      expect(axiosInstance.delete).toHaveBeenCalledTimes(3);
      expect(
        axiosInstance.delete.mock.calls.map(
          ([, options]) => options.data.system_ids.length,
        ),
      ).toEqual([100, 100, 50]);
      expect(result).toEqual({
        status: 'success',
        successfulBatches: 3,
        failedBatches: 0,
      });
      expect(jest.getTimerCount()).toBe(0);
    });

    it('should support custom batchSize', async () => {
      const systems = [{ id: 'sys-1' }, { id: 'sys-2' }, { id: 'sys-3' }];
      axiosInstance.delete.mockResolvedValue({ success: true });

      const deletion = deleteRemediationSystemsBatched(systems, remediation, 2);
      await jest.runAllTimersAsync();
      const result = await deletion;

      expect(axiosInstance.delete).toHaveBeenCalledTimes(2);
      expect(result.status).toBe('success');
      expect(result.successfulBatches).toBe(2);
    });

    it('should throttle after failed batches and return partial_failure', async () => {
      const systems = [{ id: 'sys-1' }, { id: 'sys-2' }];
      axiosInstance.delete
        .mockRejectedValueOnce({ statusText: 'Bad Request' })
        .mockResolvedValueOnce({ success: true });

      const deletion = deleteRemediationSystemsBatched(systems, remediation, 1);

      await jest.advanceTimersByTimeAsync(249);
      expect(axiosInstance.delete).toHaveBeenCalledTimes(1);
      await jest.advanceTimersByTimeAsync(1);
      const result = await deletion;

      expect(axiosInstance.delete).toHaveBeenCalledTimes(2);
      expect(result).toEqual({
        status: 'partial_failure',
        successfulBatches: 1,
        failedBatches: 1,
      });
    });

    it('should wait for a batch to finish before starting the delay', async () => {
      const systems = [{ id: 'sys-1' }, { id: 'sys-2' }];
      let finishFirstBatch;
      axiosInstance.delete
        .mockImplementationOnce(
          () =>
            new Promise((resolve) => {
              finishFirstBatch = resolve;
            }),
        )
        .mockResolvedValueOnce({ success: true });

      const deletion = deleteRemediationSystemsBatched(systems, remediation, 1);

      await jest.advanceTimersByTimeAsync(1000);
      expect(axiosInstance.delete).toHaveBeenCalledTimes(1);

      finishFirstBatch({ success: true });
      await jest.advanceTimersByTimeAsync(249);
      expect(axiosInstance.delete).toHaveBeenCalledTimes(1);
      await jest.advanceTimersByTimeAsync(1);
      await deletion;

      expect(axiosInstance.delete).toHaveBeenCalledTimes(2);
      expect(jest.getTimerCount()).toBe(0);
    });

    it('should not delay removal of a single batch', async () => {
      axiosInstance.delete.mockResolvedValue({ success: true });

      const result = await deleteRemediationSystemsBatched(
        [{ id: 'sys-1' }],
        remediation,
      );

      expect(axiosInstance.delete).toHaveBeenCalledTimes(1);
      expect(result.status).toBe('success');
      expect(jest.getTimerCount()).toBe(0);
    });

    it('should not send requests or wait when no systems are selected', async () => {
      const result = await deleteRemediationSystemsBatched([], remediation);

      expect(axiosInstance.delete).not.toHaveBeenCalled();
      expect(result).toEqual({
        status: 'success',
        successfulBatches: 0,
        failedBatches: 0,
      });
      expect(jest.getTimerCount()).toBe(0);
    });

    it('should return complete_failure when all batches fail', async () => {
      const systems = [{ id: 'sys-1' }];
      axiosInstance.delete.mockRejectedValue({
        statusText: 'Internal Server Error',
      });

      const result = await deleteRemediationSystemsBatched(
        systems,
        remediation,
      );

      expect(result).toEqual({
        status: 'complete_failure',
        successfulBatches: 0,
        failedBatches: 1,
      });
    });

    it('should return complete_failure when error has no statusText', async () => {
      const systems = [{ id: 'sys-1' }];
      axiosInstance.delete.mockRejectedValue(new Error('Connection timed out'));

      const result = await deleteRemediationSystemsBatched(
        systems,
        remediation,
      );

      expect(result).toEqual({
        status: 'complete_failure',
        successfulBatches: 0,
        failedBatches: 1,
      });
    });
  });

  describe('getRemediationPlaybookSystemsList', () => {
    it('should call remediationsApi.getPlaybookRunSystems with correct parameters', async () => {
      const remId = 'remediation-123';
      const playbook_run_id = 'run-456';
      const mockResponse = { systems: [] };
      remediationsApi.getPlaybookRunSystems.mockResolvedValue(mockResponse);

      const result = await getRemediationPlaybookSystemsList({
        remId,
        playbook_run_id,
      });

      expect(remediationsApi.getPlaybookRunSystems).toHaveBeenCalledWith({
        id: remId,
        playbookRunId: playbook_run_id,
        limit: undefined,
        offset: undefined,
        sort: undefined,
        ansibleHost: undefined,
      });
      expect(result).toBe(mockResponse);
    });

    it('should pass ansibleHost from useRemediations-style options.params', async () => {
      const remId = 'remediation-123';
      const playbook_run_id = 'run-456';
      remediationsApi.getPlaybookRunSystems.mockResolvedValue({});

      await getRemediationPlaybookSystemsList({
        remId,
        playbook_run_id,
        options: {
          params: { 'filter[ansible_host]': 'my-host' },
        },
      });

      expect(remediationsApi.getPlaybookRunSystems).toHaveBeenCalledWith({
        id: remId,
        playbookRunId: playbook_run_id,
        limit: undefined,
        offset: undefined,
        sort: undefined,
        ansibleHost: 'my-host',
      });
    });
  });

  describe('getPlaybookLogs', () => {
    it('should call remediationsApi.getPlaybookRunSystemDetails with correct parameters', async () => {
      const params = {
        remId: 'remediation-123',
        playbook_run_id: 'run-456',
        system_id: 'system-789',
      };
      const mockResponse = { logs: [] };
      remediationsApi.getPlaybookRunSystemDetails.mockResolvedValue(
        mockResponse,
      );

      const result = await getPlaybookLogs(params);

      expect(remediationsApi.getPlaybookRunSystemDetails).toHaveBeenCalledWith(
        params.remId,
        params.playbook_run_id,
        params.system_id,
      );
      expect(result).toBe(mockResponse);
    });

    it('should handle all parameters being passed correctly', async () => {
      const params = {
        remId: 'rem-1',
        playbook_run_id: 'run-1',
        system_id: 'sys-1',
      };
      remediationsApi.getPlaybookRunSystemDetails.mockResolvedValue({});

      await getPlaybookLogs(params);

      expect(remediationsApi.getPlaybookRunSystemDetails).toHaveBeenCalledWith(
        'rem-1',
        'run-1',
        'sys-1',
      );
    });
  });

  describe('updateRemediationWrapper', () => {
    it('should call updateRemediation with extracted id and data', async () => {
      const mockResponse = { success: true };
      remediationsApi.updateRemediation.mockResolvedValue(mockResponse);

      const params = {
        id: 'remediation-1',
        name: 'Updated Name',
        auto_reboot: true,
      };

      const result = await updateRemediationWrapper(params);

      expect(remediationsApi.updateRemediation).toHaveBeenCalledWith(
        'remediation-1',
        {
          name: 'Updated Name',
          auto_reboot: true,
        },
      );
      expect(result).toBe(mockResponse);
    });

    it('should handle only name update', async () => {
      const mockResponse = { success: true };
      remediationsApi.updateRemediation.mockResolvedValue(mockResponse);

      const params = {
        id: 'remediation-2',
        name: 'New Name Only',
      };

      await updateRemediationWrapper(params);

      expect(remediationsApi.updateRemediation).toHaveBeenCalledWith(
        'remediation-2',
        {
          name: 'New Name Only',
        },
      );
    });

    it('should handle only auto_reboot update', async () => {
      const mockResponse = { success: true };
      remediationsApi.updateRemediation.mockResolvedValue(mockResponse);

      const params = {
        id: 'remediation-3',
        auto_reboot: false,
      };

      await updateRemediationWrapper(params);

      expect(remediationsApi.updateRemediation).toHaveBeenCalledWith(
        'remediation-3',
        {
          auto_reboot: false,
        },
      );
    });
  });
});
