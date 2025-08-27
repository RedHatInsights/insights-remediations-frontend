/* eslint-disable react/prop-types */
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import RunSystemsTable from './RunSystemsTable';

// Mock external dependencies
jest.mock('bastilian-tabletools', () => ({
  useRawTableState: jest.fn(),
}));

// Mock useFeatureFlag
jest.mock('../../../Utilities/Hooks/useFeatureFlag', () => ({
  useFeatureFlag: jest.fn(),
}));

// Mock the Columns module - it exports a default hook function
jest.mock('./Columns', () => {
  const mockUseColumns = jest.fn(() => [
    {
      title: 'System name',
      key: 'system_name',
      Component: ({ item }) => <div>{item.system_name}</div>,
    },
    {
      title: 'Insights connection',
      key: 'connection',
      Component: ({ item }) => <div>{item.status}</div>,
    },
  ]);
  return {
    __esModule: true,
    default: mockUseColumns,
  };
});

jest.mock('../../../components/RemediationsTable/RemediationsTable', () => {
  const MockRemediationsTable = ({
    'aria-label': ariaLabel,
    ouiaId,
    variant,
    loading,
    items,
    total,
    columns,
    filters,
    options,
  }) => (
    <div data-testid="remediations-table">
      <div data-testid="aria-label">{ariaLabel}</div>
      <div data-testid="ouia-id">{ouiaId}</div>
      <div data-testid="variant">{variant}</div>
      <div data-testid="loading">{loading.toString()}</div>
      <div data-testid="items-count">{items.length}</div>
      <div data-testid="total">{total}</div>
      <div data-testid="columns-count">{columns.length}</div>
      <div data-testid="filters">{JSON.stringify(filters)}</div>
      <div data-testid="options">
        {JSON.stringify({
          ...options,
          EmptyState: options.EmptyState ? 'TableEmptyState' : undefined,
        })}
      </div>
    </div>
  );
  MockRemediationsTable.displayName = 'MockRemediationsTable';
  return MockRemediationsTable;
});

jest.mock('./Filter', () => ({
  systemFilter: [{ type: 'system', label: 'System Name' }],
}));

jest.mock('../../OverViewPage/TableEmptyState', () => {
  const MockTableEmptyState = () => (
    <div data-testid="table-empty-state">No systems found</div>
  );
  MockTableEmptyState.displayName = 'MockTableEmptyState';
  return MockTableEmptyState;
});

const { useFeatureFlag } = require('../../../Utilities/Hooks/useFeatureFlag');

