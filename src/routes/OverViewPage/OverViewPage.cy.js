import React from 'react';
import { OverViewPage } from '../../routes/OverViewPage/OverViewPage';
import { DEFAULT_RENDER_OPTIONS } from '../../Frameworks/AsyncTableTools/AsyncTableTools/utils/testHelpers';

const MountOverviewPage = () => {
  return <OverViewPage />;
};

describe('OverviewPage tests', () => {
  beforeEach(() => {
    cy.mountWithContext(MountOverviewPage, DEFAULT_RENDER_OPTIONS);
  });
  it('renders the table correctly', () => {
    cy.get('body');
  });
});
