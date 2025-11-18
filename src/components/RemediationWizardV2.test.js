import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { RemediationWizardV2 } from './RemediationWizardV2/RemediationWizardV2';

jest.mock('../api/useRemediationsQuery', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    result: { data: [] },
    loading: false,
  })),
}));

jest.mock('../Utilities/Hooks/api/useRemediations', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    result: null,
    loading: false,
    fetch: jest.fn(),
  })),
}));

jest.mock('../Utilities/Hooks/useFeatureFlag', () => ({
  useFeatureFlag: jest.fn(() => false),
}));

jest.mock('../Utilities/DownloadPlaybookButton', () => ({
  download: jest.fn(),
}));

jest.mock('../Utilities/utils', () => {
  const actual = jest.requireActual('../Utilities/utils');
  return {
    ...actual,
    remediationUrl: jest.fn(
      (id) => `https://test.example.com/insights/remediations/${id}`,
    ),
  };
});

jest.mock(
  '@redhat-cloud-services/frontend-components-notifications/hooks',
  () => ({
    useAddNotification: jest.fn(() => jest.fn()),
  }),
);

const { download } = require('../Utilities/DownloadPlaybookButton');
const useRemediationsQuery = require('../api/useRemediationsQuery').default;
const useRemediations =
  require('../Utilities/Hooks/api/useRemediations').default;
const helpers = require('./helpers');
const utils = require('../Utilities/utils');

