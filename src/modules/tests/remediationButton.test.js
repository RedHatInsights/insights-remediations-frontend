import React from 'react';
import RemediationButton from '../RemediationsButton';
import { CAN_REMEDIATE } from '../../Utilities/utils';
import { remediationWizardTestData } from './testData';
import useChrome from '@redhat-cloud-services/frontend-components/useChrome';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import { getTooltipContent } from '../../Utilities/helpers';

jest.mock('@redhat-cloud-services/frontend-components/useChrome', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('../../Utilities/Hooks/useFeatureFlag', () => ({
  useFeatureFlag: jest.fn(),
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
  hasSelected: true,
};

const user = userEvent.setup();
const { useFeatureFlag } = require('../../Utilities/Hooks/useFeatureFlag');

describe('RemediationButton', () => {
  let tmpInsights;
  beforeEach(() => {
    tmpInsights = global.insights;
    // Default to feature flag disabled
    useFeatureFlag.mockReturnValue(false);
    jest.clearAllMocks();
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

  describe('tooltipContent logic', () => {
    it('should show permissions tooltip when user has no permissions regardless of selection count', async () => {
      useChrome.mockImplementation(() => ({
        getUserPermissions: jest.fn(
          () => new Promise((resolve) => resolve([])),
        ),
      }));

      render(<RemediationButton {...initialProps} hasSelected={false} />);

      await waitFor(() => {
        expect(
          screen.getByTestId('remediationButton-no-permissions'),
        ).toBeInTheDocument();
      });

      // Check that the button is disabled and wrapped in a tooltip
      const button = screen.getByTestId('remediationButton-no-permissions');
      expect(button).toBeDisabled();
    });

    it('should show permissions tooltip when user has no permissions even with items selected', async () => {
      useChrome.mockImplementation(() => ({
        getUserPermissions: jest.fn(
          () => new Promise((resolve) => resolve([])),
        ),
      }));

      render(<RemediationButton {...initialProps} hasSelected={true} />);

      await waitFor(() => {
        expect(
          screen.getByTestId('remediationButton-no-permissions'),
        ).toBeInTheDocument();
      });

      // Check that the button is disabled regardless of selection count
      const button = screen.getByTestId('remediationButton-no-permissions');
      expect(button).toBeDisabled();
    });

    it('should render button without tooltip when user has permissions and items are selected', async () => {
      useChrome.mockImplementation(() => ({
        getUserPermissions: jest.fn(
          () =>
            new Promise((resolve) => resolve([{ permission: CAN_REMEDIATE }])),
        ),
      }));

      render(<RemediationButton {...initialProps} hasSelected={true} />);

      await waitFor(() => {
        expect(
          screen.getByTestId('remediationButton-with-permissions'),
        ).toBeInTheDocument();
      });

      // When user has permissions and items selected, button should be enabled
      const button = screen.getByTestId('remediationButton-with-permissions');
      expect(button).toBeEnabled();
    });

    it('should show selection tooltip when user has permissions but no items selected', async () => {
      const TestWrapper = () => {
        const hasPermissions = true;
        const hasSelected = false;

        const tooltipContent = getTooltipContent(hasPermissions, hasSelected);

        return <div data-testid="tooltip-content">{tooltipContent}</div>;
      };

      render(<TestWrapper />);

      expect(screen.getByTestId('tooltip-content')).toHaveTextContent(
        'Select one or more items from the table below.',
      );
    });

    it('should return null for tooltip when user has permissions and items selected', async () => {
      const TestWrapper = () => {
        const hasPermissions = true;
        const hasSelected = true;

        const tooltipContent = getTooltipContent(hasPermissions, hasSelected);

        return (
          <div data-testid="tooltip-content">
            {tooltipContent || 'no-tooltip'}
          </div>
        );
      };

      render(<TestWrapper />);

      expect(screen.getByTestId('tooltip-content')).toHaveTextContent(
        'no-tooltip',
      );
    });
  });
});
