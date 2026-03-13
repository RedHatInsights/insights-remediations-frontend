/* eslint-disable react/prop-types */
import React from 'react';
import { render, screen, within, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import configureStore from 'redux-mock-store';
import promiseMiddleware from 'redux-promise-middleware';
import { Provider as ReduxProvider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import OverViewPageProvider from './OverViewPage';
import { PermissionContext } from '../../App';
import { getRemediationsList, getRemediations } from '../api';
import { download } from '../../Utilities/DownloadPlaybookButton';

const demoRows = [
  {
    id: 'a',
    name: 'Fix things',
    last_modified: '2024-07-01T00:00:00Z',
    playbook_runs: [],
  },
  {
    id: 'b',
    name: 'Patch stuff',
    last_modified: '2024-07-02T00:00:00Z',
    playbook_runs: [],
  },
];

jest.mock('../../Utilities/Hooks/useFeatureFlag', () => ({
  useFeatureFlag: jest.fn(),
}));

jest.mock('@redhat-cloud-services/frontend-components/InsightsLink', () => {
  const MockInsightsLink = ({ children, to }) => (
    <a href={`/insights/${to}`}>{children}</a>
  );
  MockInsightsLink.displayName = 'MockInsightsLink';
  return MockInsightsLink;
});

jest.mock('../../api/useRemediationFetchExtras', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    fetchQueue: jest.fn().mockResolvedValue({}),
  })),
}));

jest.mock('../api', () => ({
  API_BASE: '',
  getRemediations: jest.fn(() =>
    Promise.resolve({ data: demoRows, meta: { total: 2 } }),
  ),
  getRemediationsList: jest.fn(() => Promise.resolve({ data: demoRows })),
  deleteRemediation: jest.fn(() => Promise.resolve({})),
  deleteRemediationList: jest.fn(() => Promise.resolve({})),
}));

const defaultMockRemediationsData = {
  data: demoRows.map((row) => ({ ...row })),
  meta: { total: 2 },
};
let mockRemediationsData = {
  data: demoRows.map((row) => ({ ...row })),
  meta: { total: 2 },
};

// Create a function that will be used to get the current mock data
// This ensures the mock always reads the latest value
const getMockRemediationsData = () => mockRemediationsData;

jest.mock('../../Utilities/Hooks/api/useRemediations', () => ({
  __esModule: true,
  default: jest.fn((endpoint) => {
    // Always read the current value, not the one captured at module load
    const currentData = getMockRemediationsData();

    if (endpoint === 'getRemediations') {
      return {
        result: currentData,
        loading: false,
        refetch: jest.fn(),
        fetchAllIds: jest
          .fn()
          .mockResolvedValue(currentData.data.map((r) => r.id)),
      };
    }
    if (endpoint === 'deleteRemediations') {
      return {
        fetchBatched: jest.fn().mockResolvedValue({}),
      };
    }
    if (endpoint === 'deleteRemediation') {
      return {
        fetch: jest.fn().mockResolvedValue({}),
      };
    }
    return {
      result: null,
      loading: false,
      refetch: jest.fn(),
    };
  }),
}));

jest.mock(
  '../../Utilities/DownloadPlaybookButton',
  () => ({
    DownloadPlaybookButton: ({ onClick, selectedItems }) => (
      <button
        data-testid="download-btn"
        disabled={!selectedItems?.length}
        onClick={onClick}
      >
        Download
      </button>
    ),
    download: jest.fn(),
  }),
  { virtual: true },
);

jest.mock(
  '@redhat-cloud-services/frontend-components-utilities/interceptors',
  () => ({
    useAxiosWithPlatformInterceptors: () => ({
      request: jest.fn(() => Promise.resolve({ data: {}, status: 200 })),
      get: jest.fn(() => Promise.resolve({ data: {}, status: 200 })),
      post: jest.fn(() => Promise.resolve({ data: {}, status: 200 })),
      put: jest.fn(() => Promise.resolve({ data: {}, status: 200 })),
      delete: jest.fn(() => Promise.resolve({ data: {}, status: 200 })),
      patch: jest.fn(() => Promise.resolve({ data: {}, status: 200 })),
    }),
  }),
);

