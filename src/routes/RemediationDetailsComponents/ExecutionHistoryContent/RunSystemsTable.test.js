/* eslint-disable react/prop-types */
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import RunSystemsTable from './RunSystemsTable';

jest.mock('./Columns', () => {
  const mockUseColumns = jest.fn(() => [
    {
      title: 'System name',
      key: 'system_name',
      Component: ({ item }) => <div>{item.system_name}</div>,
    },
    {
      title: 'Red Hat Lightspeed connection',
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

describe('RunSystemsTable', () => {
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
    jest.clearAllMocks();
  });

  describe('Basic rendering', () => {
    it('should render RemediationsTable with correct props', () => {
      render(
        <RunSystemsTable
          run={mockRun}
          loading={false}
          total={3}
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
          total={3}
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
          total={3}
          viewLogColumn={mockViewLogColumn}
        />,
      );

      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });
  });

  describe('Data handling', () => {
    it('should display systems and total from props (server-driven)', () => {
      render(
        <RunSystemsTable
          run={mockRun}
          loading={false}
          total={56}
          viewLogColumn={mockViewLogColumn}
        />,
      );

      expect(screen.getByTestId('items-count')).toHaveTextContent('3');
      expect(screen.getByTestId('total')).toHaveTextContent('56');
    });

    it('should include viewLogColumn in columns', () => {
      render(
        <RunSystemsTable
          run={mockRun}
          loading={false}
          total={3}
          viewLogColumn={mockViewLogColumn}
        />,
      );

      expect(screen.getByTestId('columns-count')).toHaveTextContent('3');
    });

    it('should pass correct options to RemediationsTable', () => {
      render(
        <RunSystemsTable
          run={mockRun}
          loading={false}
          total={100}
          viewLogColumn={mockViewLogColumn}
        />,
      );

      const optionsText = screen.getByTestId('options').textContent;
      const options = JSON.parse(optionsText);

      expect(options.itemIdsOnPage).toEqual(['sys1', 'sys2', 'sys3']);
      expect(options.total).toBe(100);
      expect(options.EmptyState).toBe('TableEmptyState');
    });

    it('should handle empty systems array', () => {
      const emptyRun = { ...mockRun, systems: [] };

      render(
        <RunSystemsTable
          run={emptyRun}
          loading={false}
          total={0}
          viewLogColumn={mockViewLogColumn}
        />,
      );

      expect(screen.getByTestId('items-count')).toHaveTextContent('0');
      expect(screen.getByTestId('total')).toHaveTextContent('0');
    });

    it('should treat missing run.systems as empty list', () => {
      render(
        <RunSystemsTable
          run={{ id: 'run-1' }}
          loading={false}
          total={0}
          viewLogColumn={mockViewLogColumn}
        />,
      );

      expect(screen.getByTestId('items-count')).toHaveTextContent('0');
    });
  });

  describe('Props validation and component integration', () => {
    it('should pass filters configuration correctly', () => {
      render(
        <RunSystemsTable
          run={mockRun}
          loading={false}
          total={3}
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
          total={3}
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
          total={2}
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
          total={42}
          viewLogColumn={mockViewLogColumn}
        />,
      );

      expect(screen.getByTestId('items-count')).toHaveTextContent('2');
      expect(screen.getByTestId('total')).toHaveTextContent('42');
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

      render(
        <RunSystemsTable
          run={runWithSpecialNames}
          loading={false}
          total={3}
          viewLogColumn={mockViewLogColumn}
        />,
      );

      expect(screen.getByTestId('items-count')).toHaveTextContent('3');
      expect(screen.getByTestId('total')).toHaveTextContent('3');
    });
  });
});
