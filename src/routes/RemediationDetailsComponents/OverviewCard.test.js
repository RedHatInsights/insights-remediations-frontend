/* eslint-disable react/prop-types */

import React from 'react';
import {
  render,
  screen,
  waitFor,
  waitForElementToBeRemoved,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import OverviewCard from './OverviewCard';
import { PermissionContext } from '../../App';
import * as useVerifyName from '../../Utilities/useVerifyName';
import useRemediations from '../../Utilities/Hooks/api/useRemediations';
import { useAddNotification } from '@redhat-cloud-services/frontend-components-notifications/hooks';

jest.mock('../../Utilities/useVerifyName');
jest.mock('../../Utilities/Hooks/api/useRemediations');
jest.mock(
  '@redhat-cloud-services/frontend-components-notifications/hooks',
  () => ({
    useAddNotification: jest.fn(),
  }),
);
jest.mock('@redhat-cloud-services/frontend-components/InsightsLink', () => {
  return function MockInsightsLink({ to, target, children, ...props }) {
    return (
      <a href={to} target={target} {...props}>
        {children}
      </a>
    );
  };
});

describe('OverviewCard', () => {
  let mockUpdateRemPlan;
  let mockOnNavigateToTab;
  let mockRefetch;
  let mockRefetchAllRemediations;
  let mockFetchRemediationIssues;
  let mockUseVerifyName;
  let mockAddNotification;

  const learnMoreUrl =
    'https://docs.redhat.com/en/documentation/red_hat_lightspeed/1-latest/html-single/red_hat_lightspeed_remediations_guide/index#creating-remediation-plans_red-hat-lightspeed-remediation-guide';

  const mockDetails = {
    id: 'remediation-123',
    name: 'Test Remediation Plan',
    auto_reboot: true,
    archived: false,
    created_by: {
      username: 'testuser',
      first_name: 'Test',
      last_name: 'User',
    },
    created_at: '2024-01-15T10:30:00Z',
    updated_by: {
      username: 'testuser',
      first_name: 'Test',
      last_name: 'User',
    },
    updated_at: '2024-01-20T15:45:00Z',
    issue_count: 2,
    system_count: 10,
  };

  const mockAllRemediations = [
    { id: 'rem-1', name: 'Existing Plan 1' },
    { id: 'rem-2', name: 'Existing Plan 2' },
  ];

  beforeEach(() => {
    jest.clearAllMocks();

    mockUpdateRemPlan = jest.fn().mockResolvedValue(undefined);
    mockOnNavigateToTab = jest.fn();
    mockRefetch = jest.fn().mockResolvedValue(undefined);
    mockRefetchAllRemediations = jest.fn().mockResolvedValue(undefined);
    mockFetchRemediationIssues = jest
      .fn()
      .mockResolvedValue({ data: [], meta: { total: 0 } });
    mockAddNotification = jest.fn();

    mockUseVerifyName = jest.fn().mockReturnValue([false, false]);
    useVerifyName.useVerifyName.mockImplementation(mockUseVerifyName);

    useRemediations.mockReturnValue({
      fetch: mockFetchRemediationIssues,
    });
    useAddNotification.mockReturnValue(mockAddNotification);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  const renderComponent = (
    props = {},
    permissions = { write: true, read: true },
  ) => {
    const defaultProps = {
      details: mockDetails,
      updateRemPlan: mockUpdateRemPlan,
      onNavigateToTab: mockOnNavigateToTab,
      allRemediations: mockAllRemediations,
      refetch: mockRefetch,
      refetchAllRemediations: mockRefetchAllRemediations,
      ...props,
    };

    return render(
      <PermissionContext.Provider value={{ permissions }}>
        <OverviewCard {...defaultProps} />
      </PermissionContext.Provider>,
    );
  };

  describe('Component Rendering', () => {
    it('renders without crashing', () => {
      renderComponent();

      expect(screen.getByText('Overview')).toBeInTheDocument();
    });

    it('displays loading spinner when no details provided', () => {
      renderComponent({ details: null });

      expect(screen.getByRole('progressbar')).toBeInTheDocument();
      expect(screen.queryByText('Overview')).not.toBeInTheDocument();
    });

    it('displays all required information when details are provided', () => {
      renderComponent();

      expect(screen.getByText('Test Remediation Plan')).toBeInTheDocument();
      expect(screen.getByText('Name')).toBeInTheDocument();
      expect(screen.getByText('Actions')).toBeInTheDocument();
      expect(screen.getByText('Systems')).toBeInTheDocument();
      expect(screen.getByText(/Auto-reboot/)).toBeInTheDocument();
    });

    it('toggles the expandable card state', async () => {
      const user = userEvent.setup();

      renderComponent();

      const toggle = screen.getByRole('button', {
        name: /toggle overview card/i,
      });
      expect(toggle).toHaveAttribute('aria-expanded', 'true');

      await user.click(toggle);

      expect(toggle).toHaveAttribute('aria-expanded', 'false');
    });

    it('displays correct action and system counts', () => {
      renderComponent();

      expect(screen.getByText('2 actions')).toBeInTheDocument();
      expect(screen.getByText('10 systems')).toBeInTheDocument();
    });

    it('displays singular form for single action/system', () => {
      const singleDetails = {
        ...mockDetails,
        issue_count: 1,
        system_count: 1,
      };

      renderComponent({ details: singleDetails });

      expect(screen.getByText('1 action')).toBeInTheDocument();
      expect(screen.getByText('1 system')).toBeInTheDocument();
    });
  });

  describe('Resolution Availability', () => {
    it('shows an alert when a resolution option is available', async () => {
      mockFetchRemediationIssues.mockResolvedValueOnce({
        data: [{ id: 'issue-1', resolutions_available: 2 }],
        meta: { total: 1 },
      });

      renderComponent();

      expect(
        await screen.findByText('Resolution options are available.'),
      ).toBeInTheDocument();
      expect(mockFetchRemediationIssues).toHaveBeenCalledWith({
        id: 'remediation-123',
        limit: 50,
        offset: 0,
      });
    });

    it('checks additional pages until it finds a resolution option', async () => {
      mockFetchRemediationIssues
        .mockResolvedValueOnce({
          data: Array.from({ length: 50 }, (_, index) => ({
            id: `issue-${index}`,
            resolutions_available: 1,
          })),
          meta: { total: 51 },
        })
        .mockResolvedValueOnce({
          data: [{ id: 'issue-51', resolutions_available: 2 }],
          meta: { total: 51 },
        });

      renderComponent();

      expect(
        await screen.findByText('Resolution options are available.'),
      ).toBeInTheDocument();
      expect(mockFetchRemediationIssues).toHaveBeenNthCalledWith(1, {
        id: 'remediation-123',
        limit: 50,
        offset: 0,
      });
      expect(mockFetchRemediationIssues).toHaveBeenNthCalledWith(2, {
        id: 'remediation-123',
        limit: 50,
        offset: 50,
      });
    });

    it('removes the checking skeleton when no resolution options exist', async () => {
      mockFetchRemediationIssues
        .mockResolvedValueOnce({
          data: [{ id: 'issue-1', resolutions_available: 1 }],
          meta: { total: 2 },
        })
        .mockResolvedValueOnce({
          data: [{ id: 'issue-2', resolutions_available: 1 }],
          meta: { total: 2 },
        });

      renderComponent();

      const checkingState = await screen.findByText(
        'Checking for resolution options',
      );
      await waitForElementToBeRemoved(checkingState);

      expect(
        screen.queryByText('Resolution options are available.'),
      ).not.toBeInTheDocument();
    });
  });

  describe('Name Editing', () => {
    it('disables inline rename for users without write permission', async () => {
      const user = userEvent.setup();

      renderComponent({}, { write: false, read: true });

      const editButton = screen.getByRole('button', {
        name: /edit remediation plan name/i,
      });
      expect(editButton).toBeDisabled();

      await user.click(editButton);

      expect(
        screen.queryByRole('textbox', { name: /rename input/i }),
      ).not.toBeInTheDocument();
    });

    it('toggles edit mode when pencil icon is clicked', async () => {
      const user = userEvent.setup();

      renderComponent();

      expect(
        screen.queryByDisplayValue('Test Remediation Plan'),
      ).not.toBeInTheDocument();

      await user.click(
        screen.getByRole('button', { name: /edit remediation plan name/i }),
      );

      expect(
        screen.getByDisplayValue('Test Remediation Plan'),
      ).toBeInTheDocument();
    });

    it('shows text input with current name when editing', async () => {
      const user = userEvent.setup();

      renderComponent();

      await user.click(
        screen.getByRole('button', { name: /edit remediation plan name/i }),
      );

      const input = screen.getByRole('textbox', { name: /rename input/i });
      expect(input).toBeInTheDocument();
      expect(input).toHaveFocus();
    });

    it('shows duplicate error when name already exists', async () => {
      const user = userEvent.setup();
      mockUseVerifyName.mockReturnValue([false, true]);

      renderComponent();

      await user.click(
        screen.getByRole('button', { name: /edit remediation plan name/i }),
      );

      const input = screen.getByRole('textbox', { name: /rename input/i });
      await user.clear(input);
      await user.type(input, 'Existing Plan 1');

      expect(
        screen.getByText(
          /A remediation plan with the same name already exists/,
        ),
      ).toBeInTheDocument();
    });

    it('shows empty error when name is empty', async () => {
      const user = userEvent.setup();

      renderComponent();

      await user.click(
        screen.getByRole('button', { name: /edit remediation plan name/i }),
      );
      const input = screen.getByRole('textbox', { name: /rename input/i });

      await user.clear(input);

      expect(
        screen.getByText(/Playbook name cannot be empty/),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /save remediation plan name/i }),
      ).toBeDisabled();
    });

    it('saves name and exits edit mode when save is clicked', async () => {
      const user = userEvent.setup();

      renderComponent();

      await user.click(
        screen.getByRole('button', { name: /edit remediation plan name/i }),
      );
      const input = screen.getByRole('textbox', { name: /rename input/i });

      await user.clear(input);
      await user.type(input, 'Updated Name');

      await user.click(
        screen.getByRole('button', { name: /save remediation plan name/i }),
      );

      await waitFor(() => {
        expect(mockUpdateRemPlan).toHaveBeenCalledWith({
          id: 'remediation-123',
          name: 'Updated Name',
        });
      });

      expect(mockRefetch).toHaveBeenCalled();
      expect(mockRefetchAllRemediations).toHaveBeenCalled();
      expect(mockAddNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Remediation plan renamed',
          variant: 'success',
        }),
      );
      expect(
        screen.queryByRole('textbox', { name: /rename input/i }),
      ).not.toBeInTheDocument();
    });

    it('shows an error notification when save fails', async () => {
      const user = userEvent.setup();
      const consoleErrorSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      mockUpdateRemPlan.mockRejectedValueOnce(new Error('rename failed'));

      renderComponent();

      await user.click(
        screen.getByRole('button', { name: /edit remediation plan name/i }),
      );
      const input = screen.getByRole('textbox', { name: /rename input/i });

      await user.clear(input);
      await user.type(input, 'Updated Name');
      await user.click(
        screen.getByRole('button', { name: /save remediation plan name/i }),
      );

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalled();
        expect(mockAddNotification).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Failed to update playbook name',
            variant: 'danger',
          }),
        );
      });

      expect(mockRefetch).not.toHaveBeenCalled();
      expect(mockRefetchAllRemediations).not.toHaveBeenCalled();
      consoleErrorSpy.mockRestore();
    });

    it('cancels editing when cancel button is clicked', async () => {
      const user = userEvent.setup();

      renderComponent();

      await user.click(
        screen.getByRole('button', { name: /edit remediation plan name/i }),
      );
      const input = screen.getByRole('textbox', { name: /rename input/i });

      await user.clear(input);
      await user.type(input, 'Changed Name');
      await user.click(
        screen.getByRole('button', {
          name: /cancel remediation plan name edit/i,
        }),
      );

      expect(
        screen.queryByRole('textbox', { name: /rename input/i }),
      ).not.toBeInTheDocument();
      expect(screen.getByText('Test Remediation Plan')).toBeInTheDocument();
    });
  });

  describe('Auto-reboot Toggle', () => {
    it('displays switch with correct initial state', () => {
      renderComponent();

      const toggle = screen.getByRole('switch');
      expect(toggle).toBeChecked();
      expect(screen.getByText(/Auto-reboot:\s*On/i)).toBeInTheDocument();
    });

    it('displays switch as unchecked when auto_reboot is false', () => {
      renderComponent({
        details: { ...mockDetails, auto_reboot: false },
      });

      const toggle = screen.getByRole('switch');
      expect(toggle).not.toBeChecked();
      expect(screen.getByText(/Auto-reboot:\s*Off/i)).toBeInTheDocument();
    });

    it('calls updateRemPlan when toggle is changed', async () => {
      const user = userEvent.setup();

      renderComponent();

      await user.click(screen.getByRole('switch'));

      await waitFor(() => {
        expect(mockUpdateRemPlan).toHaveBeenCalledWith({
          id: 'remediation-123',
          auto_reboot: false,
        });
      });
      expect(mockRefetch).toHaveBeenCalled();
    });

    it('reverts the toggle and shows an error notification when update fails', async () => {
      const user = userEvent.setup();
      const consoleErrorSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      mockUpdateRemPlan.mockRejectedValueOnce(new Error('toggle failed'));

      renderComponent();

      const toggle = screen.getByRole('switch');
      await user.click(toggle);

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalled();
        expect(mockAddNotification).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Failed to update auto-reboot setting',
            variant: 'danger',
          }),
        );
      });

      expect(toggle).toBeChecked();
      consoleErrorSpy.mockRestore();
    });
  });

  describe('Navigation', () => {
    it('navigates to actions tab when actions link is clicked', async () => {
      const user = userEvent.setup();

      renderComponent();

      await user.click(screen.getByText('2 actions'));

      expect(mockOnNavigateToTab).toHaveBeenCalledWith(
        null,
        'plannedRemediations:actions',
      );
    });

    it('navigates to systems tab when systems link is clicked', async () => {
      const user = userEvent.setup();

      renderComponent();

      await user.click(screen.getByText('10 systems'));

      expect(mockOnNavigateToTab).toHaveBeenCalledWith(
        null,
        'plannedRemediations:systems',
      );
    });
  });

  describe('Data Display', () => {
    it('displays learn more link with correct URL', () => {
      renderComponent();

      const learnMoreLink = screen.getByRole('link', { name: /learn more/i });
      expect(learnMoreLink).toHaveAttribute('href', learnMoreUrl);
      expect(learnMoreLink).toHaveAttribute('target', '_blank');
    });

    it('displays help icon for actions section', () => {
      renderComponent();

      expect(screen.getByText('Actions')).toBeInTheDocument();
    });
  });

  describe('Props Handling', () => {
    it('handles missing optional props', () => {
      renderComponent({
        onNavigateToTab: undefined,
        updateRemPlan: undefined,
        allRemediations: undefined,
      });

      expect(screen.getByText('Overview')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles details with empty counts', () => {
      renderComponent({
        details: {
          ...mockDetails,
          issue_count: 0,
          system_count: 0,
        },
      });

      expect(screen.getByText('0 actions')).toBeInTheDocument();
      expect(screen.getByText('0 systems')).toBeInTheDocument();
    });

    it('handles very long remediation names', () => {
      const longName = 'A'.repeat(200);

      renderComponent({
        details: { ...mockDetails, name: longName },
      });

      expect(screen.getByText(longName)).toBeInTheDocument();
    });

    it('updates name state when details prop changes', () => {
      const { rerender } = renderComponent();
      const newDetails = { ...mockDetails, name: 'Updated External Name' };

      rerender(
        <PermissionContext.Provider
          value={{ permissions: { write: true, read: true } }}
        >
          <OverviewCard
            details={newDetails}
            updateRemPlan={mockUpdateRemPlan}
            onNavigateToTab={mockOnNavigateToTab}
            allRemediations={mockAllRemediations}
            refetch={mockRefetch}
            refetchAllRemediations={mockRefetchAllRemediations}
          />
        </PermissionContext.Provider>,
      );

      expect(screen.getByText('Updated External Name')).toBeInTheDocument();
    });
  });

  describe('Integration', () => {
    it('calls useVerifyName with correct parameters', () => {
      renderComponent();

      expect(useVerifyName.useVerifyName).toHaveBeenCalledWith(
        'Test Remediation Plan',
        mockAllRemediations,
      );
    });

    it('re-calls useVerifyName when name changes during editing', async () => {
      const user = userEvent.setup();

      renderComponent();

      await user.click(
        screen.getByRole('button', { name: /edit remediation plan name/i }),
      );
      const input = screen.getByRole('textbox', { name: /rename input/i });

      await user.clear(input);
      await user.type(input, 'New Name');

      expect(useVerifyName.useVerifyName).toHaveBeenCalledWith(
        'New Name',
        mockAllRemediations,
      );
    });
  });
});
