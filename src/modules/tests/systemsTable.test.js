import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SystemsTableWithContext } from '../RemediationsModal/common/SystemsTable';

jest.mock(
  '@redhat-cloud-services/frontend-components/Inventory/InventoryTable',
  () =>
    jest.fn(() => (
      <div data-testid="systems-table">
        <div>This is child</div>
      </div>
    ))
);

describe('SystemsTable', () => {
  it('should render correctly', async () => {
    render(
      <SystemsTableWithContext
        allSystemsNamed={[]}
        allSystems={[]}
        disabledColumns={['updated']}
      />
    );

    expect(screen.getByTestId('systems-table')).toBeVisible();
  });
});
