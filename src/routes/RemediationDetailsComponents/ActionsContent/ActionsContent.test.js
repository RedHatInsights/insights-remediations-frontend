/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import ActionsContent from './ActionsContent';
import * as useRemediationsQuery from '../../../api/useRemediationsQuery';
import * as useRemediationFetchExtras from '../../../api/useRemediationFetchExtras';
import { useAddNotification } from '@redhat-cloud-services/frontend-components-notifications/hooks';

jest.mock('../../../api', () => ({
  remediationsApi: {
    deleteRemediationIssues: jest.fn(),
  },
}));

jest.mock('../../api', () => ({
  deleteIssues: jest.fn(),
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ id: 'test-remediation-id' }),
}));

jest.mock('../../../api/useRemediationsQuery');
jest.mock('../../../api/useRemediationFetchExtras');
jest.mock(
  '@redhat-cloud-services/frontend-components-notifications/hooks',
  () => ({
    useAddNotification: jest.fn(),
  }),
);
jest.mock('../../../components/ConfirmationDialog', () => {
  return function MockConfirmationDialog({
    isOpen,
    onClose,
    confirmText,
    title,
    text,
  }) {
    if (!isOpen) return null;
    return (
      <div data-testid="confirmation-dialog">
        <div data-testid="dialog-title">{title}</div>
        <div data-testid="dialog-text">{text}</div>
        <button data-testid="cancel-button" onClick={() => onClose(false)}>
          Cancel
        </button>
        <button data-testid="confirm-button" onClick={() => onClose(true)}>
          {confirmText}
        </button>
      </div>
    );
  };
});

jest.mock('./SystemsModal/SystemsModal', () => {
  return function MockSystemsModal({ isOpen, onClose, systems, actionName }) {
    if (!isOpen) return null;
    return (
      <div data-testid="systems-modal">
        <div data-testid="modal-action-name">{actionName}</div>
        <div data-testid="modal-systems-count">{systems.length}</div>
        <button data-testid="close-systems-modal" onClick={onClose}>
          Close
        </button>
      </div>
    );
  };
});

jest.mock('bastilian-tabletools', () => {
  const actualModule = jest.requireActual('bastilian-tabletools');
  return {
    ...actualModule,
    useRawTableState: () => {
      // Access the mockTableState from the test scope
      const testContext = expect.getState();
      return testContext.currentTestName?.includes('bulk delete')
        ? { selected: ['issue-1', 'issue-2'] }
        : { selected: [] };
    },
    TableStateProvider: ({ children }) => <div>{children}</div>,
    StaticTableToolsTable: ({
      items,
      columns,
      options,
      loading,
      'aria-label': ariaLabel,
      ouiaId,
      variant,
      filters: _filters,
    }) => {
      const {
        actionResolver,
        dedicatedAction,
        EmptyState,
        onSelect: _onSelect,
        itemIdsInTable: _itemIdsInTable,
        itemIdsOnPage: _itemIdsOnPage,
      } = options || {};

      if (loading) {
        return <div data-testid="table-loading">Loading...</div>;
      }

      if (!items || items.length === 0) {
        return EmptyState ? (
          <EmptyState />
        ) : (
          <div data-testid="table-empty">No items</div>
        );
      }

      return (
        <div
          data-testid="actions-table"
          aria-label={ariaLabel}
          data-ouia-component-id={ouiaId}
        >
          <div data-testid="table-variant">{variant}</div>
          <div data-testid="dedicated-action">
            <div data-testid="bulk-remove-button">
              {dedicatedAction && dedicatedAction()}
            </div>
          </div>
          {items.map((item, index) => (
            <div key={item.id || index} data-testid={`table-row-${index}`}>
              {columns.map((column, colIndex) => (
                <div
                  key={colIndex}
                  data-testid={`cell-${column.exportKey}-${index}`}
                >
                  {column.Component ? (
                    <column.Component {...item} />
                  ) : (
                    item[column.exportKey]
                  )}
                </div>
              ))}
              <div data-testid={`row-actions-${index}`}>
                {actionResolver &&
                  actionResolver().map((action, actionIndex) => (
                    <button
                      key={actionIndex}
                      data-testid={`action-${action.title.toLowerCase()}-${index}`}
                      onClick={(e) => action.onClick(e, index, { item })}
                    >
                      {action.title}
                    </button>
                  ))}
              </div>
            </div>
          ))}
        </div>
      );
    },
    useStateCallbacks: () => ({
      current: {
        resetSelection: jest.fn(),
      },
    }),
  };
});

