/* eslint-disable react/prop-types */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import RenameModal from './RenameModal';

jest.mock('./Dialogs/TextInputDialog', () => {
  return function MockTextInputDialog({
    title,
    ariaLabel,
    value,
    onCancel,
    onSubmit,
    remediationsList,
    refetch,
  }) {
    return (
      <div data-testid="text-input-dialog">
        <div data-testid="dialog-title">{title}</div>
        <div data-testid="dialog-aria-label">{ariaLabel}</div>
        <div data-testid="dialog-value">{value}</div>
        <div data-testid="remediations-list">
          {JSON.stringify(remediationsList)}
        </div>
        <button data-testid="cancel-button" onClick={onCancel}>
          Cancel
        </button>
        <button
          data-testid="submit-button"
          onClick={() => onSubmit('New Remediation Name')}
        >
          Submit
        </button>
        <button data-testid="submit-empty-button" onClick={() => onSubmit('')}>
          Submit Empty
        </button>
        <button
          data-testid="submit-whitespace-button"
          onClick={() => onSubmit('   Whitespace Name   ')}
        >
          Submit Whitespace
        </button>
        {refetch && <div data-testid="has-refetch">Has refetch</div>}
      </div>
    );
  };
});

jest.mock('../Utilities/dispatcher', () => ({
  dispatchNotification: jest.fn(),
}));

jest.mock('../api', () => ({
  patchRemediation: jest.fn(),
}));

const { dispatchNotification } = require('../Utilities/dispatcher');
const { patchRemediation } = require('../api');

// Create a simple mock store
const mockStore = createStore(() => ({}));

