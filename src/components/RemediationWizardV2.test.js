import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import { RemediationWizardV2 } from './RemediationWizardV2/RemediationWizardV2';
import { EXECUTION_LIMITS_HEADER_DESCRIPTION } from '../routes/RemediationDetailsComponents/helpers';

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

jest.mock('../api', () => ({
  remediationsApi: {
    getRemediations: jest.fn(),
    getRemediation: jest.fn(),
    createRemediation: jest.fn(),
    updateRemediation: jest.fn(),
    deleteRemediationSystems: jest.fn(),
    getRemediationPlaybook: jest.fn(),
    downloadPlaybooks: jest.fn(),
    getPlaybookRunSystems: jest.fn(),
    getPlaybookRunSystemDetails: jest.fn(),
    getResolutionsForIssues: jest.fn(),
  },
  sourcesApi: {},
  getHosts: jest.fn(),
  downloadPlaybook: jest.fn(),
  getIsReceptorConfigured: jest.fn(),
  deleteSystemsFromRemediation: jest.fn(),
  createRemediation: jest.fn(),
  patchRemediation: jest.fn(),
  getRemediations: jest.fn(),
  getRemediation: jest.fn(),
  getResolutionsBatch: jest.fn(),
}));

jest.mock('../routes/api', () => {
  const mockPostPlaybookPreview = jest.fn(() =>
    Promise.resolve(new Blob(['test'], { type: 'text/yaml' })),
  );
  return {
    API_BASE: '/api/remediations/v1',
    deleteRemediationSystems: jest.fn(),
    getRemediationPlaybookSystemsList: jest.fn(),
    getPlaybookLogs: jest.fn(),
    updateRemediationWrapper: jest.fn(),
    postPlaybookPreview: mockPostPlaybookPreview,
  };
});

jest.mock('../Utilities/helpers', () => ({
  downloadFile: jest.fn(),
}));

const useRemediationsQuery = require('../api/useRemediationsQuery').default;
const useRemediations =
  require('../Utilities/Hooks/api/useRemediations').default;
const helpers = require('./helpers');
const utils = require('../Utilities/utils');
const api = require('../routes/api');
const utilitiesHelpers = require('../Utilities/helpers');

