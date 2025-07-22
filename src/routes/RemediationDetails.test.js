import '@testing-library/jest-dom';
import React from 'react';
import { render, screen } from '@testing-library/react';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ id: '123' }),
  useSearchParams: () => [new URLSearchParams(), jest.fn()],
}));

import RemediationDetails from './RemediationDetails';
import * as remediationsQuery from '../api/useRemediationsQuery';
import * as connectionStatus from '../Utilities/useConnectionStatus';
import * as chromeModule from '@redhat-cloud-services/frontend-components/useChrome';
import { PermissionContext } from '../App';

jest.mock('../routes/api', () => ({
  API_BASE: '',
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

// eslint-disable-next-line react/prop-types
const RenameModalMock = ({ isRenameModalOpen }) =>
  isRenameModalOpen ? <div>RenameModal</div> : null;
RenameModalMock.displayName = 'RenameModal';
jest.mock('../components/RenameModal', () => RenameModalMock);

describe('RemediationDetails', () => {
  beforeEach(() => {
    jest
      .spyOn(chromeModule, 'default')
      .mockReturnValue({ updateDocumentTitle: jest.fn(), isFedramp: false });

    let callCount = 0;
    jest.spyOn(remediationsQuery, 'default').mockImplementation(() => {
      callCount++;
      if (callCount === 1) {
        // getRemediationDetails
        return {
          result: { id: '123', name: 'Test Remediation', issues: [] },
          refetch: jest.fn(),
          loading: false,
        };
      }
      if (callCount === 2) {
        // getRemediationsList
        return { result: { data: [] }, refetch: jest.fn() };
      }
      if (callCount === 3) {
        // checkExecutableStatus
        return { result: 'OK' };
      }
      // getRemediationPlaybook
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
    });

    jest
      .spyOn(connectionStatus, 'useConnectionStatus')
      .mockReturnValue([1, 2, false, null, []]);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('renders all main sections', () => {
    render(
      <PermissionContext.Provider value={{ permissions: {} }}>
        <RemediationDetails />
      </PermissionContext.Provider>,
    );
    expect(screen.getByText('Header')).toBeInTheDocument();
    expect(screen.getByText('GeneralContent')).toBeInTheDocument();
    expect(screen.getByText('SystemsTable')).toBeInTheDocument();
    expect(screen.getByText('ActionsContent')).toBeInTheDocument();
    expect(screen.getByText('ExecutionHistory')).toBeInTheDocument();
  });
});
