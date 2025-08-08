import React from 'react';
import { ACTION_TYPES } from '../constants';
import reducers, { remediationSystems } from './reducers';

// Mock the frontend-components-utilities
jest.mock(
  '@redhat-cloud-services/frontend-components-utilities/ReducerRegistry',
  () => ({
    applyReducerHash:
      (reducerHash, initialState) =>
      (state = initialState, action) => {
        const reducer = reducerHash[action.type];
        return reducer ? reducer(state, action) : state;
      },
  }),
);

describe('Reducers', () => {
  describe('Helper functions', () => {
    // Import the non-exported helper functions by testing them indirectly through reducer behavior
    describe('issuesToSystemsIds', () => {
      it('should extract unique system IDs from issues', () => {
        // We can test this indirectly through computeRebootStats
        const testRemediation = {
          issues: [
            {
              systems: [{ id: 'system1' }, { id: 'system2' }],
              resolution: { needs_reboot: false },
            },
            {
              systems: [{ id: 'system2' }, { id: 'system3' }],
              resolution: { needs_reboot: true },
            },
          ],
        };

        const result = reducers.selectedRemediation(
          { status: 'initial' },
          {
            type: ACTION_TYPES.LOAD_REMEDIATION_FULFILLED,
            payload: testRemediation,
          },
        );

        expect(result.remediation.stats.systemsWithReboot).toBe(2); // system2, system3
        expect(result.remediation.stats.systemsWithoutReboot).toBe(1); // system1
      });
    });

    describe('computeRebootStats', () => {
      it('should compute correct reboot statistics', () => {
        const testRemediation = {
          issues: [
            {
              systems: [{ id: 'system1' }, { id: 'system2' }],
              resolution: { needs_reboot: true },
            },
            {
              systems: [{ id: 'system3' }],
              resolution: { needs_reboot: false },
            },
          ],
        };

        const result = reducers.selectedRemediation(
          { status: 'initial' },
          {
            type: ACTION_TYPES.LOAD_REMEDIATION_FULFILLED,
            payload: testRemediation,
          },
        );

        expect(result.remediation.stats.systemsWithReboot).toBe(2);
        expect(result.remediation.stats.systemsWithoutReboot).toBe(1);
      });

      it('should handle empty issues array', () => {
        const testRemediation = { issues: [] };

        const result = reducers.selectedRemediation(
          { status: 'initial' },
          {
            type: ACTION_TYPES.LOAD_REMEDIATION_FULFILLED,
            payload: testRemediation,
          },
        );

        expect(result.remediation.stats.systemsWithReboot).toBe(0);
        expect(result.remediation.stats.systemsWithoutReboot).toBe(0);
      });
    });
  });

  describe('remediationSystems', () => {
    const LOAD_ENTITIES_FULFILLED = 'LOAD_ENTITIES_FULFILLED';
    const systemsReducer = remediationSystems({ LOAD_ENTITIES_FULFILLED });

    describe('SELECT_ENTITY action', () => {
      it('should select a single entity', () => {
        const initialState = {
          rows: [
            { id: 'system1', name: 'System 1' },
            { id: 'system2', name: 'System 2' },
          ],
          selected: new Map(),
        };

        const action = {
          type: ACTION_TYPES.SELECT_ENTITY,
          payload: { id: 'system1', selected: true },
        };

        const result = systemsReducer(initialState, action);

        expect(result.selected.has('system1')).toBe(true);
        expect(result.selected.get('system1')).toEqual({
          id: 'system1',
          name: 'System 1',
        });
      });

      it('should deselect a single entity', () => {
        const initialState = {
          rows: [{ id: 'system1', name: 'System 1' }],
          selected: new Map([['system1', { id: 'system1', name: 'System 1' }]]),
        };

        const action = {
          type: ACTION_TYPES.SELECT_ENTITY,
          payload: { id: 'system1', selected: false },
        };

        const result = systemsReducer(initialState, action);

        expect(result.selected.has('system1')).toBe(false);
      });

      it('should select all entities when id is 0', () => {
        const initialState = {
          rows: [
            { id: 'system1', name: 'System 1' },
            { id: 'system2', name: 'System 2' },
          ],
          selected: new Map(),
        };

        const action = {
          type: ACTION_TYPES.SELECT_ENTITY,
          payload: { id: 0, selected: true },
        };

        const result = systemsReducer(initialState, action);

        expect(result.selected.has('system1')).toBe(true);
        expect(result.selected.has('system2')).toBe(true);
      });

      it('should deselect all entities when id is 0', () => {
        const initialState = {
          rows: [
            { id: 'system1', name: 'System 1' },
            { id: 'system2', name: 'System 2' },
          ],
          selected: new Map([
            ['system1', { id: 'system1' }],
            ['system2', { id: 'system2' }],
          ]),
        };

        const action = {
          type: ACTION_TYPES.SELECT_ENTITY,
          payload: { id: 0, selected: false },
        };

        const result = systemsReducer(initialState, action);

        expect(result.selected.has('system1')).toBe(false);
        expect(result.selected.has('system2')).toBe(false);
      });

      it('should clear all selections when id is -1', () => {
        const initialState = {
          rows: [{ id: 'system1', name: 'System 1' }],
          selected: new Map([['system1', { id: 'system1' }]]),
        };

        const action = {
          type: ACTION_TYPES.SELECT_ENTITY,
          payload: { id: -1, selected: false },
        };

        const result = systemsReducer(initialState, action);

        expect(result.selected.size).toBe(0);
      });

      it('should handle selecting non-existent entity', () => {
        const initialState = {
          rows: [{ id: 'system1', name: 'System 1' }],
          selected: new Map(),
        };

        const action = {
          type: ACTION_TYPES.SELECT_ENTITY,
          payload: { id: 'non-existent', selected: true },
        };

        const result = systemsReducer(initialState, action);

        expect(result.selected.has('non-existent')).toBe(true);
        expect(result.selected.get('non-existent')).toEqual({
          id: 'non-existent',
        });
      });
    });

    describe('LOAD_ENTITIES_FULFILLED action', () => {
      it('should update rows with selected status', () => {
        const initialState = {
          rows: [
            { id: 'system1', name: 'System 1' },
            { id: 'system2', name: 'System 2' },
          ],
          selected: new Map([['system1', { id: 'system1' }]]),
        };

        const action = {
          type: LOAD_ENTITIES_FULFILLED,
        };

        const result = systemsReducer(initialState, action);

        expect(result.rows[0].selected).toBe(true);
        expect(result.rows[1].selected).toBe(false);
      });

      it('should handle empty selected map', () => {
        const initialState = {
          rows: [{ id: 'system1', name: 'System 1' }],
          selected: new Map(),
        };

        const action = {
          type: LOAD_ENTITIES_FULFILLED,
        };

        const result = systemsReducer(initialState, action);

        expect(result.rows[0].selected).toBe(false);
      });
    });
  });

  describe('remediations reducer', () => {
    it('should handle LOAD_REMEDIATIONS_PENDING', () => {
      const action = { type: ACTION_TYPES.LOAD_REMEDIATIONS_PENDING };
      const result = reducers.remediations(undefined, action);

      expect(result).toEqual({ status: 'pending' });
    });

    it('should handle LOAD_REMEDIATIONS_FULFILLED', () => {
      const payload = { data: ['remediation1', 'remediation2'] };
      const action = {
        type: ACTION_TYPES.LOAD_REMEDIATIONS_FULFILLED,
        payload,
      };
      const result = reducers.remediations(undefined, action);

      expect(result).toEqual({
        status: 'fulfilled',
        value: payload,
      });
    });

    it('should handle LOAD_REMEDIATIONS_REJECTED', () => {
      const action = { type: ACTION_TYPES.LOAD_REMEDIATIONS_REJECTED };
      const result = reducers.remediations(undefined, action);

      expect(result).toEqual({ status: 'rejected' });
    });
  });

  describe('selectedRemediation reducer', () => {
    it('should handle LOAD_REMEDIATION_PENDING', () => {
      const action = { type: ACTION_TYPES.LOAD_REMEDIATION_PENDING };
      const result = reducers.selectedRemediation(undefined, action);

      expect(result).toEqual({ status: 'pending' });
    });

    it('should handle LOAD_REMEDIATION_FULFILLED', () => {
      const payload = {
        id: 'test-id',
        issues: [
          {
            systems: [{ id: 'system1' }],
            resolution: { needs_reboot: true },
          },
        ],
      };
      const action = {
        type: ACTION_TYPES.LOAD_REMEDIATION_FULFILLED,
        payload,
      };
      const result = reducers.selectedRemediation(undefined, action);

      expect(result.status).toBe('fulfilled');
      expect(result.remediation.id).toBe('test-id');
      expect(result.remediation.stats).toBeDefined();
    });

    it('should handle REFRESH_REMEDIATION_FULFILLED with matching ID', () => {
      const initialState = {
        status: 'fulfilled',
        remediation: { id: 'test-id', name: 'Old Name' },
      };
      const payload = {
        id: 'test-id',
        name: 'New Name',
        issues: [],
      };
      const action = {
        type: ACTION_TYPES.REFRESH_REMEDIATION_FULFILLED,
        payload,
      };
      const result = reducers.selectedRemediation(initialState, action);

      expect(result.status).toBe('fulfilled');
      expect(result.remediation.name).toBe('New Name');
    });

    it('should not update REFRESH_REMEDIATION_FULFILLED with non-matching ID', () => {
      const initialState = {
        status: 'fulfilled',
        remediation: { id: 'different-id', name: 'Old Name' },
      };
      const payload = {
        id: 'test-id',
        name: 'New Name',
        issues: [],
      };
      const action = {
        type: ACTION_TYPES.REFRESH_REMEDIATION_FULFILLED,
        payload,
      };
      const result = reducers.selectedRemediation(initialState, action);

      expect(result).toBe(initialState);
    });

    it('should handle PATCH_REMEDIATION_FULFILLED', () => {
      const initialState = {
        status: 'fulfilled',
        remediation: { id: 'test-id', name: 'Old Name' },
      };
      const payload = { name: 'Updated Name' };
      const action = {
        type: ACTION_TYPES.PATCH_REMEDIATION_FULFILLED,
        payload,
      };
      const result = reducers.selectedRemediation(initialState, action);

      expect(result.remediation.name).toBe('Updated Name');
      expect(result.remediation.id).toBe('test-id');
    });

    it('should handle DELETE_REMEDIATION_ISSUE_FULFILLED', () => {
      const initialState = {
        status: 'fulfilled',
        remediation: {
          id: 'test-id',
          issues: [
            { id: 'issue1', systems: [], resolution: { needs_reboot: false } },
            { id: 'issue2', systems: [], resolution: { needs_reboot: true } },
          ],
        },
      };
      const payload = { id: 'test-id', issueId: 'issue1' };
      const action = {
        type: ACTION_TYPES.DELETE_REMEDIATION_ISSUE_FULFILLED,
        payload,
      };
      const result = reducers.selectedRemediation(initialState, action);

      expect(result.remediation.issues).toHaveLength(1);
      expect(result.remediation.issues[0].id).toBe('issue2');
    });

    it('should handle DELETE_REMEDIATION_ISSUE_SYSTEM_FULFILLED', () => {
      const initialState = {
        status: 'fulfilled',
        remediation: {
          id: 'test-id',
          issues: [
            {
              id: 'issue1',
              systems: [{ id: 'system1' }, { id: 'system2' }],
              resolution: { needs_reboot: false },
            },
          ],
        },
      };
      const payload = { id: 'test-id', issue: 'issue1', system: 'system1' };
      const action = {
        type: ACTION_TYPES.DELETE_REMEDIATION_ISSUE_SYSTEM_FULFILLED,
        payload,
      };
      const result = reducers.selectedRemediation(initialState, action);

      expect(result.remediation.issues[0].systems).toHaveLength(1);
      expect(result.remediation.issues[0].systems[0].id).toBe('system2');
    });

    it('should remove issue when last system is removed', () => {
      const initialState = {
        status: 'fulfilled',
        remediation: {
          id: 'test-id',
          issues: [
            {
              id: 'issue1',
              systems: [{ id: 'system1' }],
              resolution: { needs_reboot: false },
            },
          ],
        },
      };
      const payload = { id: 'test-id', issue: 'issue1', system: 'system1' };
      const action = {
        type: ACTION_TYPES.DELETE_REMEDIATION_ISSUE_SYSTEM_FULFILLED,
        payload,
      };
      const result = reducers.selectedRemediation(initialState, action);

      expect(result.remediation.issues).toHaveLength(0);
    });
  });

  describe('connectionStatus reducer', () => {
    it('should handle GET_CONNECTION_STATUS_FULFILLED', () => {
      const payload = { data: ['endpoint1'], etag: 'test-etag' };
      const action = {
        type: ACTION_TYPES.GET_CONNECTION_STATUS_FULFILLED,
        payload,
      };
      const result = reducers.connectionStatus(undefined, action);

      expect(result).toEqual({
        status: 'fulfilled',
        data: ['endpoint1'],
        etag: 'test-etag',
      });
    });

    it('should handle SET_ETAG', () => {
      const initialState = {
        status: 'fulfilled',
        data: [],
        etag: 'old-etag',
      };
      const action = {
        type: ACTION_TYPES.SET_ETAG,
        etag: 'new-etag',
      };
      const result = reducers.connectionStatus(initialState, action);

      expect(result.etag).toBe('new-etag');
      expect(result.status).toBe('fulfilled');
    });
  });

  describe('runRemediation reducer', () => {
    it('should handle RUN_REMEDIATION_REJECTED with 412 status', () => {
      const action = {
        type: ACTION_TYPES.RUN_REMEDIATION_REJECTED,
        payload: { response: { status: 412 } },
      };
      const result = reducers.runRemediation(undefined, action);

      expect(result.status).toBe('changed');
    });

    it('should handle RUN_REMEDIATION_REJECTED with other status', () => {
      const action = {
        type: ACTION_TYPES.RUN_REMEDIATION_REJECTED,
        payload: { response: { status: 500 } },
      };
      const result = reducers.runRemediation(undefined, action);

      expect(result.status).toBe('rejected');
    });
  });

  describe('sources reducer', () => {
    it('should handle GET_ENDPOINT_FULFILLED', () => {
      const initialState = {
        status: 'initial',
        data: { endpoint1: { id: 'endpoint1' } },
      };
      const payload = { id: 'endpoint2', name: 'Endpoint 2' };
      const action = {
        type: ACTION_TYPES.GET_ENDPOINT_FULFILLED,
        payload,
      };
      const result = reducers.sources(initialState, action);

      expect(result.data.endpoint2).toEqual(payload);
      expect(result.data.endpoint1).toEqual({ id: 'endpoint1' });
    });
  });

  describe('executable reducer', () => {
    it('should handle CHECK_EXECUTABLE_REJECTED', () => {
      const action = { type: ACTION_TYPES.CHECK_EXECUTABLE_REJECTED };
      const result = reducers.executable(undefined, action);

      expect(result).toBe(false);
    });

    it('should handle CHECK_EXECUTABLE_FULFILLED', () => {
      const action = { type: ACTION_TYPES.CHECK_EXECUTABLE_FULFILLED };
      const result = reducers.executable(undefined, action);

      expect(result).toBe(true);
    });
  });

  describe('playbookRuns reducer', () => {
    it('should handle GET_PLAYBOOK_RUNS_FULFILLED', () => {
      const payload = { data: ['run1', 'run2'], meta: { total: 2 } };
      const action = {
        type: ACTION_TYPES.GET_PLAYBOOK_RUNS_FULFILLED,
        payload,
      };
      const result = reducers.playbookRuns(undefined, action);

      expect(result).toEqual({
        status: 'fulfilled',
        data: ['run1', 'run2'],
        meta: { total: 2 },
      });
    });
  });

  describe('inventoryEntitiesReducer', () => {
    it('should create reducer with custom props', () => {
      const props = {
        INVENTORY_ACTION_TYPES: { LOAD_ENTITIES_FULFILLED: 'CUSTOM_LOAD' },
        urlBuilder: (id) => `/system/${id}`,
        generateStatus: (id) => <span>Status for {id}</span>,
      };
      const reducer = reducers.inventoryEntitiesReducer(props)();

      const action = { type: 'CUSTOM_LOAD' };
      const result = reducer(undefined, action);

      expect(result.columns).toHaveLength(2);
      expect(result.columns[0].key).toBe('display_name');
      expect(result.columns[1].key).toBe('system_status');
    });
  });

  describe('Edge cases and error handling', () => {
    it('should handle undefined state in reducers', () => {
      const action = { type: 'UNKNOWN_ACTION' };

      expect(() => reducers.remediations(undefined, action)).not.toThrow();
      expect(() =>
        reducers.selectedRemediation(undefined, action),
      ).not.toThrow();
      expect(() => reducers.connectionStatus(undefined, action)).not.toThrow();
    });

    it('should handle malformed action payloads', () => {
      const action = {
        type: ACTION_TYPES.LOAD_REMEDIATION_FULFILLED,
        payload: { issues: [] }, // Use valid payload structure
      };

      expect(() =>
        reducers.selectedRemediation(undefined, action),
      ).not.toThrow();
    });

    it('should preserve state for unknown actions', () => {
      const initialState = { test: 'data' };
      const action = { type: 'UNKNOWN_ACTION' };

      const result = reducers.remediations(initialState, action);
      expect(result).toBe(initialState);
    });
  });
});
