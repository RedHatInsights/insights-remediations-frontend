import useColumns from './Columns';
import { renderHook } from '@testing-library/react';

jest.mock('./Cells', () => ({
  SystemNameCell: 'SystemNameCellComponent',
  InsightsConnectCell: 'InsightsConnectCellComponent',
  RedHatLightSpeedCell: 'RedHatLightSpeedCellComponent',
  ExecutionStatusCell: 'ExecutionStatusCellComponent',
}));

jest.mock('../../../Utilities/Hooks/useFeatureFlag', () => ({
  useFeatureFlag: jest.fn(),
}));

jest.mock('@patternfly/react-table', () => ({
  wrappable: 'wrappableTransform',
}));

const { useFeatureFlag } = require('../../../Utilities/Hooks/useFeatureFlag');

const getColumnsWithFlag = (flagEnabled = false) => {
  useFeatureFlag.mockReturnValue(flagEnabled);
  const { result } = renderHook(() => useColumns());
  return result.current;
};

describe('ExecutionHistoryContent Columns', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('With feature flag disabled', () => {
    beforeEach(() => {
      useFeatureFlag.mockReturnValue(false);
    });

    describe('Basic structure', () => {
      it('should return an array', () => {
        const { result } = renderHook(() => useColumns());
        expect(Array.isArray(result.current)).toBe(true);
      });

      it('should have exactly 3 columns', () => {
        const { result } = renderHook(() => useColumns());
        expect(result.current).toHaveLength(3);
      });

      it('should have all columns defined', () => {
        const { result } = renderHook(() => useColumns());
        result.current.forEach((column) => {
          expect(column).toBeDefined();
          expect(typeof column).toBe('object');
        });
      });
    });

    describe('Column configurations', () => {
      it('should have System name column with correct configuration', () => {
        const { result } = renderHook(() => useColumns());
        const systemNameColumn = result.current[0];

        expect(systemNameColumn.title).toBe('System name');
        expect(systemNameColumn.transforms).toEqual(['wrappableTransform']);
        expect(systemNameColumn.exportKey).toBe('action');
        expect(systemNameColumn.Component).toBe('SystemNameCellComponent');
      });

      it('should have Insights connection column with correct configuration', () => {
        const { result } = renderHook(() => useColumns());
        const insightsConnectColumn = result.current[1];

        expect(insightsConnectColumn.title).toBe('Insights connection');
        expect(insightsConnectColumn.transforms).toEqual([
          'wrappableTransform',
        ]);
        expect(insightsConnectColumn.exportKey).toBe('reboot');
        expect(insightsConnectColumn.Component).toBe(
          'InsightsConnectCellComponent',
        );
      });

      it('should have Execution status column with correct configuration', () => {
        const { result } = renderHook(() => useColumns());
        const executionStatusColumn = result.current[2];

        expect(executionStatusColumn.title).toBe('Execution status');
        expect(executionStatusColumn.transforms).toEqual([
          'wrappableTransform',
        ]);
        expect(executionStatusColumn.exportKey).toBe('system_count');
        expect(executionStatusColumn.Component).toBe(
          'ExecutionStatusCellComponent',
        );
      });
    });
  });

  describe('With feature flag enabled', () => {
    beforeEach(() => {
      useFeatureFlag.mockReturnValue(true);
    });

    describe('Basic structure', () => {
      it('should return an array', () => {
        const { result } = renderHook(() => useColumns());
        expect(Array.isArray(result.current)).toBe(true);
      });

      it('should have exactly 3 columns', () => {
        const { result } = renderHook(() => useColumns());
        expect(result.current).toHaveLength(3);
      });
    });

    describe('Column configurations', () => {
      it('should have System name column with correct configuration', () => {
        const { result } = renderHook(() => useColumns());
        const systemNameColumn = result.current[0];

        expect(systemNameColumn.title).toBe('System name');
        expect(systemNameColumn.transforms).toEqual(['wrappableTransform']);
        expect(systemNameColumn.exportKey).toBe('action');
        expect(systemNameColumn.Component).toBe('SystemNameCellComponent');
      });

      it('should have Red Hat Lightspeed connection column with correct configuration', () => {
        const { result } = renderHook(() => useColumns());
        const redHatLightspeedColumn = result.current[1];

        expect(redHatLightspeedColumn.title).toBe(
          'Red Hat Lightspeed connection',
        );
        expect(redHatLightspeedColumn.transforms).toEqual([
          'wrappableTransform',
        ]);
        expect(redHatLightspeedColumn.exportKey).toBe('reboot');
        expect(redHatLightspeedColumn.Component).toBe(
          'RedHatLightSpeedCellComponent',
        );
      });

      it('should have Execution status column with correct configuration', () => {
        const { result } = renderHook(() => useColumns());
        const executionStatusColumn = result.current[2];

        expect(executionStatusColumn.title).toBe('Execution status');
        expect(executionStatusColumn.transforms).toEqual([
          'wrappableTransform',
        ]);
        expect(executionStatusColumn.exportKey).toBe('system_count');
        expect(executionStatusColumn.Component).toBe(
          'ExecutionStatusCellComponent',
        );
      });
    });
  });

  describe('Column properties validation', () => {
    it('should have all required properties for each column', () => {
      const requiredProperties = [
        'title',
        'transforms',
        'exportKey',
        'Component',
      ];

      const columns = getColumnsWithFlag(false);
      columns.forEach((column) => {
        requiredProperties.forEach((prop) => {
          expect(column).toHaveProperty(prop);
          expect(column[prop]).toBeDefined();
        });
      });
    });

    it('should work with feature flags', () => {
      // Test with flag disabled
      const columnsDisabled = getColumnsWithFlag(false);
      expect(columnsDisabled).toHaveLength(3);
      expect(columnsDisabled[1].title).toBe('Insights connection');

      // Test with flag enabled
      const columnsEnabled = getColumnsWithFlag(true);
      expect(columnsEnabled).toHaveLength(3);
      expect(columnsEnabled[1].title).toBe('Red Hat Lightspeed connection');
    });
  });

  describe('Component mapping', () => {
    it('should map correct cell components to columns', () => {
      const expectedMappings = [
        { title: 'System name', Component: 'SystemNameCellComponent' },
        {
          title: 'Red Hat Lightspeed connection',
          Component: 'RedHatLightSpeedCellComponent',
        },
        {
          title: 'Execution status',
          Component: 'ExecutionStatusCellComponent',
        },
      ];

      const columns = getColumnsWithFlag(true); // Use enabled flag to match expected titles
      expectedMappings.forEach((mapping) => {
        const column = columns.find((col) => col.title === mapping.title);
        expect(column).toBeDefined();
        expect(column.Component).toBe(mapping.Component);
      });
    });

    it('should have different components for different columns', () => {
      const columns = getColumnsWithFlag(false);
      const components = columns.map((col) => col.Component);
      const uniqueComponents = [...new Set(components)];
      expect(uniqueComponents).toHaveLength(components.length);
    });
  });

  describe('Transform configuration', () => {
    it('should use wrappable transform for all columns', () => {
      const columns = getColumnsWithFlag(false);
      columns.forEach((column) => {
        expect(column.transforms).toContain('wrappableTransform');
      });
    });

    it('should have transforms array with exactly one transform per column', () => {
      const columns = getColumnsWithFlag(false);
      columns.forEach((column) => {
        expect(column.transforms).toHaveLength(1);
      });
    });
  });

  describe('Data structure integrity', () => {
    it('should not have any null or undefined columns', () => {
      const columns = getColumnsWithFlag(false);
      columns.forEach((column) => {
        expect(column).not.toBeNull();
        expect(column).not.toBeUndefined();
      });
    });

    it('should have stable column structure', () => {
      // Check that all columns have the expected structure
      const columns = getColumnsWithFlag(false);
      columns.forEach((column) => {
        expect(column).toHaveProperty('title');
        expect(column).toHaveProperty('transforms');
        expect(column).toHaveProperty('exportKey');
        expect(column).toHaveProperty('Component');
      });
    });

    it('should maintain consistent column order', () => {
      const expectedTitles = [
        'System name',
        'Insights connection',
        'Execution status',
      ];
      const columns = getColumnsWithFlag(false);
      const actualTitles = columns.map((col) => col.title);

      expect(actualTitles).toEqual(expectedTitles);
    });
  });

  describe('Integration compatibility', () => {
    it('should be compatible with PatternFly table structure', () => {
      const columns = getColumnsWithFlag(false);
      columns.forEach((column) => {
        // PatternFly table columns should have these properties
        expect(column).toHaveProperty('title');
        expect(column).toHaveProperty('transforms');

        // Should be able to access Component for rendering
        expect(column.Component).toBeDefined();
      });
    });

    it('should have export keys for data export functionality', () => {
      const columns = getColumnsWithFlag(false);
      columns.forEach((column) => {
        expect(column.exportKey).toBeDefined();
        expect(typeof column.exportKey).toBe('string');
      });
    });
  });
});
