import { ACTION_TYPES } from './constants';
import {
  loadRemediation,
  patchRemediation,
  deleteRemediation,
  selectEntity,
  deleteSystems,
} from './actions';

jest.mock('@redhat-cloud-services/remediations-client', () => ({
  __esModule: true,
  ...jest.requireActual('@redhat-cloud-services/remediations-client'),
}));

jest.mock('./api', () => ({
  remediationsApi: {
    getRemediation: jest.fn(),
    updateRemediation: jest.fn(),
    deleteRemediation: jest.fn(),
  },
  deleteSystemsFromRemediation: jest.fn(),
}));

jest.mock('./routes/api', () => ({
  deleteRemediationSystems: jest.fn(),
}));

import { remediationsApi } from './api';
import { deleteRemediationSystems as deleteSystemsFromRemediation } from './routes/api';

describe('Actions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('loadRemediation', () => {
    it('should create an action to load a remediation', () => {
      const id = 'test-id';
      const mockPromise = Promise.resolve({ id, name: 'Test Remediation' });
      remediationsApi.getRemediation.mockReturnValue(mockPromise);

      const action = loadRemediation(id);

      expect(action).toEqual({
        type: ACTION_TYPES.LOAD_REMEDIATION,
        payload: mockPromise,
      });
      expect(remediationsApi.getRemediation).toHaveBeenCalledWith(id);
    });

    it('should handle different id types', () => {
      const numericId = 123;
      const mockPromise = Promise.resolve({ id: numericId });
      remediationsApi.getRemediation.mockReturnValue(mockPromise);

      const action = loadRemediation(numericId);

      expect(action.type).toBe(ACTION_TYPES.LOAD_REMEDIATION);
      expect(remediationsApi.getRemediation).toHaveBeenCalledWith(numericId);
    });
  });

  describe('patchRemediation', () => {
    it('should create an action to patch a remediation', async () => {
      const id = 'test-id';
      const data = { name: 'Updated Name', description: 'Updated Description' };
      const mockPromise = Promise.resolve(data);
      remediationsApi.updateRemediation.mockReturnValue(mockPromise);

      const action = patchRemediation(id, data);

      expect(action.type).toBe(ACTION_TYPES.PATCH_REMEDIATION);
      expect(remediationsApi.updateRemediation).toHaveBeenCalledWith(id, data);

      // Test that the payload resolves to the data
      const payload = await action.payload;
      expect(payload).toEqual(data);
    });

    it('should handle empty data object', async () => {
      const id = 'test-id';
      const data = {};
      const mockPromise = Promise.resolve(data);
      remediationsApi.updateRemediation.mockReturnValue(mockPromise);

      const action = patchRemediation(id, data);
      const payload = await action.payload;

      expect(payload).toEqual(data);
      expect(remediationsApi.updateRemediation).toHaveBeenCalledWith(id, data);
    });

    it('should handle API errors gracefully', async () => {
      const id = 'test-id';
      const data = { name: 'Test' };
      const error = new Error('API Error');
      remediationsApi.updateRemediation.mockRejectedValue(error);

      const action = patchRemediation(id, data);

      await expect(action.payload).rejects.toThrow('API Error');
    });
  });

  describe('deleteRemediation', () => {
    it('should create an action to delete a remediation', () => {
      const id = 'test-id';
      const mockPromise = Promise.resolve();
      remediationsApi.deleteRemediation.mockReturnValue(mockPromise);

      const action = deleteRemediation(id);

      expect(action).toEqual({
        type: ACTION_TYPES.DELETE_REMEDIATION,
        payload: mockPromise,
      });
      expect(remediationsApi.deleteRemediation).toHaveBeenCalledWith(id);
    });

    it('should handle null or undefined ids', () => {
      const mockPromise = Promise.resolve();
      remediationsApi.deleteRemediation.mockReturnValue(mockPromise);

      const action = deleteRemediation(null);

      expect(action.type).toBe(ACTION_TYPES.DELETE_REMEDIATION);
      expect(remediationsApi.deleteRemediation).toHaveBeenCalledWith(null);
    });
  });

  describe('selectEntity', () => {
    it('should create an action to select an entity', () => {
      const id = 'entity-id';
      const selected = true;

      const action = selectEntity(id, selected);

      expect(action).toEqual({
        type: ACTION_TYPES.SELECT_ENTITY,
        payload: {
          id,
          selected,
        },
      });
    });

    it('should create an action to deselect an entity', () => {
      const id = 'entity-id';
      const selected = false;

      const action = selectEntity(id, selected);

      expect(action).toEqual({
        type: ACTION_TYPES.SELECT_ENTITY,
        payload: {
          id,
          selected,
        },
      });
    });

    it('should handle special id values', () => {
      // Test select all (id: 0)
      const selectAllAction = selectEntity(0, true);
      expect(selectAllAction.payload).toEqual({ id: 0, selected: true });

      // Test deselect all (id: -1)
      const deselectAllAction = selectEntity(-1, false);
      expect(deselectAllAction.payload).toEqual({ id: -1, selected: false });
    });

    it('should handle different data types for id', () => {
      const stringId = 'string-id';
      const numberIdAction = selectEntity(123, true);
      const stringIdAction = selectEntity(stringId, false);

      expect(numberIdAction.payload.id).toBe(123);
      expect(stringIdAction.payload.id).toBe(stringId);
    });
  });

  describe('deleteSystems', () => {
    it('should create an action to delete systems from remediation', () => {
      const systems = [
        { id: 'system1', issues: [{ id: 'issue1' }] },
        { id: 'system2', issues: [{ id: 'issue2' }] },
      ];
      const remediation = { id: 'remediation-id' };
      const mockPromise = Promise.resolve();
      deleteSystemsFromRemediation.mockReturnValue(mockPromise);

      const action = deleteSystems(systems, remediation);

      expect(action).toEqual({
        type: ACTION_TYPES.DELTE_SYSTEMS, // Note: This matches the typo in the original code
        payload: mockPromise,
      });
      expect(deleteSystemsFromRemediation).toHaveBeenCalledWith(
        systems,
        remediation,
      );
    });

    it('should handle empty systems array', () => {
      const systems = [];
      const remediation = { id: 'remediation-id' };
      const mockPromise = Promise.resolve();
      deleteSystemsFromRemediation.mockReturnValue(mockPromise);

      const action = deleteSystems(systems, remediation);

      expect(action.type).toBe(ACTION_TYPES.DELTE_SYSTEMS);
      expect(deleteSystemsFromRemediation).toHaveBeenCalledWith(
        systems,
        remediation,
      );
    });

    it('should handle systems with multiple issues', () => {
      const systems = [
        {
          id: 'system1',
          issues: [{ id: 'issue1' }, { id: 'issue2' }, { id: 'issue3' }],
        },
      ];
      const remediation = { id: 'remediation-id' };
      const mockPromise = Promise.resolve();
      deleteSystemsFromRemediation.mockReturnValue(mockPromise);

      const action = deleteSystems(systems, remediation);

      expect(action.type).toBe(ACTION_TYPES.DELTE_SYSTEMS);
      expect(deleteSystemsFromRemediation).toHaveBeenCalledWith(
        systems,
        remediation,
      );
    });

    it('should handle API errors', async () => {
      const systems = [{ id: 'system1', issues: [{ id: 'issue1' }] }];
      const remediation = { id: 'remediation-id' };
      const error = new Error('Delete failed');
      deleteSystemsFromRemediation.mockRejectedValue(error);

      const action = deleteSystems(systems, remediation);

      expect(action.type).toBe(ACTION_TYPES.DELTE_SYSTEMS);
      await expect(action.payload).rejects.toThrow('Delete failed');
    });
  });
});
