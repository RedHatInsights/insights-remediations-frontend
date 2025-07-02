import React from 'react';
import FormRenderer from '@data-driven-forms/react-form-renderer/form-renderer';
import FormTemplate from '@data-driven-forms/pf4-component-mapper/form-template';
import IssueResolution from '../../RemediationsModal/steps/issueResolution';
import {
  RESOLUTIONS,
  SELECTED_RESOLUTIONS,
  SYSTEMS,
} from '../../../Utilities/utils';
import { remediationWizardTestData } from '../testData';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

const RendererWrapper = (props) => (
  <FormRenderer
    onSubmit={() => {}}
    FormTemplate={FormTemplate}
    componentMapper={{
      'issue-resolution': {
        component: IssueResolution,
        issues: remediationWizardTestData.issues,
      },
    }}
    initialValues={{
      [SELECTED_RESOLUTIONS]: {
        testId: 'test2',
      },
      [RESOLUTIONS]: remediationWizardTestData.resolutions,
      [SYSTEMS]: remediationWizardTestData.systems,
    }}
    schema={{ fields: [] }}
    {...props}
    subscription={{ values: true }}
  />
);

const createSchema = () => ({
  fields: [
    {
      name: 'test',
      component: 'issue-resolution',
      issue: {
        id: 'testId',
        description: 'description',
      },
    },
  ],
});

describe('ReviewActions', () => {
  let initialProps;
  let onSubmit;
  const user = userEvent.setup();

  beforeEach(() => {
    initialProps = {
      issues: remediationWizardTestData.issues,
    };
    onSubmit = jest.fn();
  });

  it('should render resolutions correctly', async () => {
    render(<RendererWrapper schema={createSchema({})} {...initialProps} />);

    expect(
      screen.getAllByRole('option', { 'aria-selected': 'true' }),
    ).toHaveLength(2);
    expect(
      screen.getAllByRole('option', { 'aria-selected': 'false' }),
    ).toHaveLength(2);
  });

  it('should select another resolution correctly', async () => {
    render(<RendererWrapper schema={createSchema({})} {...initialProps} />);

    await user.click(screen.getAllByRole('option')[0]);

    expect(screen.getAllByRole('option')[0]).toHaveClass('pf-m-selected');
    expect(screen.getAllByRole('option')[1]).not.toHaveClass('pf-m-selected');
  });

  it('should submit the form', async () => {
    render(
      <RendererWrapper
        schema={createSchema({})}
        {...initialProps}
        onSubmit={onSubmit}
      />,
    );

    await user.click(
      screen.getByRole('button', {
        name: /submit/i,
      }),
    );

    expect(onSubmit).toHaveBeenCalledTimes(1);
  });
});
