import columns from './Columns';
import { wrappable } from '@patternfly/react-table';

// Mock external dependencies
jest.mock('@patternfly/react-table', () => ({
  wrappable: 'wrappableTransform',
}));

jest.mock('./Cells', () => ({
  ActionsCell: 'ActionsCellComponent',
  IssueTypeCell: 'IssueTypeCellComponent',
  SystemsCell: 'SystemsCellComponent',
  RebootRequiredCell: 'RebootRequiredCellComponent',
}));

describe('ActionsContent Columns', () => {
  describe('Array structure', () => {
    it('should be an array', () => {
      expect(Array.isArray(columns)).toBe(true);
    });

    it('should have exactly 4 columns', () => {
      expect(columns).toHaveLength(4);
    });

    it('should be defined and not empty', () => {
      expect(columns).toBeDefined();
      expect(columns.length).toBeGreaterThan(0);
    });
  });

  describe('Column configurations', () => {
    it('should have correct Action column configuration', () => {
      const actionColumn = columns[0];
      expect(actionColumn.title).toBe('Action');
      expect(actionColumn.transforms).toEqual([wrappable]);
      expect(actionColumn.exportKey).toBe('action');
      expect(actionColumn.Component).toBe('ActionsCellComponent');
    });

    it('should have correct Reboot required column configuration', () => {
      const rebootColumn = columns[1];
      expect(rebootColumn.title).toBe('Reboot required');
      expect(rebootColumn.transforms).toEqual([wrappable]);
      expect(rebootColumn.exportKey).toBe('reboot');
      expect(rebootColumn.Component).toBe('RebootRequiredCellComponent');
    });

    it('should have correct Affected systems column configuration', () => {
      const systemsColumn = columns[2];
      expect(systemsColumn.title).toBe('Affected systems');
      expect(systemsColumn.transforms).toEqual([wrappable]);
      expect(systemsColumn.exportKey).toBe('system_count');
      expect(systemsColumn.Component).toBe('SystemsCellComponent');
    });

    it('should have correct Issue type column configuration', () => {
      const issueTypeColumn = columns[3];
      expect(issueTypeColumn.title).toBe('Issue type');
      expect(issueTypeColumn.transforms).toEqual([wrappable]);
      expect(issueTypeColumn.exportKey).toBe('type');
      expect(issueTypeColumn.Component).toBe('IssueTypeCellComponent');
    });
  });

  describe('Property validation', () => {
    it('should have all required properties for each column', () => {
      columns.forEach((column) => {
        expect(column).toHaveProperty('title');
        expect(column).toHaveProperty('transforms');
        expect(column).toHaveProperty('exportKey');
        expect(column).toHaveProperty('Component');
      });
    });

    it('should have valid string titles', () => {
      columns.forEach((column) => {
        expect(typeof column.title).toBe('string');
        expect(column.title.length).toBeGreaterThan(0);
      });
    });

    it('should have valid transforms arrays', () => {
      columns.forEach((column) => {
        expect(Array.isArray(column.transforms)).toBe(true);
        expect(column.transforms).toContain(wrappable);
      });
    });

    it('should have valid export keys', () => {
      columns.forEach((column) => {
        expect(typeof column.exportKey).toBe('string');
        expect(column.exportKey.length).toBeGreaterThan(0);
      });
    });

    it('should have valid Components', () => {
      columns.forEach((column) => {
        expect(column.Component).toBeDefined();
        expect(typeof column.Component).toBe('string');
      });
    });
  });

  describe('Unique properties', () => {
    it('should have unique titles', () => {
      const titles = columns.map((column) => column.title);
      const uniqueTitles = [...new Set(titles)];
      expect(uniqueTitles).toHaveLength(titles.length);
    });

    it('should have unique export keys', () => {
      const exportKeys = columns.map((column) => column.exportKey);
      const uniqueExportKeys = [...new Set(exportKeys)];
      expect(uniqueExportKeys).toHaveLength(exportKeys.length);
    });

    it('should have unique Components', () => {
      const components = columns.map((column) => column.Component);
      const uniqueComponents = [...new Set(components)];
      expect(uniqueComponents).toHaveLength(components.length);
    });
  });

  describe('Component mapping', () => {
    it('should map Action column to ActionsCell', () => {
      const actionColumn = columns.find((col) => col.title === 'Action');
      expect(actionColumn.Component).toBe('ActionsCellComponent');
    });

    it('should map Reboot required column to RebootRequiredCell', () => {
      const rebootColumn = columns.find(
        (col) => col.title === 'Reboot required',
      );
      expect(rebootColumn.Component).toBe('RebootRequiredCellComponent');
    });

    it('should map Affected systems column to SystemsCell', () => {
      const systemsColumn = columns.find(
        (col) => col.title === 'Affected systems',
      );
      expect(systemsColumn.Component).toBe('SystemsCellComponent');
    });

    it('should map Issue type column to IssueTypeCell', () => {
      const issueTypeColumn = columns.find((col) => col.title === 'Issue type');
      expect(issueTypeColumn.Component).toBe('IssueTypeCellComponent');
    });
  });

  describe('Transform configuration', () => {
    it('should use wrappable transform for all columns', () => {
      columns.forEach((column) => {
        expect(column.transforms).toContain(wrappable);
      });
    });

    it('should have consistent transform structure', () => {
      columns.forEach((column) => {
        expect(column.transforms).toHaveLength(1);
        expect(column.transforms[0]).toBe('wrappableTransform');
      });
    });
  });

  describe('Export key mapping', () => {
    it('should have appropriate export keys for data extraction', () => {
      const expectedExportKeys = ['action', 'reboot', 'system_count', 'type'];
      const actualExportKeys = columns.map((col) => col.exportKey);

      expectedExportKeys.forEach((key) => {
        expect(actualExportKeys).toContain(key);
      });
    });

    it('should map export keys to logical data fields', () => {
      expect(columns[0].exportKey).toBe('action'); // Action column
      expect(columns[1].exportKey).toBe('reboot'); // Reboot required column
      expect(columns[2].exportKey).toBe('system_count'); // Affected systems column
      expect(columns[3].exportKey).toBe('type'); // Issue type column
    });
  });

  describe('Data structure integrity', () => {
    it('should maintain consistent column order', () => {
      const expectedOrder = [
        'Action',
        'Reboot required',
        'Affected systems',
        'Issue type',
      ];
      const actualOrder = columns.map((col) => col.title);

      expect(actualOrder).toEqual(expectedOrder);
    });

    it('should have stable structure for table rendering', () => {
      columns.forEach((column) => {
        // Essential properties for PatternFly table
        expect(Object.keys(column)).toContain('title');
        expect(Object.keys(column)).toContain('transforms');
        expect(Object.keys(column)).toContain('Component');
        expect(Object.keys(column)).toContain('exportKey');
      });
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

    it('should be suitable for table column configuration', () => {
      // Verify that each column can be used in PatternFly table
      expect(
        columns.every(
          (col) =>
            col.title && col.transforms && col.Component && col.exportKey,
        ),
      ).toBe(true);
    });
  });
});
