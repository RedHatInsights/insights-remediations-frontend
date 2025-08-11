import columns from './Columns';

// Mock the cell components
jest.mock('./Cells', () => ({
  SystemNameCell: 'SystemNameCellComponent',
  InsightsConnectCell: 'InsightsConnectCellComponent',
  ExecutionStatusCell: 'ExecutionStatusCellComponent',
}));

// Mock PatternFly table utilities
jest.mock('@patternfly/react-table', () => ({
  wrappable: 'wrappableTransform',
}));

describe('ExecutionHistoryContent Columns', () => {
  describe('Basic structure', () => {
    it('should export an array', () => {
      expect(Array.isArray(columns)).toBe(true);
    });

    it('should have exactly 3 columns', () => {
      expect(columns).toHaveLength(3);
    });

    it('should have all columns defined', () => {
      columns.forEach((column) => {
        expect(column).toBeDefined();
        expect(typeof column).toBe('object');
      });
    });
  });

  describe('Column configurations', () => {
    it('should have System name column with correct configuration', () => {
      const systemNameColumn = columns[0];

      expect(systemNameColumn.title).toBe('System name');
      expect(systemNameColumn.transforms).toEqual(['wrappableTransform']);
      expect(systemNameColumn.exportKey).toBe('action');
      expect(systemNameColumn.Component).toBe('SystemNameCellComponent');
    });

    it('should have Insights connection column with correct configuration', () => {
      const insightsConnectColumn = columns[1];

      expect(insightsConnectColumn.title).toBe('Insights connection');
      expect(insightsConnectColumn.transforms).toEqual(['wrappableTransform']);
      expect(insightsConnectColumn.exportKey).toBe('reboot');
      expect(insightsConnectColumn.Component).toBe(
        'InsightsConnectCellComponent',
      );
    });

    it('should have Execution status column with correct configuration', () => {
      const executionStatusColumn = columns[2];

      expect(executionStatusColumn.title).toBe('Execution status');
      expect(executionStatusColumn.transforms).toEqual(['wrappableTransform']);
      expect(executionStatusColumn.exportKey).toBe('system_count');
      expect(executionStatusColumn.Component).toBe(
        'ExecutionStatusCellComponent',
      );
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

      columns.forEach((column) => {
        requiredProperties.forEach((prop) => {
          expect(column).toHaveProperty(prop);
          expect(column[prop]).toBeDefined();
        });
      });
    });

    it('should have string titles for all columns', () => {
      columns.forEach((column) => {
        expect(typeof column.title).toBe('string');
        expect(column.title.length).toBeGreaterThan(0);
      });
    });

    it('should have transforms arrays for all columns', () => {
      columns.forEach((column) => {
        expect(Array.isArray(column.transforms)).toBe(true);
        expect(column.transforms).toContain('wrappableTransform');
      });
    });

    it('should have string exportKeys for all columns', () => {
      columns.forEach((column) => {
        expect(typeof column.exportKey).toBe('string');
        expect(column.exportKey.length).toBeGreaterThan(0);
      });
    });

    it('should have Components defined for all columns', () => {
      columns.forEach((column) => {
        expect(column.Component).toBeDefined();
        expect(typeof column.Component).toBe('string'); // Mocked as strings
      });
    });
  });

  describe('Column titles and keys', () => {
    it('should have unique titles', () => {
      const titles = columns.map((col) => col.title);
      const uniqueTitles = [...new Set(titles)];
      expect(uniqueTitles).toHaveLength(titles.length);
    });

    it('should have unique export keys', () => {
      const exportKeys = columns.map((col) => col.exportKey);
      const uniqueExportKeys = [...new Set(exportKeys)];
      expect(uniqueExportKeys).toHaveLength(exportKeys.length);
    });

    it('should have meaningful column titles', () => {
      const expectedTitles = [
        'System name',
        'Insights connection',
        'Execution status',
      ];

      columns.forEach((column) => {
        expect(expectedTitles).toContain(column.title);
      });
    });

    it('should have appropriate export keys', () => {
      const expectedExportKeys = ['action', 'reboot', 'system_count'];

      columns.forEach((column) => {
        expect(expectedExportKeys).toContain(column.exportKey);
      });
    });
  });

  describe('Component mapping', () => {
    it('should map correct cell components to columns', () => {
      const expectedMappings = [
        { title: 'System name', Component: 'SystemNameCellComponent' },
        {
          title: 'Insights connection',
          Component: 'InsightsConnectCellComponent',
        },
        {
          title: 'Execution status',
          Component: 'ExecutionStatusCellComponent',
        },
      ];

      expectedMappings.forEach((mapping) => {
        const column = columns.find((col) => col.title === mapping.title);
        expect(column).toBeDefined();
        expect(column.Component).toBe(mapping.Component);
      });
    });

    it('should have different components for different columns', () => {
      const components = columns.map((col) => col.Component);
      const uniqueComponents = [...new Set(components)];
      expect(uniqueComponents).toHaveLength(components.length);
    });
  });

  describe('Transform configuration', () => {
    it('should use wrappable transform for all columns', () => {
      columns.forEach((column) => {
        expect(column.transforms).toContain('wrappableTransform');
      });
    });

    it('should have transforms array with exactly one transform per column', () => {
      columns.forEach((column) => {
        expect(column.transforms).toHaveLength(1);
      });
    });
  });

  describe('Data structure integrity', () => {
    it('should not have any null or undefined columns', () => {
      columns.forEach((column) => {
        expect(column).not.toBeNull();
        expect(column).not.toBeUndefined();
      });
    });

    it('should have stable column structure', () => {
      // Check that all columns have the expected structure
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
      const actualTitles = columns.map((col) => col.title);

      expect(actualTitles).toEqual(expectedTitles);
    });
  });

  describe('Integration compatibility', () => {
    it('should be compatible with PatternFly table structure', () => {
      columns.forEach((column) => {
        // PatternFly table columns should have these properties
        expect(column).toHaveProperty('title');
        expect(column).toHaveProperty('transforms');

        // Should be able to access Component for rendering
        expect(column.Component).toBeDefined();
      });
    });

    it('should have export keys for data export functionality', () => {
      columns.forEach((column) => {
        expect(column.exportKey).toBeDefined();
        expect(typeof column.exportKey).toBe('string');
      });
    });
  });
});
