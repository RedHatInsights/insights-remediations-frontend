import { remediationsApi } from '../api';
import {
  API_BASE,
  getRemediationDetails,
  getRemediations,
  getRemediationPlaybook,
  checkExecutableStatus,
  getRemediationPlaybookSystemsList,
  getPlaybookLogs,
  getRemediationsList,
  updateRemediationPlans,
  deleteRemediation,
  deleteRemediationList,
  executeRemediation,
  deleteIssues,
} from './api';

// Mock the remediations API
jest.mock('../api', () => ({
  remediationsApi: {
    getRemediation: jest.fn(),
    getRemediations: jest.fn(),
    listPlaybookRuns: jest.fn(),
    checkExecutable: jest.fn(),
    getPlaybookRunSystems: jest.fn(),
    getPlaybookRunSystemDetails: jest.fn(),
    updateRemediation: jest.fn(),
    deleteRemediation: jest.fn(),
    deleteRemediations: jest.fn(),
    runRemediation: jest.fn(),
    deleteRemediationIssues: jest.fn(),
  },
}));

describe('Routes API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('constants', () => {
    it('should export correct API_BASE', () => {
      expect(API_BASE).toBe('/api/remediations/v1');
    });
  });

  describe('getRemediationDetails', () => {
    it('should call remediationsApi.getRemediation with correct parameters', async () => {
      const remId = 'remediation-123';
      const mockResponse = { id: remId, name: 'Test Remediation' };
      remediationsApi.getRemediation.mockResolvedValue(mockResponse);

      const result = await getRemediationDetails({ remId });

      expect(remediationsApi.getRemediation).toHaveBeenCalledWith(remId);
      expect(result).toBe(mockResponse);
    });
  });

  describe('getRemediations', () => {
    it('should call remediationsApi.getRemediations with parameters', async () => {
      const params = { limit: 10, offset: 0 };
      const mockResponse = { data: [], meta: {} };
      remediationsApi.getRemediations.mockResolvedValue(mockResponse);

      const result = await getRemediations(params);

      expect(remediationsApi.getRemediations).toHaveBeenCalledWith(params);
      expect(result).toBe(mockResponse);
    });

    it('should call remediationsApi.getRemediations without parameters', async () => {
      const mockResponse = { data: [], meta: {} };
      remediationsApi.getRemediations.mockResolvedValue(mockResponse);

      const result = await getRemediations();

      expect(remediationsApi.getRemediations).toHaveBeenCalledWith(undefined);
      expect(result).toBe(mockResponse);
    });
  });

  describe('getRemediationPlaybook', () => {
    it('should call remediationsApi.listPlaybookRuns with correct parameters', async () => {
      const remId = 'remediation-123';
      const mockResponse = { runs: [] };
      remediationsApi.listPlaybookRuns.mockResolvedValue(mockResponse);

      const result = await getRemediationPlaybook({ remId });

      expect(remediationsApi.listPlaybookRuns).toHaveBeenCalledWith(remId);
      expect(result).toBe(mockResponse);
    });
  });

  describe('checkExecutableStatus', () => {
    it('should call remediationsApi.checkExecutable with correct parameters', async () => {
      const remId = 'remediation-123';
      const mockResponse = { executable: true };
      remediationsApi.checkExecutable.mockResolvedValue(mockResponse);

      const result = await checkExecutableStatus({ remId });

      expect(remediationsApi.checkExecutable).toHaveBeenCalledWith(remId);
      expect(result).toBe(mockResponse);
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
      const mockResponse = { logs: 'test logs' };
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
  });

  describe('getRemediationsList', () => {
    it('should call remediationsApi.getRemediations with fieldsData filter', async () => {
      const mockResponse = { data: [] };
      remediationsApi.getRemediations.mockResolvedValue(mockResponse);

      const result = await getRemediationsList();

      expect(remediationsApi.getRemediations).toHaveBeenCalledWith({
        fieldsData: ['name'],
      });
      expect(result).toBe(mockResponse);
    });
  });

  describe('updateRemediationPlans', () => {
    it('should call remediationsApi.updateRemediation with correct parameters', async () => {
      const params = {
        id: 'remediation-123',
        name: 'Updated Name',
        description: 'Updated Description',
      };
      const mockResponse = { id: params.id, name: params.name };
      remediationsApi.updateRemediation.mockResolvedValue(mockResponse);

      const result = await updateRemediationPlans(params);

      expect(remediationsApi.updateRemediation).toHaveBeenCalledWith(
        params.id,
        { name: params.name, description: params.description },
      );
      expect(result).toBe(mockResponse);
    });

    it('should handle params with only id', async () => {
      const params = { id: 'remediation-123' };
      const mockResponse = { id: params.id };
      remediationsApi.updateRemediation.mockResolvedValue(mockResponse);

      const result = await updateRemediationPlans(params);

      expect(remediationsApi.updateRemediation).toHaveBeenCalledWith(
        params.id,
        {},
      );
      expect(result).toBe(mockResponse);
    });
  });

  describe('deleteRemediation', () => {
    it('should call remediationsApi.deleteRemediation with correct parameters', async () => {
      const id = 'remediation-123';
      const mockResponse = { success: true };
      remediationsApi.deleteRemediation.mockResolvedValue(mockResponse);

      const result = await deleteRemediation({ id });

      expect(remediationsApi.deleteRemediation).toHaveBeenCalledWith(id);
      expect(result).toBe(mockResponse);
    });
  });

  describe('deleteRemediationList', () => {
    it('should call remediationsApi.deleteRemediations with correct parameters', async () => {
      const remediation_ids = ['rem-1', 'rem-2', 'rem-3'];
      const mockResponse = { deleted: 3 };
      remediationsApi.deleteRemediations.mockResolvedValue(mockResponse);

      const result = await deleteRemediationList({ remediation_ids });

      expect(remediationsApi.deleteRemediations).toHaveBeenCalledWith({
        remediation_ids,
      });
      expect(result).toBe(mockResponse);
    });
  });

  describe('executeRemediation', () => {
    it('should call remediationsApi.runRemediation with correct parameters', async () => {
      const id = 'remediation-123';
      const etag = 'etag-456';
      const exclude = ['system-1', 'system-2'];
      const mockResponse = { execution_id: 'exec-789' };
      remediationsApi.runRemediation.mockResolvedValue(mockResponse);

      const result = await executeRemediation({ id, etag, exclude });

      expect(remediationsApi.runRemediation).toHaveBeenCalledWith(
        id,
        { exclude },
        { headers: { 'If-Match': etag } },
      );
      expect(result).toBe(mockResponse);
    });

    it('should handle execution without exclude parameter', async () => {
      const id = 'remediation-123';
      const etag = 'etag-456';
      const mockResponse = { execution_id: 'exec-789' };
      remediationsApi.runRemediation.mockResolvedValue(mockResponse);

      const result = await executeRemediation({ id, etag });

      expect(remediationsApi.runRemediation).toHaveBeenCalledWith(
        id,
        { exclude: undefined },
        { headers: { 'If-Match': etag } },
      );
      expect(result).toBe(mockResponse);
    });
  });

  describe('deleteIssues', () => {
    it('should call remediationsApi.deleteRemediationIssues with correct parameters', async () => {
      const id = 'remediation-123';
      const issue_ids = ['issue-1', 'issue-2'];
      const mockResponse = { deleted: 2 };
      remediationsApi.deleteRemediationIssues.mockResolvedValue(mockResponse);

      const result = await deleteIssues({ id, issue_ids });

      expect(remediationsApi.deleteRemediationIssues).toHaveBeenCalledWith(id, {
        issue_ids,
      });
      expect(result).toBe(mockResponse);
    });
  });
});
