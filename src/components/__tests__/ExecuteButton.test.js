/* eslint-disable camelcase */
import React from 'react';
import ExecuteButton from '../ExecuteButton';
import * as api from '../../api';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import { BrowserRouter as Router } from 'react-router-dom';

// eslint-disable-next-line no-import-assign
api.downloadPlaybook = jest.fn();
global.insights = {
  chrome: {
    auth: {
      getUser: () =>
        new Promise(() => ({
          entitlements: { smart_management: { isEntitled: true } },
        })),
    },
  },
};

const data = [
  {
    executor_id: '722ec903-f4b5-4b1f-9c2f-23fc7b0ba390',
    executor_type: 'satellite',
    executor_name: 'Satellite 1 (connected)',
    system_count: 1,
    connection_status: 'connected',
  },
  {
    executor_id: null,
    executor_type: null,
    executor_name: null,
    system_count: 4,
    connection_status: 'no_executor',
  },
];

describe('Execute button', () => {
  test('Renders execute button as disabled', async () => {
    render(
      <ExecuteButton
        data={[]}
        isDisabled={true}
        remediationStatus={'pending'}
        issueCount={1}
        remediation={{
          id: 'id',
          issues: [
            {
              systems: [
                {
                  display_name: 'test',
                  hostname: 'test2',
                  id: 'id',
                  resolved: false,
                },
              ],
            },
          ],
        }}
        getConnectionStatus={() => null}
      />
    );

    expect(
      screen.getByRole('button', { 'aria-disabled': 'true' })
    ).toHaveTextContent('Execute');
  });

  test('Renders execute button as enabled', () => {
    render(
      <ExecuteButton
        data={data}
        isLoading
        remediationStatus={'fullfiled'}
        issueCount={1}
        remediation={{
          id: 'id',
          issues: [
            {
              systems: [
                {
                  display_name: 'test',
                  hostname: 'test2',
                  id: 'id',
                  resolved: false,
                },
              ],
            },
          ],
        }}
        isDisabled={false}
        getConnectionStatus={() => null}
      />
    );

    expect(
      screen.getByRole('button', { 'aria-disabled': 'false' })
    ).toHaveTextContent('Execute');
  });

  test('Opens execute modal on execute button click', async () => {
    render(
      <Router>
        <ExecuteButton
          data={data}
          isLoading
          remediationStatus={'fullfiled'}
          issueCount={1}
          remediation={{
            id: 'id',
            issues: [
              {
                systems: [
                  {
                    display_name: 'test',
                    hostname: 'test2',
                    id: 'id',
                    resolved: false,
                  },
                ],
              },
            ],
          }}
          isDisabled={false}
          getConnectionStatus={() => null}
        />
      </Router>
    );

    expect(screen.queryByTestId('execute-button')).not.toBeInTheDocument();

    await userEvent.click(screen.getByTestId('execute-button-enabled'));
    await waitFor(() =>
      expect(screen.getByTestId('execute-modal')).toBeVisible()
    );
  });
});