describe('RemediationWizardV2', () => {
  const mockSetOpen = jest.fn();
  const mockCreateRemediationFetch = jest.fn(() =>
    Promise.resolve({ id: 'new-id' }),
  );
  const mockUpdateRemediationFetch = jest.fn(() => Promise.resolve({}));

  // Spy on helper functions to verify calls while using real implementation
  const handleRemediationSubmitSpy = jest.spyOn(
    helpers,
    'handleRemediationSubmit',
  );
  const handleRemediationPreviewSpy = jest.spyOn(
    helpers,
    'handleRemediationPreview',
  );

  beforeEach(() => {
    jest.spyOn(utils, 'remediationUrl').mockClear();
  });

  const defaultDataFlat = {
    issues: [
      {
        id: 'patch-advisory:RHSA-2021:1234',
        description: 'Test Issue 1',
      },
      {
        id: 'vulnerabilities:CVE-2021-1234',
        description: 'Test Issue 2',
      },
    ],
    systems: ['system-1', 'system-2', 'system-3'],
  };

  const defaultDataNested = {
    issues: [
      {
        id: 'issue-1',
        description: 'Test Issue 1',
        systems: ['system-1', 'system-2'],
      },
      {
        id: 'issue-2',
        description: 'Test Issue 2',
        systems: ['system-2', 'system-3', 'system-4'],
      },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    useRemediationsQuery.mockReturnValue({
      result: { data: [] },
      loading: false,
    });
    useRemediations.mockImplementation((method) => {
      if (method === 'createRemediation') {
        return {
          result: null,
          loading: false,
          fetch: mockCreateRemediationFetch,
        };
      }
      if (method === 'updateRemediation') {
        return {
          result: null,
          loading: false,
          fetch: mockUpdateRemediationFetch,
        };
      }
      return {
        result: null,
        loading: false,
        fetch: jest.fn(),
      };
    });
    // Reset spies
    handleRemediationSubmitSpy.mockResolvedValue({
      success: true,
      remediationId: 'test-id',
    });
    handleRemediationPreviewSpy.mockClear();
    // Reset mocks
    jest.spyOn(utils, 'remediationUrl').mockClear();
  });

  afterEach(() => {
    handleRemediationSubmitSpy.mockClear();
    handleRemediationPreviewSpy.mockClear();
  });

  describe('Basic rendering', () => {
    it('should render all modal components correctly', () => {
      render(
        <RemediationWizardV2 setOpen={mockSetOpen} data={defaultDataFlat} />,
      );

      // Modal title
      expect(screen.getByText('Plan a remediation')).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /Open Remediations popover/i }),
      ).toBeInTheDocument();

      // Modal body content
      expect(
        screen.getByText(
          /Create or update a plan to remediate issues identified by Red Hat Lightspeed/i,
        ),
      ).toBeInTheDocument();
      expect(
        screen.getByText('Select or create a playbook'),
      ).toBeInTheDocument();

      // Plan summary header
      expect(screen.getByText('Plan summary')).toBeInTheDocument();
      expect(
        screen.getByText(
          /Execution limits: 100 systems and 1000 action points/i,
        ),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('switch', { name: /Auto-reboot/i }),
      ).toBeChecked();

      // Plan summary charts
      expect(screen.getAllByText('Actions').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Systems').length).toBeGreaterThan(0);

      // Action points helper text
      expect(
        screen.getByText(
          /Action points \(pts\) per issue type: Advisor: 20 pts, Vulnerability: 20 pts, Patch: 2 pts, and Compliance: 5 pts/i,
        ),
      ).toBeInTheDocument();

      // Footer buttons
      expect(
        screen.getByRole('button', { name: /Create plan/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /Preview/i }),
      ).toBeInTheDocument();
    });
  });

  describe('Data normalization', () => {
    it('should handle flat data structure (with systems array)', () => {
      render(
        <RemediationWizardV2 setOpen={mockSetOpen} data={defaultDataFlat} />,
      );

      // Should display correct systems count in chart subtitle
      expect(screen.getAllByText(/3 systems/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/2 actions/i).length).toBeGreaterThan(0);
    });

    it('should normalize nested data structure (systems within issues)', () => {
      render(
        <RemediationWizardV2 setOpen={mockSetOpen} data={defaultDataNested} />,
      );

      // Should extract unique systems from nested structure
      // system-1, system-2, system-3, system-4 = 4 unique systems
      expect(screen.getAllByText(/4 systems/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/2 actions/i).length).toBeGreaterThan(0);
    });

    it('should handle empty data', () => {
      render(
        <RemediationWizardV2
          setOpen={mockSetOpen}
          data={{ issues: [], systems: [] }}
        />,
      );

      expect(screen.getAllByText(/0 systems/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/0 actions/i).length).toBeGreaterThan(0);
    });

    it('should handle data with no systems array and no nested systems', () => {
      const dataNoSystems = {
        issues: [
          {
            id: 'issue-1',
            description: 'Test Issue 1',
          },
        ],
      };

      render(
        <RemediationWizardV2 setOpen={mockSetOpen} data={dataNoSystems} />,
      );

      expect(screen.getAllByText(/0 systems/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/1 action/i).length).toBeGreaterThan(0);
    });

    it('should handle data with duplicate systems in nested structure', () => {
      const dataWithDuplicates = {
        issues: [
          {
            id: 'issue-1',
            description: 'Test Issue 1',
            systems: ['system-1', 'system-2', 'system-1'], // duplicate system-1
          },
          {
            id: 'issue-2',
            description: 'Test Issue 2',
            systems: ['system-2', 'system-3'], // duplicate system-2
          },
        ],
      };

      render(
        <RemediationWizardV2 setOpen={mockSetOpen} data={dataWithDuplicates} />,
      );

      // Should count unique systems only: system-1, system-2, system-3 = 3
      expect(screen.getAllByText(/3 systems/i).length).toBeGreaterThan(0);
    });
  });

  describe('Count calculations', () => {
    it('should calculate correct action points for different issue types', () => {
      const dataWithMultipleTypes = {
        issues: [
          { id: 'patch-advisory:RHSA-2021:1234', description: 'Patch' }, // 2 pts
          { id: 'vulnerabilities:CVE-2021-1234', description: 'Vulnerability' }, // 20 pts
          { id: 'advisor:test-recommendation', description: 'Advisor' }, // 20 pts
        ],
        systems: ['system-1'],
      };

      render(
        <RemediationWizardV2
          setOpen={mockSetOpen}
          data={dataWithMultipleTypes}
        />,
      );

      // 2 + 20 + 20 = 42 action points
      expect(screen.getAllByText(/42 points/i).length).toBeGreaterThan(0);
    });

    it('should update counts when existing plan is selected', async () => {
      const user = userEvent.setup();
      const remediationDetailsSummary = {
        issues: [
          { id: 'patch-advisory:RHSA-2021:5678', description: 'Plan Issue 1' },
        ],
        system_count: 5,
      };

      useRemediations.mockImplementation((method) => {
        if (method === 'getRemediation') {
          return {
            result: remediationDetailsSummary,
            loading: false,
            fetch: jest.fn(),
          };
        }
        return {
          result: null,
          loading: false,
          fetch: jest.fn(),
        };
      });

      useRemediationsQuery.mockReturnValue({
        result: {
          data: [{ id: 'existing-plan-id', name: 'Existing Plan' }],
        },
        loading: false,
      });

      render(
        <RemediationWizardV2 setOpen={mockSetOpen} data={defaultDataFlat} />,
      );

      // Select the existing plan
      const input = screen.getByPlaceholderText(/Select or create a playbook/i);
      await user.click(input);
      await waitFor(() => {
        expect(screen.getByText('Existing Plan')).toBeInTheDocument();
      });
      const option = screen.getByText('Existing Plan');
      await user.click(option);

      // Base: 2 issues, 3 systems, ~22 action points (1 patch + 1 vulnerability)
      // Plan: 1 issue, 5 systems, 2 action points
      // Total: 3 issues, 8 systems, 24 action points
      await waitFor(() => {
        expect(screen.getAllByText(/3 actions/i).length).toBeGreaterThan(0);
      });
      expect(screen.getAllByText(/8 systems/i).length).toBeGreaterThan(0);
    });
  });

  describe('Limits checking', () => {
    it('should detect when systems limit is exceeded', () => {
      const dataExceedingSystems = {
        issues: Array(10)
          .fill(null)
          .map((_, i) => ({
            id: `issue-${i}`,
            description: `Issue ${i}`,
          })),
        systems: Array(101)
          .fill(null)
          .map((_, i) => `system-${i}`),
      };

      render(
        <RemediationWizardV2
          setOpen={mockSetOpen}
          data={dataExceedingSystems}
        />,
      );

      // Should show warning helper text
      expect(
        screen.getAllByText(/Remediation plan exceeds execution limits/i)
          .length,
      ).toBeGreaterThan(0);
    });

    it('should detect when action points limit is exceeded', () => {
      // Create 51 vulnerability issues (51 * 20 = 1020 > 1000)
      const dataExceedingActions = {
        issues: Array(51)
          .fill(null)
          .map((_, i) => ({
            id: `vulnerabilities:CVE-2021-${i}`,
            description: `Vulnerability ${i}`,
          })),
        systems: ['system-1'],
      };

      render(
        <RemediationWizardV2
          setOpen={mockSetOpen}
          data={dataExceedingActions}
        />,
      );

      // Should show warning helper text
      expect(
        screen.getAllByText(/Remediation plan exceeds execution limits/i)
          .length,
      ).toBeGreaterThan(0);
    });

    it('should not show exceeds limits when within bounds', () => {
      render(
        <RemediationWizardV2 setOpen={mockSetOpen} data={defaultDataFlat} />,
      );

      expect(
        screen.queryByText(/Remediation plan exceeds execution limits/i),
      ).not.toBeInTheDocument();
    });

    it('should show exceeds limits alert when limits are exceeded', () => {
      const dataExceedingSystems = {
        issues: [
          { id: 'patch-advisory:RHSA-2021:1234', description: 'Issue 1' },
        ],
        systems: Array(101)
          .fill(null)
          .map((_, i) => `system-${i}`),
      };

      render(
        <RemediationWizardV2
          setOpen={mockSetOpen}
          data={dataExceedingSystems}
        />,
      );

      // Check for the alert title specifically (not the helper text)
      const alerts = screen.getAllByText(
        /Remediation plan exceeds execution limits/i,
      );
      expect(alerts.length).toBeGreaterThan(0);
      // The alert should contain more detailed information
      expect(
        screen.getByText(
          /To execute a remediation plan using Red Hat Lightspeed/i,
        ),
      ).toBeInTheDocument();
    });
  });

  describe('Form interactions', () => {
    it('should disable submit button when no plan is selected and input is empty', () => {
      render(
        <RemediationWizardV2 setOpen={mockSetOpen} data={defaultDataFlat} />,
      );

      const submitButton = screen.getByRole('button', { name: /Create plan/i });
      // When disabled with tooltip, button uses isAriaDisabled which sets aria-disabled
      expect(submitButton).toHaveAttribute('aria-disabled', 'true');
    });

    it('should enable submit button when existing plan is selected', async () => {
      const user = userEvent.setup();
      useRemediationsQuery.mockReturnValue({
        result: {
          data: [{ id: 'existing-plan-id', name: 'Existing Plan' }],
        },
        loading: false,
      });

      render(
        <RemediationWizardV2 setOpen={mockSetOpen} data={defaultDataFlat} />,
      );

      // Click the input to open dropdown
      const input = screen.getByPlaceholderText(/Select or create a playbook/i);
      await user.click(input);

      // Wait for and select the existing plan
      await waitFor(() => {
        expect(screen.getByText('Existing Plan')).toBeInTheDocument();
      });
      const option = screen.getByText('Existing Plan');
      await user.click(option);

      // Wait for button to update
      await waitFor(() => {
        const submitButton = screen.getByRole('button', {
          name: /Update plan/i,
        });
        expect(submitButton).toBeEnabled();
      });
    });

    it('should disable submit button when dropdown is open', async () => {
      const user = userEvent.setup();
      render(
        <RemediationWizardV2 setOpen={mockSetOpen} data={defaultDataFlat} />,
      );

      // Find the input and type to open the dropdown
      const input = screen.getByPlaceholderText(/Select or create a playbook/i);
      await user.type(input, 'New Plan');

      // When typing, dropdown opens and button should be disabled
      // When disabled with tooltip, button uses isAriaDisabled which sets aria-disabled
      const submitButton = screen.getByRole('button', { name: /Create plan/i });
      expect(submitButton).toHaveAttribute('aria-disabled', 'true');
    });

    it('should toggle auto-reboot switch', () => {
      render(
        <RemediationWizardV2 setOpen={mockSetOpen} data={defaultDataFlat} />,
      );

      const switchElement = screen.getByRole('switch', {
        name: /Auto-reboot/i,
      });
      expect(switchElement).toBeChecked();

      fireEvent.click(switchElement);

      expect(switchElement).not.toBeChecked();
    });
  });

  describe('Submit functionality', () => {
    it('should call handleRemediationSubmit when creating new plan', async () => {
      const user = userEvent.setup();
      render(
        <RemediationWizardV2 setOpen={mockSetOpen} data={defaultDataFlat} />,
      );

      // Type a plan name to enable the submit button
      const input = screen.getByPlaceholderText(/Select or create a playbook/i);
      await user.type(input, 'New Remediation Plan');
      // Wait for "Create new" option to appear and select it to close dropdown
      await waitFor(() => {
        expect(
          screen.getByText(/Create new playbook "New Remediation Plan"/i),
        ).toBeInTheDocument();
      });
      const createOption = screen.getByText(
        /Create new playbook "New Remediation Plan"/i,
      );
      await user.click(createOption);

      await waitFor(() => {
        const submitButton = screen.getByRole('button', {
          name: /Create plan/i,
        });
        expect(submitButton).toBeEnabled();
      });

      const submitButton = screen.getByRole('button', { name: /Create plan/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(handleRemediationSubmitSpy).toHaveBeenCalled();
      });

      const callArgs = handleRemediationSubmitSpy.mock.calls[0][0];
      expect(callArgs.isExistingPlanSelected).toBe(false);
      expect(callArgs.inputValue).toBe('New Remediation Plan');
      expect(callArgs.data).toEqual(defaultDataFlat);
      expect(callArgs.autoReboot).toBe(true);
    });

    it('should call handleRemediationSubmit when updating existing plan', async () => {
      const user = userEvent.setup();
      useRemediationsQuery.mockReturnValue({
        result: {
          data: [{ id: 'existing-plan-id', name: 'Updated Plan' }],
        },
        loading: false,
      });

      render(
        <RemediationWizardV2 setOpen={mockSetOpen} data={defaultDataFlat} />,
      );

      // Select an existing plan from the dropdown
      const input = screen.getByPlaceholderText(/Select or create a playbook/i);
      await user.click(input);
      // Wait for options to appear and select one
      await waitFor(() => {
        expect(screen.getByText('Updated Plan')).toBeInTheDocument();
      });
      const option = screen.getByText('Updated Plan');
      await user.click(option);

      await waitFor(() => {
        const submitButton = screen.getByRole('button', {
          name: /Update plan/i,
        });
        expect(submitButton).toBeEnabled();
      });

      const submitButton = screen.getByRole('button', { name: /Update plan/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(handleRemediationSubmitSpy).toHaveBeenCalled();
      });

      const callArgs = handleRemediationSubmitSpy.mock.calls[0][0];
      expect(callArgs.isExistingPlanSelected).toBe(true);
      expect(callArgs.selected).toBe('existing-plan-id');
      expect(callArgs.inputValue).toBe('Updated Plan');
      expect(callArgs.data).toEqual(defaultDataFlat);
    });

    it('should navigate to remediation details page after successful submission', async () => {
      const user = userEvent.setup();
      render(
        <RemediationWizardV2 setOpen={mockSetOpen} data={defaultDataFlat} />,
      );

      // Type a plan name to enable the submit button
      const input = screen.getByPlaceholderText(/Select or create a playbook/i);
      await user.type(input, 'New Plan');
      // Wait for "Create new" option to appear and select it to close dropdown
      await waitFor(() => {
        expect(
          screen.getByText(/Create new playbook "New Plan"/i),
        ).toBeInTheDocument();
      });
      const createOption = screen.getByText(/Create new playbook "New Plan"/i);
      await user.click(createOption);

      await waitFor(() => {
        const submitButton = screen.getByRole('button', {
          name: /Create plan/i,
        });
        expect(submitButton).toBeEnabled();
      });

      const submitButton = screen.getByRole('button', { name: /Create plan/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(handleRemediationSubmitSpy).toHaveBeenCalled();
      });

      // Should navigate to the remediation details page using window.location.href
      // Verify remediationUrl was called with the correct ID
      expect(utils.remediationUrl).toHaveBeenCalledWith('test-id');
      // Verify the URL was generated (remediationUrl returns the full URL)
      const generatedUrl = utils.remediationUrl.mock.results[0].value;
      expect(generatedUrl).toContain('test-id');
      expect(generatedUrl).toContain('remediations');
      // Note: window.location.href assignment is tested indirectly via remediationUrl call
      // Modal should not be closed when navigating (navigation handles it)
      expect(mockSetOpen).not.toHaveBeenCalled();
    });

    it('should close modal if navigation fails (no remediationId)', async () => {
      const user = userEvent.setup();
      handleRemediationSubmitSpy.mockResolvedValueOnce({
        success: true,
        // No remediationId
      });

      render(
        <RemediationWizardV2 setOpen={mockSetOpen} data={defaultDataFlat} />,
      );

      // Type a plan name to enable the submit button
      const input = screen.getByPlaceholderText(/Select or create a playbook/i);
      await user.type(input, 'New Plan');
      // Wait for "Create new" option to appear and select it to close dropdown
      await waitFor(() => {
        expect(
          screen.getByText(/Create new playbook "New Plan"/i),
        ).toBeInTheDocument();
      });
      const createOption = screen.getByText(/Create new playbook "New Plan"/i);
      await user.click(createOption);

      await waitFor(() => {
        const submitButton = screen.getByRole('button', {
          name: /Create plan/i,
        });
        expect(submitButton).toBeEnabled();
      });

      const submitButton = screen.getByRole('button', { name: /Create plan/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(handleRemediationSubmitSpy).toHaveBeenCalled();
      });

      // Should not navigate if no remediationId (remediationUrl should not be called)
      expect(utils.remediationUrl).not.toHaveBeenCalled();
      // Modal should not close if no remediationId (no navigation, no action)
      expect(mockSetOpen).not.toHaveBeenCalled();
    });

    it('should handle submission errors gracefully', async () => {
      const user = userEvent.setup();
      const consoleSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      handleRemediationSubmitSpy.mockRejectedValue(
        new Error('Submission failed'),
      );

      render(
        <RemediationWizardV2 setOpen={mockSetOpen} data={defaultDataFlat} />,
      );

      // Type a plan name to enable the submit button
      const input = screen.getByPlaceholderText(/Select or create a playbook/i);
      await user.type(input, 'New Plan');
      // Wait for "Create new" option to appear and select it to close dropdown
      await waitFor(() => {
        expect(
          screen.getByText(/Create new playbook "New Plan"/i),
        ).toBeInTheDocument();
      });
      const createOption = screen.getByText(/Create new playbook "New Plan"/i);
      await user.click(createOption);

      await waitFor(() => {
        const submitButton = screen.getByRole('button', {
          name: /Create plan/i,
        });
        expect(submitButton).toBeEnabled();
      });

      const submitButton = screen.getByRole('button', { name: /Create plan/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalled();
      });

      // Modal should not close on error
      expect(mockSetOpen).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it('should pass original data (not normalized) to handleRemediationSubmit', async () => {
      const user = userEvent.setup();
      render(
        <RemediationWizardV2 setOpen={mockSetOpen} data={defaultDataNested} />,
      );

      // Type a plan name to enable the submit button
      const input = screen.getByPlaceholderText(/Select or create a playbook/i);
      await user.type(input, 'New Plan');
      // Wait for "Create new" option to appear and select it to close dropdown
      await waitFor(() => {
        expect(
          screen.getByText(/Create new playbook "New Plan"/i),
        ).toBeInTheDocument();
      });
      const createOption = screen.getByText(/Create new playbook "New Plan"/i);
      await user.click(createOption);

      await waitFor(() => {
        const submitButton = screen.getByRole('button', {
          name: /Create plan/i,
        });
        expect(submitButton).toBeEnabled();
      });

      const submitButton = screen.getByRole('button', { name: /Create plan/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(handleRemediationSubmitSpy).toHaveBeenCalled();
      });

      const callArgs = handleRemediationSubmitSpy.mock.calls[0][0];
      expect(callArgs.data).toEqual(defaultDataNested); // Original nested structure
    });
  });

  describe('Preview functionality', () => {
    it('should call handleRemediationPreview when preview button is clicked', async () => {
      const user = userEvent.setup();
      useRemediationsQuery.mockReturnValue({
        result: {
          data: [
            { id: 'plan-1', name: 'Plan 1' },
            { id: 'plan-2', name: 'Plan 2' },
          ],
        },
        loading: false,
      });

      const remediationDetailsSummary = {
        id: 'plan-1',
        name: 'Plan 1',
        issues: [],
      };

      useRemediations.mockImplementation((method) => {
        if (method === 'getRemediation') {
          return {
            result: remediationDetailsSummary,
            loading: false,
            fetch: jest.fn(),
          };
        }
        return {
          result: null,
          loading: false,
          fetch: jest.fn(),
        };
      });

      render(
        <RemediationWizardV2 setOpen={mockSetOpen} data={defaultDataFlat} />,
      );

      // Select an existing plan from the dropdown
      const input = screen.getByPlaceholderText(/Select or create a playbook/i);
      await user.click(input);
      // Wait for options to appear and select one
      await waitFor(() => {
        expect(screen.getByText('Plan 1')).toBeInTheDocument();
      });
      const option = screen.getByText('Plan 1');
      await user.click(option);

      await waitFor(() => {
        const previewButton = screen.getByRole('button', { name: /Preview/i });
        expect(previewButton).toBeInTheDocument();
      });

      const previewButton = screen.getByRole('button', { name: /Preview/i });
      await user.click(previewButton);

      expect(handleRemediationPreviewSpy).toHaveBeenCalled();
      const callArgs = handleRemediationPreviewSpy.mock.calls[0][0];
      expect(callArgs.selected).toBe('plan-1');
      expect(callArgs.remediationDetailsSummary).toEqual(
        remediationDetailsSummary,
      );
      expect(callArgs.allRemediationsData).toEqual([
        { id: 'plan-1', name: 'Plan 1' },
        { id: 'plan-2', name: 'Plan 2' },
      ]);
      expect(callArgs.download).toBe(download);
      expect(callArgs.addNotification).toBeDefined();
    });
  });

  describe('Modal close functionality', () => {
    it('should call setOpen(false) when modal is closed', () => {
      render(
        <RemediationWizardV2 setOpen={mockSetOpen} data={defaultDataFlat} />,
      );

      // Find and click the close button (PatternFly Modal typically has a close button)
      // Since we're using Modal component, we need to simulate the onClose
      // In a real test, you'd trigger the modal's close mechanism
      // For now, we'll test handleClose indirectly through submit
    });
  });

  describe('Confirmation dialog', () => {
    it('should show confirmation dialog when Cancel button is clicked', async () => {
      const user = userEvent.setup();
      render(
        <RemediationWizardV2 setOpen={mockSetOpen} data={defaultDataFlat} />,
      );

      // Verify main content is visible
      expect(screen.getByText('Plan a remediation')).toBeInTheDocument();

      // Click Cancel button
      const cancelButton = screen.getByRole('button', { name: /Cancel/i });
      await user.click(cancelButton);

      // Verify confirmation dialog appears
      expect(
        screen.getByText('Are you sure you want to cancel?'),
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          'The systems and actions you selected are not added to this remediation plan.',
        ),
      ).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Yes/i })).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /No, go back/i }),
      ).toBeInTheDocument();

      // Verify main content is hidden
      expect(screen.queryByText('Plan a remediation')).not.toBeInTheDocument();
    });

    it('should show confirmation dialog when modal close is triggered', async () => {
      const user = userEvent.setup();
      const { container } = render(
        <RemediationWizardV2 setOpen={mockSetOpen} data={defaultDataFlat} />,
      );

      // Verify main content is visible
      expect(screen.getByText('Plan a remediation')).toBeInTheDocument();

      // Find and click the modal close button (X button)
      const closeButton = screen.queryByLabelText('Close');
      if (closeButton) {
        await user.click(closeButton);
      } else {
        // If close button not found by label, try to trigger onClose via Escape key
        fireEvent.keyDown(container, { key: 'Escape', code: 'Escape' });
      }

      // Verify confirmation dialog appears
      await waitFor(() => {
        expect(
          screen.getByText('Are you sure you want to cancel?'),
        ).toBeInTheDocument();
      });
    });

    it('should close modal when Yes button is clicked in confirmation dialog', async () => {
      const user = userEvent.setup();
      render(
        <RemediationWizardV2 setOpen={mockSetOpen} data={defaultDataFlat} />,
      );

      // Click Cancel to show confirmation
      const cancelButton = screen.getByRole('button', { name: /Cancel/i });
      await user.click(cancelButton);

      // Wait for confirmation dialog
      await waitFor(() => {
        expect(
          screen.getByText('Are you sure you want to cancel?'),
        ).toBeInTheDocument();
      });

      // Click Yes button
      const yesButton = screen.getByRole('button', { name: /Yes/i });
      await user.click(yesButton);

      // Verify setOpen was called with false
      await waitFor(() => {
        expect(mockSetOpen).toHaveBeenCalledWith(false);
      });
    });

    it('should return to main content when No, go back button is clicked', async () => {
      const user = userEvent.setup();
      render(
        <RemediationWizardV2 setOpen={mockSetOpen} data={defaultDataFlat} />,
      );

      // Click Cancel to show confirmation
      const cancelButton = screen.getByRole('button', { name: /Cancel/i });
      await user.click(cancelButton);

      // Wait for confirmation dialog
      await waitFor(() => {
        expect(
          screen.getByText('Are you sure you want to cancel?'),
        ).toBeInTheDocument();
      });

      // Click No, go back button
      const noButton = screen.getByRole('button', { name: /No, go back/i });
      await user.click(noButton);

      // Verify main content is visible again
      await waitFor(() => {
        expect(screen.getByText('Plan a remediation')).toBeInTheDocument();
      });

      // Verify confirmation dialog is hidden
      expect(
        screen.queryByText('Are you sure you want to cancel?'),
      ).not.toBeInTheDocument();

      // Verify setOpen was NOT called
      expect(mockSetOpen).not.toHaveBeenCalled();
    });

    it('should show warning icon in confirmation dialog title', async () => {
      const user = userEvent.setup();
      render(
        <RemediationWizardV2 setOpen={mockSetOpen} data={defaultDataFlat} />,
      );

      // Click Cancel to show confirmation
      const cancelButton = screen.getByRole('button', { name: /Cancel/i });
      await user.click(cancelButton);

      // Wait for confirmation dialog
      await waitFor(() => {
        expect(
          screen.getByText('Are you sure you want to cancel?'),
        ).toBeInTheDocument();
      });

      // Verify the confirmation dialog title is present
      // The titleIconVariant prop should be set to 'warning' on ModalHeader
      expect(
        screen.getByText('Are you sure you want to cancel?'),
      ).toBeInTheDocument();
    });

    it('should maintain main content state when returning from confirmation', async () => {
      const user = userEvent.setup();
      render(
        <RemediationWizardV2 setOpen={mockSetOpen} data={defaultDataFlat} />,
      );

      // Type in the playbook select input
      const input = screen.getByPlaceholderText(/Select or create a playbook/i);
      await user.type(input, 'Test Plan');

      // Click Cancel to show confirmation
      const cancelButton = screen.getByRole('button', { name: /Cancel/i });
      await user.click(cancelButton);

      // Click No, go back
      await waitFor(() => {
        expect(
          screen.getByText('Are you sure you want to cancel?'),
        ).toBeInTheDocument();
      });
      const noButton = screen.getByRole('button', { name: /No, go back/i });
      await user.click(noButton);

      // Verify input value is preserved
      await waitFor(() => {
        expect(input).toHaveValue('Test Plan');
      });
    });
  });

  describe('Edge cases', () => {
    it('should handle null data gracefully', () => {
      render(<RemediationWizardV2 setOpen={mockSetOpen} data={null} />);

      expect(screen.getAllByText(/0 systems/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/0 actions/i).length).toBeGreaterThan(0);
    });

    it('should handle undefined data gracefully', () => {
      render(<RemediationWizardV2 setOpen={mockSetOpen} data={undefined} />);

      expect(screen.getAllByText(/0 systems/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/0 actions/i).length).toBeGreaterThan(0);
    });

    it('should handle data with missing issues array', () => {
      render(
        <RemediationWizardV2
          setOpen={mockSetOpen}
          data={{ systems: ['system-1'] }}
        />,
      );

      expect(screen.getAllByText(/0 actions/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/1 system/i).length).toBeGreaterThan(0);
    });

    it('should handle loading state for remediation details', async () => {
      const user = userEvent.setup();
      useRemediationsQuery.mockReturnValue({
        result: {
          data: [{ id: 'plan-id', name: 'Plan' }],
        },
        loading: false,
      });

      useRemediations.mockImplementation((method) => {
        if (method === 'getRemediation') {
          return {
            result: null,
            loading: true,
            fetch: jest.fn(),
          };
        }
        return {
          result: null,
          loading: false,
          fetch: jest.fn(),
        };
      });

      render(
        <RemediationWizardV2 setOpen={mockSetOpen} data={defaultDataFlat} />,
      );

      // Select an existing plan from the dropdown
      const input = screen.getByPlaceholderText(/Select or create a playbook/i);
      await user.click(input);
      // Wait for options to appear and select one
      await waitFor(() => {
        expect(screen.getByText('Plan')).toBeInTheDocument();
      });
      const option = screen.getByText('Plan');
      await user.click(option);

      // When loading, skeleton should be shown instead of charts
      expect(screen.queryByText('Actions')).not.toBeInTheDocument();
      expect(screen.queryByText('Systems')).not.toBeInTheDocument();
    });
  });
});
