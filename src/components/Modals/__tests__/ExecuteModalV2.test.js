import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ExecuteModalV2 } from '../ExecuteModalV2';
import { mockRemediationStatus } from '../../../__mocks__/remediationStatus';

// Mock hooks
const mockAddNotification = jest.fn();
jest.mock(
  '@redhat-cloud-services/frontend-components-notifications/hooks',
  () => ({
    useAddNotification: () => mockAddNotification,
  }),
);

const mockExecuteRun = jest.fn();
jest.mock('../../../Utilities/Hooks/api/useRemediations', () => ({
  __esModule: true,
  default: jest.fn((endpoint, options) => {
    if (endpoint === 'runRemediation' && options?.skip) {
      return {
        fetch: mockExecuteRun,
      };
    }
    return {};
  }),
}));

describe('ExecuteModalV2', () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    remediation: {
      id: '123',
      name: 'Test Remediation',
      auto_reboot: false,
    },
    refetchRemediationPlaybookRuns: jest.fn(),
    remediationStatus: mockRemediationStatus,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockExecuteRun.mockResolvedValue({});
  });

  describe('Rendering', () => {
    it('should render all modal content correctly', () => {
      render(<ExecuteModalV2 {...defaultProps} />);

      expect(
        screen.getByText('Plan execution cannot be stopped or rolled back'),
      ).toBeInTheDocument();

      expect(
        screen.getByText(
          'Once you execute this plan, changes will be pushed immediately and cannot be rolled back.',
        ),
      ).toBeInTheDocument();

      expect(
        screen.getByText(/Executing this plan will remediate 2 systems/),
      ).toBeInTheDocument();

      expect(
        screen.getByText(
          'Auto-reboot is disabled for this plan. None of the included systems will reboot automatically.',
        ),
      ).toBeInTheDocument();

      expect(
        screen.getByRole('button', { name: 'Execute' }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Cancel' }),
      ).toBeInTheDocument();
    });

    it('should not render modal when isOpen is false', () => {
      render(<ExecuteModalV2 {...defaultProps} isOpen={false} />);

      expect(
        screen.queryByText('Plan execution cannot be stopped or rolled back'),
      ).not.toBeInTheDocument();
    });

    it('should display singular form for single system', () => {
      const singleSystemStatus = {
        ...mockRemediationStatus,
        connectedData: [
          {
            executor_name: 'Satellite 1 (connected)',
            executor_id: 'sat-1',
            connection_status: 'connected',
            system_count: 1,
          },
        ],
      };

      render(
        <ExecuteModalV2
          {...defaultProps}
          remediationStatus={singleSystemStatus}
        />,
      );

      expect(
        screen.getByText(/Executing this plan will remediate 1 system/),
      ).toBeInTheDocument();
    });

    it('should display 0 systems when no connected systems', () => {
      const noConnectedStatus = {
        ...mockRemediationStatus,
        connectedData: [
          {
            executor_name: null,
            executor_id: 'edge-42',
            connection_status: 'disconnected',
            system_count: 1,
          },
        ],
      };

      render(
        <ExecuteModalV2
          {...defaultProps}
          remediationStatus={noConnectedStatus}
        />,
      );

      expect(
        screen.getByText(/Executing this plan will remediate 0 systems/),
      ).toBeInTheDocument();
    });

    it('should display auto-reboot enabled message when auto_reboot is true', () => {
      render(
        <ExecuteModalV2
          {...defaultProps}
          remediation={{ ...defaultProps.remediation, auto_reboot: true }}
        />,
      );

      expect(
        screen.getByText(
          'Auto-reboot is enabled for this plan. All of the included systems that require a reboot will reboot automatically.',
        ),
      ).toBeInTheDocument();
    });

    it('should default to disabled when auto_reboot is undefined', () => {
      render(
        <ExecuteModalV2
          {...defaultProps}
          remediation={{ id: '123', name: 'Test Remediation' }}
        />,
      );

      expect(
        screen.getByText(
          'Auto-reboot is disabled for this plan. None of the included systems will reboot automatically.',
        ),
      ).toBeInTheDocument();
    });
  });

  describe('Buttons', () => {
    it('should disable Execute button when no connected systems', () => {
      const noConnectedStatus = {
        ...mockRemediationStatus,
        connectedData: [
          {
            executor_name: null,
            executor_id: 'edge-42',
            connection_status: 'disconnected',
            system_count: 1,
          },
        ],
      };

      render(
        <ExecuteModalV2
          {...defaultProps}
          remediationStatus={noConnectedStatus}
        />,
      );

      const executeButton = screen.getByRole('button', { name: 'Execute' });
      expect(executeButton).toBeDisabled();
    });

    it('should enable Execute button when connected systems exist', () => {
      render(<ExecuteModalV2 {...defaultProps} />);

      const executeButton = screen.getByRole('button', { name: 'Execute' });
      expect(executeButton).toBeEnabled();
    });
  });

  describe('User interactions', () => {
    it('should execute remediation when Execute button is clicked', async () => {
      const mockOnClose = jest.fn();
      const mockRefetch = jest.fn();

      render(
        <ExecuteModalV2
          {...defaultProps}
          onClose={mockOnClose}
          refetchRemediationPlaybookRuns={mockRefetch}
        />,
      );

      fireEvent.click(screen.getByRole('button', { name: 'Execute' }));

      await waitFor(() => {
        expect(mockExecuteRun).toHaveBeenCalledWith({
          id: '123',
          playbookRunsInput: { exclude: ['edge-42'] },
        });
      });

      await waitFor(() => {
        expect(mockRefetch).toHaveBeenCalledTimes(1);
      });

      await waitFor(() => {
        expect(mockAddNotification).toHaveBeenCalledWith({
          title: 'Executing playbook Test Remediation',
          description: expect.any(Object),
          variant: 'success',
          dismissable: true,
          autoDismiss: true,
        });
      });

      await waitFor(() => {
        expect(mockOnClose).toHaveBeenCalledTimes(1);
      });
    });

    it('should handle execution error and show error notification', async () => {
      const mockOnClose = jest.fn();
      const errorMessage = 'Execution failed';
      mockExecuteRun.mockRejectedValueOnce(new Error(errorMessage));

      render(<ExecuteModalV2 {...defaultProps} onClose={mockOnClose} />);

      fireEvent.click(screen.getByRole('button', { name: 'Execute' }));

      await waitFor(() => {
        expect(mockAddNotification).toHaveBeenCalledWith({
          title: 'Failed to execute playbook',
          description: errorMessage,
          variant: 'danger',
          dismissable: true,
          autoDismiss: true,
        });
      });

      // Should not close modal on error
      expect(mockOnClose).not.toHaveBeenCalled();
    });

    it('should exclude disconnected systems from execution', async () => {
      render(<ExecuteModalV2 {...defaultProps} />);

      fireEvent.click(screen.getByRole('button', { name: 'Execute' }));

      await waitFor(() => {
        expect(mockExecuteRun).toHaveBeenCalledWith({
          id: '123',
          playbookRunsInput: { exclude: ['edge-42'] },
        });
      });
    });

    it('should handle empty exclude array when all systems are connected', async () => {
      const allConnectedStatus = {
        ...mockRemediationStatus,
        connectedData: [
          {
            executor_name: 'Satellite 1 (connected)',
            executor_id: 'sat-1',
            connection_status: 'connected',
            system_count: 1,
          },
          {
            executor_name: null,
            executor_id: null,
            connection_status: 'connected',
            system_count: 1,
          },
        ],
      };

      render(
        <ExecuteModalV2
          {...defaultProps}
          remediationStatus={allConnectedStatus}
        />,
      );

      fireEvent.click(screen.getByRole('button', { name: 'Execute' }));

      await waitFor(() => {
        expect(mockExecuteRun).toHaveBeenCalledWith({
          id: '123',
          playbookRunsInput: { exclude: [] },
        });
      });
    });
  });

  describe('Edge cases', () => {
    it('should handle empty connectedData', () => {
      const emptyStatus = {
        ...mockRemediationStatus,
        connectedData: [],
      };

      render(
        <ExecuteModalV2 {...defaultProps} remediationStatus={emptyStatus} />,
      );

      expect(
        screen.getByText(/Executing this plan will remediate 0 systems/),
      ).toBeInTheDocument();
    });

    it('should handle undefined connectedData', () => {
      const undefinedStatus = {
        ...mockRemediationStatus,
        connectedData: undefined,
      };

      render(
        <ExecuteModalV2
          {...defaultProps}
          remediationStatus={undefinedStatus}
        />,
      );

      expect(
        screen.getByText(/Executing this plan will remediate 0 systems/),
      ).toBeInTheDocument();
    });

    it('should handle null remediationStatus', () => {
      render(<ExecuteModalV2 {...defaultProps} remediationStatus={null} />);

      expect(
        screen.getByText(/Executing this plan will remediate 0 systems/),
      ).toBeInTheDocument();
    });
  });
});
