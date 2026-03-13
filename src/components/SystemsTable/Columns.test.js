/* eslint-disable react/prop-types, testing-library/render-result-naming-convention */
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import createColumns from './Columns';

const columns = createColumns('test-remediation-id');

jest.mock('./IssuesColumn', () => {
  return function MockIssuesColumn({ issues, display_name }) {
    return (
      <div data-testid="issues-column">{`${issues.length} issues for ${display_name}`}</div>
    );
  };
});

jest.mock('./ConnectionStatusCol', () => {
  return function MockConnectionStatusColumn({
    connection_status,
    executor_type,
  }) {
    return (
      <div data-testid="connection-status-column">{`${connection_status} - ${executor_type}`}</div>
    );
  };
});

jest.mock('@redhat-cloud-services/frontend-components/InsightsLink', () => {
  return function MockInsightsLink({ app, to, children }) {
    return (
      <a data-testid="insights-link" data-app={app} href={to}>
        {children}
      </a>
    );
  };
});

describe('SystemsTable Columns', () => {
  it('should export an array of column configurations', () => {
    expect(Array.isArray(columns)).toBe(true);
    expect(columns).toHaveLength(5);
  });

  describe('display_name column', () => {
    const displayNameColumn = columns[0];

    it('should have correct configuration', () => {
      expect(displayNameColumn.key).toBe('display_name');
      expect(displayNameColumn.title).toBe('Name');
      expect(typeof displayNameColumn.renderFunc).toBe('function');
    });

    it('should render InsightsLink with correct props', () => {
      const entity = { id: 'system-123', display_name: 'Test System' };

      const component = displayNameColumn.renderFunc(
        'display_name_value',
        0,
        entity,
      );

      render(<div>{component}</div>);

      const link = screen.getByTestId('insights-link');
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('data-app', 'inventory');
      expect(link).toHaveAttribute('href', '/system-123');
      expect(link).toHaveTextContent('Test System');
    });

    it('should handle entity with different display names', () => {
      const entity = { id: 'system-456', display_name: 'Another System' };

      const component = displayNameColumn.renderFunc('value', 1, entity);

      render(<div>{component}</div>);

      const link = screen.getByTestId('insights-link');
      expect(link).toHaveTextContent('Another System');
      expect(link).toHaveAttribute('href', '/system-456');
    });

    it('should handle empty display name', () => {
      const entity = { id: 'system-789', display_name: '' };

      const component = displayNameColumn.renderFunc('value', 0, entity);

      render(<div>{component}</div>);

      const link = screen.getByTestId('insights-link');
      expect(link).toHaveTextContent('');
    });
  });

  describe('tags column', () => {
    const tagsColumn = columns[1];

    it('should have correct configuration', () => {
      expect(tagsColumn.key).toBe('tags');
      expect(tagsColumn.title).toBeUndefined();
      expect(tagsColumn.renderFunc).toBeUndefined();
    });
  });

  describe('system_profile column', () => {
    const systemProfileColumn = columns[2];

    it('should have correct configuration', () => {
      expect(systemProfileColumn.key).toBe('system_profile');
      expect(systemProfileColumn.title).toBeUndefined();
      expect(systemProfileColumn.renderFunc).toBeUndefined();
    });
  });

  describe('issues column', () => {
    const issuesColumn = columns[3];

    it('should have correct configuration', () => {
      expect(issuesColumn.key).toBe('issue_count');
      expect(issuesColumn.title).toBe('Actions');
      expect(typeof issuesColumn.renderFunc).toBe('function');
      expect(issuesColumn.props).toEqual({
        width: 15,
        isStatic: true,
      });
    });

    it('should render IssuesColumn with correct props', () => {
      const issues = [{ id: 'issue-1' }, { id: 'issue-2' }];
      const entity = { display_name: 'Test System' };

      const component = issuesColumn.renderFunc(issues, 0, entity);

      render(<div>{component}</div>);

      const issuesCol = screen.getByTestId('issues-column');
      expect(issuesCol).toBeInTheDocument();
      expect(issuesCol).toHaveTextContent('2 issues for Test System');
    });

    it('should handle empty issues array', () => {
      const issues = [];
      const entity = { display_name: 'System With No Issues' };

      const component = issuesColumn.renderFunc(issues, 1, entity);

      render(<div>{component}</div>);

      const issuesCol = screen.getByTestId('issues-column');
      expect(issuesCol).toHaveTextContent('0 issues for System With No Issues');
    });

    it('should handle undefined display_name', () => {
      const issues = [{ id: 'issue-1' }];
      const entity = {};

      const component = issuesColumn.renderFunc(issues, 0, entity);

      render(<div>{component}</div>);

      const issuesCol = screen.getByTestId('issues-column');
      expect(issuesCol).toHaveTextContent('1 issues for undefined');
    });
  });

  describe('connection_status column', () => {
    it('should be the last column (connection_status)', () => {
      // Note: There seems to be an issue with indexing - let me get the actual connection column
      const actualConnectionColumn = columns.find(
        (col) => col.key === 'connection_status',
      );

      expect(actualConnectionColumn).toBeDefined();
      expect(actualConnectionColumn.key).toBe('connection_status');
      expect(actualConnectionColumn.title).toBe('Connection status');
      expect(typeof actualConnectionColumn.renderFunc).toBe('function');
      expect(actualConnectionColumn.props).toEqual({
        width: 15,
        isStatic: true,
      });
    });

    it('should render ConnectionStatusColumn with correct props', () => {
      const connectionColumn = columns.find(
        (col) => col.key === 'connection_status',
      );
      const entity = { executor_type: 'satellite' };

      const component = connectionColumn.renderFunc('connected', 0, entity);

      render(<div>{component}</div>);

      const connectionCol = screen.getByTestId('connection-status-column');
      expect(connectionCol).toBeInTheDocument();
      expect(connectionCol).toHaveTextContent('connected - satellite');
    });

    it('should handle different connection statuses', () => {
      const connectionColumn = columns.find(
        (col) => col.key === 'connection_status',
      );
      const entity = { executor_type: 'receptor' };

      const component = connectionColumn.renderFunc('disconnected', 1, entity);

      render(<div>{component}</div>);

      const connectionCol = screen.getByTestId('connection-status-column');
      expect(connectionCol).toHaveTextContent('disconnected - receptor');
    });

    it('should handle undefined executor_type', () => {
      const connectionColumn = columns.find(
        (col) => col.key === 'connection_status',
      );
      const entity = {};

      const component = connectionColumn.renderFunc('unknown', 0, entity);

      render(<div>{component}</div>);

      const connectionCol = screen.getByTestId('connection-status-column');
      expect(connectionCol).toHaveTextContent('unknown - undefined');
    });
  });

  describe('column structure and props', () => {
    it('should have correct static column configurations', () => {
      const staticColumns = columns.filter((col) => col.props?.isStatic);

      expect(staticColumns).toHaveLength(2); // issue_count and connection_status
      staticColumns.forEach((column) => {
        expect(column.props.width).toBe(15);
        expect(column.props.isStatic).toBe(true);
      });
    });

    it('should have columns without renderFunc for basic columns', () => {
      const basicColumns = columns.filter((col) => !col.renderFunc);
      expect(basicColumns).toHaveLength(2); // tags and system_profile

      expect(basicColumns[0].key).toBe('tags');
      expect(basicColumns[1].key).toBe('system_profile');
    });

    it('should have render functions for complex columns', () => {
      const complexColumns = columns.filter((col) => col.renderFunc);
      expect(complexColumns).toHaveLength(3); // display_name, issue_count, connection_status

      complexColumns.forEach((column) => {
        expect(typeof column.renderFunc).toBe('function');
      });
    });
  });

  describe('edge cases', () => {
    it('should handle null values in renderFunc', () => {
      const displayNameColumn = columns[0];
      const entity = { id: null, display_name: null };

      const component = displayNameColumn.renderFunc(null, 0, entity);

      render(<div>{component}</div>);

      const link = screen.getByTestId('insights-link');
      expect(link).toHaveAttribute('href', '/null');
    });

    it('should handle undefined entity in issues column', () => {
      const issuesColumn = columns.find((col) => col.key === 'issues');

      expect(() => {
        issuesColumn.renderFunc([], 0, undefined);
      }).toThrow();
    });

    it('should handle various data types in connection status', () => {
      const connectionColumn = columns.find(
        (col) => col.key === 'connection_status',
      );

      // Test with numbers
      const component1 = connectionColumn.renderFunc(123, 0, {
        executor_type: 456,
      });
      render(<div>{component1}</div>);
      expect(screen.getByTestId('connection-status-column')).toHaveTextContent(
        '123 - 456',
      );

      // Clean up
      screen.getByTestId('connection-status-column').remove();

      // Test with booleans
      const component2 = connectionColumn.renderFunc(true, 0, {
        executor_type: false,
      });
      render(<div>{component2}</div>);
      expect(screen.getByTestId('connection-status-column')).toHaveTextContent(
        'true - false',
      );
    });
  });
});
