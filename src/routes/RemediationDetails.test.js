import '@testing-library/jest-dom';

jest.mock('react-dom/test-utils', () => {
  const actual = jest.requireActual('react-dom/test-utils');
  return {
    ...actual,
    act: require('react').act,
  };
});

import React from 'react';
import { render, screen } from '@testing-library/react';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ id: '123' }),
  useSearchParams: () => [new URLSearchParams(), jest.fn()],
  useNavigate: () => jest.fn(),
}));

import RemediationDetails from './RemediationDetails';
import * as useRemediations from '../Utilities/Hooks/api/useRemediations';
import * as connectionStatus from '../Utilities/useConnectionStatus';
import * as chromeModule from '@redhat-cloud-services/frontend-components/useChrome';
import { PermissionContext } from '../App';

jest.mock('./api', () => ({
  API_BASE: '',
  updateRemediationWrapper: jest.fn(),
}));

const SystemsTableMock = () => <div>SystemsTable</div>;
SystemsTableMock.displayName = 'SystemsTable';
jest.mock('../components/SystemsTable/SystemsTable', () => SystemsTableMock);

const HeaderMock = () => <div>Header</div>;
HeaderMock.displayName = 'Header';
jest.mock('./RemediationDetailsComponents/DetailsPageHeader', () => HeaderMock);

const GeneralContentMock = () => <div>GeneralContent</div>;
GeneralContentMock.displayName = 'GeneralContent';
jest.mock(
  './RemediationDetailsComponents/DetailsGeneralContent',
  () => GeneralContentMock,
);

const ActionsContentMock = () => <div>ActionsContent</div>;
ActionsContentMock.displayName = 'ActionsContent';
jest.mock(
  './RemediationDetailsComponents/ActionsContent/ActionsContent',
  () => ActionsContentMock,
);

const ExecutionHistoryMock = () => <div>ExecutionHistory</div>;
ExecutionHistoryMock.displayName = 'ExecutionHistory';
jest.mock(
  './RemediationDetailsComponents/ExecutionHistoryContent/ExecutionHistoryContent',
  () => ExecutionHistoryMock,
);

const PlannedRemediationsContentMock = () => (
  <div>PlannedRemediationsContent</div>
);
PlannedRemediationsContentMock.displayName = 'PlannedRemediationsContent';
jest.mock(
  './RemediationDetailsComponents/PlannedRemediationsContent',
  () => PlannedRemediationsContentMock,
);

// eslint-disable-next-line react/prop-types
const RenameModalMock = ({ isRenameModalOpen }) =>
  isRenameModalOpen ? <div>RenameModal</div> : null;
RenameModalMock.displayName = 'RenameModal';
jest.mock('../components/RenameModal', () => RenameModalMock);

describe('RemediationDetails', () => {
  let remediationSpy;

  beforeEach(() => {
    // Stub out useChrome()
    jest.spyOn(chromeModule, 'default').mockReturnValue({
      updateDocumentTitle: jest.fn(),
      isFedramp: false,
    });

    let callCount = 0;
    remediationSpy = jest
      .spyOn(useRemediations, 'default')
      .mockImplementation(() => {
        callCount++;
        switch (callCount) {
          case 1:
            // 1) getRemediationsList()
            return {
              result: { data: [] },
              refetch: jest.fn(),
            };
          case 2:
            // 2) checkExecutableStatus({ params: { remId: '123' } })
            return { result: 'OK' };
          case 3:
            // 3) getRemediationDetails({ params: { remId: '123', format: 'summary' } })
            return {
              result: { id: '123', name: 'Test Remediation', issues: [] },
              refetch: jest.fn(),
              loading: false,
            };
          case 4:
            // 4) getRemediationDetails({ params: { remId: '123' } }) - full details
            return {
              result: { id: '123', name: 'Test Remediation', issues: [] },
              refetch: jest.fn(),
              loading: false,
            };
          case 5:
            // 5) getRemediationPlaybook({ params: { remId: '123' } })
            return {
              result: {
                data: [
                  {
                    id: 'testing-id',
                    status: 'success',
                    remediation_id: 'supa test id',
                    created_by: {
                      username: 'insights-qa',
                      first_name: 'Insights',
                      last_name: 'QA',
                    },
                    created_at: '2025-07-22T10:28:24.882Z',
                    updated_at: '2025-07-22T10:28:24.882Z',
                    executors: [
                      {
                        executor_id: 'testing-id',
                        executor_name: 'Direct connected',
                        status: 'success',
                        system_count: 1,
                        counts: {
                          pending: 0,
                          running: 0,
                          success: 1,
                          failure: 0,
                          canceled: 0,
                        },
                      },
                    ],
                  },
                ],
              },
              loading: false,
              refetch: jest.fn(),
            };
          case 6:
            // 6) getRemediationIssues({ params: { id: '123' }, useTableState: false })
            return {
              result: {
                data: [],
                meta: { total: 0 },
              },
              loading: false,
              refetch: jest.fn(),
            };
          case 7:
            // 7) updateRemediationWrapper({ skip: true })
            return { fetch: jest.fn() };
          default:
            return {};
        }
      });

    // Stub out useConnectionStatus()
    jest
      .spyOn(connectionStatus, 'useConnectionStatus')
      .mockReturnValue([1, 2, false, null, []]);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('renders all main sections and calls queries in the right order', () => {
    render(
      <PermissionContext.Provider value={{ permissions: {} }}>
        <RemediationDetails />
      </PermissionContext.Provider>,
    );

    // 3) Rendering sanity checks
    expect(screen.getByText('Header')).toBeInTheDocument();
    expect(screen.getByText('GeneralContent')).toBeInTheDocument();
    expect(screen.getByText('PlannedRemediationsContent')).toBeInTheDocument();
    expect(screen.getByText('ExecutionHistory')).toBeInTheDocument();

    // 4) Assert exactly seven calls in the right sequence
    expect(remediationSpy).toHaveBeenCalledTimes(7);

    const calls = remediationSpy.mock.calls;

    // Check that we got the expected endpoint calls
    expect(calls[0][0]).toBe('getRemediations');
    expect(calls[1][0]).toBe('checkExecutable');
    expect(calls[2][0]).toBe('getRemediation');
    expect(calls[3][0]).toBe('getRemediation');
    expect(calls[4][0]).toBe('listPlaybookRuns');
    expect(calls[5][0]).toBe('getRemediationIssues');
    // The 7th call passes updateRemediationWrapper function
    expect(typeof calls[6][0]).toBe('function');

    // 5) Spot‑check the options object on each call:
    expect(remediationSpy.mock.calls[0][1]).toEqual({
      params: { fieldsData: ['name'] },
    });
    expect(remediationSpy.mock.calls[1][1]).toEqual({
      params: { id: '123' },
    });
    expect(remediationSpy.mock.calls[2][1]).toEqual({
      params: { id: '123', format: 'summary' },
    });
    expect(remediationSpy.mock.calls[3][1]).toEqual({
      params: { id: '123' },
    });
    expect(remediationSpy.mock.calls[4][1]).toEqual({
      params: { id: '123' },
    });
    expect(remediationSpy.mock.calls[5][1]).toEqual({
      params: { id: '123' },
      useTableState: false,
    });
    expect(remediationSpy.mock.calls[6][1]).toEqual({ skip: true });
  });
});
