import React from 'react';
import FormRenderer from '@data-driven-forms/react-form-renderer/form-renderer';
import FormTemplate from '@data-driven-forms/pf4-component-mapper/form-template';
import SelectPlaybook from '../../RemediationsModal/steps/selectPlaybook';
import TextField from '@data-driven-forms/pf4-component-mapper/text-field';
import componentTypes from '@data-driven-forms/react-form-renderer/component-types';
import promiseMiddleware from 'redux-promise-middleware';
import configureStore from 'redux-mock-store';
import { selectPlaybookFields } from '../../RemediationsModal/schema';
import { remediationWizardTestData } from '../testData';
import { Provider } from 'react-redux';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { getRemediation } from '../../../api';

jest.mock('../../../api', () => ({
  ...jest.requireActual('../../../api'),
  getRemediations: jest.fn(
    () =>
      new Promise((resolve) =>
        resolve({
          data: [
            { id: 'remediationId', name: 'test-remediation-1' },
            { id: '1234', name: 'bretheren' },
          ],
        })
      )
  ),
  getRemediation: jest.fn(
    () =>
      new Promise((resolve) =>
        resolve({
          data: [{ id: 'remediationId', name: 'test-remediation-single' }],
        })
      )
  ),
}));

const RendererWrapper = (props) => (
  <FormRenderer
    onSubmit={() => {}}
    FormTemplate={FormTemplate}
    componentMapper={{
      [componentTypes.TEXT_FIELD]: TextField,
      'select-playbook': {
        component: SelectPlaybook,
        issues: remediationWizardTestData.issues,
        systems: remediationWizardTestData.systems,
        allSystems: remediationWizardTestData.systems,
      },
      ['review-step']: TextField,
    }}
    schema={{ fields: [] }}
    {...props}
  />
);
const remediationsList = [
  {
    name: 'aaaa',
  },
  {
    name: 'aaaaaaa',
  },
  {
    name: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
  },
  {
    name: 'asddfgd',
  },
  {
    name: 'asdf',
  },
];

const createSchema = () => ({
  fields: selectPlaybookFields(remediationsList),
});

