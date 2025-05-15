import React from 'react';
//import RemediationsTable from './RemediationsTable';
import { OverViewPage } from '../../routes/OverViewPage/OverViewPage';
import { Home } from '../../routes/Home';
import { DEFAULT_RENDER_OPTIONS } from '../../Frameworks/AsyncTableTools/AsyncTableTools/utils/testHelpers';

const MountRemediationsTable = () => {
  return <RemediationsTable />;
};

const MountOverviewPage = () => {
  return <OverViewPage />;
};

const MountHome = () => {
  return <Home />;
};

describe('OverviewPage tests', () => {
  beforeEach(() => {
    cy.mountWithContext(MountOverviewPage);
  });
  it('renders the table correctly', () => {
    cy.get('body');
  });
});