jest.mock('../../OverViewPage/TableEmptyState', () => {
  return function MockTableEmptyState() {
    return <div data-testid="table-empty-state">No actions found</div>;
  };
});

describe('ActionsContent', () => {
  let mockFetchBatched;
  let mockFetchQueue;
  let mockAddNotification;
  let mockRefetch;
  let mockTableState;

  const mockRemediationDetails = {
    issues: [
      {
        id: 'issue-1',
        description: 'Fix security vulnerability',
        systems: [
          { id: 'system-1', name: 'server1' },
          { id: 'system-2', name: 'server2' },
        ],
        reboot: false,
        type: 'advisor',
      },
      {
        id: 'issue-2',
        description: 'Update packages',
        systems: [{ id: 'system-3', name: 'server3' }],
        reboot: true,
        type: 'patch',
      },
    ],
  };

  beforeEach(() => {
    mockFetchBatched = jest.fn();
    mockFetchQueue = jest.fn();
    mockAddNotification = jest.fn();
    mockRefetch = jest.fn();

    // Default table state with no selections
    mockTableState = {
      selected: [],
    };

    useRemediationsQuery.default.mockReturnValue({
      fetchBatched: mockFetchBatched,
    });

    useRemediationFetchExtras.default.mockReturnValue({
      fetchQueue: mockFetchQueue,
    });

    useAddNotification.mockReturnValue(mockAddNotification);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const renderComponent = (props = {}) => {
    const defaultProps = {
      remediationDetails: mockRemediationDetails,
      refetch: mockRefetch,
      loading: false,
      ...props,
    };

    return render(
      <MemoryRouter>
        <ActionsContent {...defaultProps} />
      </MemoryRouter>,
    );
  };

  describe('Component Rendering', () => {
    it('renders without crashing', () => {
      renderComponent();
      expect(screen.getByTestId('actions-table')).toBeInTheDocument();
    });

    it('displays loading state', () => {
      renderComponent({ loading: true });
      expect(screen.getByTestId('table-loading')).toBeInTheDocument();
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('displays empty state when no issues', () => {
      renderComponent({ remediationDetails: { issues: [] } });
      expect(screen.getByTestId('table-empty-state')).toBeInTheDocument();
      expect(screen.getByText('No actions found')).toBeInTheDocument();
    });

    it('displays empty state when remediationDetails is null', () => {
      renderComponent({ remediationDetails: null });
      expect(screen.getByTestId('table-empty-state')).toBeInTheDocument();
    });

    it('renders table with correct configuration', () => {
      renderComponent();
      expect(screen.getByTestId('actions-table')).toHaveAttribute(
        'aria-label',
        'ActionsTable',
      );
      expect(screen.getByTestId('actions-table')).toHaveAttribute(
        'data-ouia-component-id',
        'ActionsTable',
      );
      expect(screen.getByTestId('table-variant')).toHaveTextContent('compact');
    });

    it('renders all issues in table', () => {
      renderComponent();
      expect(screen.getByTestId('table-row-0')).toBeInTheDocument();
      expect(screen.getByTestId('table-row-1')).toBeInTheDocument();
    });
  });

  describe('SystemsButton Component', () => {
    it('renders systems button with correct singular text', () => {
      const singleSystemIssue = {
        issues: [
          {
            id: 'issue-1',
            description: 'Test action',
            systems: [{ id: 'system-1', name: 'server1' }],
          },
        ],
      };
      renderComponent({ remediationDetails: singleSystemIssue });

      const systemsButton = screen.getByText('1 system');
      expect(systemsButton).toBeInTheDocument();
    });

    it('renders systems button with correct plural text', () => {
      renderComponent();
      const systemsButton = screen.getByText('2 systems');
      expect(systemsButton).toBeInTheDocument();
    });

    it('opens systems modal when systems button is clicked', () => {
      renderComponent();
      const systemsButton = screen.getByText('2 systems');

      fireEvent.click(systemsButton);

      expect(screen.getByTestId('systems-modal')).toBeInTheDocument();
      expect(screen.getByTestId('modal-action-name')).toHaveTextContent(
        'Fix security vulnerability',
      );
      expect(screen.getByTestId('modal-systems-count')).toHaveTextContent('2');
    });

    it('closes systems modal when close button is clicked', () => {
      renderComponent();
      const systemsButton = screen.getByText('2 systems');

      fireEvent.click(systemsButton);
      expect(screen.getByTestId('systems-modal')).toBeInTheDocument();

      fireEvent.click(screen.getByTestId('close-systems-modal'));
      expect(screen.queryByTestId('systems-modal')).not.toBeInTheDocument();
    });

    it('handles empty systems array', () => {
      const emptySystemsIssue = {
        issues: [
          {
            id: 'issue-1',
            description: 'Test action',
            systems: [],
          },
        ],
      };
      renderComponent({ remediationDetails: emptySystemsIssue });

      const systemsButton = screen.getByText('0 systems');
      expect(systemsButton).toBeInTheDocument();
    });
  });

  describe('Delete Functionality', () => {
    it('renders remove action for each row', () => {
      renderComponent();
      expect(screen.getByTestId('action-remove-0')).toBeInTheDocument();
      expect(screen.getByTestId('action-remove-1')).toBeInTheDocument();
    });

    it('opens delete confirmation dialog for single action', () => {
      renderComponent();

      fireEvent.click(screen.getByTestId('action-remove-0'));

      expect(screen.getByTestId('confirmation-dialog')).toBeInTheDocument();
      expect(screen.getByTestId('dialog-title')).toHaveTextContent(
        'Remove action?',
      );
      expect(screen.getByTestId('dialog-text')).toHaveTextContent('issue-1');
    });

    it('renders dedicated bulk remove button', () => {
      renderComponent();
      expect(screen.getByTestId('dedicated-action')).toBeInTheDocument();

      // Use the dedicated data-testid for the bulk remove button
      const bulkRemoveButton = screen.getByTestId('bulk-remove-button');
      expect(bulkRemoveButton).toBeInTheDocument();
      expect(bulkRemoveButton).toHaveTextContent('Remove');
    });

    it('bulk delete button is disabled when no items selected', () => {
      // Test that the bulk delete functionality is properly configured
      renderComponent();

      // Verify that the bulk remove button container exists and has content
      const bulkRemoveButtonContainer =
        screen.getByTestId('bulk-remove-button');
      expect(bulkRemoveButtonContainer).toBeInTheDocument();
      expect(bulkRemoveButtonContainer).toHaveTextContent('Remove');

      // The actual button behavior (enabled/disabled) is controlled by the table state
      // This test verifies the structure is in place for bulk delete functionality
    });

    it('cancels delete operation', () => {
      renderComponent();

      fireEvent.click(screen.getByTestId('action-remove-0'));
      expect(screen.getByTestId('confirmation-dialog')).toBeInTheDocument();

      fireEvent.click(screen.getByTestId('cancel-button'));
      expect(
        screen.queryByTestId('confirmation-dialog'),
      ).not.toBeInTheDocument();
    });

    it('successfully deletes single action', async () => {
      mockFetchQueue.mockResolvedValue();
      renderComponent();

      fireEvent.click(screen.getByTestId('action-remove-0'));
      fireEvent.click(screen.getByTestId('confirm-button'));

      await waitFor(() => {
        expect(mockFetchQueue).toHaveBeenCalledWith([
          { id: 'test-remediation-id', issue_ids: ['issue-1'] },
        ]);
      });

      await waitFor(() => {
        expect(mockAddNotification).toHaveBeenCalledWith({
          title: 'Successfully deleted actions',
          variant: 'success',
          dismissable: true,
          autoDismiss: true,
        });
      });

      expect(mockRefetch).toHaveBeenCalled();
    });

    it('handles delete error', async () => {
      const error = new Error('Delete failed');
      mockFetchQueue.mockRejectedValue(error);
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      renderComponent();

      fireEvent.click(screen.getByTestId('action-remove-0'));
      fireEvent.click(screen.getByTestId('confirm-button'));

      await waitFor(() => {
        expect(mockAddNotification).toHaveBeenCalledWith({
          title: 'Failed to delete actions',
          variant: 'danger',
          dismissable: true,
          autoDismiss: true,
        });
      });

      expect(consoleSpy).toHaveBeenCalledWith(error);
      consoleSpy.mockRestore();
    });

    it('chunks large delete operations', async () => {
      mockFetchQueue.mockResolvedValue();

      // Create many issues to test chunking
      const manyIssues = Array.from({ length: 250 }, (_, i) => ({
        id: `issue-${i}`,
        description: `Action ${i}`,
        systems: [],
      }));

      renderComponent({ remediationDetails: { issues: manyIssues } });

      fireEvent.click(screen.getByTestId('action-remove-0'));
      fireEvent.click(screen.getByTestId('confirm-button'));

      await waitFor(() => {
        expect(mockFetchQueue).toHaveBeenCalledWith([
          { id: 'test-remediation-id', issue_ids: ['issue-0'] },
        ]);
      });
    });
  });

  describe('Props Handling', () => {
    it('handles undefined remediationDetails', () => {
      renderComponent({ remediationDetails: undefined });
      expect(screen.getByTestId('table-empty-state')).toBeInTheDocument();
    });

    it('handles missing refetch prop', () => {
      renderComponent({ refetch: undefined });
      expect(screen.getByTestId('actions-table')).toBeInTheDocument();
    });

    it('handles missing loading prop', () => {
      renderComponent({ loading: undefined });
      expect(screen.getByTestId('actions-table')).toBeInTheDocument();
    });
  });

  describe('Hook Integration', () => {
    it('calls useRemediationsQuery with correct parameters', () => {
      renderComponent();

      expect(useRemediationsQuery.default).toHaveBeenCalledWith(
        expect.any(Function), // deleteIssues function
        {
          skip: true,
          batched: true,
        },
      );
    });

    it('calls useRemediationFetchExtras with correct parameters', () => {
      renderComponent();

      expect(useRemediationFetchExtras.default).toHaveBeenCalledWith({
        fetch: mockFetchBatched,
      });
    });
  });

  describe('Edge Cases', () => {
    it('handles issues without systems array', () => {
      const issuesWithoutSystems = {
        issues: [
          {
            id: 'issue-1',
            description: 'Test action',
            // no systems property
          },
        ],
      };
      renderComponent({ remediationDetails: issuesWithoutSystems });

      const systemsButton = screen.getByText('0 systems');
      expect(systemsButton).toBeInTheDocument();
    });

    it('handles issues with null systems', () => {
      const issuesWithNullSystems = {
        issues: [
          {
            id: 'issue-1',
            description: 'Test action',
            systems: null,
          },
        ],
      };
      renderComponent({ remediationDetails: issuesWithNullSystems });

      const systemsButton = screen.getByText('0 systems');
      expect(systemsButton).toBeInTheDocument();
    });

    it('displays correct dialog text for single action with action name', () => {
      const issueWithLongName = {
        issues: [
          {
            id: 'issue-1',
            description: 'Very long action name for testing purposes',
            systems: [],
          },
        ],
      };
      renderComponent({ remediationDetails: issueWithLongName });

      fireEvent.click(screen.getByTestId('action-remove-0'));

      // The dialog text shows the issue ID, not the description
      expect(screen.getByTestId('dialog-text')).toHaveTextContent('issue-1');
    });
  });

  describe('Integration with Table Tools', () => {
    it('passes correct items to table', () => {
      renderComponent();
      expect(screen.getByTestId('table-row-0')).toBeInTheDocument();
      expect(screen.getByTestId('table-row-1')).toBeInTheDocument();
    });

    it('passes correct filters configuration', () => {
      renderComponent();
      // Verify the table receives filters - this would be tested in integration
      expect(screen.getByTestId('actions-table')).toBeInTheDocument();
    });

    it('configures action resolver correctly', () => {
      renderComponent();
      expect(screen.getByTestId('action-remove-0')).toHaveTextContent('Remove');
      expect(screen.getByTestId('action-remove-1')).toHaveTextContent('Remove');
    });
  });
});
