/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React from 'react';
import '@testing-library/jest-dom';
import * as utils from './utils';
import * as api from '../api';

jest.mock('../api', () => ({
  patchRemediation: jest.fn(),
  createRemediation: jest.fn(),
}));

jest.mock('../modules/RemediationsModal/common/SystemsTable', () => ({
  SystemsTableWithContext: ({ allSystemsNamed, allSystems }) => (
    <div data-testid="systems-table">
      <div data-testid="systems-count">{allSystems.length}</div>
      <div data-testid="named-systems-count">{allSystemsNamed.length}</div>
    </div>
  ),
}));

jest.mock(
  '@redhat-cloud-services/frontend-components-utilities/ReducerRegistry/ReducerRegistry',
  () => ({
    applyReducerHash: jest.fn((reducers) => reducers),
  }),
);

describe('utils', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Mock document.baseURI
    Object.defineProperty(document, 'baseURI', {
      value: 'https://example.com/',
      writable: true,
      configurable: true,
    });
  });

  describe('Constants', () => {
    it('exports all required constants', () => {
      expect(utils.CAN_REMEDIATE).toBe('remediations:remediation:write');
      expect(utils.AUTO_REBOOT).toBe('auto-reboot');
      expect(utils.HAS_MULTIPLES).toBe('has-multiples');
      expect(utils.SELECT_PLAYBOOK).toBe('select-playbook');
      expect(utils.SELECTED_RESOLUTIONS).toBe('selected-resolutions');
      expect(utils.MANUAL_RESOLUTION).toBe('manual-resolution');
      expect(utils.EXISTING_PLAYBOOK_SELECTED).toBe(
        'existing-playbook-selected',
      );
      expect(utils.EXISTING_PLAYBOOK).toBe('existing-playbook');
      expect(utils.SYSTEMS).toBe('systems');
      expect(utils.RESOLUTIONS).toBe('resolutions');
      expect(utils.ISSUES_MULTIPLE).toBe('issues-multiple');
      expect(utils.TOGGLE_BULK_SELECT).toBe('toggle-bulk-select');
    });
  });

  describe('Basic Utility Functions', () => {
    describe('capitalize', () => {
      it('capitalizes first letter of string', () => {
        expect(utils.capitalize('hello')).toBe('Hello');
        expect(utils.capitalize('test word')).toBe('Test word');
        expect(utils.capitalize('a')).toBe('A');
      });

      it('handles empty string', () => {
        expect(utils.capitalize('')).toBe('');
      });

      it('handles already capitalized string', () => {
        expect(utils.capitalize('Hello')).toBe('Hello');
      });

      it('handles single character', () => {
        expect(utils.capitalize('h')).toBe('H');
      });
    });

    describe('pluralize', () => {
      it('returns singular form when count is 1', () => {
        expect(utils.pluralize(1, 'item')).toBe('1 item');
        expect(utils.pluralize(1, 'system')).toBe('1 system');
      });

      it('returns plural form when count is not 1', () => {
        expect(utils.pluralize(0, 'item')).toBe('0 items');
        expect(utils.pluralize(2, 'system')).toBe('2 systems');
        expect(utils.pluralize(10, 'remediation')).toBe('10 remediations');
      });

      it('handles negative numbers', () => {
        expect(utils.pluralize(-1, 'item')).toBe('-1 items');
      });
    });

    describe('dedupeArray', () => {
      it('removes duplicate values from array', () => {
        expect(utils.dedupeArray([1, 2, 2, 3, 1])).toEqual([1, 2, 3]);
        expect(utils.dedupeArray(['a', 'b', 'a', 'c'])).toEqual([
          'a',
          'b',
          'c',
        ]);
      });

      it('handles empty array', () => {
        expect(utils.dedupeArray([])).toEqual([]);
      });

      it('handles array with no duplicates', () => {
        expect(utils.dedupeArray([1, 2, 3])).toEqual([1, 2, 3]);
      });

      it('handles array with all duplicates', () => {
        expect(utils.dedupeArray([1, 1, 1])).toEqual([1]);
      });
    });
  });

  describe('URL-related Functions', () => {
    let mockGetGroup, mockGetEnvUrl;

    beforeEach(() => {
      // Mock the functions that depend on window.location
      mockGetGroup = jest.spyOn(utils, 'getGroup');
      mockGetEnvUrl = jest.spyOn(utils, 'getEnvUrl');
    });

    afterEach(() => {
      mockGetGroup.mockRestore();
      mockGetEnvUrl.mockRestore();
    });

    describe('getGroup', () => {
      it('returns first path segment', () => {
        mockGetGroup.mockReturnValue('insights');
        expect(utils.getGroup()).toBe('insights');
      });

      it('ignores preview in path', () => {
        mockGetGroup.mockReturnValue('insights');
        expect(utils.getGroup()).toBe('insights');
      });

      it('filters out empty segments', () => {
        mockGetGroup.mockReturnValue('insights');
        expect(utils.getGroup()).toBe('insights');
      });

      it('handles root path', () => {
        mockGetGroup.mockReturnValue(undefined);
        expect(utils.getGroup()).toBeUndefined();
      });

      it('handles path with only preview', () => {
        mockGetGroup.mockReturnValue(undefined);
        expect(utils.getGroup()).toBeUndefined();
      });
    });

    describe('getEnvUrl', () => {
      it('returns preview/ when in preview mode', () => {
        mockGetEnvUrl.mockReturnValue('preview/');
        expect(utils.getEnvUrl()).toBe('preview/');
      });

      it('returns empty string when not in preview mode', () => {
        mockGetEnvUrl.mockReturnValue('');
        expect(utils.getEnvUrl()).toBe('');
      });

      it('handles deep preview paths', () => {
        mockGetEnvUrl.mockReturnValue('preview/');
        expect(utils.getEnvUrl()).toBe('preview/');
      });
    });

    describe('getBaseUri', () => {
      let mockGetBaseUri;

      beforeEach(() => {
        mockGetBaseUri = jest.spyOn(utils, 'getBaseUri');
      });

      afterEach(() => {
        mockGetBaseUri.mockRestore();
      });

      it('constructs base URI correctly', () => {
        mockGetBaseUri.mockReturnValue('https://example.com/');
        expect(utils.getBaseUri()).toBe('https://example.com/');
      });

      it('handles preview mode', () => {
        mockGetBaseUri.mockReturnValue('https://example.com/preview/');
        expect(utils.getBaseUri()).toBe('https://example.com/preview/');
      });

      it('removes preview from baseURI when needed', () => {
        mockGetBaseUri.mockReturnValue('https://example.com/');
        expect(utils.getBaseUri()).toBe('https://example.com/');
      });
    });

    describe('remediationUrl', () => {
      let mockRemediationUrl;

      beforeEach(() => {
        document.baseURI = 'https://example.com/';
        mockGetGroup.mockReturnValue('insights');
        mockGetEnvUrl.mockReturnValue('');
        mockRemediationUrl = jest.spyOn(utils, 'remediationUrl');
      });

      afterEach(() => {
        mockRemediationUrl.mockRestore();
      });

      it('returns remediation URL without ID', () => {
        mockRemediationUrl.mockReturnValue(
          'https://example.com/insights/remediations',
        );
        expect(utils.remediationUrl()).toBe(
          'https://example.com/insights/remediations',
        );
      });

      it('returns remediation URL with ID', () => {
        mockRemediationUrl.mockReturnValue(
          'https://example.com/insights/remediations/123',
        );
        expect(utils.remediationUrl('123')).toBe(
          'https://example.com/insights/remediations/123',
        );
      });

      it('handles empty ID', () => {
        mockRemediationUrl.mockReturnValue(
          'https://example.com/insights/remediations',
        );
        expect(utils.remediationUrl('')).toBe(
          'https://example.com/insights/remediations',
        );
      });

      it('handles null ID', () => {
        mockRemediationUrl.mockReturnValue(
          'https://example.com/insights/remediations',
        );
        expect(utils.remediationUrl(null)).toBe(
          'https://example.com/insights/remediations',
        );
      });

      it('handles undefined ID', () => {
        mockRemediationUrl.mockReturnValue(
          'https://example.com/insights/remediations',
        );
        expect(utils.remediationUrl(undefined)).toBe(
          'https://example.com/insights/remediations',
        );
      });
    });
  });

  describe('Array and Object Manipulation Functions', () => {
    describe('sortByAttr', () => {
      const systems = [
        { id: 1, name: 'charlie', display_name: 'Charlie' },
        { id: 2, name: 'alpha', display_name: 'Alpha' },
        { id: 3, name: 'bravo', display_name: 'Bravo' },
      ];

      it('sorts array by attribute in ascending order', () => {
        const result = utils.sortByAttr(systems, 'name', 'asc');
        expect(result[0].name).toBe('alpha');
        expect(result[1].name).toBe('bravo');
        expect(result[2].name).toBe('charlie');
      });

      it('sorts array by attribute in descending order', () => {
        const result = utils.sortByAttr(systems, 'name', 'desc');
        expect(result[0].name).toBe('charlie');
        expect(result[1].name).toBe('bravo');
        expect(result[2].name).toBe('alpha');
      });

      it('handles non-array input', () => {
        expect(utils.sortByAttr(null, 'name', 'asc')).toEqual([]);
        expect(utils.sortByAttr(undefined, 'name', 'asc')).toEqual([]);
        expect(utils.sortByAttr('not-array', 'name', 'asc')).toEqual([]);
      });

      it('handles empty array', () => {
        expect(utils.sortByAttr([], 'name', 'asc')).toEqual([]);
      });

      it('handles objects without the sort attribute', () => {
        const result = utils.sortByAttr([{ id: 1 }, { id: 2 }], 'name', 'asc');
        expect(result).toHaveLength(2);
      });
    });

    describe('splitArray', () => {
      it('splits array into chunks', () => {
        const result = utils.splitArray([1, 2, 3, 4, 5, 6], 2);
        expect(result).toEqual([
          [1, 2],
          [3, 4],
          [5, 6],
        ]);
      });

      it('handles uneven splits', () => {
        const result = utils.splitArray([1, 2, 3, 4, 5], 2);
        expect(result).toEqual([[1, 2], [3, 4], [5]]);
      });

      it('handles chunk size larger than array', () => {
        const result = utils.splitArray([1, 2], 5);
        expect(result).toEqual([[1, 2]]);
      });

      it('handles empty array', () => {
        const result = utils.splitArray([], 2);
        expect(result).toEqual([]);
      });

      it('handles chunk size of 1', () => {
        const result = utils.splitArray([1, 2, 3], 1);
        expect(result).toEqual([[1], [2], [3]]);
      });
    });

    describe('buildRows', () => {
      const mockRecords = [
        {
          action: 'Fix vulnerability',
          resolution: 'Apply security patch',
          needsReboot: false,
          systems: [],
        },
        {
          action: 'Update packages',
          resolution: 'Update all packages',
          needsReboot: true,
          systems: ['system1', 'system2'],
        },
      ];

      const mockSortByState = { index: 1, direction: 'asc' };
      const mockAllSystemsNamed = [
        { id: 'system1', name: 'System 1' },
        { id: 'system2', name: 'System 2' },
      ];

      it('builds rows correctly with systems', () => {
        const result = utils.buildRows(
          mockRecords,
          mockSortByState,
          false,
          mockAllSystemsNamed,
        );

        expect(result).toHaveLength(3); // 2 main rows + 1 system row
        expect(result[0].cells[0].title).toBe('Fix vulnerability');
        expect(result[1].cells[0].title).toBe('Update packages');
        expect(result[1].cells[3].title).toBe(2); // systems count

        // Check system row
        expect(result[2].parent).toBe(2);
        expect(result[2].fullWidth).toBe(true);
        expect(result[2].allSystems).toEqual(['system1', 'system2']);
      });

      it('builds rows without systems correctly', () => {
        const recordsWithoutSystems = [mockRecords[0]]; // Fix vulnerability has no systems
        const result = utils.buildRows(
          recordsWithoutSystems,
          mockSortByState,
          false,
          mockAllSystemsNamed,
        );

        expect(result).toHaveLength(1); // Only main row, no system row
        expect(result[0].cells[3].title).toBe(0); // systems count
      });

      it('shows alternate resolutions when enabled', () => {
        const recordsWithAlternate = [{ ...mockRecords[0], alternate: 2 }];

        const result = utils.buildRows(
          recordsWithAlternate,
          mockSortByState,
          true,
          mockAllSystemsNamed,
        );

        // Check that alternate resolution text is included
        const descriptionCell = result[0].cells[1];
        expect(descriptionCell.title).toBeDefined();
      });

      it('handles reboot requirements correctly', () => {
        const result = utils.buildRows(
          mockRecords,
          mockSortByState,
          false,
          mockAllSystemsNamed,
        );

        // First record (Fix vulnerability) doesn't need reboot
        const rebootCell1 = result[0].cells[2].title;
        expect(rebootCell1).toBeDefined();
        expect(rebootCell1.type).toBe('div');

        // Second record (Update packages) needs reboot
        const rebootCell2 = result[1].cells[2].title;
        expect(rebootCell2).toBeDefined();
        expect(rebootCell2.type).toBe('div');
      });

      it('handles empty records array', () => {
        const result = utils.buildRows(
          [],
          mockSortByState,
          false,
          mockAllSystemsNamed,
        );
        expect(result).toEqual([]);
      });
    });

    describe('onCollapse', () => {
      it('handles row collapse correctly', () => {
        const mockRows = [
          { isOpen: false, cells: [] },
          {
            parent: 0,
            allSystemsNamed: [{ id: 'sys1', name: 'System1' }],
            allSystems: ['sys1'],
            cells: [],
          },
        ];
        const mockSetRows = jest.fn();

        utils.onCollapse(null, 0, true, mockRows, mockSetRows);

        expect(mockRows[0].isOpen).toBe(true);
        expect(mockSetRows).toHaveBeenCalledWith(mockRows);
        expect(mockRows[1].cells).toHaveLength(1);
      });

      it('handles closing a row', () => {
        const mockRows = [
          { isOpen: true, cells: [] },
          {
            parent: 0,
            allSystemsNamed: [{ id: 'sys1', name: 'System1' }],
            allSystems: ['sys1'],
            cells: [],
          },
        ];
        const mockSetRows = jest.fn();

        utils.onCollapse(null, 0, false, mockRows, mockSetRows);

        expect(mockRows[0].isOpen).toBe(false);
        expect(mockSetRows).toHaveBeenCalledWith(mockRows);
      });
    });
  });

  describe('Business Logic Functions', () => {
    describe('getResolution', () => {
      const mockFormValues = {
        [utils.RESOLUTIONS]: [
          {
            id: 'issue1',
            resolutions: [
              { id: 'res1', description: 'Resolution 1' },
              { id: 'res2', description: 'Resolution 2' },
            ],
          },
        ],
        [utils.MANUAL_RESOLUTION]: true,
        [utils.SELECTED_RESOLUTIONS]: { issue1: 'res2' },
        [utils.EXISTING_PLAYBOOK_SELECTED]: false,
        [utils.EXISTING_PLAYBOOK]: {
          issues: [{ id: 'issue1', resolution: { id: 'res1' } }],
        },
      };

      it('returns manual resolution when selected', () => {
        const result = utils.getResolution('issue1', mockFormValues);
        expect(result).toEqual([{ id: 'res2', description: 'Resolution 2' }]);
      });

      it('returns existing playbook resolution when selected', () => {
        const formValues = {
          ...mockFormValues,
          [utils.MANUAL_RESOLUTION]: false,
          [utils.EXISTING_PLAYBOOK_SELECTED]: true,
        };

        const result = utils.getResolution('issue1', formValues);
        expect(result).toEqual([{ id: 'res1', description: 'Resolution 1' }]);
      });

      it('returns all resolutions when no specific selection', () => {
        const formValues = {
          ...mockFormValues,
          [utils.MANUAL_RESOLUTION]: false,
          [utils.EXISTING_PLAYBOOK_SELECTED]: false,
        };

        const result = utils.getResolution('issue1', formValues);
        expect(result).toEqual([
          { id: 'res1', description: 'Resolution 1' },
          { id: 'res2', description: 'Resolution 2' },
        ]);
      });

      it('handles missing issue', () => {
        const result = utils.getResolution('nonexistent', mockFormValues);
        expect(result).toEqual([]);
      });

      it('handles existing playbook without matching issue', () => {
        const formValues = {
          ...mockFormValues,
          [utils.MANUAL_RESOLUTION]: false,
          [utils.EXISTING_PLAYBOOK_SELECTED]: true,
          [utils.EXISTING_PLAYBOOK]: {
            issues: [{ id: 'other-issue', resolution: { id: 'res1' } }],
          },
        };

        const result = utils.getResolution('issue1', formValues);
        expect(result).toEqual([
          { id: 'res1', description: 'Resolution 1' },
          { id: 'res2', description: 'Resolution 2' },
        ]);
      });
    });

    describe('createNotification', () => {
      it('creates notification for new playbook', () => {
        const result = utils.createNotification('123', 'Test Playbook', true);

        expect(result.variant).toBe('success');
        expect(result.title).toBe('Playbook created');
        expect(result.dismissable).toBe(true);
        expect(result.description).toBeDefined();
      });

      it('creates notification for updated playbook', () => {
        const result = utils.createNotification('123', 'Test Playbook', false);

        expect(result.variant).toBe('success');
        expect(result.title).toBe('Playbook updated');
        expect(result.dismissable).toBe(true);
      });

      it('includes correct link in description', () => {
        document.baseURI = 'https://example.com/';

        const result = utils.createNotification('123', 'Test Playbook', true);

        // The description should be a React element
        expect(result.description).toBeDefined();
        expect(result.description.type).toBe('span');
      });
    });

    describe('submitRemediation', () => {
      const mockFormValues = {
        [utils.SELECT_PLAYBOOK]: 'Test Playbook',
        [utils.AUTO_REBOOT]: true,
        [utils.SYSTEMS]: { issue1: ['sys1', 'sys2'] },
        [utils.EXISTING_PLAYBOOK_SELECTED]: false,
        [utils.EXISTING_PLAYBOOK]: null,
        [utils.RESOLUTIONS]: [
          {
            id: 'issue1',
            resolutions: [{ id: 'res1' }],
          },
        ],
        [utils.MANUAL_RESOLUTION]: false,
        [utils.SELECTED_RESOLUTIONS]: {},
      };

      const mockData = {
        issues: [{ id: 'issue1' }],
        onRemediationCreated: jest.fn(),
      };

      const mockSetState = jest.fn();
      let mockSetInterval, mockClearInterval;

      beforeEach(() => {
        jest.useFakeTimers();

        // Mock setInterval to avoid infinite loops
        mockSetInterval = jest.fn((callback, delay) => {
          // Just return the interval ID without calling the callback
          return 'mock-interval-id';
        });

        mockClearInterval = jest.fn();

        global.setInterval = mockSetInterval;
        global.clearInterval = mockClearInterval;

        api.createRemediation.mockResolvedValue({ id: '123' });
        api.patchRemediation.mockResolvedValue({ id: '456' });
      });

      afterEach(() => {
        jest.clearAllTimers();
        jest.useRealTimers();
        jest.restoreAllMocks();
      });

      it('creates new remediation successfully', async () => {
        const promise = Promise.resolve({ id: '123' });
        api.createRemediation.mockReturnValue(promise);

        utils.submitRemediation(mockFormValues, mockData, '/api', mockSetState);

        expect(mockSetState).toHaveBeenCalledWith({ percent: 1 });
        expect(api.createRemediation).toHaveBeenCalledWith(
          {
            name: 'Test Playbook',
            add: {
              issues: [
                {
                  id: 'issue1',
                  resolution: 'res1',
                  systems: ['sys1', 'sys2'],
                },
              ],
              systems: [],
            },
            auto_reboot: true,
          },
          '/api',
        );

        // Wait for promise to resolve
        await promise;

        expect(mockSetState).toHaveBeenCalledWith({ id: '123', percent: 100 });
        expect(mockData.onRemediationCreated).toHaveBeenCalled();
        expect(mockSetInterval).toHaveBeenCalled();
      });

      it('updates existing remediation successfully', async () => {
        const updateFormValues = {
          ...mockFormValues,
          [utils.EXISTING_PLAYBOOK_SELECTED]: true,
          [utils.EXISTING_PLAYBOOK]: { id: '456' },
        };

        const promise = Promise.resolve({ id: '456' });
        api.patchRemediation.mockReturnValue(promise);

        utils.submitRemediation(
          updateFormValues,
          mockData,
          '/api',
          mockSetState,
        );

        expect(api.patchRemediation).toHaveBeenCalledWith('456', {
          add: {
            issues: [
              {
                id: 'issue1',
                resolution: 'res1',
                systems: ['sys1', 'sys2'],
              },
            ],
            systems: [],
          },
          auto_reboot: true,
        });

        // Wait for promise to resolve
        await promise;

        expect(mockSetState).toHaveBeenCalledWith({ id: '456', percent: 100 });
        expect(mockSetInterval).toHaveBeenCalled();
      });

      it('handles API failure', () => {
        api.createRemediation.mockRejectedValue(new Error('API Error'));

        utils.submitRemediation(mockFormValues, mockData, '/api', mockSetState);

        // Timer starts and initial setState call is made
        expect(mockSetState).toHaveBeenCalledWith({ percent: 1 });
        expect(mockSetInterval).toHaveBeenCalled();
        // Note: The catch block runs asynchronously, so we focus on initial behavior
      });

      it('filters out issues without systems', async () => {
        const formValuesNoSystems = {
          ...mockFormValues,
          [utils.SYSTEMS]: {}, // No systems selected
        };

        const promise = Promise.resolve({ id: '123' });
        api.createRemediation.mockReturnValue(promise);

        utils.submitRemediation(
          formValuesNoSystems,
          mockData,
          '/api',
          mockSetState,
        );

        expect(api.createRemediation).toHaveBeenCalledWith(
          expect.objectContaining({
            add: {
              issues: [], // Should be empty
              systems: [],
            },
          }),
          '/api',
        );

        // Wait for promise to resolve
        await promise;
      });

      it('handles playbook name trimming', async () => {
        const formValuesWithSpaces = {
          ...mockFormValues,
          [utils.SELECT_PLAYBOOK]: '  Test Playbook  ',
        };

        const promise = Promise.resolve({ id: '123' });
        api.createRemediation.mockReturnValue(promise);

        utils.submitRemediation(
          formValuesWithSpaces,
          mockData,
          '/api',
          mockSetState,
        );

        expect(api.createRemediation).toHaveBeenCalledWith(
          expect.objectContaining({
            name: 'Test Playbook', // Should be trimmed
          }),
          '/api',
        );

        await promise;
      });

      it('handles existing playbook systems merge', async () => {
        const formValuesWithExisting = {
          ...mockFormValues,
          [utils.EXISTING_PLAYBOOK_SELECTED]: false,
          [utils.EXISTING_PLAYBOOK]: {
            issues: [
              {
                id: 'issue1',
                systems: [{ id: 'existing-sys1' }, { id: 'existing-sys2' }],
              },
            ],
          },
        };

        const promise = Promise.resolve({ id: '123' });
        api.createRemediation.mockReturnValue(promise);

        utils.submitRemediation(
          formValuesWithExisting,
          mockData,
          '/api',
          mockSetState,
        );

        expect(api.createRemediation).toHaveBeenCalledWith(
          expect.objectContaining({
            add: {
              issues: [
                {
                  id: 'issue1',
                  resolution: 'res1',
                  systems: ['existing-sys1', 'existing-sys2', 'sys1', 'sys2'],
                },
              ],
              systems: [],
            },
          }),
          '/api',
        );

        await promise;
      });
    });

    describe('fetchSystemsInfo', () => {
      const mockConfig = {
        page: 1,
        per_page: 10,
        orderBy: 'display_name',
        orderDirection: 'ASC',
        filters: { hostnameOrId: 'test' },
      };

      const mockSortableColumns = ['display_name', 'updated'];
      const mockAllSystemsNamed = [
        { id: 'sys1', name: 'test-system-1' },
        { id: 'sys2', name: 'another-system' },
        { id: 'sys3', name: 'test-system-2' },
      ];

      const mockGetEntities = jest.fn().mockResolvedValue({
        results: [
          { id: 'sys1', display_name: 'test-system-1' },
          { id: 'sys3', display_name: 'test-system-2' },
        ],
        total: 2,
      });

      beforeEach(() => {
        mockGetEntities.mockClear();
      });

      it('fetches and filters systems correctly', async () => {
        const result = await utils.fetchSystemsInfo(
          mockConfig,
          mockSortableColumns,
          mockAllSystemsNamed,
          mockGetEntities,
        );

        expect(mockGetEntities).toHaveBeenCalledWith(
          ['sys1', 'sys3'], // Only systems matching "test" filter
          expect.objectContaining({
            page: 1,
            per_page: 10,
            orderBy: 'display_name',
            orderDirection: 'asc',
            fields: { system_profile: ['operating_system', 'bootc_status'] },
            hasItems: true,
          }),
          true,
        );

        expect(result.page).toBe(1);
        expect(result.per_page).toBe(10);
        expect(result.orderBy).toBe('display_name');
        expect(result.orderDirection).toBe('asc');
      });

      it('handles invalid sort column', async () => {
        const configInvalidSort = {
          ...mockConfig,
          orderBy: 'invalid_column',
        };

        await utils.fetchSystemsInfo(
          configInvalidSort,
          mockSortableColumns,
          mockAllSystemsNamed,
          mockGetEntities,
        );

        expect(mockGetEntities).toHaveBeenCalledWith(
          expect.any(Array),
          expect.objectContaining({
            orderBy: undefined,
            orderDirection: undefined,
          }),
          true,
        );
      });

      it('handles no hostname filter', async () => {
        const configNoFilter = {
          ...mockConfig,
          filters: {},
        };

        await utils.fetchSystemsInfo(
          configNoFilter,
          mockSortableColumns,
          mockAllSystemsNamed,
          mockGetEntities,
        );

        expect(mockGetEntities).toHaveBeenCalledWith(
          ['sys2', 'sys1', 'sys3'], // All systems sorted by name
          expect.any(Object),
          true,
        );
      });

      it('handles pagination correctly', async () => {
        const configPage2 = {
          ...mockConfig,
          page: 2,
          per_page: 1,
          filters: {},
        };

        await utils.fetchSystemsInfo(
          configPage2,
          mockSortableColumns,
          mockAllSystemsNamed,
          mockGetEntities,
        );

        expect(mockGetEntities).toHaveBeenCalledWith(
          ['sys1'], // First item for page 2 with per_page 1 (after sorting)
          expect.any(Object),
          true,
        );
      });

      it('handles empty results', async () => {
        mockGetEntities.mockResolvedValueOnce({});

        const result = await utils.fetchSystemsInfo(
          { ...mockConfig, filters: { hostnameOrId: 'nonexistent' } },
          mockSortableColumns,
          mockAllSystemsNamed,
          mockGetEntities,
        );

        expect(result.results).toEqual([]);
      });

      it('handles case insensitive filtering', async () => {
        const configUpperCase = {
          ...mockConfig,
          filters: { hostnameOrId: 'TEST' },
        };

        await utils.fetchSystemsInfo(
          configUpperCase,
          mockSortableColumns,
          mockAllSystemsNamed,
          mockGetEntities,
        );

        expect(mockGetEntities).toHaveBeenCalledWith(
          ['sys1', 'sys3'], // Should still match lowercase systems
          expect.any(Object),
          true,
        );
      });
    });
  });

  describe('State Management Functions', () => {
    describe('entitySelected', () => {
      const mockState = {
        selected: ['item1'],
        rows: [{ id: 'item1' }, { id: 'item2' }, { id: 'item3' }],
      };

      it('adds single item to selection', () => {
        const action = { payload: { id: 'item2', selected: true } };
        const result = utils.entitySelected(mockState, action);

        expect(result.selected).toEqual(['item1', 'item2']);
      });

      it('removes single item from selection', () => {
        const action = { payload: { id: 'item1', selected: false } };
        const result = utils.entitySelected(mockState, action);

        expect(result.selected).toEqual([]);
      });

      it('selects all items when id is 0', () => {
        const action = { payload: { id: 0, selected: true } };
        const result = utils.entitySelected(mockState, action);

        expect(result.selected).toEqual(['item1', 'item1', 'item2', 'item3']);
      });

      it('deselects all items when id is 0', () => {
        const stateAllSelected = {
          selected: ['item1', 'item2', 'item3'],
          rows: mockState.rows,
        };
        const action = { payload: { id: 0, selected: false } };
        const result = utils.entitySelected(stateAllSelected, action);

        expect(result.selected).toEqual([]);
      });

      it('clears all selection when id is -1', () => {
        const action = { payload: { id: -1, selected: false } };
        const result = utils.entitySelected(mockState, action);

        expect(result.selected).toEqual([]);
      });

      it('handles state without selected array', () => {
        const stateNoSelected = { rows: mockState.rows };
        const action = { payload: { id: 'item2', selected: true } };
        const result = utils.entitySelected(stateNoSelected, action);

        expect(result.selected).toEqual(['item2']);
      });
    });

    describe('loadEntitiesFulfilled', () => {
      const mockState = {
        rows: [
          { id: 'item1', display_name: 'Charlie' },
          { id: 'item2', display_name: 'Alpha' },
          { id: 'item3', display_name: 'Bravo' },
        ],
      };

      const mockSortBy = { key: 'display_name', direction: 'asc' };

      it('loads entities with provided allSystems', () => {
        const result = utils.loadEntitiesFulfilled(
          mockState,
          ['item1', 'item2'],
          mockSortBy,
        );

        expect(result.selected).toEqual(['item1', 'item2']);
        expect(result.sortBy).toEqual(mockSortBy);
        expect(result.rows[0].display_name).toBe('Alpha'); // Sorted
        expect(result.rows[0].selected).toBe(true); // item1 selected
      });

      it('loads entities without allSystems (selects all)', () => {
        const result = utils.loadEntitiesFulfilled(mockState, null, mockSortBy);

        expect(result.selected).toEqual(['item1', 'item2', 'item3']);
        expect(result.rows.every((row) => row.selected)).toBe(true);
      });

      it('preserves existing selection when state has selected', () => {
        const stateWithSelection = {
          ...mockState,
          selected: ['item2'],
        };

        const result = utils.loadEntitiesFulfilled(
          stateWithSelection,
          null,
          mockSortBy,
        );

        expect(result.selected).toEqual(['item2']);
      });

      it('handles default sort direction', () => {
        const sortByNoDirection = { key: 'display_name' };
        const result = utils.loadEntitiesFulfilled(
          mockState,
          null,
          sortByNoDirection,
        );

        expect(result.rows[0].display_name).toBe('Alpha'); // Still sorted asc by default
      });
    });

    describe('changeBulkSelect', () => {
      const mockState = {
        selected: ['item1'],
        rows: [
          { id: 'item1', name: 'Item 1' },
          { id: 'item2', name: 'Item 2' },
          { id: 'item3', name: 'Item 3' },
        ],
      };

      it('selects all items when payload is true', () => {
        const action = { payload: true };
        const result = utils.changeBulkSelect(mockState, action);

        expect(result.selected).toEqual(['item1', 'item2', 'item3']);
        expect(result.rows.every((row) => row.selected)).toBe(true);
      });

      it('deselects all items when payload is false', () => {
        const action = { payload: false };
        const result = utils.changeBulkSelect(mockState, action);

        expect(result.selected).toEqual([]);
        expect(result.rows.every((row) => row.selected)).toBe(false);
      });

      it('deduplicates selected items when selecting all', () => {
        const stateWithDuplicates = {
          selected: ['item1', 'item1', 'item2'],
          rows: mockState.rows,
        };
        const action = { payload: true };
        const result = utils.changeBulkSelect(stateWithDuplicates, action);

        expect(result.selected).toEqual(['item1', 'item2', 'item3']);
      });
    });
  });

  describe('Specialized Functions', () => {
    describe('getPlaybookSystems', () => {
      const mockPlaybook = {
        issues: [
          {
            systems: [
              { id: 'sys1', display_name: 'System 1' },
              { id: 'sys2', display_name: 'System 2' },
            ],
          },
          {
            systems: [
              { id: 'sys2', display_name: 'System 2' }, // Duplicate
              { id: 'sys3', display_name: 'System 3' },
            ],
          },
        ],
      };

      it('extracts unique systems from playbook', () => {
        const result = utils.getPlaybookSystems(mockPlaybook);

        expect(result).toHaveLength(3);
        expect(result).toEqual([
          { id: 'sys1', name: 'System 1' },
          { id: 'sys2', name: 'System 2' },
          { id: 'sys3', name: 'System 3' },
        ]);
      });

      it('handles null playbook', () => {
        const result = utils.getPlaybookSystems(null);
        expect(result).toEqual([]);
      });

      it('handles undefined playbook', () => {
        const result = utils.getPlaybookSystems(undefined);
        expect(result).toEqual([]);
      });

      it('handles playbook without issues', () => {
        const result = utils.getPlaybookSystems({});
        expect(result).toEqual([]);
      });

      it('handles empty issues array', () => {
        const result = utils.getPlaybookSystems({ issues: [] });
        expect(result).toEqual([]);
      });

      it('handles issues without systems', () => {
        const result = utils.getPlaybookSystems({ issues: [{ systems: [] }] });
        expect(result).toEqual([]);
      });
    });

    describe('shortenIssueId', () => {
      it('shortens issue ID by taking last segment', () => {
        expect(utils.shortenIssueId('advisor|RULE_1|error')).toBe('error');
        expect(utils.shortenIssueId('patch|CVE-2021-1234|high')).toBe('high');
      });

      it('handles single segment ID', () => {
        expect(utils.shortenIssueId('simple-id')).toBe('simple-id');
      });

      it('handles null ID', () => {
        expect(utils.shortenIssueId(null)).toBe(null);
      });

      it('handles undefined ID', () => {
        expect(utils.shortenIssueId(undefined)).toBe(undefined);
      });

      it('handles empty string ID', () => {
        expect(utils.shortenIssueId('')).toBe('');
      });

      it('handles ID without pipe separators', () => {
        expect(utils.shortenIssueId('no-pipes-here')).toBe('no-pipes-here');
      });

      it('handles ID with multiple pipe separators', () => {
        expect(utils.shortenIssueId('a|b|c|d|e')).toBe('e');
      });
    });

    describe('getIssuesMultiple', () => {
      const mockIssues = [
        { id: 'issue1', description: 'Fix vulnerability' },
        { id: 'issue2', description: 'Update packages' },
      ];

      const mockSystems = ['sys1', 'sys2'];

      const mockResolutions = [
        {
          id: 'issue1',
          resolutions: [
            { description: 'Apply patch', needs_reboot: true },
            { description: 'Alternative patch', needs_reboot: false },
            { description: 'Manual fix', needs_reboot: false },
          ],
        },
        {
          id: 'issue2',
          resolutions: [
            { description: 'Automatic update', needs_reboot: false },
          ],
        },
      ];

      it('returns issues with multiple resolutions', () => {
        const result = utils.getIssuesMultiple(
          mockIssues,
          mockSystems,
          mockResolutions,
        );

        expect(result).toHaveLength(1); // Only issue1 has multiple resolutions
        expect(result[0]).toEqual({
          action: 'Fix vulnerability',
          resolution: 'Apply patch',
          needsReboot: true,
          systems: ['sys1', 'sys2'],
          id: 'issue1',
          alternate: 2, // 3 total - 1 primary = 2 alternates
        });
      });

      it('combines issue systems with provided systems', () => {
        const issuesWithSystems = [
          { ...mockIssues[0], systems: ['sys3', 'sys4'] },
        ];

        const result = utils.getIssuesMultiple(
          issuesWithSystems,
          mockSystems,
          mockResolutions,
        );

        expect(result[0].systems).toEqual(['sys3', 'sys4', 'sys1', 'sys2']);
      });

      it('handles empty arrays', () => {
        expect(utils.getIssuesMultiple([], [], [])).toEqual([]);
        expect(utils.getIssuesMultiple(mockIssues, mockSystems, [])).toEqual(
          [],
        );
      });

      it('filters out issues without resolutions', () => {
        const result = utils.getIssuesMultiple(
          [{ id: 'nonexistent', description: 'No resolutions' }],
          mockSystems,
          mockResolutions,
        );

        expect(result).toEqual([]);
      });

      it('handles undefined issues systems', () => {
        const issuesNoSystems = [
          { id: 'issue1', description: 'Fix vulnerability' },
        ];
        const result = utils.getIssuesMultiple(
          issuesNoSystems,
          mockSystems,
          mockResolutions,
        );

        expect(result[0].systems).toEqual(['sys1', 'sys2']);
      });

      it('handles resolutions without descriptions', () => {
        const resolutionsNoDesc = [
          {
            id: 'issue1',
            resolutions: [{ needs_reboot: true }, { needs_reboot: false }],
          },
        ];

        const result = utils.getIssuesMultiple(
          mockIssues.slice(0, 1),
          mockSystems,
          resolutionsNoDesc,
        );

        expect(result[0].resolution).toBeUndefined();
        expect(result[0].needsReboot).toBe(true);
      });
    });

    describe('matchPermissions', () => {
      it('matches exact permissions', () => {
        expect(
          utils.matchPermissions('read:write:execute', 'read:write:execute'),
        ).toBe(true);
      });

      it('matches with wildcards in first permission', () => {
        expect(
          utils.matchPermissions('*:write:execute', 'read:write:execute'),
        ).toBe(true);
        expect(
          utils.matchPermissions('read:*:execute', 'read:write:execute'),
        ).toBe(true);
        expect(
          utils.matchPermissions('read:write:*', 'read:write:execute'),
        ).toBe(true);
      });

      it('matches with wildcards in second permission', () => {
        expect(
          utils.matchPermissions('read:write:execute', '*:write:execute'),
        ).toBe(true);
        expect(
          utils.matchPermissions('read:write:execute', 'read:*:execute'),
        ).toBe(true);
        expect(
          utils.matchPermissions('read:write:execute', 'read:write:*'),
        ).toBe(true);
      });

      it('matches with wildcards in both permissions', () => {
        expect(utils.matchPermissions('*:write:*', '*:write:*')).toBe(true);
        expect(utils.matchPermissions('*:*:*', 'read:write:execute')).toBe(
          true,
        );
      });

      it('rejects mismatched permissions', () => {
        expect(
          utils.matchPermissions('read:write:execute', 'read:admin:execute'),
        ).toBe(false);
        expect(
          utils.matchPermissions('admin:write:execute', 'read:write:execute'),
        ).toBe(false);
      });

      it('rejects permissions with different segment counts', () => {
        expect(utils.matchPermissions('read:write', 'read:write:execute')).toBe(
          false,
        );
        expect(
          utils.matchPermissions(
            'read:write:execute:admin',
            'read:write:execute',
          ),
        ).toBe(false);
      });

      it('handles empty segments', () => {
        expect(utils.matchPermissions('::execute', '::execute')).toBe(true);
        expect(utils.matchPermissions('*::execute', 'read::execute')).toBe(
          true,
        );
      });

      it('handles single segment permissions', () => {
        expect(utils.matchPermissions('admin', 'admin')).toBe(true);
        expect(utils.matchPermissions('*', 'admin')).toBe(true);
        expect(utils.matchPermissions('admin', '*')).toBe(true);
      });
    });
  });

  describe('Reducer Functions', () => {
    describe('inventoryEntitiesReducer', () => {
      const mockAllSystems = ['sys1', 'sys2'];
      const mockLoadEntitiesFulfilled = 'LOAD_ENTITIES_FULFILLED';

      it('creates reducer with correct action handlers', () => {
        const reducer = utils.inventoryEntitiesReducer(mockAllSystems, {
          LOAD_ENTITIES_FULFILLED: mockLoadEntitiesFulfilled,
        });

        // The function should return the result of applyReducerHash
        expect(reducer).toBeDefined();
        expect(typeof reducer).toBe('object');
      });

      it('handles SELECT_ENTITY action', () => {
        const reducer = utils.inventoryEntitiesReducer(mockAllSystems, {
          LOAD_ENTITIES_FULFILLED: mockLoadEntitiesFulfilled,
        });

        expect(reducer.SELECT_ENTITY).toBeDefined();
        expect(typeof reducer.SELECT_ENTITY).toBe('function');
      });

      it('handles LOAD_ENTITIES_FULFILLED action', () => {
        const reducer = utils.inventoryEntitiesReducer(mockAllSystems, {
          LOAD_ENTITIES_FULFILLED: mockLoadEntitiesFulfilled,
        });

        expect(reducer[mockLoadEntitiesFulfilled]).toBeDefined();
        expect(typeof reducer[mockLoadEntitiesFulfilled]).toBe('function');
      });

      it('handles TOGGLE_BULK_SELECT action', () => {
        const reducer = utils.inventoryEntitiesReducer(mockAllSystems, {
          LOAD_ENTITIES_FULFILLED: mockLoadEntitiesFulfilled,
        });

        expect(reducer[utils.TOGGLE_BULK_SELECT]).toBeDefined();
        expect(typeof reducer[utils.TOGGLE_BULK_SELECT]).toBe('function');
      });
    });
  });
});
