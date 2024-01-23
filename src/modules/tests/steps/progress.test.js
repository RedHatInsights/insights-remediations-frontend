import React from 'react';
import { render, screen } from '@testing-library/react';
import Progress from '../../RemediationsModal/steps/progress';
import { remediationWizardTestData } from '../testData';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

describe('Progress', () => {
  const user = userEvent.setup();
  it('should render loading progress correctly ', async () => {
    render(
      <Progress
        onClose={() => null}
        title={'Adding items to the playbook'}
        setOpen={() => null}
        submitRemediation={() => null}
        setState={() => null}
        state={{
          formValues: remediationWizardTestData.formValues,
          percent: 0,
          failed: false,
        }}
      />
    );

    expect(screen.getByTestId('wizard-progress')).toBeVisible();
    expect(screen.getByTestId('finished-create-remediation')).toBeVisible();
    expect(screen.getByTestId('finished-create-remediation')).toHaveTextContent(
      'In progress'
    );
  });

  it('should render success progress with buttons correctly ', async () => {
    const onClose = jest.fn();
    render(
      <Progress
        onClose={onClose}
        title={'Adding items to the playbook'}
        setOpen={() => null}
        submitRemediation={() => null}
        setState={() => null}
        state={{
          formValues: remediationWizardTestData.formValues,
          percent: 100,
          failed: false,
        }}
      />
    );

    expect(screen.getByTestId('finished-create-remediation')).toHaveTextContent(
      'Completed'
    );

    await user.click(screen.getByTestId('OpenPlaybookButton'));

    expect(onClose).toHaveBeenCalled();
  });

  it('should render error progress correctly ', async () => {
    const onClose = jest.fn();
    const setState = jest.fn();
    render(
      <Progress
        onClose={onClose}
        title={'Adding items to the playbook'}
        setOpen={() => null}
        submitRemediation={() => null}
        setState={setState}
        state={{
          formValues: remediationWizardTestData.formValues,
          percent: 10,
          failed: true,
        }}
      />
    );

    expect(screen.getByTestId('finished-create-remediation')).toHaveTextContent(
      'Error'
    );

    await user.click(screen.getByTestId('BackToWizardButton'));
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(setState).toHaveBeenCalledTimes(0);

    await user.click(screen.getByTestId('TryAgainButton'));
    expect(setState).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
