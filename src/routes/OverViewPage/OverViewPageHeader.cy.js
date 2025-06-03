import React from 'react';
import { mount } from 'cypress/react';
import { OverViewPageHeader } from './OverViewPageHeader';

describe('<OverViewPageHeader />', () => {
  //   Button should appear when hasRemediations is true
  it('shows the “Launch Quick Start” button (hasRemediations = true)', () => {
    mount(<OverViewPageHeader hasRemediations={true} />);
    cy.contains('button', 'Launch Quick Start').should('be.visible');
  });

  //  Button should not appear when hasRemediations is false
  it('hides the button (hasRemediations = false)', () => {
    mount(<OverViewPageHeader hasRemediations={false} />);
    cy.contains('button', 'Launch Quick Start').should('not.exist');
  });
});
