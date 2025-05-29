import React from 'react';
import { ExecuteModal } from '../ExecuteModal';
import { queryHelpers, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

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

describe('Execute modal', () => {
  it('renders ExecuteModal component with correct connection type when given data', () => {
    const closeFn = jest.fn();

    render(
      <ExecuteModal
        isOpen={true}
        onClose={closeFn}
        showRefresh={false}
        remediationId={'id'}
        data={data}
        etag={'etag'}
        isLoading={false}
        issueCount={1}
        remediationStatus={'initial'}
        runRemediation={() => null}
        setEtag={() => null}
      />
    );

    expect(screen.getByTestId('execute-modal')).toBeVisible();

    const queryAllByLabel = queryHelpers.queryAllByAttribute.bind(
      null,
      'data-label'
    );

    const connectionTypeColumn = queryAllByLabel(
      screen.getByRole('tablebody'),
      'Connection type'
    );

    expect(connectionTypeColumn[0]).toHaveTextContent(
      'Satellite 1 (connected)'
    );
    expect(connectionTypeColumn[1]).toHaveTextContent('Direct connection');
    expect(connectionTypeColumn[2]).toHaveTextContent('Not available');
  });

  it('renders ExecuteModal with refresh message when showRefresh is true', () => {
    const closeFn = jest.fn();

    render(
      <ExecuteModal
        isOpen={true}
        onClose={closeFn}
        showRefresh={true}
        remediationId={'id'}
        data={data}
        etag={'etag'}
        isLoading={false}
        issueCount={1}
        remediationStatus={'initial'}
        setEtag={() => null}
      />
    );

    expect(
      screen.getByText(
        'The connection status of systems associated with this Playbook has changed. Please review again.'
      )
    ).toBeVisible();
  });
});
