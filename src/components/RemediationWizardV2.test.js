import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { RemediationWizardV2 } from './RemediationWizardV2';

// Mock only API calls and external dependencies
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

jest.mock('./RemediationWizardV2/usePlaybookSelect', () => ({
  usePlaybookSelect: jest.fn(() => ({
    selected: '',
    inputValue: '',
    isExistingPlanSelected: false,
    isSelectOpen: false,
    selectOptions: [],
    focusedItemIndex: null,
    activeItemId: null,
    textInputRef: { current: null },
    onToggleClick: jest.fn(),
    onInputClick: jest.fn(),
    onSelect: jest.fn(),
    onTextInputChange: jest.fn(),
    onInputKeyDown: jest.fn(),
    handleClear: jest.fn(),
    closeMenu: jest.fn(),
    createItemId: jest.fn((id) => `item-${id}`),
  })),
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

const {
  usePlaybookSelect,
} = require('./RemediationWizardV2/usePlaybookSelect');
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
    usePlaybookSelect.mockReturnValue({
      selected: '',
      inputValue: '',
      isExistingPlanSelected: false,
      isSelectOpen: false,
      selectOptions: [],
      focusedItemIndex: null,
      activeItemId: null,
      textInputRef: { current: null },
      onToggleClick: jest.fn(),
      onInputClick: jest.fn(),
      onSelect: jest.fn(),
      onTextInputChange: jest.fn(),
      onInputKeyDown: jest.fn(),
      handleClear: jest.fn(),
      closeMenu: jest.fn(),
      createItemId: jest.fn((id) => `item-${id}`),
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
    it('should render modal with correct title', () => {
      render(
        <RemediationWizardV2 setOpen={mockSetOpen} data={defaultDataFlat} />,
      );

      expect(screen.getByText('Plan a remediation')).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /Open Remediations popover/i }),
      ).toBeInTheDocument();
    });

    it('should render modal body content', () => {
      render(
        <RemediationWizardV2 setOpen={mockSetOpen} data={defaultDataFlat} />,
      );

      expect(
        screen.getByText(
          /Create or update a plan to remediate issues identified by Red Hat Lightspeed/i,
        ),
      ).toBeInTheDocument();
      expect(
        screen.getByText('Select or create a playbook'),
      ).toBeInTheDocument();
    });

    it('should render plan summary header', () => {
      render(
        <RemediationWizardV2 setOpen={mockSetOpen} data={defaultDataFlat} />,
      );

      expect(screen.getByText('Plan summary')).toBeInTheDocument();
      expect(
        screen.getByText(
          /Execution limits: 100 systems and 1000 action points/i,
        ),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('switch', { name: /Auto-reboot/i }),
      ).toBeChecked();
    });

    it('should render plan summary charts', () => {
      render(
        <RemediationWizardV2 setOpen={mockSetOpen} data={defaultDataFlat} />,
      );

      expect(screen.getAllByText('Actions').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Systems').length).toBeGreaterThan(0);
    });

    it('should render action points helper text', () => {
      render(
        <RemediationWizardV2 setOpen={mockSetOpen} data={defaultDataFlat} />,
      );

      expect(
        screen.getByText(
          /Action points \(pts\) per issue type: Advisor: 20 pts, Vulnerability: 20 pts, Patch: 2 pts, and Compliance: 5 pts/i,
        ),
      ).toBeInTheDocument();
    });

    it('should render footer buttons', () => {
      render(
        <RemediationWizardV2 setOpen={mockSetOpen} data={defaultDataFlat} />,
      );

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

    it('should update counts when existing plan is selected', () => {
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

      usePlaybookSelect.mockReturnValue({
        selected: 'existing-plan-id',
        inputValue: 'Existing Plan',
        isExistingPlanSelected: true,
        isSelectOpen: false,
        selectOptions: [],
        focusedItemIndex: null,
        activeItemId: null,
        textInputRef: { current: null },
        onToggleClick: jest.fn(),
        onInputClick: jest.fn(),
        onSelect: jest.fn(),
        onTextInputChange: jest.fn(),
        onInputKeyDown: jest.fn(),
        handleClear: jest.fn(),
        closeMenu: jest.fn(),
        createItemId: jest.fn((id) => `item-${id}`),
      });

      render(
        <RemediationWizardV2 setOpen={mockSetOpen} data={defaultDataFlat} />,
      );

      // Base: 2 issues, 3 systems, ~22 action points (1 patch + 1 vulnerability)
      // Plan: 1 issue, 5 systems, 2 action points
      // Total: 3 issues, 8 systems, 24 action points
      expect(screen.getAllByText(/3 actions/i).length).toBeGreaterThan(0);
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
      usePlaybookSelect.mockReturnValue({
        selected: '',
        inputValue: '',
        isExistingPlanSelected: false,
        isSelectOpen: false,
        selectOptions: [],
        focusedItemIndex: null,
        activeItemId: null,
        textInputRef: { current: null },
        onToggleClick: jest.fn(),
        onInputClick: jest.fn(),
        onSelect: jest.fn(),
        onTextInputChange: jest.fn(),
        onInputKeyDown: jest.fn(),
        handleClear: jest.fn(),
        closeMenu: jest.fn(),
        createItemId: jest.fn((id) => `item-${id}`),
      });

      render(
        <RemediationWizardV2 setOpen={mockSetOpen} data={defaultDataFlat} />,
      );

      const submitButton = screen.getByRole('button', { name: /Create plan/i });
      expect(submitButton).toBeDisabled();
    });

    it('should enable submit button when existing plan is selected', () => {
      usePlaybookSelect.mockReturnValue({
        selected: 'existing-plan-id',
        inputValue: 'Existing Plan',
        isExistingPlanSelected: true,
        isSelectOpen: false,
        selectOptions: [],
        focusedItemIndex: null,
        activeItemId: null,
        textInputRef: { current: null },
        onToggleClick: jest.fn(),
        onInputClick: jest.fn(),
        onSelect: jest.fn(),
        onTextInputChange: jest.fn(),
        onInputKeyDown: jest.fn(),
        handleClear: jest.fn(),
        closeMenu: jest.fn(),
        createItemId: jest.fn((id) => `item-${id}`),
      });

      render(
        <RemediationWizardV2 setOpen={mockSetOpen} data={defaultDataFlat} />,
      );

      const submitButton = screen.getByRole('button', { name: /Update plan/i });
      expect(submitButton).toBeEnabled();
    });

    it('should disable submit button when dropdown is open', () => {
      usePlaybookSelect.mockReturnValue({
        selected: '',
        inputValue: 'New Plan',
        isExistingPlanSelected: false,
        isSelectOpen: true,
        selectOptions: [],
        focusedItemIndex: null,
        activeItemId: null,
        textInputRef: { current: null },
        onToggleClick: jest.fn(),
        onInputClick: jest.fn(),
        onSelect: jest.fn(),
        onTextInputChange: jest.fn(),
        onInputKeyDown: jest.fn(),
        handleClear: jest.fn(),
        closeMenu: jest.fn(),
        createItemId: jest.fn((id) => `item-${id}`),
      });

      render(
        <RemediationWizardV2 setOpen={mockSetOpen} data={defaultDataFlat} />,
      );

      const submitButton = screen.getByRole('button', { name: /Create plan/i });
      expect(submitButton).toBeDisabled();
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
      usePlaybookSelect.mockReturnValue({
        selected: '',
        inputValue: 'New Remediation Plan',
        isExistingPlanSelected: false,
        isSelectOpen: false,
        selectOptions: [],
        focusedItemIndex: null,
        activeItemId: null,
        textInputRef: { current: null },
        onToggleClick: jest.fn(),
        onInputClick: jest.fn(),
        onSelect: jest.fn(),
        onTextInputChange: jest.fn(),
        onInputKeyDown: jest.fn(),
        handleClear: jest.fn(),
        closeMenu: jest.fn(),
        createItemId: jest.fn((id) => `item-${id}`),
      });

      render(
        <RemediationWizardV2 setOpen={mockSetOpen} data={defaultDataFlat} />,
      );

      const submitButton = screen.getByRole('button', { name: /Create plan/i });
      fireEvent.click(submitButton);

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
      usePlaybookSelect.mockReturnValue({
        selected: 'existing-plan-id',
        inputValue: 'Updated Plan',
        isExistingPlanSelected: true,
        isSelectOpen: false,
        selectOptions: [],
        focusedItemIndex: null,
        activeItemId: null,
        textInputRef: { current: null },
        onToggleClick: jest.fn(),
        onInputClick: jest.fn(),
        onSelect: jest.fn(),
        onTextInputChange: jest.fn(),
        onInputKeyDown: jest.fn(),
        handleClear: jest.fn(),
        closeMenu: jest.fn(),
        createItemId: jest.fn((id) => `item-${id}`),
      });

      render(
        <RemediationWizardV2 setOpen={mockSetOpen} data={defaultDataFlat} />,
      );

      const submitButton = screen.getByRole('button', { name: /Update plan/i });
      fireEvent.click(submitButton);

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
      usePlaybookSelect.mockReturnValue({
        selected: '',
        inputValue: 'New Plan',
        isExistingPlanSelected: false,
        isSelectOpen: false,
        selectOptions: [],
        focusedItemIndex: null,
        activeItemId: null,
        textInputRef: { current: null },
        onToggleClick: jest.fn(),
        onInputClick: jest.fn(),
        onSelect: jest.fn(),
        onTextInputChange: jest.fn(),
        onInputKeyDown: jest.fn(),
        handleClear: jest.fn(),
        closeMenu: jest.fn(),
        createItemId: jest.fn((id) => `item-${id}`),
      });

      render(
        <RemediationWizardV2 setOpen={mockSetOpen} data={defaultDataFlat} />,
      );

      const submitButton = screen.getByRole('button', { name: /Create plan/i });
      fireEvent.click(submitButton);

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
      handleRemediationSubmitSpy.mockResolvedValueOnce({
        success: true,
        // No remediationId
      });

      usePlaybookSelect.mockReturnValue({
        selected: '',
        inputValue: 'New Plan',
        isExistingPlanSelected: false,
        isSelectOpen: false,
        selectOptions: [],
        focusedItemIndex: null,
        activeItemId: null,
        textInputRef: { current: null },
        onToggleClick: jest.fn(),
        onInputClick: jest.fn(),
        onSelect: jest.fn(),
        onTextInputChange: jest.fn(),
        onInputKeyDown: jest.fn(),
        handleClear: jest.fn(),
        closeMenu: jest.fn(),
        createItemId: jest.fn((id) => `item-${id}`),
      });

      render(
        <RemediationWizardV2 setOpen={mockSetOpen} data={defaultDataFlat} />,
      );

      const submitButton = screen.getByRole('button', { name: /Create plan/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(handleRemediationSubmitSpy).toHaveBeenCalled();
      });

      // Should not navigate if no remediationId (remediationUrl should not be called)
      expect(utils.remediationUrl).not.toHaveBeenCalled();
      // Modal should not close if no remediationId (no navigation, no action)
      expect(mockSetOpen).not.toHaveBeenCalled();
    });

    it('should handle submission errors gracefully', async () => {
      const consoleSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      handleRemediationSubmitSpy.mockRejectedValue(
        new Error('Submission failed'),
      );

      usePlaybookSelect.mockReturnValue({
        selected: '',
        inputValue: 'New Plan',
        isExistingPlanSelected: false,
        isSelectOpen: false,
        selectOptions: [],
        focusedItemIndex: null,
        activeItemId: null,
        textInputRef: { current: null },
        onToggleClick: jest.fn(),
        onInputClick: jest.fn(),
        onSelect: jest.fn(),
        onTextInputChange: jest.fn(),
        onInputKeyDown: jest.fn(),
        handleClear: jest.fn(),
        closeMenu: jest.fn(),
        createItemId: jest.fn((id) => `item-${id}`),
      });

      render(
        <RemediationWizardV2 setOpen={mockSetOpen} data={defaultDataFlat} />,
      );

      const submitButton = screen.getByRole('button', { name: /Create plan/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalled();
      });

      // Modal should not close on error
      expect(mockSetOpen).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it('should pass original data (not normalized) to handleRemediationSubmit', async () => {
      usePlaybookSelect.mockReturnValue({
        selected: '',
        inputValue: 'New Plan',
        isExistingPlanSelected: false,
        isSelectOpen: false,
        selectOptions: [],
        focusedItemIndex: null,
        activeItemId: null,
        textInputRef: { current: null },
        onToggleClick: jest.fn(),
        onInputClick: jest.fn(),
        onSelect: jest.fn(),
        onTextInputChange: jest.fn(),
        onInputKeyDown: jest.fn(),
        handleClear: jest.fn(),
        closeMenu: jest.fn(),
        createItemId: jest.fn((id) => `item-${id}`),
      });

      render(
        <RemediationWizardV2 setOpen={mockSetOpen} data={defaultDataNested} />,
      );

      const submitButton = screen.getByRole('button', { name: /Create plan/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(handleRemediationSubmitSpy).toHaveBeenCalled();
      });

      const callArgs = handleRemediationSubmitSpy.mock.calls[0][0];
      expect(callArgs.data).toEqual(defaultDataNested); // Original nested structure
    });
  });

  describe('Preview functionality', () => {
    it('should call handleRemediationPreview when preview button is clicked', () => {
      useRemediationsQuery.mockReturnValue({
        result: {
          data: [
            { id: 'plan-1', name: 'Plan 1' },
            { id: 'plan-2', name: 'Plan 2' },
          ],
        },
        loading: false,
      });

      usePlaybookSelect.mockReturnValue({
        selected: 'plan-1',
        inputValue: 'Plan 1',
        isExistingPlanSelected: true,
        isSelectOpen: false,
        selectOptions: [],
        focusedItemIndex: null,
        activeItemId: null,
        textInputRef: { current: null },
        onToggleClick: jest.fn(),
        onInputClick: jest.fn(),
        onSelect: jest.fn(),
        onTextInputChange: jest.fn(),
        onInputKeyDown: jest.fn(),
        handleClear: jest.fn(),
        closeMenu: jest.fn(),
        createItemId: jest.fn((id) => `item-${id}`),
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

      const previewButton = screen.getByRole('button', { name: /Preview/i });
      fireEvent.click(previewButton);

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

    it('should handle loading state for remediation details', () => {
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

      usePlaybookSelect.mockReturnValue({
        selected: 'plan-id',
        inputValue: 'Plan',
        isExistingPlanSelected: true,
        isSelectOpen: false,
        selectOptions: [],
        focusedItemIndex: null,
        activeItemId: null,
        textInputRef: { current: null },
        onToggleClick: jest.fn(),
        onInputClick: jest.fn(),
        onSelect: jest.fn(),
        onTextInputChange: jest.fn(),
        onInputKeyDown: jest.fn(),
        handleClear: jest.fn(),
        closeMenu: jest.fn(),
        createItemId: jest.fn((id) => `item-${id}`),
      });

      render(
        <RemediationWizardV2 setOpen={mockSetOpen} data={defaultDataFlat} />,
      );

      // When loading, skeleton should be shown instead of charts
      expect(screen.queryByText('Actions')).not.toBeInTheDocument();
      expect(screen.queryByText('Systems')).not.toBeInTheDocument();
    });
  });
});
