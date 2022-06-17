import React from 'react';
import { mount } from 'enzyme';
import { BrowserRouter as Router } from 'react-router-dom';
import { SystemsTableWithContext } from '../../RemediationsModal/common/SystemsTable';

jest.mock(
  '@redhat-cloud-services/frontend-components/Inventory/InventoryTable',
  () =>
    jest.fn(() => (
      <div className="testInventroyComponentChild">
        <div>This is child</div>
      </div>
    ))
);

describe('SystemsTable', () => {
  it('should render correctly', async () => {
    let wrapper;
    wrapper = mount(
      <Router>
        <SystemsTableWithContext
          allSystemsNamed={[]}
          allSystems={[]}
          disabledColumns={['updated']}
        />
      </Router>
    );

    expect(wrapper.find(SystemsTableWithContext)).toHaveLength(1);
  });
});
