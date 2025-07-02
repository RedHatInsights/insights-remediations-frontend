import React from 'react';
import FormRenderer from '@data-driven-forms/react-form-renderer/form-renderer';
import FormTemplate from '@data-driven-forms/pf4-component-mapper/form-template';
import ReviewActions from '../../RemediationsModal/steps/reviewActions';
import { reviewActionsFields } from '../../RemediationsModal//schema';
import promiseMiddleware from 'redux-promise-middleware';
import configureStore from 'redux-mock-store';
import {
  EXISTING_PLAYBOOK,
  EXISTING_PLAYBOOK_SELECTED,
  ISSUES_MULTIPLE,
  RESOLUTIONS,
  SYSTEMS,
} from '../../../Utilities/utils';
import { remediationWizardTestData } from '../testData';
import { Provider } from 'react-redux';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

const RendererWrapper = (props) => (
  <FormRenderer
    onSubmit={() => {}}
    FormTemplate={FormTemplate}
    componentMapper={{
      'review-actions': {
        component: ReviewActions,
        issues: remediationWizardTestData.issues,
      },
    }}
    initialValues={{
      [EXISTING_PLAYBOOK_SELECTED]: true,
      [EXISTING_PLAYBOOK]: {
        auto_reboot: true,
        id: 'id',
        issues: [
          {
            id: 'test',
          },
        ],
        name: 'test',
        needs_reboot: false,
      },
      [RESOLUTIONS]: remediationWizardTestData.resolutions,
      [ISSUES_MULTIPLE]: remediationWizardTestData.issuesMultiple,
      [SYSTEMS]: remediationWizardTestData.selectedSystems,
    }}
    schema={{ fields: [] }}
    {...props}
  />
);

const createSchema = () => ({
  fields: reviewActionsFields,
});

let mockStore = configureStore([promiseMiddleware]);

const initialState = {
  hostReducer: {
    hosts: [{ id: 'test2', display_name: 'test2' }],
  },
};

describe('ReviewActions', () => {
  it('should render correctly', async () => {
    const store = mockStore(initialState);
    render(
      <Provider store={store}>
        <RendererWrapper schema={createSchema()} />
      </Provider>,
    );
    expect(screen.getByTestId('wizard-review-actions')).toBeVisible();
  });
});
