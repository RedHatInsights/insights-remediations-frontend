import React from 'react';
import FormRenderer from '@data-driven-forms/react-form-renderer/form-renderer';
import FormTemplate from '@data-driven-forms/pf4-component-mapper/form-template';
import configureStore from 'redux-mock-store';
import promiseMiddleware from 'redux-promise-middleware';
import {
  EXISTING_PLAYBOOK,
  EXISTING_PLAYBOOK_SELECTED,
  SYSTEMS,
} from '../../../Utilities/utils';
import { remediationWizardTestData } from '../testData';
import ReviewSystems from '../../RemediationsModal/steps/reviewSystems';
import { Provider } from 'react-redux';
import ReducerRegistry from '@redhat-cloud-services/frontend-components-utilities/ReducerRegistry';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

jest.mock('../../RemediationsModal/common/SystemsTable', () => ({
  __esModule: true,

  default: () => <table></table>,
}));

jest.mock('../../../Utilities/utils', () => {
  return {
    dedupeArray: jest.fn((props) => props),
    getPlaybookSystems: jest.fn(() => []),
    SYSTEMS: 'systems',
  };
});

const RendererWrapper = (props) => (
  <FormRenderer
    onSubmit={() => {}}
    FormTemplate={FormTemplate}
    componentMapper={{
      'review-systems': {
        component: ReviewSystems,
        issues: remediationWizardTestData.issues,
        systems: remediationWizardTestData.systems,
        allSystems: remediationWizardTestData.systems,
        registry: {},
      },
    }}
    initialValues={{
      [EXISTING_PLAYBOOK_SELECTED]: true,
      [EXISTING_PLAYBOOK]: {
        issues: [
          {
            id: 'test',
            systems: [{ id: 'test', display_name: 'test' }],
          },
        ],
      },
    }}
    schema={{ fields: [] }}
    {...props}
  />
);

const schema = {
  fields: [
    {
      name: SYSTEMS,
      component: 'review-systems',
      issues: [
        {
          id: 'test',
          systems: [{ id: 'test', display_name: 'test' }],
        },
      ],
      systems: ['test2'],
      allSystems: ['test', 'test2'],
      registry: new ReducerRegistry({}, [promiseMiddleware]),
    },
  ],
};

describe('ReviewSystems', () => {
  let mockStore = configureStore([promiseMiddleware]);

  const initialState = {
    hostReducer: {
      hosts: [{ id: 'test2', display_name: 'test2' }],
    },
  };

  it('should render correctly', async () => {
    const store = mockStore(initialState);
    render(
      <Provider store={store}>
        <RendererWrapper schema={schema} />
      </Provider>,
    );

    expect(screen.getByTestId('wizard-review-systems')).toBeVisible();
  });
});
