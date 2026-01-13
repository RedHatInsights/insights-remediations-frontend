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

jest.mock('../api', () => ({
  API_BASE: '',
  getRemediations: jest.fn(() =>
    Promise.resolve({ data: demoRows, meta: { total: 2 } }),
  ),
  getRemediationsList: jest.fn(() => Promise.resolve({ data: demoRows })),
  deleteRemediation: jest.fn(() => Promise.resolve({})),
  deleteRemediationList: jest.fn(() => Promise.resolve({})),
}));

const defaultMockRemediationsData = { data: demoRows, meta: { total: 2 } };
let mockRemediationsData = { data: demoRows, meta: { total: 2 } };

jest.mock('../../Utilities/Hooks/api/useRemediations', () => ({
  __esModule: true,
  default: jest.fn((endpoint) => {
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
const store = mockStore({});

const renderPage = () =>
  render(
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

const renderPageWithList = (list) => {
  // Override the default mock implementations for this specific test
  mockRemediationsData = { data: list, meta: { total: list.length } };
  getRemediations.mockImplementation(() =>
    Promise.resolve({ data: list, meta: { total: list.length } }),
  );
  getRemediationsList.mockImplementation(() => Promise.resolve({ data: list }));
  return renderPage();
};

const { useFeatureFlag } = require('../../Utilities/Hooks/useFeatureFlag');
const useRemediations =
  require('../../Utilities/Hooks/api/useRemediations').default;

describe('OverViewPage', () => {
  beforeEach(() => {
    // Clear all mocks first to prevent leakage from other test files
    jest.clearAllMocks();

    // Clear Redux store actions
    store.clearActions();

    // Reset mockRemediationsData to default
    mockRemediationsData = { ...defaultMockRemediationsData };

    // Reset shared mocks to their default implementations
    // This is critical when tests run together - mocks from other files can leak
    useFeatureFlag.mockReset();
    useFeatureFlag.mockReturnValue(false);

    // Reset useRemediations to default implementation for this test file
    useRemediations.mockReset();
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
      return {
        result: null,
        loading: false,
        refetch: jest.fn(),
      };
    });

    // Reset API mocks
    getRemediations.mockImplementation(() =>
      Promise.resolve({ data: demoRows, meta: { total: 2 } }),
    );
    getRemediationsList.mockImplementation(() =>
      Promise.resolve({ data: demoRows }),
    );

    // Reset global mock for quickstart
    if (global.mockActivateQuickstart) {
      global.mockActivateQuickstart.mockClear();
    }
  });
  it('renders table rows and opens delete modal', async () => {
    const user = userEvent.setup();
    renderPage();
    const row = await screen.findByRole('row', { name: /patch stuff/i });
    const kebab = within(row).getByRole('button', { name: /Kebab toggle/i });

    await user.click(kebab);

    const deleteItem = await waitFor(
      () => {
        const menuItem = screen.getByRole('menuitem', { name: /delete/i });
        expect(menuItem).toBeVisible();
        return menuItem;
      },
      { timeout: 5000 },
    );

    await user.click(deleteItem);

    expect(
      await screen.findByRole('dialog', { name: /delete remediation plan/i }),
    ).toBeVisible();
  });

  it('calls download helper for single row', async () => {
    const user = userEvent.setup();
    renderPage();
    const row = await screen.findByRole('row', { name: /patch stuff/i });
    const kebab = within(row).getByRole('button', { name: /kebab toggle/i });
    await user.click(kebab);

    // Wait for the menu to appear before trying to find the download item
    const downloadItem = await screen.findByRole(
      'menuitem',
      { name: /download/i },
      { timeout: 5000 },
    );
    await user.click(downloadItem);

    await waitFor(() => expect(download).toHaveBeenCalledTimes(1));
    expect(download.mock.calls[0][0]).toEqual(['b']);
  });

  it('shows Launch Quick Start button when remediations exist and triggers QS', async () => {
    const user = userEvent.setup();
    renderPage();
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
    renderPageWithList([]);

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
