import React from 'react';
import ActionsResolvedCard from './ActionsResolvedCard';
import { mount } from '@cypress/react18';

const testStatus = {
  status: 'fulfilled',
  data: {
    summary: {
      resolved: 50,
      total: 100,
    },
  },
};

describe('ActionResolvedCard tests', () => {
  it('renders correctly fulfilled component', () => {
    mount(<ActionsResolvedCard status={testStatus} />);
    cy.get('.pf-c-card__header').contains('Actions Resolved');
    cy.get('.pf-c-card__body').contains('50 of 100');
  });
  it('renders correctly not loading component', () => {
    const loadingStatus = { ...testStatus, status: 'loading' };
    mount(<ActionsResolvedCard status={loadingStatus} />);
    cy.get('.pf-c-card__body').find('.pf-c-skeleton');
  });
});
