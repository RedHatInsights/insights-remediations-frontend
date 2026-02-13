import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import RemediationDetailsPageHeader from './DetailsPageHeader';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';

jest.mock('../../components/RemediationDetailsDropdown', () => {
  const Dropdown = () => <div>Dropdown</div>;
  Dropdown.displayName = 'RemediationDetailsDropdown';
  return Dropdown;
});
jest.mock('../../components/ExecuteButton', () => {
  const ExecuteButton = (props) => (
    <button disabled={props.isDisabled} onClick={props.onClick}>
      Execute
    </button>
  );
  ExecuteButton.displayName = 'ExecuteButton';
  ExecuteButton.propTypes = {
    isDisabled: () => {},
    onClick: () => {},
  };
  return ExecuteButton;
});
jest.mock('../../Utilities/DownloadPlaybookButton', () => ({
  download: jest.fn(),
}));
jest.mock('../../Utilities/ButtonWithToolTip', () => {
  const ButtonWithToolTip = (props) => (
    <button disabled={props.isDisabled} onClick={props.onClick}>
      Download
    </button>
  );
  ButtonWithToolTip.displayName = 'ButtonWithToolTip';
  ButtonWithToolTip.propTypes = {
    isDisabled: () => {},
    onClick: () => {},
  };
  return ButtonWithToolTip;
});

const remediation = {
  id: 'rem-123',
  name: 'Test Remediation',
  issues: [{ id: 'issue-1' }, { id: 'issue-2' }],
};
const remediationStatus = {
  connectedSystems: 1,
  totalSystems: 2,
  areDetailsLoading: false,
  connectionError: null,
};
const allRemediations = { data: [] };
const permissions = { execute: true };
const updateRemPlan = jest.fn();
const refetch = jest.fn();
const refetchAllRemediations = jest.fn();
const refetchRemediationPlaybookRuns = jest.fn();

const mockStore = configureStore([]);
const store = mockStore({});

describe('RemediationDetailsPageHeader', () => {
  it('renders title, id, and buttons', () => {
    render(
      <Provider store={store}>
        <RemediationDetailsPageHeader
          remediation={remediation}
          remediationStatus={remediationStatus}
          isFedramp={false}
          allRemediations={allRemediations}
          updateRemPlan={updateRemPlan}
          refetch={refetch}
          permissions={permissions}
          isExecutable={true}
          refetchAllRemediations={refetchAllRemediations}
          refetchRemediationPlaybookRuns={refetchRemediationPlaybookRuns}
        />
      </Provider>,
    );
    expect(screen.getByText('Test Remediation')).toBeInTheDocument();
    expect(screen.getByText('ID: rem-123')).toBeInTheDocument();
    expect(screen.getByText('Execute')).toBeInTheDocument();
    expect(screen.getByText('Download')).toBeInTheDocument();
    expect(screen.getByText('Dropdown')).toBeInTheDocument();
  });

  it('disables ExecuteButton if not executable', () => {
    render(
      <Provider store={store}>
        <RemediationDetailsPageHeader
          remediation={remediation}
          remediationStatus={{ ...remediationStatus, connectedSystems: 0 }}
          isFedramp={false}
          allRemediations={allRemediations}
          updateRemPlan={updateRemPlan}
          refetch={refetch}
          permissions={permissions}
          isExecutable={true}
          refetchAllRemediations={refetchAllRemediations}
          refetchRemediationPlaybookRuns={refetchRemediationPlaybookRuns}
        />
      </Provider>,
    );
    expect(screen.getByText('Execute')).toBeDisabled();
  });

  it('disables ExecuteButton when isExecutable is false (e.g., due to 503 connection error)', () => {
    render(
      <Provider store={store}>
        <RemediationDetailsPageHeader
          remediation={remediation}
          remediationStatus={{
            ...remediationStatus,
            connectionError: {
              errors: [
                {
                  id: '2bb8b920fe07464ea020c1454e7b29f4',
                  status: 503,
                  code: 'DEPENDENCY_UNAVAILABLE',
                  title:
                    'Internal service dependency is temporarily unavailable.  If the issue persists please contact Red Hat support: https://access.redhat.com/support/cases/',
                  details: {
                    name: 'configManager',
                    impl: 'impl',
                  },
                },
              ],
            },
            connectedSystems: 5,
          }}
          isFedramp={false}
          allRemediations={allRemediations}
          updateRemPlan={updateRemPlan}
          refetch={refetch}
          permissions={permissions}
          isExecutable={false}
          refetchAllRemediations={refetchAllRemediations}
          refetchRemediationPlaybookRuns={refetchRemediationPlaybookRuns}
        />
      </Provider>,
    );
    expect(screen.getByText('Execute')).toBeDisabled();
  });

  it('shows spinner when loading', () => {
    render(
      <Provider store={store}>
        <RemediationDetailsPageHeader
          remediation={remediation}
          remediationStatus={{ ...remediationStatus, areDetailsLoading: true }}
          isFedramp={false}
          allRemediations={allRemediations}
          updateRemPlan={updateRemPlan}
          refetch={refetch}
          permissions={permissions}
          isExecutable={true}
          refetchAllRemediations={refetchAllRemediations}
          refetchRemediationPlaybookRuns={refetchRemediationPlaybookRuns}
        />
      </Provider>,
    );
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });
});
