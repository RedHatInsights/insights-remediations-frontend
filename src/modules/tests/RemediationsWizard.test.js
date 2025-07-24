import React from 'react';
import { remediationWizardTestData } from './testData';
import { RemediationWizard } from '../RemediationsModal/RemediationsWizard';
import configureStore from 'redux-mock-store';
import promiseMiddleware from 'redux-promise-middleware';
import { Provider } from 'react-redux';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';

jest.mock('../../store/actions/host-actions', () => {
  const actions = jest.requireActual('../../store/actions/host-actions');
  return {
    __esModule: true,
    ...actions,
    fetchHostsById: () => ({
      type: 'FETCH_SELECTED_HOSTS',
      payload: () => Promise.resolve([]),
    }),
  };
});

jest.mock('../../api/index', () => {
  const { remediationWizardTestData } = jest.requireActual('./testData');
  return {
    __esModule: true,
    remediationsApi: {},
    getRemediations: jest.fn(() =>
      Promise.resolve({ data: [], meta: { total: 2 } }),
    ),
    getResolutionsBatch: () =>
      Promise.resolve(remediationWizardTestData.issueResolutionsResponse),
  };
});

jest.mock('../../routes/api', () => ({
  getRemediations: jest.fn(() =>
    Promise.resolve({ data: [], meta: { total: 0 } }),
  ),
  getRemediationsList: jest.fn(() => Promise.resolve({ data: [] })),
  deleteRemediation: jest.fn(() => Promise.resolve({})),
  deleteRemediationList: jest.fn(() => Promise.resolve({})),
}));

jest.mock(
  '@redhat-cloud-services/frontend-components-utilities/interceptors',
  () => ({
    __esModule: true,
    useAxiosWithPlatformInterceptors: jest.fn(() => ({
      get: () => {
        let res = {
          meta: {
            count: 2,
            total: 2,
          },
          data: [
            {
              name: 'aaaa',
            },
            {
              name: 'aaaaaaa',
            },
            {
              name: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
            },
            {
              name: 'asddfgd',
            },
            {
              name: 'asdf',
            },
          ],
        };
        return res;
      },
    })),
  }),
);

describe('RemediationWizard', () => {
  let initialProps;
  let mockStore = configureStore([promiseMiddleware]);

  beforeEach(() => {
    initialProps = {
      data: {
        issues: remediationWizardTestData.issues,
        systems: remediationWizardTestData.systems,
      },
      setOpen: jest.fn(),
    };
  });

  it('should render wizard correctly', async () => {
    fetch.mockResponse(JSON.stringify({}));

    const store = mockStore({});
    const registrySpy = jest.fn();

    render(
      <Provider store={store}>
        <RemediationWizard
          {...initialProps}
          registry={{
            register: registrySpy,
          }}
        />
      </Provider>,
    );

    await screen.findByRole('button', { name: /select playbook/i });
    await screen.findByRole('button', { name: /review systems/i });
    await screen.findByRole('button', { name: /remediation review/i });

    expect(
      screen.getByRole('button', { name: /select playbook/i }),
    ).toBeVisible();
    expect(
      screen.getByRole('button', { name: /review systems/i }),
    ).toBeVisible();
    expect(
      screen.getByRole('button', { name: /remediation review/i }),
    ).toBeVisible();

    expect(
      screen.getByText(
        /you selected to remediate with ansible, which in total includes of which can be remediated by ansible\./i,
      ),
    ).toBeVisible();
  });

  it('should display correct wording for multiple systems', async () => {
    const store = mockStore({});
    const registrySpy = jest.fn();
    // Use two systems for this test
    const multiSystemProps = {
      ...initialProps,
      data: {
        ...initialProps.data,
        systems: ['system1', 'system2'],
      },
    };

    render(
      <Provider store={store}>
        <RemediationWizard
          {...multiSystemProps}
          registry={{
            register: registrySpy,
          }}
        />
      </Provider>,
    );

    await screen.findByRole('button', { name: /select playbook/i });

    expect(screen.getByText(/2 systems/i)).toBeInTheDocument();
    expect(screen.getByText(/1 issue/i)).toBeInTheDocument();
    expect(
      screen.getByText(
        /you selected to remediate with ansible, which in total includes of which can be remediated by ansible\./i,
      ),
    ).toBeInTheDocument();
  });

  it('should display correct wording for a single system', async () => {
    const store = mockStore({});
    const registrySpy = jest.fn();
    // Use one system for this test
    const singleSystemProps = {
      ...initialProps,
      data: {
        ...initialProps.data,
        systems: ['system1'],
      },
    };

    render(
      <Provider store={store}>
        <RemediationWizard
          {...singleSystemProps}
          registry={{
            register: registrySpy,
          }}
        />
      </Provider>,
    );

    await screen.findByRole('button', { name: /select playbook/i });

    // Check for correct singular wording
    expect(screen.getByText(/1 system/i)).toBeInTheDocument();
    expect(screen.getByText(/1 issue/i)).toBeInTheDocument();
    expect(
      screen.getByText(
        /you selected to remediate with ansible, which in total includes of which can be remediated by ansible\./i,
      ),
    ).toBeInTheDocument();
  });

  it('should not advance without playbook name, but should after entering one', async () => {
    const store = mockStore({
      hostReducer: { hosts: [] },
    });
    const registrySpy = jest.fn();
    render(
      <Provider store={store}>
        <RemediationWizard
          {...initialProps}
          registry={{ register: registrySpy }}
        />
      </Provider>,
    );

    await screen.findByRole('button', { name: /select playbook/i });

    // Try pressing 'Next' without entering a playbook name
    const nextButton = screen.getByRole('button', { name: /next/i });
    const user = userEvent.setup();
    await user.click(nextButton);

    // Should NOT advance: 'Review systems' step should not be present
    expect(
      screen.queryByText(
        /Review and optionally exclude systems from your selection\./i,
      ),
    ).not.toBeInTheDocument();

    const playbookInput = screen.getByRole('textbox', {
      name: /name your playbook/i,
    });
    await user.type(playbookInput, 'My Playbook');

    await user.click(nextButton);

    expect(
      await screen.findByText(
        /Review and optionally exclude systems from your selection\./i,
      ),
    ).toBeInTheDocument();
  });
});
