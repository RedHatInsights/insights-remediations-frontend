import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import promiseMiddleware from 'redux-promise-middleware';

import FormRenderer from '@data-driven-forms/react-form-renderer/form-renderer';
import FormTemplate from '@data-driven-forms/pf4-component-mapper/form-template';
import TextField from '@data-driven-forms/pf4-component-mapper/text-field';
import componentTypes from '@data-driven-forms/react-form-renderer/component-types';

import SelectPlaybook from '../../RemediationsModal/steps/selectPlaybook';
import { selectPlaybookFields } from '../../RemediationsModal/schema';
import { remediationWizardTestData } from '../testData';
import { getRemediation } from '../../../api';
import { withTableState } from '../../../__testUtils__/withTableState';

jest.mock('../../../api', () => ({
  ...jest.requireActual('../../../api'),
  getRemediations: jest.fn(() =>
    Promise.resolve({
      data: [
        { id: 'remediationId', name: 'test-remediation-1' },
        { id: '1234', name: 'bretheren' },
      ],
    }),
  ),
  getRemediation: jest.fn(() =>
    Promise.resolve({
      data: [{ id: 'remediationId', name: 'test-remediation-single' }],
    }),
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
  { name: 'aaaa' },
  { name: 'aaaaaaa' },
  { name: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa' },
  { name: 'asddfgd' },
  { name: 'asdf' },
];

const createSchema = () => ({
  fields: selectPlaybookFields(remediationsList),
});

// Reusable test render that wires Redux **and** TableState
const renderWithProviders = (ui, store, tableProps = {}) =>
  render(withTableState(<Provider store={store}>{ui}</Provider>, tableProps));

describe('SelectPlaybook', () => {
  const mockStore = configureStore([promiseMiddleware]);

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

  let onSubmit;

  beforeEach(() => {
    onSubmit = jest.fn();
  });

  it('renders correctly without remediations and shows Skeleton loader', async () => {
    const store = mockStore(initialState);
    renderWithProviders(<RendererWrapper schema={createSchema()} />, store);

    expect(screen.getByLabelText('Add to existing playbook')).toBeVisible();
    expect(screen.getByLabelText('Create new plan')).toBeVisible();
    expect(
      screen.queryByLabelText('Select an existing playbook'),
    ).not.toBeInTheDocument();
    expect(screen.getByTestId('skeleton-loader')).toBeVisible();
  });

  it('populates existing playbooks dropdown', async () => {
    const store = mockStore(initialState);
    renderWithProviders(<RendererWrapper schema={createSchema()} />, store);

    await waitFor(() => {
      expect(screen.queryByTestId('skeleton-loader')).not.toBeInTheDocument();
    });

    expect(
      screen.getByRole('combobox', { name: /type to filter/i }),
    ).toBeVisible();
  });

  it('filters with type‑ahead', async () => {
    const store = mockStore(initialState);
    renderWithProviders(<RendererWrapper schema={createSchema()} />, store);

    await waitFor(() => {
      expect(screen.queryByTestId('skeleton-loader')).not.toBeInTheDocument();
    });

    const typeaheadBox = screen.getByRole('combobox', {
      name: /type to filter/i,
    });

    await userEvent.click(typeaheadBox);
    expect(
      screen.getByRole('option', { name: /test-remediation-1/i }),
    ).toBeVisible();
    expect(screen.getByRole('option', { name: /bretheren/i })).toBeVisible();

    await userEvent.type(typeaheadBox, 'br');

    expect(
      screen.queryByRole('option', { name: /test-remediation-1/i }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole('option', { name: /bretheren/i })).toBeVisible();
  });

  it('shows "no results found" on type‑ahead', async () => {
    const store = mockStore(initialState);
    renderWithProviders(<RendererWrapper schema={createSchema()} />, store);

    await waitFor(() => {
      expect(screen.queryByTestId('skeleton-loader')).not.toBeInTheDocument();
    });

    const typeaheadBox = screen.getByRole('combobox', {
      name: /type to filter/i,
    });
    await userEvent.click(typeaheadBox);
    await userEvent.type(typeaheadBox, 'tooted');

    expect(
      screen.getByRole('option', {
        name: /no results found for "tooted"/i,
      }),
    ).toBeVisible();
  });

  it('calls getRemediation on select', async () => {
    const store = mockStore(initialState);
    renderWithProviders(<RendererWrapper schema={createSchema()} />, store);

    await waitFor(() => {
      expect(screen.queryByTestId('skeleton-loader')).not.toBeInTheDocument();
    });

    await userEvent.click(
      screen.getByRole('combobox', { name: /type to filter/i }),
    );
    await userEvent.click(
      screen.getByRole('option', { name: /test-remediation-1/i }),
    );

    expect(getRemediation).toHaveBeenCalled();
  });

  it('creates a new playbook', async () => {
    const store = mockStore(initialState);
    renderWithProviders(
      <RendererWrapper schema={createSchema()} onSubmit={onSubmit} />,
      store,
    );

    await userEvent.click(screen.getByLabelText('Add to existing playbook'));
    await userEvent.type(
      screen.getByLabelText('Name your playbook'),
      'new-playbook',
    );

    await waitFor(() => {
      expect(
        screen.getByRole('textbox', { value: /new-playbook/i }),
      ).toBeInTheDocument();
    });
  });

  it('displays resolutions error panel', () => {
    const store = mockStore({
      ...initialState,
      resolutionsReducer: {
        ...initialState.resolutionsReducer,
        errors: ['some-error'],
      },
    });

    renderWithProviders(
      <RendererWrapper schema={createSchema()} onSubmit={onSubmit} />,
      store,
    );

    screen.getByRole('heading', { name: /unexpected error/i });
  });
});