describe('RunSystemsTable', () => {
  const mockUseRawTableState = require('bastilian-tabletools').useRawTableState;

  beforeEach(() => {
    // Default to feature flag disabled
    useFeatureFlag.mockReturnValue(false);
    jest.clearAllMocks();
  });

  const mockRun = {
    id: 'run-123',
    systems: [
      { system_id: 'sys1', system_name: 'Server-1', status: 'success' },
      { system_id: 'sys2', system_name: 'Server-2', status: 'failure' },
      { system_id: 'sys3', system_name: 'Database-1', status: 'running' },
    ],
  };

  const mockViewLogColumn = {
    title: 'View Log',
    key: 'view_log',
    renderFunc: jest.fn(),
  };

  beforeEach(() => {
    mockUseRawTableState.mockReturnValue({
      filters: {},
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic rendering', () => {
    it('should render RemediationsTable with correct props', () => {
      render(
        <RunSystemsTable
          run={mockRun}
          loading={false}
          viewLogColumn={mockViewLogColumn}
        />,
      );

      expect(screen.getByTestId('remediations-table')).toBeInTheDocument();
      expect(screen.getByTestId('aria-label')).toHaveTextContent(
        'ExecutionHistoryTable',
      );
      expect(screen.getByTestId('ouia-id')).toHaveTextContent(
        'ExecutionHistory-run-123',
      );
      expect(screen.getByTestId('variant')).toHaveTextContent('compact');
    });

    it('should pass loading state correctly', () => {
      render(
        <RunSystemsTable
          run={mockRun}
          loading={true}
          viewLogColumn={mockViewLogColumn}
        />,
      );

      expect(screen.getByTestId('loading')).toHaveTextContent('true');
    });

    it('should pass loading false correctly', () => {
      render(
        <RunSystemsTable
          run={mockRun}
          loading={false}
          viewLogColumn={mockViewLogColumn}
        />,
      );

      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });
  });

  describe('Data handling', () => {
    it('should display all systems when no filter is applied', () => {
      render(
        <RunSystemsTable
          run={mockRun}
          loading={false}
          viewLogColumn={mockViewLogColumn}
        />,
      );

      expect(screen.getByTestId('items-count')).toHaveTextContent('3');
      expect(screen.getByTestId('total')).toHaveTextContent('3');
    });

    it('should include viewLogColumn in columns', () => {
      render(
        <RunSystemsTable
          run={mockRun}
          loading={false}
          viewLogColumn={mockViewLogColumn}
        />,
      );

      // Base columns (2) + viewLogColumn (1) = 3
      expect(screen.getByTestId('columns-count')).toHaveTextContent('3');
    });

    it('should pass correct options to RemediationsTable', () => {
      render(
        <RunSystemsTable
          run={mockRun}
          loading={false}
          viewLogColumn={mockViewLogColumn}
        />,
      );

      const optionsText = screen.getByTestId('options').textContent;
      const options = JSON.parse(optionsText);

      expect(options.itemIdsOnPage).toEqual(['sys1', 'sys2', 'sys3']);
      expect(options.total).toBe(3);
      expect(options.EmptyState).toBe('TableEmptyState');
    });

    it('should handle empty systems array', () => {
      const emptyRun = { ...mockRun, systems: [] };

      render(
        <RunSystemsTable
          run={emptyRun}
          loading={false}
          viewLogColumn={mockViewLogColumn}
        />,
      );

      expect(screen.getByTestId('items-count')).toHaveTextContent('0');
      expect(screen.getByTestId('total')).toHaveTextContent('0');
    });
  });

  describe('Filtering functionality', () => {
    it('should filter systems by name when filter is applied', () => {
      mockUseRawTableState.mockReturnValue({
        filters: {
          system: ['Server'],
        },
      });

      render(
        <RunSystemsTable
          run={mockRun}
          loading={false}
          viewLogColumn={mockViewLogColumn}
        />,
      );

      // Should show only systems with 'Server' in name (Server-1, Server-2)
      expect(screen.getByTestId('items-count')).toHaveTextContent('2');
      expect(screen.getByTestId('total')).toHaveTextContent('2');
    });

    it('should handle case-insensitive filtering', () => {
      mockUseRawTableState.mockReturnValue({
        filters: {
          system: ['server'],
        },
      });

      render(
        <RunSystemsTable
          run={mockRun}
          loading={false}
          viewLogColumn={mockViewLogColumn}
        />,
      );

      // Should still match 'Server-1' and 'Server-2'
      expect(screen.getByTestId('items-count')).toHaveTextContent('2');
      expect(screen.getByTestId('total')).toHaveTextContent('2');
    });

    it('should filter by partial matches', () => {
      mockUseRawTableState.mockReturnValue({
        filters: {
          system: ['base'],
        },
      });

      render(
        <RunSystemsTable
          run={mockRun}
          loading={false}
          viewLogColumn={mockViewLogColumn}
        />,
      );

      // Should match 'Database-1'
      expect(screen.getByTestId('items-count')).toHaveTextContent('1');
      expect(screen.getByTestId('total')).toHaveTextContent('1');
    });

    it('should return no results for non-matching filter', () => {
      mockUseRawTableState.mockReturnValue({
        filters: {
          system: ['NonExistent'],
        },
      });

      render(
        <RunSystemsTable
          run={mockRun}
          loading={false}
          viewLogColumn={mockViewLogColumn}
        />,
      );

      expect(screen.getByTestId('items-count')).toHaveTextContent('0');
      expect(screen.getByTestId('total')).toHaveTextContent('0');
    });

    it('should handle empty filter string', () => {
      mockUseRawTableState.mockReturnValue({
        filters: {
          system: [''],
        },
      });

      render(
        <RunSystemsTable
          run={mockRun}
          loading={false}
          viewLogColumn={mockViewLogColumn}
        />,
      );

      // Empty filter should show all systems
      expect(screen.getByTestId('items-count')).toHaveTextContent('3');
      expect(screen.getByTestId('total')).toHaveTextContent('3');
    });

    it('should handle filter with multiple entries (uses first)', () => {
      mockUseRawTableState.mockReturnValue({
        filters: {
          system: ['Server', 'Database'],
        },
      });

      render(
        <RunSystemsTable
          run={mockRun}
          loading={false}
          viewLogColumn={mockViewLogColumn}
        />,
      );

      // Should use first filter 'Server'
      expect(screen.getByTestId('items-count')).toHaveTextContent('2');
      expect(screen.getByTestId('total')).toHaveTextContent('2');
    });
  });

  describe('Edge cases and null handling', () => {
    it('should handle null tableState', () => {
      mockUseRawTableState.mockReturnValue(null);

      render(
        <RunSystemsTable
          run={mockRun}
          loading={false}
          viewLogColumn={mockViewLogColumn}
        />,
      );

      // Should show all systems when tableState is null
      expect(screen.getByTestId('items-count')).toHaveTextContent('3');
      expect(screen.getByTestId('total')).toHaveTextContent('3');
    });

    it('should handle undefined tableState', () => {
      mockUseRawTableState.mockReturnValue(undefined);

      render(
        <RunSystemsTable
          run={mockRun}
          loading={false}
          viewLogColumn={mockViewLogColumn}
        />,
      );

      // Should show all systems when tableState is undefined
      expect(screen.getByTestId('items-count')).toHaveTextContent('3');
      expect(screen.getByTestId('total')).toHaveTextContent('3');
    });

    it('should handle tableState without filters', () => {
      mockUseRawTableState.mockReturnValue({});

      render(
        <RunSystemsTable
          run={mockRun}
          loading={false}
          viewLogColumn={mockViewLogColumn}
        />,
      );

      expect(screen.getByTestId('items-count')).toHaveTextContent('3');
      expect(screen.getByTestId('total')).toHaveTextContent('3');
    });

    it('should handle tableState with filters but no system filter', () => {
      mockUseRawTableState.mockReturnValue({
        filters: {
          other: ['someValue'],
        },
      });

      render(
        <RunSystemsTable
          run={mockRun}
          loading={false}
          viewLogColumn={mockViewLogColumn}
        />,
      );

      expect(screen.getByTestId('items-count')).toHaveTextContent('3');
      expect(screen.getByTestId('total')).toHaveTextContent('3');
    });

    it('should handle system filter as empty array', () => {
      mockUseRawTableState.mockReturnValue({
        filters: {
          system: [],
        },
      });

      render(
        <RunSystemsTable
          run={mockRun}
          loading={false}
          viewLogColumn={mockViewLogColumn}
        />,
      );

      expect(screen.getByTestId('items-count')).toHaveTextContent('3');
      expect(screen.getByTestId('total')).toHaveTextContent('3');
    });
  });

  describe('Props validation and component integration', () => {
    it('should pass filters configuration correctly', () => {
      render(
        <RunSystemsTable
          run={mockRun}
          loading={false}
          viewLogColumn={mockViewLogColumn}
        />,
      );

      const filtersText = screen.getByTestId('filters').textContent;
      const filters = JSON.parse(filtersText);

      expect(filters.filterConfig).toBeDefined();
      expect(filters.filterConfig).toHaveLength(1);
      expect(filters.filterConfig[0]).toEqual({
        type: 'system',
        label: 'System Name',
      });
    });

    it('should generate correct ouiaId from run id', () => {
      const customRun = { ...mockRun, id: 'custom-run-456' };

      render(
        <RunSystemsTable
          run={customRun}
          loading={false}
          viewLogColumn={mockViewLogColumn}
        />,
      );

      expect(screen.getByTestId('ouia-id')).toHaveTextContent(
        'ExecutionHistory-custom-run-456',
      );
    });

    it('should map system_id correctly for itemIdsOnPage', () => {
      const customRun = {
        id: 'test',
        systems: [
          { system_id: 'custom1', system_name: 'System 1', status: 'success' },
          { system_id: 'custom2', system_name: 'System 2', status: 'failure' },
        ],
      };

      render(
        <RunSystemsTable
          run={customRun}
          loading={false}
          viewLogColumn={mockViewLogColumn}
        />,
      );

      const optionsText = screen.getByTestId('options').textContent;
      const options = JSON.parse(optionsText);

      expect(options.itemIdsOnPage).toEqual(['custom1', 'custom2']);
    });
  });

  describe('System data structure variations', () => {
    it('should handle systems with different properties', () => {
      const runWithVariedSystems = {
        id: 'varied-run',
        systems: [
          { system_id: '1', system_name: 'Normal System', status: 'success' },
          {
            system_id: '2',
            system_name: 'System with Extra Props',
            status: 'failure',
            extra: 'data',
          },
        ],
      };

      render(
        <RunSystemsTable
          run={runWithVariedSystems}
          loading={false}
          viewLogColumn={mockViewLogColumn}
        />,
      );

      expect(screen.getByTestId('items-count')).toHaveTextContent('2');
      expect(screen.getByTestId('total')).toHaveTextContent('2');
    });

    it('should handle systems with special characters in names', () => {
      const runWithSpecialNames = {
        id: 'special-run',
        systems: [
          {
            system_id: '1',
            system_name: 'System-With-Dashes',
            status: 'success',
          },
          {
            system_id: '2',
            system_name: 'System_With_Underscores',
            status: 'success',
          },
          {
            system_id: '3',
            system_name: 'System With Spaces',
            status: 'success',
          },
        ],
      };

      mockUseRawTableState.mockReturnValue({
        filters: {
          system: ['with'],
        },
      });

      render(
        <RunSystemsTable
          run={runWithSpecialNames}
          loading={false}
          viewLogColumn={mockViewLogColumn}
        />,
      );

      // Should match all three systems (case-insensitive 'with')
      expect(screen.getByTestId('items-count')).toHaveTextContent('3');
      expect(screen.getByTestId('total')).toHaveTextContent('3');
    });
  });
});
