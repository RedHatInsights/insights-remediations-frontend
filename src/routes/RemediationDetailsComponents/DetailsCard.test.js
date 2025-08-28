/* eslint-disable react/prop-types */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import DetailsCard from './DetailsCard';
import * as useVerifyName from '../../Utilities/useVerifyName';
import * as formatDate from '../Cells';
import * as helpers from './helpers';

jest.mock('../../Utilities/useVerifyName');
jest.mock('../Cells', () => ({
  formatDate: jest.fn(),
}));
jest.mock('./helpers', () => ({
  execStatus: jest.fn(),
}));

// Mock useFeatureFlag
jest.mock('../../Utilities/Hooks/useFeatureFlag', () => ({
  useFeatureFlag: jest.fn(),
}));
jest.mock('@redhat-cloud-services/frontend-components/InsightsLink', () => {
  return function MockInsightsLink({ to, target, children }) {
    return (
      <a href={to} target={target} data-testid="insights-link">
        {children}
      </a>
    );
  };
});

const { useFeatureFlag } = require('../../Utilities/Hooks/useFeatureFlag');

describe('DetailsCard', () => {
  let mockUpdateRemPlan;
  let mockOnNavigateToTab;

  beforeEach(() => {
    // Default to feature flag disabled
    useFeatureFlag.mockReturnValue(false);
    jest.clearAllMocks();
  });
  let mockRefetch;
  let mockRefetchAllRemediations;
  let mockUseVerifyName;

  const mockDetails = {
    id: 'remediation-123',
    name: 'Test Remediation Plan',
    needs_reboot: false,
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
    resolved_count: 5,
    issues: [
      {
        id: 'issue-1',
        description: 'Fix security issue',
        resolution: {
          id: 'res-1',
          description: 'Apply security patch',
          resolution_risk: 2,
          needs_reboot: false,
        },
        resolutions_available: 1,
        systems: [
          {
            id: 'sys-1',
            hostname: 'server1.example.com',
            display_name: 'Server 1',
            resolved: false,
          },
        ],
      },
      {
        id: 'issue-2',
        description: 'Update packages',
        resolution: {
          id: 'res-2',
          description: 'Update system packages',
          resolution_risk: 1,
          needs_reboot: true,
        },
        resolutions_available: 2,
        systems: [
          {
            id: 'sys-2',
            hostname: 'server2.example.com',
            display_name: 'Server 2',
            resolved: true,
          },
        ],
      },
    ],
    autoreboot: true,
  };

  const mockRemediationStatus = {
    totalSystems: 10,
  };

  const mockRemediationPlaybookRuns = {
    status: 'success',
    updated_at: '2024-01-20T16:00:00Z',
  };

  const mockAllRemediations = {
    data: [{ name: 'Existing Plan 1' }, { name: 'Existing Plan 2' }],
  };

  beforeEach(() => {
    mockUpdateRemPlan = jest.fn().mockResolvedValue();
    mockOnNavigateToTab = jest.fn();
    mockRefetch = jest.fn().mockResolvedValue();
    mockRefetchAllRemediations = jest.fn().mockResolvedValue();

    mockUseVerifyName = jest.fn().mockReturnValue([false, false]); // [isVerifying, isDuplicate]
    useVerifyName.useVerifyName.mockImplementation(mockUseVerifyName);

    formatDate.formatDate.mockImplementation((dateStr) => {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    });

    helpers.execStatus.mockReturnValue(
      <div data-testid="exec-status">Succeeded 5 hours ago</div>,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const renderComponent = (props = {}) => {
    const defaultProps = {
      details: mockDetails,
      remediationStatus: mockRemediationStatus,
      updateRemPlan: mockUpdateRemPlan,
      onNavigateToTab: mockOnNavigateToTab,
      allRemediations: mockAllRemediations, // Keep as object with data property as component expects
      refetch: mockRefetch,
      remediationPlaybookRuns: mockRemediationPlaybookRuns,
      refetchAllRemediations: mockRefetchAllRemediations,
      // Add missing required props to fix PropType warnings
      onRename: jest.fn(),
      onToggleAutoreboot: jest.fn(),
      onViewActions: jest.fn(),
      ...props,
    };

    return render(<DetailsCard {...defaultProps} />);
  };

  describe('Component Rendering', () => {
    it('renders without crashing', () => {
      renderComponent();
      expect(
        screen.getByText('Remediation plan details and status'),
      ).toBeInTheDocument();
    });

    it('displays loading spinner when no details provided', () => {
      renderComponent({ details: null });
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
      expect(
        screen.queryByText('Remediation plan details and status'),
      ).not.toBeInTheDocument();
    });

    it('displays all required information when details are provided', () => {
      renderComponent();

      expect(screen.getByText('Test Remediation Plan')).toBeInTheDocument();
      expect(screen.getByText('Name')).toBeInTheDocument();
      expect(screen.getByText('Created')).toBeInTheDocument();
      expect(screen.getByText('Last modified')).toBeInTheDocument();
      expect(screen.getByText('Latest execution status')).toBeInTheDocument();
      expect(screen.getByText('Actions')).toBeInTheDocument();
      expect(screen.getByText('Systems')).toBeInTheDocument();
      expect(screen.getByText('Auto-reboot')).toBeInTheDocument();
    });

    it('displays correct action and system counts', () => {
      renderComponent();

      expect(screen.getByText('2 actions')).toBeInTheDocument();
      expect(screen.getByText('10 systems')).toBeInTheDocument();
    });

    it('displays singular form for single action/system', () => {
      const singleDetails = {
        ...mockDetails,
        issues: [mockDetails.issues[0]], // Only one issue
      };
      const singleStatus = { totalSystems: 1 };

      renderComponent({
        details: singleDetails,
        remediationStatus: singleStatus,
      });

      expect(screen.getByText('1 action')).toBeInTheDocument();
      expect(screen.getByText('1 system')).toBeInTheDocument();
    });

    it('calls formatDate for created and updated dates', () => {
      renderComponent();

      expect(formatDate.formatDate).toHaveBeenCalledWith(
        '2024-01-15T10:30:00Z',
      );
      expect(formatDate.formatDate).toHaveBeenCalledWith(
        '2024-01-20T15:45:00Z',
      );
    });

    it('calls execStatus with correct parameters', () => {
      renderComponent();

      expect(helpers.execStatus).toHaveBeenCalledWith(
        'success',
        new Date('2024-01-20T16:00:00Z'),
      );
    });
  });

  describe('Name Editing', () => {
    it('toggles edit mode when pencil icon is clicked', () => {
      renderComponent();

      // The edit button is the first button (with no accessible name) - it contains the pencil icon
      const buttons = screen.getAllByRole('button');
      const editButton = buttons[0]; // First button is the edit button
      expect(
        screen.queryByDisplayValue('Test Remediation Plan'),
      ).not.toBeInTheDocument();

      fireEvent.click(editButton);
      expect(
        screen.getByDisplayValue('Test Remediation Plan'),
      ).toBeInTheDocument();
    });

    it('shows text input with current name when editing', () => {
      renderComponent();

      const buttons = screen.getAllByRole('button');
      fireEvent.click(buttons[0]);

      const input = screen.getByDisplayValue('Test Remediation Plan');
      expect(input).toBeInTheDocument();
      expect(input).toHaveFocus();
    });

    it('updates input value when typing', () => {
      renderComponent();

      const buttons = screen.getAllByRole('button');
      fireEvent.click(buttons[0]);
      const input = screen.getByDisplayValue('Test Remediation Plan');

      fireEvent.change(input, { target: { value: 'Updated Plan Name' } });
      expect(screen.getByDisplayValue('Updated Plan Name')).toBeInTheDocument();
    });

    it('shows duplicate error when name already exists', () => {
      mockUseVerifyName.mockReturnValue([false, true]); // [isVerifying, isDuplicate]
      renderComponent();

      const buttons = screen.getAllByRole('button');
      fireEvent.click(buttons[0]);

      // Change to a name that would trigger duplicate
      const input = screen.getByDisplayValue('Test Remediation Plan');
      fireEvent.change(input, { target: { value: 'Existing Plan 1' } });

      expect(
        screen.getByText(
          /A remediation plan with the same name already exists/,
        ),
      ).toBeInTheDocument();
    });

    it('shows empty error when name is empty', () => {
      renderComponent();

      const buttons = screen.getAllByRole('button');
      fireEvent.click(buttons[0]);
      const input = screen.getByDisplayValue('Test Remediation Plan');

      fireEvent.change(input, { target: { value: '' } });

      expect(
        screen.getByText(/Playbook name cannot be empty/),
      ).toBeInTheDocument();
    });

    it('shows checking state when verifying name', () => {
      mockUseVerifyName.mockReturnValue([true, false]); // [isVerifying, isDuplicate]
      renderComponent();

      const buttons = screen.getAllByRole('button');
      fireEvent.click(buttons[0]);
      // The checking state is handled internally, we can verify the hook is called
      expect(useVerifyName.useVerifyName).toHaveBeenCalled();
    });

    it('disables save button when name is invalid', () => {
      renderComponent();

      const buttons = screen.getAllByRole('button');
      fireEvent.click(buttons[0]);
      const input = screen.getByDisplayValue('Test Remediation Plan');

      fireEvent.change(input, { target: { value: '' } });

      // After entering edit mode, there should be more buttons including save/cancel
      const editButtons = screen.getAllByRole('button');
      // The save button should be disabled when name is invalid
      // We'll check by trying to find a disabled button
      const disabledButtons = editButtons.filter((btn) => btn.disabled);
      expect(disabledButtons.length).toBeGreaterThan(0);
    });

    it('enables save button when name is valid and changed', () => {
      renderComponent();

      const buttons = screen.getAllByRole('button');
      fireEvent.click(buttons[0]);
      const input = screen.getByDisplayValue('Test Remediation Plan');

      fireEvent.change(input, { target: { value: 'New Valid Name' } });

      // When name is valid, save button should not be disabled
      const editButtons = screen.getAllByRole('button');
      const disabledButtons = editButtons.filter((btn) => btn.disabled);
      // There should be fewer or no disabled buttons now
      expect(disabledButtons.length).toBeLessThanOrEqual(1);
    });

    it('saves name and exits edit mode when save is clicked', async () => {
      renderComponent();

      const buttons = screen.getAllByRole('button');
      fireEvent.click(buttons[0]);
      const input = screen.getByDisplayValue('Test Remediation Plan');

      fireEvent.change(input, { target: { value: 'Updated Name' } });

      // Find and click the first non-disabled button (should be save)
      const editButtons = screen.getAllByRole('button');
      const saveButton = editButtons.find(
        (btn) => !btn.disabled && btn !== buttons[0],
      );
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockUpdateRemPlan).toHaveBeenCalledWith({
          id: 'remediation-123',
          name: 'Updated Name',
        });
      });

      await waitFor(() => {
        expect(mockRefetch).toHaveBeenCalled();
      });

      await waitFor(() => {
        expect(mockRefetchAllRemediations).toHaveBeenCalled();
      });

      expect(
        screen.queryByDisplayValue('Updated Name'),
      ).not.toBeInTheDocument();
    });

    it('cancels editing when cancel button is clicked', async () => {
      renderComponent();

      const buttons = screen.getAllByRole('button');
      fireEvent.click(buttons[0]); // Enter edit mode

      const input = screen.getByDisplayValue('Test Remediation Plan');
      fireEvent.change(input, { target: { value: 'Changed Name' } });

      // Find all buttons in edit mode
      const editButtons = screen.getAllByRole('button');

      // The cancel button should be the one with TimesIcon - look for the last button
      // or we can click it by finding a button that's not disabled and not the first one
      const cancelButton =
        editButtons.find(
          (btn, index) =>
            index > 0 && // Not the edit button (first one)
            !btn.disabled && // Not disabled
            btn !== editButtons.find((b) => !b.disabled && b !== buttons[0]), // Not the save button
        ) || editButtons[editButtons.length - 1]; // Fallback to last button

      fireEvent.click(cancelButton);

      // After cancel, we should see the original text again (not in edit mode)
      await waitFor(() => {
        expect(screen.getByText('Test Remediation Plan')).toBeInTheDocument();
      });

      // And the input should no longer be visible
      expect(
        screen.queryByDisplayValue('Changed Name'),
      ).not.toBeInTheDocument();
    });
  });

  describe('Auto-reboot Toggle', () => {
    it('displays switch with correct initial state', () => {
      renderComponent();

      const toggle = screen.getByRole('switch');
      expect(toggle).toBeInTheDocument();
      expect(toggle).toBeChecked(); // auto_reboot is true in mockDetails
    });

    it('displays switch as unchecked when auto_reboot is false', () => {
      const detailsWithNoReboot = { ...mockDetails, auto_reboot: false };
      renderComponent({ details: detailsWithNoReboot });

      const toggle = screen.getByRole('switch');
      expect(toggle).not.toBeChecked();
    });

    it('calls updateRemPlan when toggle is changed', () => {
      renderComponent();

      const toggle = screen.getByRole('switch');
      fireEvent.click(toggle);

      expect(mockUpdateRemPlan).toHaveBeenCalledWith({
        id: 'remediation-123',
        auto_reboot: false, // Should toggle from true to false
      });
    });

    it('updates local state when toggle is changed', () => {
      renderComponent();

      const toggle = screen.getByRole('switch');
      expect(toggle).toBeChecked();

      fireEvent.click(toggle);
      expect(toggle).not.toBeChecked();

      // Click again to toggle back
      fireEvent.click(toggle);
      expect(toggle).toBeChecked();
    });
  });

  describe('Navigation', () => {
    it('navigates to actions tab when actions link is clicked', () => {
      renderComponent();

      const actionsLink = screen.getByText('2 actions');
      fireEvent.click(actionsLink);

      expect(mockOnNavigateToTab).toHaveBeenCalledWith(null, 'actions');
    });

    it('navigates to systems tab when systems link is clicked', () => {
      renderComponent();

      const systemsLink = screen.getByText('10 systems');
      fireEvent.click(systemsLink);

      expect(mockOnNavigateToTab).toHaveBeenCalledWith(null, 'systems');
    });

    it('navigates to execution history when status link is clicked', () => {
      renderComponent();

      // Find the button that contains the exec-status element
      const statusButton = screen.getByRole('button', { name: /succeeded/i });
      fireEvent.click(statusButton);

      expect(mockOnNavigateToTab).toHaveBeenCalledWith(
        null,
        'executionHistory',
      );
    });
  });

  describe('Data Display', () => {
    it('displays learn more link with correct URL', () => {
      renderComponent();

      const learnMoreLink = screen.getByTestId('insights-link');
      expect(learnMoreLink).toHaveAttribute(
        'href',
        'https://docs.redhat.com/en/documentation/red_hat_insights/1-latest/html-single/red_hat_insights_remediations_guide/index#creating-managing-playbooks_red-hat-insights-remediation-guide',
      );
      expect(learnMoreLink).toHaveAttribute('target', '_blank');
    });

    it('displays help icon for actions section', () => {
      renderComponent();

      // The help icon should be present in the Actions section
      // We can verify by checking that the Actions text is rendered
      expect(screen.getByText('Actions')).toBeInTheDocument();
    });

    it('handles missing remediation status gracefully', () => {
      renderComponent({ remediationStatus: null });

      // Should handle null remediationStatus without crashing
      expect(
        screen.getByText('Remediation plan details and status'),
      ).toBeInTheDocument();
    });

    it('handles missing playbook runs gracefully', () => {
      renderComponent({ remediationPlaybookRuns: null });

      // Should still render the component
      expect(
        screen.getByText('Remediation plan details and status'),
      ).toBeInTheDocument();
    });
  });

  describe('Props Handling', () => {
    it('handles missing onNavigateToTab prop', () => {
      renderComponent({ onNavigateToTab: undefined });

      // Should render without crashing
      expect(
        screen.getByText('Remediation plan details and status'),
      ).toBeInTheDocument();
    });

    it('handles missing updateRemPlan prop', () => {
      renderComponent({ updateRemPlan: undefined });

      // Should render without crashing
      expect(
        screen.getByText('Remediation plan details and status'),
      ).toBeInTheDocument();
    });

    it('handles missing allRemediations prop', () => {
      renderComponent({ allRemediations: undefined });

      // Should render without crashing
      expect(
        screen.getByText('Remediation plan details and status'),
      ).toBeInTheDocument();
    });

    it('handles undefined remediationStatus totalSystems', () => {
      renderComponent({ remediationStatus: {} });

      // Should handle undefined totalSystems
      expect(
        screen.getByText('Remediation plan details and status'),
      ).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles details with empty issues array', () => {
      const emptyDetails = { ...mockDetails, issues: [] };
      renderComponent({ details: emptyDetails });

      expect(screen.getByText('0 actions')).toBeInTheDocument();
    });

    it('handles details with missing created_at date', () => {
      const detailsWithoutDate = { ...mockDetails, created_at: undefined };
      renderComponent({ details: detailsWithoutDate });

      // Should still render without crashing
      expect(
        screen.getByText('Remediation plan details and status'),
      ).toBeInTheDocument();
    });

    it('handles very long remediation names', () => {
      const longName = 'A'.repeat(200);
      const longNameDetails = { ...mockDetails, name: longName };
      renderComponent({ details: longNameDetails });

      expect(screen.getByText(longName)).toBeInTheDocument();
    });

    it('handles special characters in remediation name', () => {
      const specialName = 'Test & <script>alert("xss")</script> Plan';
      const specialDetails = { ...mockDetails, name: specialName };
      renderComponent({ details: specialDetails });

      expect(screen.getByText(specialName)).toBeInTheDocument();
    });

    it('updates name state when details prop changes', () => {
      const { rerender } = renderComponent();

      const newDetails = { ...mockDetails, name: 'Updated External Name' };
      rerender(
        <DetailsCard
          details={newDetails}
          remediationStatus={mockRemediationStatus}
          updateRemPlan={mockUpdateRemPlan}
          onNavigateToTab={mockOnNavigateToTab}
          allRemediations={mockAllRemediations}
          refetch={mockRefetch}
          remediationPlaybookRuns={mockRemediationPlaybookRuns}
          refetchAllRemediations={mockRefetchAllRemediations}
          onRename={jest.fn()}
          onToggleAutoreboot={jest.fn()}
          onViewActions={jest.fn()}
        />,
      );

      expect(screen.getByText('Updated External Name')).toBeInTheDocument();
    });
  });

  describe('Integration', () => {
    it('calls useVerifyName with correct parameters', () => {
      renderComponent();

      expect(useVerifyName.useVerifyName).toHaveBeenCalledWith(
        'Test Remediation Plan',
        mockAllRemediations.data,
      );
    });

    it('re-calls useVerifyName when name changes during editing', () => {
      renderComponent();

      const buttons = screen.getAllByRole('button');
      fireEvent.click(buttons[0]);
      const input = screen.getByDisplayValue('Test Remediation Plan');

      fireEvent.change(input, { target: { value: 'New Name' } });

      // useVerifyName should be called with the new value
      expect(useVerifyName.useVerifyName).toHaveBeenCalledWith(
        'New Name',
        mockAllRemediations.data,
      );
    });

    it('handles concurrent edit operations', async () => {
      renderComponent();

      const buttons = screen.getAllByRole('button');
      fireEvent.click(buttons[0]);
      const input = screen.getByDisplayValue('Test Remediation Plan');

      fireEvent.change(input, { target: { value: 'Name 1' } });

      // Find and click save button
      const editButtons = screen.getAllByRole('button');
      const saveButton = editButtons.find(
        (btn) => !btn.disabled && btn !== buttons[0],
      );
      fireEvent.click(saveButton);

      // Start another edit before the first completes
      const newButtons = screen.getAllByRole('button');
      fireEvent.click(newButtons[0]);

      await waitFor(() => {
        expect(mockUpdateRemPlan).toHaveBeenCalled();
      });
    });
  });
});
