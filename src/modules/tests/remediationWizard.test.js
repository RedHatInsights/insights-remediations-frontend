import React from 'react';
import { remediationWizardTestData } from './testData';
import { RemediationWizard } from '../RemediationsModal/RemediationsWizard';
import configureStore from 'redux-mock-store';
import promiseMiddleware from 'redux-promise-middleware';
import { Provider } from 'react-redux';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

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
  const api = jest.requireActual('../../api/index');
  const { remediationWizardTestData } = jest.requireActual('./testData');
  return {
    __esModule: true,
    ...api,
    getResolutionsBatch: () =>
      Promise.resolve(remediationWizardTestData.issueResolutionsResponse),
  };
});

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
  })
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
      </Provider>
    );

    await screen.findByRole('button', { name: /select playbook/i });
    await screen.findByRole('button', { name: /review systems/i });
    await screen.findByRole('button', { name: /remediation review/i });

    expect(
      screen.getByRole('button', { name: /select playbook/i })
    ).toBeVisible();
    expect(
      screen.getByRole('button', { name: /review systems/i })
    ).toBeVisible();
    expect(
      screen.getByRole('button', { name: /remediation review/i })
    ).toBeVisible();

    expect(
      screen.getByText(
        /you selected to remediate with ansible, which in total includes of which can be remediated by ansible\./i
      )
    ).toBeVisible();
  });
});