// Mock bastilian-tabletools to ensure consistent table rendering
jest.mock('bastilian-tabletools', () => {
  const React = require('react');
  const actualModule = jest.requireActual('bastilian-tabletools');

  // Component to manage kebab menu state
  const TableToolsTable = ({
    items,
    columns,
    options,
    loading,
    'aria-label': ariaLabel,
    ouiaId,
  }) => {
    const { actionResolver, dedicatedAction, EmptyState } = options || {};
    const [openMenus, setOpenMenus] = React.useState({});

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

    const toggleMenu = (index) => {
      setOpenMenus((prev) => ({
        ...prev,
        [index]: !prev[index],
      }));
    };

    return (
      <table aria-label={ariaLabel} data-ouia-component-id={ouiaId}>
        <thead>
          <tr>
            {columns.map((col, idx) => (
              <th key={idx}>{col.title || col.exportKey}</th>
            ))}
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => {
            const actions = actionResolver ? actionResolver() : [];
            const isMenuOpen = openMenus[index];

            return (
              <tr key={item.id || index} role="row">
                {columns.map((column, colIndex) => (
                  <td key={colIndex}>
                    {column.Component ? (
                      <column.Component {...item} />
                    ) : (
                      item[column.exportKey]
                    )}
                  </td>
                ))}
                <td>
                  {actions.length > 0 && (
                    <div>
                      <button
                        aria-label="Kebab toggle"
                        onClick={() => toggleMenu(index)}
                      >
                        Actions
                      </button>
                      {isMenuOpen && (
                        <div role="menu">
                          {actions.map((action, actionIndex) => {
                            return (
                              <button
                                key={actionIndex}
                                role="menuitem"
                                onClick={(e) => {
                                  action.onClick(e, index, { item });
                                  toggleMenu(index);
                                }}
                              >
                                {typeof action.title === 'string'
                                  ? action.title
                                  : action.title}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
        {dedicatedAction && (
          <tfoot>
            <tr>
              <td colSpan={columns.length + 1}>{dedicatedAction()}</td>
            </tr>
          </tfoot>
        )}
      </table>
    );
  };

  return {
    ...actualModule,
    useRawTableState: jest.fn(() => ({ selected: [] })),
    useStateCallbacks: jest.fn(() => ({
      current: {
        resetSelection: jest.fn(),
      },
    })),
    TableStateProvider: ({ children }) => <div>{children}</div>,
    TableToolsTable,
  };
});

const realStringify = JSON.stringify;

beforeAll(() => {
  jest.spyOn(JSON, 'stringify').mockImplementation((v, ...a) => {
    try {
      return realStringify(v, ...a);
    } catch {
      return '';
    }
  });
});

afterAll(() => JSON.stringify.mockRestore());

const mockStore = configureStore([promiseMiddleware]);

const renderPage = (customStore) => {
  const store = customStore || mockStore({});
  return render(
    <ReduxProvider store={store}>
      <PermissionContext.Provider
        value={{ permissions: { write: true, read: true } }}
      >
        <MemoryRouter>
          <OverViewPageProvider />
        </MemoryRouter>
      </PermissionContext.Provider>
    </ReduxProvider>,
  );
};

const renderPageWithList = (list, customStore) => {
  // Override the default mock implementations for this specific test
  // Use deep copy to prevent mutations
  const listCopy = list.map((item) => ({ ...item }));
  mockRemediationsData = { data: listCopy, meta: { total: list.length } };
  getRemediations.mockImplementation(() =>
    Promise.resolve({ data: listCopy, meta: { total: list.length } }),
  );
  getRemediationsList.mockImplementation(() =>
    Promise.resolve({ data: listCopy }),
  );

  // Also update useRemediations mock to return the new data
  useRemediations.mockImplementation((endpoint) => {
    if (endpoint === 'getRemediations') {
      return {
        result: mockRemediationsData,
        loading: false,
        refetch: jest.fn(),
        fetchAllIds: jest
          .fn()
          .mockResolvedValue(mockRemediationsData.data.map((r) => r.id)),
      };
    }
    if (endpoint === 'deleteRemediations') {
      return {
        fetchBatched: jest.fn().mockResolvedValue({}),
      };
    }
    if (endpoint === 'deleteRemediation') {
      return {
        fetch: jest.fn().mockResolvedValue({}),
      };
    }
    return {
      result: null,
      loading: false,
      refetch: jest.fn(),
    };
  });

  return renderPage(customStore);
};

const { useFeatureFlag } = require('../../Utilities/Hooks/useFeatureFlag');
const useRemediations =
  require('../../Utilities/Hooks/api/useRemediations').default;

describe('OverViewPage', () => {
  let store;
  let cleanup;

  beforeEach(() => {
    // Clear all mocks first to prevent leakage from other test files
    jest.clearAllMocks();

    // Create a fresh Redux store for each test
    store = mockStore({});

    // Reset mockRemediationsData to default with deep copy to prevent mutations
    mockRemediationsData = {
      data: defaultMockRemediationsData.data.map((row) => ({ ...row })),
      meta: { ...defaultMockRemediationsData.meta },
    };

    // Reset shared mocks to their default implementations
    // This is critical when tests run together - mocks from other files can leak
    useFeatureFlag.mockReset();
    useFeatureFlag.mockReturnValue(false);

    // Reset useRemediations to default implementation for this test file
    useRemediations.mockReset();
    useRemediations.mockImplementation((endpoint) => {
      if (endpoint === 'getRemediations') {
        // Component calls getRemediations twice:
        // 1. With useTableState: true (for main table)
        // 2. With fieldsData: ['name'] (for allRemediations list)
        // Both should return the same data structure
        return {
          result: mockRemediationsData,
          loading: false,
          refetch: jest.fn(),
          fetchAllIds: jest
            .fn()
            .mockResolvedValue(mockRemediationsData.data.map((r) => r.id)),
        };
      }
      if (endpoint === 'deleteRemediations') {
        return {
          fetchBatched: jest.fn().mockResolvedValue({}),
        };
      }
      if (endpoint === 'deleteRemediation') {
        return {
          fetch: jest.fn().mockResolvedValue({}),
        };
      }
      return {
        result: null,
        loading: false,
        refetch: jest.fn(),
      };
    });

    // Reset API mocks with fresh promises
    getRemediations.mockReset();
    getRemediations.mockImplementation(() =>
      Promise.resolve({ data: [...demoRows], meta: { total: 2 } }),
    );
    getRemediationsList.mockReset();
    getRemediationsList.mockImplementation(() =>
      Promise.resolve({ data: [...demoRows] }),
    );

    // Reset download mock
    download.mockReset();
    download.mockResolvedValue(undefined);

    // Initialize and reset global mock for quickstart
    if (!global.mockActivateQuickstart) {
      global.mockActivateQuickstart = jest.fn();
    }
    global.mockActivateQuickstart.mockClear();
    global.mockActivateQuickstart.mockResolvedValue(undefined);
  });

  afterEach(async () => {
    // Cleanup rendered components first
    if (cleanup && typeof cleanup === 'function') {
      cleanup();
      cleanup = null;
    } else if (cleanup && typeof cleanup.unmount === 'function') {
      cleanup.unmount();
      cleanup = null;
    }

    // Wait for any pending promises/timers to complete
    // This ensures all async operations finish before the next test
    await new Promise((resolve) => {
      // Use setImmediate for better async handling
      if (typeof setImmediate !== 'undefined') {
        setImmediate(resolve);
      } else {
        setTimeout(resolve, 0);
      }
    });

    // Clear all timers (but don't use fake timers unless needed)
    // jest.clearAllTimers() only works with fake timers

    // Ensure all mocks are properly cleaned up
    jest.clearAllMocks();

    // Clear Redux store actions
    if (store) {
      store.clearActions();
    }

    // Reset to default data with deep copy to prevent mutations
    mockRemediationsData = {
      data: defaultMockRemediationsData.data.map((row) => ({ ...row })),
      meta: { ...defaultMockRemediationsData.meta },
    };

    // Reset download mock specifically
    download.mockReset();
    download.mockResolvedValue(undefined);
  });

  it('renders table rows and opens delete modal', async () => {
    const user = userEvent.setup();
    const view = renderPage(store);
    cleanup = view.unmount;

    // Wait for the table row to be rendered
    const row = await screen.findByRole('row', { name: /patch stuff/i });

    // Wait for the kebab button to be available and visible
    const kebab = await waitFor(
      () => {
        const button = within(row).getByRole('button', {
          name: /Kebab toggle/i,
        });
        expect(button).toBeVisible();
        return button;
      },
      { timeout: 5000 },
    );

    // Click the kebab button
    await user.click(kebab);

    // Wait for the menu to appear and the delete item to be visible
    const deleteItem = await waitFor(
      () => {
        const menuItem = screen.getByRole('menuitem', { name: /delete/i });
        expect(menuItem).toBeVisible();
        return menuItem;
      },
      { timeout: 5000 },
    );

    // Click the delete menu item and wait for the modal to appear
    await user.click(deleteItem);

    // Wait for the modal to appear - use findByRole which retries automatically
    const modal = await waitFor(
      () => {
        const dialog = screen.getByRole('dialog', {
          name: /delete remediation plan/i,
        });
        expect(dialog).toBeVisible();
        return dialog;
      },
      { timeout: 5000 },
    );

    expect(modal).toBeVisible();
  });

  it('calls download helper for single row', async () => {
    const user = userEvent.setup();
    const view = renderPage(store);
    cleanup = view.unmount;

    // Wait for the table row to be rendered
    const row = await screen.findByRole('row', { name: /patch stuff/i });

    // Wait for the kebab button to be available and visible
    const kebab = await waitFor(
      () => {
        const button = within(row).getByRole('button', {
          name: /kebab toggle/i,
        });
        expect(button).toBeVisible();
        return button;
      },
      { timeout: 5000 },
    );

    await user.click(kebab);

    // Wait for the menu to appear before trying to find the download item
    const downloadItem = await waitFor(
      () => {
        const menuItem = screen.getByRole('menuitem', { name: /download/i });
        expect(menuItem).toBeVisible();
        return menuItem;
      },
      { timeout: 5000 },
    );
    await user.click(downloadItem);

    await waitFor(() => expect(download).toHaveBeenCalledTimes(1));
    expect(download.mock.calls[0][0]).toEqual(['b']);
  });

  it('shows Launch Quick Start button when remediations exist and triggers QS', async () => {
    const user = userEvent.setup();
    const view = renderPage(store);
    cleanup = view.unmount;
    const qsBtn = await screen.findByRole('button', {
      name: /launch quick start/i,
    });
    expect(qsBtn).toBeInTheDocument();
    await user.click(qsBtn);
    expect(global.mockActivateQuickstart).toHaveBeenCalledWith(
      'insights-remediate-plan-create',
    );
  });

  it('hides Launch Quick Start button when no remediations exist', async () => {
    const view = renderPageWithList([], store);
    cleanup = view.unmount;

    await waitFor(() => {
      expect(screen.getByText(/no remediation plans/i)).toBeInTheDocument();
    });

    // The Launch Quick Start button should appear in the empty state, not in the header
    // So we should have exactly 1 button (from empty state) not 2 (header + empty state)
    const quickStartButtons = screen.getAllByRole('button', {
      name: /launch quick start/i,
    });
    expect(quickStartButtons).toHaveLength(1);

    expect(
      screen.getByText(/use ansible playbooks to resolve issues/i, {
        exact: false,
      }),
    ).toBeInTheDocument();
  });
});
