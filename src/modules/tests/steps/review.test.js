import React from 'react';
import FormRenderer from '@data-driven-forms/react-form-renderer/form-renderer';
import FormTemplate from '@data-driven-forms/pf4-component-mapper/form-template';
import { AUTO_REBOOT, RESOLUTIONS, SYSTEMS } from '../../../Utilities/utils';
import promiseMiddleware from 'redux-promise-middleware';
import configureStore from 'redux-mock-store';
import Review from '../../RemediationsModal/steps/review';
import { remediationWizardTestData } from '../testData';
import { Provider } from 'react-redux';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';

jest.mock('../../RemediationsModal/common/SystemsTable', () => ({
  __esModule: true,
  // eslint-disable-next-line react/display-name
  SystemsTableWithContext: () => <table></table>,
}));

const RendererWrapper = (props) => (
  <FormRenderer
    onSubmit={() => {}}
    FormTemplate={FormTemplate}
    componentMapper={{
      review: {
        component: Review,
        data: {
          issues: [
            {
              id: 'testId',
            },
            {
              id: 'testId2',
            },
          ],
          systems: remediationWizardTestData.systems,
        },
        issuesById: remediationWizardTestData.issuesById,
      },
    }}
    initialValues={{
      [RESOLUTIONS]: remediationWizardTestData.resolutions,
      [SYSTEMS]: {
        ...remediationWizardTestData.selectedSystems,
        testId2: ['system2'],
      },
    }}
    schema={{ fields: [] }}
    subscription={{ values: true }}
    {...props}
  />
);

const createSchema = () => ({
  fields: [
    {
      name: AUTO_REBOOT,
      component: 'review',
    },
  ],
});

let mockStore = configureStore([promiseMiddleware]);

const initialState = {
  hostReducer: {
    hosts: [
      { id: 'system', display_name: 'system1' },
      { id: 'system2', display_name: 'system2' },
    ],
  },
};

describe('Review', () => {
  let initialProps;
  let onSubmit;

  beforeEach(() => {
    initialProps = {
      data: {
        issues: remediationWizardTestData.issues,
        systems: remediationWizardTestData.systems,
      },
    };
    onSubmit = jest.fn();
  });

  it('should render correctly', async () => {
    const store = mockStore(initialState);
    render(
      <Provider store={store}>
        <RendererWrapper schema={createSchema({})} {...initialProps} />
      </Provider>
    );

    expect(screen.getByTestId('wizard-review')).toBeVisible();
  });

  it('should change autoreboot correctly', async () => {
    const store = mockStore(initialState);
    render(
      <Provider store={store}>
        <RendererWrapper schema={createSchema({})} {...initialProps} />
      </Provider>
    );

    expect(screen.getByTestId('autoreboot-button')).toHaveTextContent(
      'Turn off autoreboot'
    );
    await userEvent.click(screen.getByTestId('autoreboot-button'));
    expect(screen.getByTestId('autoreboot-button')).toHaveTextContent(
      'Turn on autoreboot'
    );
  });

  it('should sort records correctly', async () => {
    const store = mockStore(initialState);
    render(
      <Provider store={store}>
        <RendererWrapper schema={createSchema({})} {...initialProps} />
      </Provider>
    );

    expect(screen.getAllByRole('cell')[1]).toHaveTextContent(
      'test_description'
    );
    await userEvent.click(screen.getByRole('button', { name: /action/i }));
    expect(screen.getAllByRole('cell')[6]).toHaveTextContent(
      'test_description'
    );
  });

  it('should submit the form', async () => {
    const store = mockStore(initialState);
    render(
      <Provider store={store}>
        <RendererWrapper
          schema={createSchema({})}
          {...initialProps}
          onSubmit={onSubmit}
        />
      </Provider>
    );

    await userEvent.click(screen.getByRole('button', { name: /submit/i }));
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });
});