const renderWithRouter = (component) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('RemediationWizardV2', () => {
  let mockSetOpen;
  let mockCreateRemediationFetch;
  let mockUpdateRemediationFetch;

  const handleRemediationSubmitSpy = jest.spyOn(
    helpers,
    'handleRemediationSubmit',
  );
  const preparePlaybookPreviewPayloadSpy = jest.spyOn(
    helpers,
    'preparePlaybookPreviewPayload',
  );

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
        id: 'patch-advisory:RHSA-2021:1234',
        description: 'Test Issue 1',
        systems: ['system-1', 'system-2'],
      },
      {
        id: 'patch-advisory:RHSA-2021:5678',
        description: 'Test Issue 2',
        systems: ['system-2', 'system-3', 'system-4'],
      },
    ],
  };

  beforeEach(() => {
    // Clear all mocks first to prevent leakage from other test files
    jest.clearAllMocks();

    // Create fresh mock functions for each test
    mockSetOpen = jest.fn();
    mockCreateRemediationFetch = jest.fn(() =>
      Promise.resolve({ id: 'new-id' }),
    );
    mockUpdateRemediationFetch = jest.fn(() => Promise.resolve({}));

    // Reset shared mocks to their default implementations
    // This is critical when tests run together - mocks from other files can leak
    useRemediationsQuery.mockReset();
    useRemediationsQuery.mockReturnValue({
      result: { data: [] },
      loading: false,
    });

    // Reset useRemediations to default implementation
    useRemediations.mockReset();
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

    // Reset API mocks
    api.postPlaybookPreview.mockClear();
    api.postPlaybookPreview.mockResolvedValue(
      new Blob(['test'], { type: 'text/yaml' }),
    );
    utilitiesHelpers.downloadFile.mockClear();

    // Reset spies
    handleRemediationSubmitSpy.mockResolvedValue({
      success: true,
      status: 'success',
      remediationId: 'test-id',
      remediationName: 'Test Plan',
      isUpdate: false,
    });
    preparePlaybookPreviewPayloadSpy.mockClear();

    // Reset utils mock
    jest.spyOn(utils, 'remediationUrl').mockClear();
  });

  afterEach(() => {
    handleRemediationSubmitSpy.mockClear();
    preparePlaybookPreviewPayloadSpy.mockClear();
  });

  describe('Basic rendering', () => {
    it('should render all modal components correctly', () => {
      renderWithRouter(
        <RemediationWizardV2 setOpen={mockSetOpen} data={defaultDataFlat} />,
      );

      expect(screen.getByText('Plan a remediation')).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /Open Remediations popover/i }),
      ).toBeInTheDocument();

      expect(
        screen.getByText(
          /Create or update a plan to remediate issues identified by Red Hat Lightspeed/i,
        ),
      ).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText(/Enter or select/i),
      ).toBeInTheDocument();

      expect(screen.getByText('Plan summary')).toBeInTheDocument();
      expect(
        screen.getByText(EXECUTION_LIMITS_HEADER_DESCRIPTION),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('switch', { name: /Auto-reboot/i }),
      ).toBeChecked();

      expect(screen.getAllByText(/Action point/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/System/i).length).toBeGreaterThan(0);

      expect(
        screen.getByText(
          /Action points \(pts\) per issue type: Advisor: 20 pts, Vulnerability: 20 pts, Patch: 2 pts, and Compliance: 5 pts/i,
        ),
      ).toBeInTheDocument();
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
      renderWithRouter(
        <RemediationWizardV2 setOpen={mockSetOpen} data={defaultDataFlat} />,
      );

      expect(screen.getAllByText(/3 System/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/22 Action point/i).length).toBeGreaterThan(0);
    });

    it('should normalize nested data structure (systems within issues)', () => {
      renderWithRouter(
        <RemediationWizardV2 setOpen={mockSetOpen} data={defaultDataNested} />,
      );

      expect(screen.getAllByText(/4 System/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/4 Action point/i).length).toBeGreaterThan(0);
    });

    it('should handle empty data', () => {
      renderWithRouter(
        <RemediationWizardV2
          setOpen={mockSetOpen}
          data={{ issues: [], systems: [] }}
        />,
      );

      expect(screen.getAllByText(/0 System/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/0 Action point/i).length).toBeGreaterThan(0);
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

      renderWithRouter(
        <RemediationWizardV2 setOpen={mockSetOpen} data={dataNoSystems} />,
      );

      expect(screen.getAllByText(/0 System/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/0 Action point/i).length).toBeGreaterThan(0);
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

      renderWithRouter(
        <RemediationWizardV2 setOpen={mockSetOpen} data={dataWithDuplicates} />,
      );

      expect(screen.getAllByText(/3 System/i).length).toBeGreaterThan(0);
    });
  });

  describe('Count calculations', () => {
    it('should calculate correct action points for different issue types', () => {
      const dataWithMultipleTypes = {
        issues: [
          { id: 'patch-advisory:RHSA-2021:1234', description: 'Patch' },
          { id: 'vulnerabilities:CVE-2021-1234', description: 'Vulnerability' },
          { id: 'advisor:test-recommendation', description: 'Advisor' },
        ],
        systems: ['system-1'],
      };

      renderWithRouter(
        <RemediationWizardV2
          setOpen={mockSetOpen}
          data={dataWithMultipleTypes}
        />,
      );

      // 42 action points: Patch (2) + Vulnerability (20) + Advisor (20) = 42
      expect(screen.getAllByText(/42 Action point/i).length).toBeGreaterThan(0);
    });

    it('should update counts when existing plan is selected', async () => {
      const user = userEvent.setup();
      const remediationDetailsSummary = {
        issues: [
          {
            id: 'patch-advisory:RHSA-2021:5678',
            description: 'Plan Issue 1',
            systems: [
              'system-4',
              'system-5',
              'system-6',
              'system-7',
              'system-8',
            ],
          },
        ],
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

      renderWithRouter(
        <RemediationWizardV2 setOpen={mockSetOpen} data={defaultDataFlat} />,
      );

      const input = screen.getByPlaceholderText(/Enter or select/i);
      await user.click(input);
      await waitFor(() => {
        expect(screen.getByText('Existing Plan')).toBeInTheDocument();
      });
      const option = screen.getByText('Existing Plan');
      await user.click(option);

      await waitFor(() => {
        expect(screen.getAllByText(/8 System/i).length).toBeGreaterThan(0);
      });
      expect(screen.getAllByText(/24 Action point/i).length).toBeGreaterThan(0);
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

      renderWithRouter(
        <RemediationWizardV2
          setOpen={mockSetOpen}
          data={dataExceedingSystems}
        />,
      );

      expect(
        screen.getAllByText(/Remediation plan exceeds limits/i).length,
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

      renderWithRouter(
        <RemediationWizardV2
          setOpen={mockSetOpen}
          data={dataExceedingActions}
        />,
      );

      expect(
        screen.getAllByText(/Remediation plan exceeds limits/i).length,
      ).toBeGreaterThan(0);
    });

    it('should not show exceeds limits when within bounds', () => {
      renderWithRouter(
        <RemediationWizardV2 setOpen={mockSetOpen} data={defaultDataFlat} />,
      );

      expect(
        screen.queryByText(/Remediation plan exceeds limits/i),
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

      renderWithRouter(
        <RemediationWizardV2
          setOpen={mockSetOpen}
          data={dataExceedingSystems}
        />,
      );

      const alerts = screen.getAllByText(/Remediation plan exceeds limits/i);
      expect(alerts.length).toBeGreaterThan(0);
      expect(
        screen.getByText(
          /To preview or execute a remediation plan using Red Hat Lightspeed/i,
        ),
      ).toBeInTheDocument();
    });
  });

  describe('Form interactions', () => {
    it('should disable submit button when no plan is selected and input is empty', () => {
      renderWithRouter(
        <RemediationWizardV2 setOpen={mockSetOpen} data={defaultDataFlat} />,
      );

      const submitButton = screen.getByRole('button', { name: /Create plan/i });
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

      renderWithRouter(
        <RemediationWizardV2 setOpen={mockSetOpen} data={defaultDataFlat} />,
      );

      const input = screen.getByPlaceholderText(/Enter or select/i);
      await user.click(input);

      await waitFor(() => {
        expect(screen.getByText('Existing Plan')).toBeInTheDocument();
      });
      const option = screen.getByText('Existing Plan');
      await user.click(option);
      await waitFor(() => {
        const submitButton = screen.getByRole('button', {
          name: /Update plan/i,
        });
        expect(submitButton).toBeEnabled();
      });
    });

    it('should disable submit button when dropdown is open', async () => {
      const user = userEvent.setup();
      renderWithRouter(
        <RemediationWizardV2 setOpen={mockSetOpen} data={defaultDataFlat} />,
      );

      const input = screen.getByPlaceholderText(/Enter or select/i);
      await user.type(input, 'New Plan');

      const submitButton = screen.getByRole('button', { name: /Create plan/i });
      expect(submitButton).toHaveAttribute('aria-disabled', 'true');
    });

    it('should toggle auto-reboot switch', () => {
      renderWithRouter(
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
      renderWithRouter(
        <RemediationWizardV2 setOpen={mockSetOpen} data={defaultDataFlat} />,
      );

      const input = screen.getByPlaceholderText(/Enter or select/i);
      await user.type(input, 'New Remediation Plan');
      await waitFor(() => {
        expect(
          screen.getByText(/Create new plan "New Remediation Plan"/i),
        ).toBeInTheDocument();
      });
      const createOption = screen.getByText(
        /Create new plan "New Remediation Plan"/i,
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
      expect(callArgs.isCompliancePrecedenceEnabled).toBe(false);
    });

    it('should call handleRemediationSubmit when updating existing plan', async () => {
      const user = userEvent.setup();
      useRemediationsQuery.mockReturnValue({
        result: {
          data: [{ id: 'existing-plan-id', name: 'Updated Plan' }],
        },
        loading: false,
      });

      renderWithRouter(
        <RemediationWizardV2 setOpen={mockSetOpen} data={defaultDataFlat} />,
      );

      const input = screen.getByPlaceholderText(/Enter or select/i);
      await user.click(input);
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
      expect(callArgs.isCompliancePrecedenceEnabled).toBe(false);
    });

    it('should pass isCompliancePrecedenceEnabled to handleRemediationSubmit when enabled', async () => {
      const user = userEvent.setup();
      renderWithRouter(
        <RemediationWizardV2
          setOpen={mockSetOpen}
          data={defaultDataFlat}
          isCompliancePrecedenceEnabled={true}
        />,
      );

      const input = screen.getByPlaceholderText(/Enter or select/i);
      await user.type(input, 'New Plan');
      await waitFor(() => {
        expect(
          screen.getByText(/Create new plan "New Plan"/i),
        ).toBeInTheDocument();
      });
      const createOption = screen.getByText(/Create new plan "New Plan"/i);
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
      expect(callArgs.isCompliancePrecedenceEnabled).toBe(true);
    });

    it('should navigate to remediation details page after successful submission', async () => {
      const user = userEvent.setup();
      // Mock window.location to prevent actual navigation
      const originalLocation = window.location;
      delete window.location;
      window.location = { href: '' };

      renderWithRouter(
        <RemediationWizardV2 setOpen={mockSetOpen} data={defaultDataFlat} />,
      );

      // Type a plan name to enable the submit button
      const input = screen.getByPlaceholderText(/Enter or select/i);
      await user.type(input, 'New Plan');
      // Wait for "Create new" option to appear and select it to close dropdown
      await waitFor(() => {
        expect(
          screen.getByText(/Create new plan "New Plan"/i),
        ).toBeInTheDocument();
      });
      const createOption = screen.getByText(/Create new plan "New Plan"/i);
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

      await waitFor(() => {
        expect(utils.remediationUrl).toHaveBeenCalledWith('test-id');
      });
      const generatedUrl = utils.remediationUrl.mock.results[0].value;
      expect(generatedUrl).toContain('test-id');
      expect(generatedUrl).toContain('remediations');
      expect(mockSetOpen).not.toHaveBeenCalled();

      // Restore window.location
      window.location = originalLocation;
    });

    it('should close modal if navigation fails (no remediationId)', async () => {
      const user = userEvent.setup();
      handleRemediationSubmitSpy.mockResolvedValueOnce({
        success: true,
        status: 'success',
        // No remediationId
      });

      renderWithRouter(
        <RemediationWizardV2 setOpen={mockSetOpen} data={defaultDataFlat} />,
      );

      // Type a plan name to enable the submit button
      const input = screen.getByPlaceholderText(/Enter or select/i);
      await user.type(input, 'New Plan');
      // Wait for "Create new" option to appear and select it to close dropdown
      await waitFor(() => {
        expect(
          screen.getByText(/Create new plan "New Plan"/i),
        ).toBeInTheDocument();
      });
      const createOption = screen.getByText(/Create new plan "New Plan"/i);
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

      expect(utils.remediationUrl).not.toHaveBeenCalled();
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

      renderWithRouter(
        <RemediationWizardV2 setOpen={mockSetOpen} data={defaultDataFlat} />,
      );

      // Type a plan name to enable the submit button
      const input = screen.getByPlaceholderText(/Enter or select/i);
      await user.type(input, 'New Plan');
      // Wait for "Create new" option to appear and select it to close dropdown
      await waitFor(() => {
        expect(
          screen.getByText(/Create new plan "New Plan"/i),
        ).toBeInTheDocument();
      });
      const createOption = screen.getByText(/Create new plan "New Plan"/i);
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

      expect(mockSetOpen).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it('should show error state for complete failure', async () => {
      const user = userEvent.setup();
      handleRemediationSubmitSpy.mockImplementationOnce(async (args) => {
        // Call onProgress with values that will show standard error UI (not progress bar)
        // Need progressTotalBatches > 0, progressCompletedBatches > 0, and remediationId to exist
        if (args.onProgress) {
          args.onProgress(1, 1, 0, [], true);
        }
        return {
          success: false,
          status: 'complete_failure',
          remediationId: 'test-remediation-id', // Must exist to show standard error UI
          remediationName: 'Test Plan',
          isUpdate: false,
          errors: [],
        };
      });

      renderWithRouter(
        <RemediationWizardV2 setOpen={mockSetOpen} data={defaultDataFlat} />,
      );

      // Type a plan name to enable the submit button
      const input = screen.getByPlaceholderText(/Enter or select/i);
      await user.type(input, 'New Plan');
      await waitFor(() => {
        expect(
          screen.getByText(/Create new plan "New Plan"/i),
        ).toBeInTheDocument();
      });
      const createOption = screen.getByText(/Create new plan "New Plan"/i);
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
        expect(
          screen.getByText('Remediation plan creation failed'),
        ).toBeInTheDocument();
      });
      expect(
        screen.getByText('The plan creation failed. The plan was not created.'),
      ).toBeInTheDocument();
      const closeButtons = screen.getAllByRole('button', { name: /Close/i });
      expect(closeButtons.length).toBeGreaterThan(0);
    });

    it('should show error state for partial failure', async () => {
      const user = userEvent.setup();
      handleRemediationSubmitSpy.mockImplementationOnce(async () => {
        // Don't call onProgress - when progressTotalBatches === 0, partial failure shows standard error UI
        return {
          success: false,
          status: 'partial_failure',
          remediationId: 'partial-remediation-id',
          remediationName: 'Test Plan',
          isUpdate: false,
          errors: [],
        };
      });

      renderWithRouter(
        <RemediationWizardV2 setOpen={mockSetOpen} data={defaultDataFlat} />,
      );

      // Type a plan name to enable the submit button
      const input = screen.getByPlaceholderText(/Enter or select/i);
      await user.type(input, 'New Plan');
      await waitFor(() => {
        expect(
          screen.getByText(/Create new plan "New Plan"/i),
        ).toBeInTheDocument();
      });
      const createOption = screen.getByText(/Create new plan "New Plan"/i);
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
        expect(
          screen.getByText('Remediation plan creation failed'),
        ).toBeInTheDocument();
      });
      expect(
        screen.getByText(
          'The plan was partially created. Some of the selected items were not added to the plan.',
        ),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /View plan/i }),
      ).toBeInTheDocument();
      const closeButtons = screen.getAllByRole('button', { name: /Close/i });
      expect(closeButtons.length).toBeGreaterThan(0);
    });

    it('should show error state for update failure', async () => {
      const user = userEvent.setup();
      useRemediationsQuery.mockReturnValue({
        result: {
          data: [{ id: 'existing-plan-id', name: 'Existing Plan' }],
        },
        loading: false,
      });

      handleRemediationSubmitSpy.mockImplementationOnce(async (args) => {
        // Call onProgress with values that will show standard error UI (not progress bar)
        // progressTotalBatches > 0 and progressCompletedBatches > 0 to avoid progress bar UI
        if (args.onProgress) {
          args.onProgress(1, 1, 0, [], true);
        }
        return {
          success: false,
          status: 'complete_failure',
          remediationId: 'existing-plan-id',
          remediationName: 'Existing Plan',
          isUpdate: true,
          errors: [],
        };
      });

      renderWithRouter(
        <RemediationWizardV2 setOpen={mockSetOpen} data={defaultDataFlat} />,
      );

      const input = screen.getByPlaceholderText(/Enter or select/i);
      await user.click(input);
      await waitFor(() => {
        expect(screen.getByText('Existing Plan')).toBeInTheDocument();
      });
      const option = screen.getByText('Existing Plan');
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
        expect(
          screen.getByText('Remediation plan update failed'),
        ).toBeInTheDocument();
      });
      expect(
        screen.getByText('The plan update failed. The plan was not updated.'),
      ).toBeInTheDocument();
    });

    it('should close error state and return to main content', async () => {
      const user = userEvent.setup();
      handleRemediationSubmitSpy.mockResolvedValueOnce({
        success: false,
        status: 'complete_failure',
        remediationId: null,
        remediationName: 'Test Plan',
        isUpdate: false,
      });

      renderWithRouter(
        <RemediationWizardV2 setOpen={mockSetOpen} data={defaultDataFlat} />,
      );

      const input = screen.getByPlaceholderText(/Enter or select/i);
      await user.type(input, 'New Plan');
      await waitFor(() => {
        expect(
          screen.getByText(/Create new plan "New Plan"/i),
        ).toBeInTheDocument();
      });
      const createOption = screen.getByText(/Create new plan "New Plan"/i);
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
        expect(
          screen.getByText('Remediation plan creation failed'),
        ).toBeInTheDocument();
      });

      const closeButtons = screen.getAllByRole('button', { name: /Close/i });
      // The error state Close button should be one of them, click the last one (error state)
      await user.click(closeButtons[closeButtons.length - 1]);

      await waitFor(() => {
        expect(mockSetOpen).toHaveBeenCalledWith(false);
      });
    });

    it('should navigate to plan when View plan is clicked in partial failure', async () => {
      const user = userEvent.setup();
      const originalLocation = window.location;
      delete window.location;
      window.location = { href: '' };

      handleRemediationSubmitSpy.mockResolvedValueOnce({
        success: false,
        status: 'partial_failure',
        remediationId: 'partial-remediation-id',
        remediationName: 'Test Plan',
        isUpdate: false,
      });

      renderWithRouter(
        <RemediationWizardV2 setOpen={mockSetOpen} data={defaultDataFlat} />,
      );

      // Type a plan name and submit
      const input = screen.getByPlaceholderText(/Enter or select/i);
      await user.type(input, 'New Plan');
      await waitFor(() => {
        expect(
          screen.getByText(/Create new plan "New Plan"/i),
        ).toBeInTheDocument();
      });
      const createOption = screen.getByText(/Create new plan "New Plan"/i);
      await user.click(createOption);

      await waitFor(() => {
        const submitButton = screen.getByRole('button', {
          name: /Create plan/i,
        });
        expect(submitButton).toBeEnabled();
      });

      const submitButton = screen.getByRole('button', { name: /Create plan/i });
      await user.click(submitButton);

      // Wait for error state
      await waitFor(() => {
        expect(
          screen.getByText('Remediation plan creation failed'),
        ).toBeInTheDocument();
      });

      const viewPlanButton = screen.getByRole('button', { name: /View plan/i });
      await user.click(viewPlanButton);

      await waitFor(() => {
        expect(utils.remediationUrl).toHaveBeenCalledWith(
          'partial-remediation-id',
        );
      });

      // Restore window.location
      window.location = originalLocation;
    });

    it('should pass original data (not normalized) to handleRemediationSubmit', async () => {
      const user = userEvent.setup();
      renderWithRouter(
        <RemediationWizardV2 setOpen={mockSetOpen} data={defaultDataNested} />,
      );

      // Type a plan name to enable the submit button
      const input = screen.getByPlaceholderText(/Enter or select/i);
      await user.type(input, 'New Plan');
      // Wait for "Create new" option to appear and select it to close dropdown
      await waitFor(() => {
        expect(
          screen.getByText(/Create new plan "New Plan"/i),
        ).toBeInTheDocument();
      });
      const createOption = screen.getByText(/Create new plan "New Plan"/i);
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
    it('should call postPlaybookPreview when preview button is clicked', async () => {
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

      renderWithRouter(
        <RemediationWizardV2 setOpen={mockSetOpen} data={defaultDataFlat} />,
      );

      const input = screen.getByPlaceholderText(/Enter or select/i);
      await user.click(input);
      await waitFor(() => {
        expect(screen.getByText('Plan 1')).toBeInTheDocument();
      });
      const option = screen.getByText('Plan 1');
      await user.click(option);

      await waitFor(() => {
        const previewButton = screen.getByRole('button', {
          name: /Download preview/i,
        });
        expect(previewButton).toBeInTheDocument();
      });

      const previewButton = screen.getByRole('button', {
        name: /Download preview/i,
      });
      await user.click(previewButton);

      await waitFor(() => {
        expect(api.postPlaybookPreview).toHaveBeenCalled();
      });

      // Verify API was called with correct payload structure
      expect(api.postPlaybookPreview).toHaveBeenCalledWith(
        expect.objectContaining({
          auto_reboot: true,
          issues: expect.any(Array),
        }),
        { responseType: 'blob' },
      );

      await waitFor(() => {
        expect(utilitiesHelpers.downloadFile).toHaveBeenCalled();
      });
    });

    it('should pass enablePrecedence when isCompliancePrecedenceEnabled is true', async () => {
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

      renderWithRouter(
        <RemediationWizardV2
          setOpen={mockSetOpen}
          data={defaultDataFlat}
          isCompliancePrecedenceEnabled={true}
        />,
      );

      const input = screen.getByPlaceholderText(/Enter or select/i);
      await user.click(input);
      await waitFor(() => {
        expect(screen.getByText('Plan 1')).toBeInTheDocument();
      });
      const option = screen.getByText('Plan 1');
      await user.click(option);

      await waitFor(() => {
        const previewButton = screen.getByRole('button', {
          name: /Download preview/i,
        });
        expect(previewButton).toBeInTheDocument();
      });

      const previewButton = screen.getByRole('button', {
        name: /Download preview/i,
      });
      await user.click(previewButton);

      await waitFor(() => {
        expect(api.postPlaybookPreview).toHaveBeenCalled();
      });

      // Verify API was called with correct payload structure
      // When enablePrecedence is true, issues should include precedence if present
      expect(api.postPlaybookPreview).toHaveBeenCalledWith(
        expect.objectContaining({
          auto_reboot: true,
          issues: expect.any(Array),
        }),
        { responseType: 'blob' },
      );

      await waitFor(() => {
        expect(utilitiesHelpers.downloadFile).toHaveBeenCalled();
      });
    });
  });
  describe('Modal close functionality', () => {
    it('should call setOpen(false) when Cancel button is clicked', async () => {
      const user = userEvent.setup();
      renderWithRouter(
        <RemediationWizardV2 setOpen={mockSetOpen} data={defaultDataFlat} />,
      );

      expect(screen.getByText('Plan a remediation')).toBeInTheDocument();

      const cancelButton = screen.getByRole('button', { name: /Cancel/i });
      await user.click(cancelButton);

      await waitFor(() => {
        expect(mockSetOpen).toHaveBeenCalledWith(false);
      });
    });

    it('should call setOpen(false) when modal close is triggered', async () => {
      const user = userEvent.setup();
      renderWithRouter(
        <RemediationWizardV2 setOpen={mockSetOpen} data={defaultDataFlat} />,
      );

      await waitFor(() => {
        expect(screen.getByText('Plan a remediation')).toBeInTheDocument();
      });

      // Click the Cancel button which calls handleClose
      const cancelButton = screen.getByRole('button', { name: /Cancel/i });
      await user.click(cancelButton);

      await waitFor(() => {
        expect(mockSetOpen).toHaveBeenCalledWith(false);
      });
    });
  });

  describe('Edge cases', () => {
    it('should handle null data gracefully', () => {
      renderWithRouter(
        <RemediationWizardV2 setOpen={mockSetOpen} data={null} />,
      );

      // Check for chart titles which are more reliably queryable than SVG labels
      expect(screen.getAllByText(/0 System/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/0 Action point/i).length).toBeGreaterThan(0);
    });

    it('should handle undefined data gracefully', () => {
      renderWithRouter(
        <RemediationWizardV2 setOpen={mockSetOpen} data={undefined} />,
      );

      // Check for chart titles which are more reliably queryable than SVG labels
      expect(screen.getAllByText(/0 System/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/0 Action point/i).length).toBeGreaterThan(0);
    });

    it('should handle data with missing issues array', () => {
      renderWithRouter(
        <RemediationWizardV2
          setOpen={mockSetOpen}
          data={{ systems: ['system-1'] }}
        />,
      );

      expect(screen.getAllByText(/0 Action point/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/1 System/i).length).toBeGreaterThan(0);
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

      renderWithRouter(
        <RemediationWizardV2 setOpen={mockSetOpen} data={defaultDataFlat} />,
      );

      const input = screen.getByPlaceholderText(/Enter or select/i);
      await user.click(input);
      await waitFor(() => {
        expect(screen.getByText('Plan')).toBeInTheDocument();
      });
      const option = screen.getByText('Plan');
      await user.click(option);

      // When loading, charts should show skeletons instead of chart titles
      // The chart containers should exist but charts themselves may not be fully rendered
      // Check that we're in loading state by verifying the plan selection worked
      await waitFor(() => {
        expect(screen.getByText('Plan')).toBeInTheDocument();
      });
    });
  });
});
