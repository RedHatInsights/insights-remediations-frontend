import React from 'react';
import ActionsResolvedCard from './ActionsResolvedCard';
import { mount } from '@cypress/react18';
import { Provider } from 'react-redux';

const testStatus = {
  status: 'fulfilled',
  data: {
    summary: {
      resolved: 50,
      total: 100,
    },
  },
};

const MountActionsResolvedCard = () => {
  return (
    <Provider>
      <ActionsResolvedCard status="fulfilled" />
    </Provider>
  );
};

describe('ActionResolvedCard tests', () => {
  beforeEach(() => {
    //cy.mountWithContext(MoundActionsResolvedCard);
    cy.mount(MountActionsResolvedCard);
    cy.get('div[class*="skeleton"]').should('not.exist');
  });
  it('renders correctly fulfilled component', () => {
    //mount(<ActionsResolvedCard status={testStatus} />);
    cy.get('.pf-v5-c-card__header-main').contains('Actions Resolved');
    cy.get('.pf-v5-c-progress__status > .pf-v5-c-progress__measure').contains(
      '50 of 100'
    );
  });
  it('renders correctly not loading component', () => {
    const loadingStatus = { ...testStatus, status: 'loading' };
    mount(<ActionsResolvedCard status={loadingStatus} />);
    cy.get('.pf-v5-c-card__body').find('.pf-v5-c-skeleton');
  });
});
