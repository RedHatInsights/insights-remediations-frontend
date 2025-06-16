import React from 'react';
import { ExecuteModal } from '../ExecuteModal';
import { queryHelpers, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { withTableState } from '../../../__testUtils__/withTableState';
import { mockRemediationStatus } from '../../../__mocks__/remediationStatus';

describe('Execute modal', () => {
  it('renders ExecuteModal component with correct connection type when given data', () => {
    render(
      withTableState(
        <ExecuteModal
          isOpen
          remediation={{ id: '1', name: 'foo' }}
          remediationStatus={mockRemediationStatus}
          issueCount={3}
          refetchRemediationPlaybookRuns={() => {}}
          onClose={() => {}}
        />
      )
    );

    expect(screen.getByTestId('execute-modal')).toBeVisible();

    const connectionTypeCells = queryHelpers
      .queryAllByAttribute(
        'data-label',
        screen.getByTestId('execute-modal'),
        'Connection type'
      )
      .filter((el) => el.tagName.toLowerCase() === 'td');

    expect(connectionTypeCells).toHaveLength(3);
    expect(connectionTypeCells[0]).toHaveTextContent('Satellite 1 (connected)');
    expect(connectionTypeCells[1]).toHaveTextContent('Direct connection');
    expect(connectionTypeCells[2]).toHaveTextContent('Not available');
  });
});
