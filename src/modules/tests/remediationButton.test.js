import React from 'react';
import RemediationButton from '../RemediationsButton';
import { CAN_REMEDIATE } from '../../Utilities/utils';
import { remediationWizardTestData } from './testData';
import useChrome from '@redhat-cloud-services/frontend-components/useChrome';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';

jest.mock('@redhat-cloud-services/frontend-components/useChrome', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('../../modules/RemediationsModal/RemediationsWizard', () => ({
  __esModule: true,
  default: jest.fn((props) => (
    <div {...props} data-testid="remediation-wizard-mock">
      Remediation Wizard
    </div>
  )),
}));

let initialProps = {
  dataProvider: jest.fn(() =>
    Promise.resolve({
      issues: remediationWizardTestData.issues,
      systems: ['something'],
    }),
  ),
  isDisabled: false,
  onRemediationCreated: jest.fn(),
};

const user = userEvent.setup();

describe('RemediationButton', () => {
  let tmpInsights;
  beforeEach(() => {
    tmpInsights = global.insights;
  });

  afterEach(() => {
    global.insights = tmpInsights;
  });

  it('should open remediation wizard with permissions', async () => {
    useChrome.mockImplementation(() => ({
      getUserPermissions: jest.fn(
        () =>
          new Promise((resolve) => resolve([{ permission: CAN_REMEDIATE }])),
      ),
    }));

    render(<RemediationButton {...initialProps} />);

    await waitFor(() => {
      expect(
        screen.getByTestId('remediationButton-with-permissions'),
      ).toBeInTheDocument();
    });

    await user.click(screen.getByTestId('remediationButton-with-permissions'));

    expect(screen.getByTestId('remediation-wizard-mock')).toBeVisible();
  });

  it('should not open wizard without permissions', async () => {
    useChrome.mockImplementation(() => ({
      getUserPermissions: jest.fn(() => new Promise((resolve) => resolve([]))),
    }));

    render(<RemediationButton {...initialProps} />);

    expect(
      screen.getByTestId('remediationButton-no-permissions'),
    ).toBeInTheDocument();

    expect(
      screen.queryByTestId('remediation-wizard-mock'),
    ).not.toBeInTheDocument();
  });
});
