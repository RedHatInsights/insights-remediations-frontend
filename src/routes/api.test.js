import { remediationsApi } from '../api';
import {
  API_BASE,
  deleteRemediationSystems,
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

      expect(remediationsApi.getPlaybookRunSystems).toHaveBeenCalledWith(
        remId,
        playbook_run_id,
      );
      expect(result).toBe(mockResponse);
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