describe('SelectPlaybook', () => {
  let initialProps;
  let onSubmit;

  let mockStore = configureStore([promiseMiddleware]);

  const initialState = {
    hostReducer: {
      hosts: [{ id: 'test2', display_name: 'test2' }],
    },
    resolutionsReducer: {
      isLoading: false,
      resolutions: remediationWizardTestData.resolutions,
      errors: [],
      warnings: [],
    },
  };

  beforeEach(() => {
    onSubmit = jest.fn();
  });

  it('should render correctly without remediations and show Skeleton loader', async () => {
    const store = mockStore(initialState);
    render(
      <Provider store={store}>
        <RendererWrapper schema={createSchema({})} {...initialProps} />
      </Provider>
    );
    expect(screen.getByLabelText('Add to existing playbook')).toBeVisible();
    expect(screen.getByLabelText('Create new playbook')).toBeVisible();
    expect(
      screen.queryByLabelText('Select an existing playbook')
    ).not.toBeInTheDocument();
    expect(screen.getByTestId('skeleton-loader')).toBeVisible();
  });

  it('should populate existing playbooks dropdown', async () => {
    const store = mockStore(initialState);
    render(
      <Provider store={store}>
        <RendererWrapper schema={createSchema({})} {...initialProps} />
      </Provider>
    );

    await waitFor(() => {
      expect(screen.queryByTestId('skeleton-loader')).not.toBeInTheDocument();
    });

    await waitFor(() => {
      expect(
        screen.getByRole('combobox', {
          name: /type to filter/i,
        })
      ).toBeVisible();
    });
  });

  it('should use type ahead on existing playbooks dropdown', async () => {
    const store = mockStore(initialState);
    render(
      <Provider store={store}>
        <RendererWrapper schema={createSchema({})} {...initialProps} />
      </Provider>
    );

    await waitFor(() => {
      expect(screen.queryByTestId('skeleton-loader')).not.toBeInTheDocument();
    });

    const typeaheadBox = screen.getByRole('combobox', {
      name: /type to filter/i,
    });
    await userEvent.click(typeaheadBox);

    expect(
      screen.getByRole('option', {
        name: /test-remediation-1/i,
      })
    ).toBeVisible();

    expect(
      screen.getByRole('option', {
        name: /bretheren/i,
      })
    ).toBeVisible();

    await userEvent.type(typeaheadBox, 'br');

    expect(
      screen.queryByRole('option', {
        name: /test-remediation-1/i,
      })
    ).not.toBeInTheDocument();

    expect(
      screen.getByRole('option', {
        name: /bretheren/i,
      })
    ).toBeVisible();
  });

  it('should display no results found on typeahead', async () => {
    const store = mockStore(initialState);
    render(
      <Provider store={store}>
        <RendererWrapper schema={createSchema({})} {...initialProps} />
      </Provider>
    );

    await waitFor(() => {
      expect(screen.queryByTestId('skeleton-loader')).not.toBeInTheDocument();
    });

    const typeaheadBox = screen.getByRole('combobox', {
      name: /type to filter/i,
    });
    await userEvent.click(typeaheadBox);

    expect(
      screen.getByRole('option', {
        name: /test-remediation-1/i,
      })
    ).toBeVisible();

    expect(
      screen.getByRole('option', {
        name: /bretheren/i,
      })
    ).toBeVisible();

    await userEvent.type(typeaheadBox, 'tooted');

    expect(
      screen.queryByRole('option', {
        name: /test-remediation-1/i,
      })
    ).not.toBeInTheDocument();

    expect(
      screen.queryByRole('option', {
        name: /bretheren/i,
      })
    ).not.toBeInTheDocument();

    expect(
      screen.getByRole('option', {
        name: /no results found for "tooted"/i,
      })
    ).toBeVisible();
  });

  it('should call getRemediation on select', async () => {
    const store = mockStore(initialState);
    render(
      <Provider store={store}>
        <RendererWrapper schema={createSchema({})} {...initialProps} />
      </Provider>
    );

    await waitFor(() => {
      expect(screen.queryByTestId('skeleton-loader')).not.toBeInTheDocument();
    });

    const typeaheadBox = screen.getByRole('combobox', {
      name: /type to filter/i,
    });
    await userEvent.click(typeaheadBox);

    await userEvent.click(
      screen.queryByRole('option', {
        name: /test-remediation-1/i,
      })
    );

    expect(getRemediation).toHaveBeenCalled();
  });

  it('should be able to create new playbook', async () => {
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

    await userEvent.click(screen.getByLabelText('Add to existing playbook'));
    await userEvent.type(
      screen.getByLabelText('Name your playbook'),
      'new-playbook'
    );

    await waitFor(() => {
      expect(
        screen.getByRole('textbox', { value: /new-playbook/i })
      ).toBeInTheDocument();
    });
  });

  it('should display resolutions warninng panel', async () => {
    const store = mockStore({
      ...initialState,
      resolutionsReducer: {
        ...initialState.resolutionsReducer,
        warnings: ['some-warning'],
      },
    });
    render(
      <Provider store={store}>
        <RendererWrapper
          schema={createSchema({})}
          {...initialProps}
          onSubmit={onSubmit}
        />
      </Provider>
    );

    screen.getByRole('heading', {
      name: /warning alert: there was 1 error while fetching resolutions for your issues!/i,
    });
  });

  it('should display resolutions errors panel', async () => {
    const store = mockStore({
      ...initialState,
      resolutionsReducer: {
        ...initialState.resolutionsReducer,
        errors: ['some-error'],
      },
    });
    render(
      <Provider store={store}>
        <RendererWrapper
          schema={createSchema({})}
          {...initialProps}
          onSubmit={onSubmit}
        />
      </Provider>
    );

    screen.getByRole('heading', { name: /unexpected error/i });
  });
});