describe('RenameModal', () => {
  const defaultProps = {
    remediation: {
      id: 'remediation-1',
      name: 'Test Remediation',
    },
    setIsRenameModalOpen: jest.fn(),
    remediationsList: [
      { id: 'rem-1', name: 'Existing Remediation 1' },
      { id: 'rem-2', name: 'Existing Remediation 2' },
    ],
    fetch: jest.fn(),
    refetch: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    patchRemediation.mockResolvedValue({});
  });

  const renderWithStore = (props = {}) => {
    return render(
      <Provider store={mockStore}>
        <RenameModal {...defaultProps} {...props} />
      </Provider>,
    );
  };

  describe('Basic rendering', () => {
    it('should render TextInputDialog with correct props', () => {
      renderWithStore();

      expect(screen.getByTestId('text-input-dialog')).toBeInTheDocument();
      expect(screen.getByTestId('dialog-title')).toHaveTextContent(
        'Rename remediation plan?',
      );
      expect(screen.getByTestId('dialog-aria-label')).toHaveTextContent(
        'RenameModal',
      );
      expect(screen.getByTestId('dialog-value')).toHaveTextContent(
        'Test Remediation',
      );
    });

    it('should pass remediationsList prop correctly', () => {
      renderWithStore();

      const remediationsListText =
        screen.getByTestId('remediations-list').textContent;
      const remediationsList = JSON.parse(remediationsListText);

      expect(remediationsList).toEqual(defaultProps.remediationsList);
    });

    it('should handle null remediationsList by providing empty array', () => {
      renderWithStore({ remediationsList: null });

      const remediationsListText =
        screen.getByTestId('remediations-list').textContent;
      const remediationsList = JSON.parse(remediationsListText);

      expect(remediationsList).toEqual([]);
    });

    it('should handle undefined remediationsList by providing empty array', () => {
      renderWithStore({ remediationsList: undefined });

      const remediationsListText =
        screen.getByTestId('remediations-list').textContent;
      const remediationsList = JSON.parse(remediationsListText);

      expect(remediationsList).toEqual([]);
    });

    it('should pass refetch prop when provided', () => {
      renderWithStore();

      expect(screen.getByTestId('has-refetch')).toBeInTheDocument();
    });

    it('should not break when refetch is not provided', () => {
      renderWithStore({ refetch: undefined });

      expect(screen.queryByTestId('has-refetch')).not.toBeInTheDocument();
    });
  });

  describe('Cancel functionality', () => {
    it('should call setIsRenameModalOpen(false) when cancel is clicked', () => {
      const mockSetIsRenameModalOpen = jest.fn();
      renderWithStore({ setIsRenameModalOpen: mockSetIsRenameModalOpen });

      fireEvent.click(screen.getByTestId('cancel-button'));

      expect(mockSetIsRenameModalOpen).toHaveBeenCalledWith(false);
    });
  });

  describe('Submit functionality', () => {
    it('should handle successful rename submission', async () => {
      const mockSetIsRenameModalOpen = jest.fn();
      const mockFetch = jest.fn();
      const mockRefetch = jest.fn();

      renderWithStore({
        setIsRenameModalOpen: mockSetIsRenameModalOpen,
        fetch: mockFetch,
        refetch: mockRefetch,
      });

      fireEvent.click(screen.getByTestId('submit-button'));

      // Should close modal immediately
      expect(mockSetIsRenameModalOpen).toHaveBeenCalledWith(false);

      // Wait for async operations
      await waitFor(() => {
        expect(patchRemediation).toHaveBeenCalledWith('remediation-1', {
          name: 'New Remediation Name',
        });
      });

      await waitFor(() => {
        expect(dispatchNotification).toHaveBeenCalledWith({
          title: 'Remediation plan renamed',
          variant: 'success',
          dismissable: true,
          autoDismiss: true,
        });
      });

      expect(mockFetch).toHaveBeenCalled();
      expect(mockRefetch).toHaveBeenCalled();
    });

    it('should handle empty name submission by using default name', async () => {
      renderWithStore();

      fireEvent.click(screen.getByTestId('submit-empty-button'));

      await waitFor(() => {
        expect(patchRemediation).toHaveBeenCalledWith('remediation-1', {
          name: 'Unnamed Playbook',
        });
      });
    });

    it('should trim whitespace from submitted name', async () => {
      renderWithStore();

      fireEvent.click(screen.getByTestId('submit-whitespace-button'));

      await waitFor(() => {
        expect(patchRemediation).toHaveBeenCalledWith('remediation-1', {
          name: 'Whitespace Name',
        });
      });
    });

    it('should handle failed rename submission', async () => {
      const error = new Error('API Error');
      patchRemediation.mockRejectedValue(error);

      const consoleSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      renderWithStore();

      fireEvent.click(screen.getByTestId('submit-button'));

      await waitFor(() => {
        expect(patchRemediation).toHaveBeenCalledWith('remediation-1', {
          name: 'New Remediation Name',
        });
      });

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(error);
      });

      await waitFor(() => {
        expect(dispatchNotification).toHaveBeenCalledWith({
          title: 'Failed to update playbook name',
          variant: 'danger',
          dismissable: true,
          autoDismiss: true,
        });
      });

      consoleSpy.mockRestore();
    });

    it('should not call fetch when not provided', async () => {
      renderWithStore({ fetch: undefined });

      fireEvent.click(screen.getByTestId('submit-button'));

      await waitFor(() => {
        expect(patchRemediation).toHaveBeenCalled();
      });

      // No error should be thrown for missing fetch
    });

    it('should not call refetch when not provided', async () => {
      renderWithStore({ refetch: undefined });

      fireEvent.click(screen.getByTestId('submit-button'));

      await waitFor(() => {
        expect(patchRemediation).toHaveBeenCalled();
      });

      // No error should be thrown for missing refetch
    });
  });

  describe('Redux connection', () => {
    it('should be connected to Redux', () => {
      // The default export should be the connected component
      expect(RenameModal).toBeDefined();
      expect(typeof RenameModal).toBe('object'); // Connected components are objects
    });

    it('should work with minimal props', () => {
      const minimalProps = {
        remediation: { id: 'test', name: 'Test' },
      };

      expect(() => {
        renderWithStore(minimalProps);
      }).not.toThrow();

      expect(screen.getByTestId('text-input-dialog')).toBeInTheDocument();
    });
  });

  describe('Edge cases', () => {
    it('should handle remediation with empty name', () => {
      renderWithStore({
        remediation: { id: 'test', name: '' },
      });

      expect(screen.getByTestId('dialog-value')).toHaveTextContent('');
    });

    it('should handle remediation with null name', () => {
      renderWithStore({
        remediation: { id: 'test', name: null },
      });

      expect(screen.getByTestId('dialog-value')).toHaveTextContent('');
    });

    it('should handle remediation with undefined name', () => {
      renderWithStore({
        remediation: { id: 'test', name: undefined },
      });

      expect(screen.getByTestId('dialog-value')).toHaveTextContent('');
    });

    it('should handle very long remediation names', () => {
      const longName = 'A'.repeat(1000);
      renderWithStore({
        remediation: { id: 'test', name: longName },
      });

      expect(screen.getByTestId('dialog-value')).toHaveTextContent(longName);
    });

    it('should handle special characters in remediation names', () => {
      const specialName = '!@#$%^&*()_+-=[]{}|;":,.<>?';
      renderWithStore({
        remediation: { id: 'test', name: specialName },
      });

      expect(screen.getByTestId('dialog-value')).toHaveTextContent(specialName);
    });

    it('should handle unicode characters in remediation names', () => {
      const unicodeName = '测试 🚀 Тест עברית العربية';
      renderWithStore({
        remediation: { id: 'test', name: unicodeName },
      });

      expect(screen.getByTestId('dialog-value')).toHaveTextContent(unicodeName);
    });
  });

  describe('Async error handling', () => {
    it('should handle network timeout errors', async () => {
      const timeoutError = new Error('Network timeout');
      timeoutError.code = 'NETWORK_TIMEOUT';
      patchRemediation.mockRejectedValue(timeoutError);

      const consoleSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      renderWithStore();

      fireEvent.click(screen.getByTestId('submit-button'));

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(timeoutError);
      });

      await waitFor(() => {
        expect(dispatchNotification).toHaveBeenCalledWith({
          title: 'Failed to update playbook name',
          variant: 'danger',
          dismissable: true,
          autoDismiss: true,
        });
      });

      consoleSpy.mockRestore();
    });

    it('should handle API response errors', async () => {
      const apiError = {
        response: {
          status: 400,
          data: { message: 'Invalid name' },
        },
      };
      patchRemediation.mockRejectedValue(apiError);

      const consoleSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      renderWithStore();

      fireEvent.click(screen.getByTestId('submit-button'));

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(apiError);
      });

      consoleSpy.mockRestore();
    });
  });

  describe('Component lifecycle', () => {
    it('should clean up properly when unmounted', () => {
      const { unmount } = renderWithStore();

      expect(() => {
        unmount();
      }).not.toThrow();
    });

    it('should handle rapid successive clicks without breaking', async () => {
      renderWithStore();

      const submitButton = screen.getByTestId('submit-button');

      // Click multiple times rapidly
      fireEvent.click(submitButton);
      fireEvent.click(submitButton);
      fireEvent.click(submitButton);

      // Should still work correctly
      await waitFor(() => {
        expect(patchRemediation).toHaveBeenCalled();
      });
    });
  });
});
