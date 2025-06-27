/* eslint-disable react/prop-types */
import React from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import configureStore from 'redux-mock-store';
import promiseMiddleware from 'redux-promise-middleware';
import { Provider as ReduxProvider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import OverViewPageProvider from './OverViewPage';
import { PermissionContext } from '../../App';

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

jest.mock('../api', () => ({
  getRemediations: jest.fn(
    () => () => Promise.resolve({ data: demoRows, meta: { total: 2 } }),
  ),
  getRemediationsList: jest.fn(() => () => Promise.resolve({ data: demoRows })),
  deleteRemediation: jest.fn(() => () => Promise.resolve({})),
  deleteRemediationList: jest.fn(() => () => Promise.resolve({})),
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

const mockActivateQuickstart = jest.fn();
jest.mock('@redhat-cloud-services/frontend-components/useChrome', () => ({
  __esModule: true,
  default: () => ({
    getApp: () => 'remediations',
    quickStarts: { activateQuickstart: mockActivateQuickstart },
  }),
}));

jest.mock(
  '@redhat-cloud-services/frontend-components-utilities/interceptors',
  () => ({
    useAxiosWithPlatformInterceptors: () => ({}),
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
  const { getRemediationsList } = require('../api');
  getRemediationsList.mockImplementationOnce(
    () => () => Promise.resolve({ data: list }),
  );
  return renderPage();
};

describe('OverViewPage', () => {
  it('renders table rows and opens delete modal', async () => {
    renderPage();
    const row = await screen.findByRole('row', { name: /patch stuff/i });
    const kebab = within(row).getByRole('button', { name: /kebab toggle/i });
    await userEvent.click(kebab);
    const deleteItem = await screen.findByRole('menuitem', {
      name: /^delete$/i,
    });
    await userEvent.click(deleteItem);

    expect(
      screen.getByRole('dialog', { name: /delete remediation plan/i }),
    ).toBeVisible();
  });

  it('calls download helper for single row', async () => {
    const { download } = require('../../Utilities/DownloadPlaybookButton');
    renderPage();
    const row = await screen.findByRole('row', { name: /patch stuff/i });
    const kebab = within(row).getByRole('button', { name: /kebab toggle/i });
    await userEvent.click(kebab);
    const downloadItem = await screen.findByRole('menuitem', {
      name: /^download$/i,
    });
    await userEvent.click(downloadItem);
    expect(download).toHaveBeenCalledTimes(1);
    expect(download.mock.calls[0][0]).toEqual(['b']);
  });

  it('shows Launch Quick Start button when remediations exist and triggers QS', async () => {
    renderPage();
    const qsBtn = await screen.findByRole('button', {
      name: /launch quick start/i,
    });
    expect(qsBtn).toBeInTheDocument();
    await userEvent.click(qsBtn);
    expect(mockActivateQuickstart).toHaveBeenCalledWith(
      'insights-remediate-plan-create',
    );
  });

  it('hides Launch Quick Start button when no remediations exist', async () => {
    renderPageWithList([]);
    expect(
      screen.queryByRole('button', { name: /launch quick start/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByText(/use ansible playbooks to resolve issues/i, {
        exact: false,
      }),
    ).toBeInTheDocument();
  });
});
