import { renderHook, act } from '@testing-library/react';
import useOnConfirm from './useOnConfirm';

describe('useOnConfirm Hook', () => {
  let mockDeleteSystemsBatched;
  let mockRefreshRemediation;
  let mockSetIsOpen;
  let mockSetIsRemoving;
  let mockActiveSystem;
  let mockSelected;
  let mockRemediation;
  let mockAddNotification;

  let mockClearSelection;
  let mockReloadTable;

  const successfulDeletion = {
    status: 'success',
    successfulBatches: 1,
    failedBatches: 0,
  };

  beforeEach(() => {
    mockDeleteSystemsBatched = jest.fn().mockResolvedValue(successfulDeletion);
    mockRefreshRemediation = jest.fn().mockResolvedValue({});
    mockSetIsOpen = jest.fn();
    mockSetIsRemoving = jest.fn();
    mockAddNotification = jest.fn();
    mockClearSelection = jest.fn();
    mockReloadTable = jest.fn();
    mockActiveSystem = {
      current: { id: 'active-system-1', name: 'Active System' },
    };
    mockRemediation = { id: 'rem-123', name: 'Test Remediation' };
  });

  describe('Hook initialization', () => {
    it('should return a function', () => {
      mockSelected = new Map();
      const { result } = renderHook(() =>
        useOnConfirm({
          selected: mockSelected,
          activeSystem: mockActiveSystem,
          deleteRemediationSystemsBatched: mockDeleteSystemsBatched,
          clearSelection: mockClearSelection,
          reloadTable: mockReloadTable,
          remediation: mockRemediation,
          refreshRemediation: mockRefreshRemediation,
          setIsOpen: mockSetIsOpen,
          addNotification: mockAddNotification,
        }),
      );

      expect(typeof result.current).toBe('function');
    });

    it('should memoize the callback with correct dependencies', () => {
      mockSelected = new Map();
      const { result, rerender } = renderHook(() =>
        useOnConfirm({
          selected: mockSelected,
          activeSystem: mockActiveSystem,
          deleteRemediationSystemsBatched: mockDeleteSystemsBatched,
          clearSelection: mockClearSelection,
          reloadTable: mockReloadTable,
          remediation: mockRemediation,
          refreshRemediation: mockRefreshRemediation,
          setIsOpen: mockSetIsOpen,
          addNotification: mockAddNotification,
        }),
      );

      const firstCallback = result.current;
      rerender();
      const secondCallback = result.current;

      expect(firstCallback).toBe(secondCallback);
    });

    it('should create new callback when dependencies change', () => {
      mockSelected = new Map();
      const { result, rerender } = renderHook(
        ({ selected }) =>
          useOnConfirm({
            selected,
            activeSystem: mockActiveSystem,
            deleteRemediationSystemsBatched: mockDeleteSystemsBatched,
            clearSelection: mockClearSelection,
            reloadTable: mockReloadTable,
            remediation: mockRemediation,
            refreshRemediation: mockRefreshRemediation,
            setIsOpen: mockSetIsOpen,
          }),
        { initialProps: { selected: mockSelected } },
      );

      const firstCallback = result.current;

      const newSelected = new Map([['sys1', { id: 'sys1', name: 'System 1' }]]);
      rerender({ selected: newSelected });
      const secondCallback = result.current;

      expect(firstCallback).not.toBe(secondCallback);
    });
  });

  describe('Single system deletion', () => {
    beforeEach(() => {
      mockSelected = new Map(); // Empty selection
    });

    it('should delete active system when no systems selected', async () => {
      const { result } = renderHook(() =>
        useOnConfirm({
          selected: mockSelected,
          activeSystem: mockActiveSystem,
          deleteRemediationSystemsBatched: mockDeleteSystemsBatched,
          clearSelection: mockClearSelection,
          reloadTable: mockReloadTable,
          remediation: mockRemediation,
          refreshRemediation: mockRefreshRemediation,
          setIsOpen: mockSetIsOpen,
          addNotification: mockAddNotification,
        }),
      );

      await act(async () => {
        await result.current();
      });

      expect(mockDeleteSystemsBatched).toHaveBeenCalledWith(
        [{ id: 'active-system-1', name: 'Active System' }],
        mockRemediation,
      );
    });

    it('should call deleteRemediationSystemsBatched with correct arguments', async () => {
      const { result } = renderHook(() =>
        useOnConfirm({
          selected: mockSelected,
          activeSystem: mockActiveSystem,
          deleteRemediationSystemsBatched: mockDeleteSystemsBatched,
          clearSelection: mockClearSelection,
          reloadTable: mockReloadTable,
          remediation: mockRemediation,
          refreshRemediation: mockRefreshRemediation,
          setIsOpen: mockSetIsOpen,
          addNotification: mockAddNotification,
        }),
      );

      await act(async () => {
        await result.current();
      });

      expect(mockDeleteSystemsBatched).toHaveBeenCalledWith(
        [{ id: 'active-system-1', name: 'Active System' }],
        mockRemediation,
      );
    });

    it('should clear active system reference', async () => {
      const { result } = renderHook(() =>
        useOnConfirm({
          selected: mockSelected,
          activeSystem: mockActiveSystem,
          deleteRemediationSystemsBatched: mockDeleteSystemsBatched,
          clearSelection: mockClearSelection,
          reloadTable: mockReloadTable,
          remediation: mockRemediation,
          refreshRemediation: mockRefreshRemediation,
          setIsOpen: mockSetIsOpen,
          addNotification: mockAddNotification,
        }),
      );

      await act(async () => {
        await result.current();
      });

      expect(mockActiveSystem.current).toBeUndefined();
    });

    it('should show success notification for single system', async () => {
      const { result } = renderHook(() =>
        useOnConfirm({
          selected: mockSelected,
          activeSystem: mockActiveSystem,
          deleteRemediationSystemsBatched: mockDeleteSystemsBatched,
          clearSelection: mockClearSelection,
          reloadTable: mockReloadTable,
          remediation: mockRemediation,
          refreshRemediation: mockRefreshRemediation,
          setIsOpen: mockSetIsOpen,
          addNotification: mockAddNotification,
        }),
      );

      await act(async () => {
        await result.current();
      });

      expect(mockAddNotification).toHaveBeenCalledWith({
        title: 'Removed 1 system from playbook',
        description: '',
        variant: 'success',
        dismissable: true,
        autoDismiss: true,
      });
    });

    it('should close the modal', async () => {
      const { result } = renderHook(() =>
        useOnConfirm({
          selected: mockSelected,
          activeSystem: mockActiveSystem,
          deleteRemediationSystemsBatched: mockDeleteSystemsBatched,
          clearSelection: mockClearSelection,
          reloadTable: mockReloadTable,
          remediation: mockRemediation,
          refreshRemediation: mockRefreshRemediation,
          setIsOpen: mockSetIsOpen,
          addNotification: mockAddNotification,
        }),
      );

      await act(async () => {
        await result.current();
      });

      expect(mockSetIsOpen).toHaveBeenCalledWith(false);
    });
  });

  describe('Multiple systems deletion', () => {
    beforeEach(() => {
      mockSelected = new Map([
        ['sys1', { id: 'sys1', name: 'System 1' }],
        ['sys2', { id: 'sys2', name: 'System 2' }],
        ['sys3', { id: 'sys3', name: 'System 3' }],
      ]);
    });

    it('should delete selected systems when systems are selected', async () => {
      const { result } = renderHook(() =>
        useOnConfirm({
          selected: mockSelected,
          activeSystem: mockActiveSystem,
          deleteRemediationSystemsBatched: mockDeleteSystemsBatched,
          clearSelection: mockClearSelection,
          reloadTable: mockReloadTable,
          remediation: mockRemediation,
          refreshRemediation: mockRefreshRemediation,
          setIsOpen: mockSetIsOpen,
          addNotification: mockAddNotification,
        }),
      );

      await act(async () => {
        await result.current();
      });

      expect(mockDeleteSystemsBatched).toHaveBeenCalledWith(
        [
          { id: 'sys1', name: 'System 1' },
          { id: 'sys2', name: 'System 2' },
          { id: 'sys3', name: 'System 3' },
        ],
        mockRemediation,
      );
    });

    it('should show success notification for multiple systems', async () => {
      const { result } = renderHook(() =>
        useOnConfirm({
          selected: mockSelected,
          activeSystem: mockActiveSystem,
          deleteRemediationSystemsBatched: mockDeleteSystemsBatched,
          clearSelection: mockClearSelection,
          reloadTable: mockReloadTable,
          remediation: mockRemediation,
          refreshRemediation: mockRefreshRemediation,
          setIsOpen: mockSetIsOpen,
          addNotification: mockAddNotification,
        }),
      );

      await act(async () => {
        await result.current();
      });

      expect(mockAddNotification).toHaveBeenCalledWith({
        title: 'Removed 3 systems from playbook',
        description: '',
        variant: 'success',
        dismissable: true,
        autoDismiss: true,
      });
    });

    it('should handle single selected system correctly', async () => {
      mockSelected = new Map([['sys1', { id: 'sys1', name: 'System 1' }]]);

      const { result } = renderHook(() =>
        useOnConfirm({
          selected: mockSelected,
          activeSystem: mockActiveSystem,
          deleteRemediationSystemsBatched: mockDeleteSystemsBatched,
          clearSelection: mockClearSelection,
          reloadTable: mockReloadTable,
          remediation: mockRemediation,
          refreshRemediation: mockRefreshRemediation,
          setIsOpen: mockSetIsOpen,
          addNotification: mockAddNotification,
        }),
      );

      await act(async () => {
        await result.current();
      });

      expect(mockAddNotification).toHaveBeenCalledWith({
        title: 'Removed 1 system from playbook',
        description: '',
        variant: 'success',
        dismissable: true,
        autoDismiss: true,
      });
    });
  });

  describe('Async operations', () => {
    it('should call deleteSystems and refreshRemediation', async () => {
      mockSelected = new Map();

      const { result } = renderHook(() =>
        useOnConfirm({
          selected: mockSelected,
          activeSystem: mockActiveSystem,
          deleteRemediationSystemsBatched: mockDeleteSystemsBatched,
          clearSelection: mockClearSelection,
          reloadTable: mockReloadTable,
          remediation: mockRemediation,
          refreshRemediation: mockRefreshRemediation,
          setIsOpen: mockSetIsOpen,
          addNotification: mockAddNotification,
        }),
      );

      await act(async () => {
        await result.current();
      });

      expect(mockDeleteSystemsBatched).toHaveBeenCalled();
      expect(mockRefreshRemediation).toHaveBeenCalled();
    });

    it('should call refreshRemediation after delete action', async () => {
      mockSelected = new Map();

      const { result } = renderHook(() =>
        useOnConfirm({
          selected: mockSelected,
          activeSystem: mockActiveSystem,
          deleteRemediationSystemsBatched: mockDeleteSystemsBatched,
          clearSelection: mockClearSelection,
          reloadTable: mockReloadTable,
          remediation: mockRemediation,
          refreshRemediation: mockRefreshRemediation,
          setIsOpen: mockSetIsOpen,
          addNotification: mockAddNotification,
        }),
      );

      await act(async () => {
        await result.current();
      });

      expect(mockRefreshRemediation).toHaveBeenCalled();
    });

    it('should toggle removing state while delete is in progress', async () => {
      mockSelected = new Map();
      let resolveDeletion;
      const deletionPromise = new Promise((resolve) => {
        resolveDeletion = resolve;
      });
      mockDeleteSystemsBatched.mockReturnValue(deletionPromise);

      const { result } = renderHook(() =>
        useOnConfirm({
          selected: mockSelected,
          activeSystem: mockActiveSystem,
          deleteRemediationSystemsBatched: mockDeleteSystemsBatched,
          clearSelection: mockClearSelection,
          reloadTable: mockReloadTable,
          remediation: mockRemediation,
          refreshRemediation: mockRefreshRemediation,
          setIsRemoving: mockSetIsRemoving,
          setIsOpen: mockSetIsOpen,
          addNotification: mockAddNotification,
        }),
      );

      let confirmation;
      act(() => {
        confirmation = result.current();
      });

      expect(mockSetIsRemoving).toHaveBeenNthCalledWith(1, true);
      expect(mockSetIsRemoving).toHaveBeenCalledTimes(1);
      expect(mockSetIsOpen).not.toHaveBeenCalled();
      expect(mockRefreshRemediation).not.toHaveBeenCalled();

      await act(async () => {
        resolveDeletion(successfulDeletion);
        await confirmation;
      });

      expect(mockSetIsRemoving).toHaveBeenLastCalledWith(false);
      expect(mockSetIsOpen).toHaveBeenCalledWith(false);
    });

    it('should call refetchConnectionStatus when provided', async () => {
      mockSelected = new Map();
      const mockRefetchConnectionStatus = jest.fn().mockResolvedValue();

      const { result } = renderHook(() =>
        useOnConfirm({
          selected: mockSelected,
          activeSystem: mockActiveSystem,
          deleteRemediationSystemsBatched: mockDeleteSystemsBatched,
          clearSelection: mockClearSelection,
          reloadTable: mockReloadTable,
          remediation: mockRemediation,
          refreshRemediation: mockRefreshRemediation,
          refetchConnectionStatus: mockRefetchConnectionStatus,
          setIsOpen: mockSetIsOpen,
          addNotification: mockAddNotification,
        }),
      );

      await act(async () => {
        await result.current();
      });

      expect(mockDeleteSystemsBatched).toHaveBeenCalled();
      expect(mockRefreshRemediation).toHaveBeenCalled();
      expect(mockRefetchConnectionStatus).toHaveBeenCalled();
    });

    it('should not call refetchConnectionStatus when not provided', async () => {
      mockSelected = new Map();

      const { result } = renderHook(() =>
        useOnConfirm({
          selected: mockSelected,
          activeSystem: mockActiveSystem,
          deleteRemediationSystemsBatched: mockDeleteSystemsBatched,
          clearSelection: mockClearSelection,
          reloadTable: mockReloadTable,
          remediation: mockRemediation,
          refreshRemediation: mockRefreshRemediation,
          setIsOpen: mockSetIsOpen,
          addNotification: mockAddNotification,
        }),
      );

      await act(async () => {
        await result.current();
      });

      expect(mockDeleteSystemsBatched).toHaveBeenCalled();
      expect(mockRefreshRemediation).toHaveBeenCalled();
      // refetchConnectionStatus is not provided, so it shouldn't be called
    });
  });

  describe('Batched deletion results', () => {
    it.each([
      {
        status: 'partial_failure',
        successfulBatches: 2,
        failedBatches: 1,
        shouldRefresh: true,
        notification: {
          title: 'Some selected systems may not have been removed',
          description:
            'The system list has been refreshed to show the current state.',
          variant: 'warning',
          dismissable: true,
          autoDismiss: true,
        },
      },
      {
        status: 'complete_failure',
        successfulBatches: 0,
        failedBatches: 3,
        shouldRefresh: false,
        notification: {
          title: 'Failed to remove systems',
          variant: 'danger',
          dismissable: true,
        },
      },
    ])(
      'should handle $status and finish the removal',
      async ({
        status,
        successfulBatches,
        failedBatches,
        shouldRefresh,
        notification,
      }) => {
        mockSelected = new Map(
          Array.from({ length: 201 }, (_, index) => [
            `sys-${index}`,
            { id: `sys-${index}` },
          ]),
        );
        mockDeleteSystemsBatched.mockResolvedValue({
          status,
          successfulBatches,
          failedBatches,
        });
        const mockRefetchConnectionStatus = jest.fn().mockResolvedValue();
        const activeSystem = mockActiveSystem.current;

        const { result } = renderHook(() =>
          useOnConfirm({
            selected: mockSelected,
            activeSystem: mockActiveSystem,
            deleteRemediationSystemsBatched: mockDeleteSystemsBatched,
            clearSelection: mockClearSelection,
            reloadTable: mockReloadTable,
            remediation: mockRemediation,
            refreshRemediation: mockRefreshRemediation,
            refetchConnectionStatus: mockRefetchConnectionStatus,
            setIsRemoving: mockSetIsRemoving,
            setIsOpen: mockSetIsOpen,
            addNotification: mockAddNotification,
          }),
        );

        await act(async () => {
          await result.current();
        });

        const refreshCount = shouldRefresh ? 1 : 0;
        expect(mockRefreshRemediation).toHaveBeenCalledTimes(refreshCount);
        expect(mockRefetchConnectionStatus).toHaveBeenCalledTimes(refreshCount);
        expect(mockClearSelection).toHaveBeenCalledTimes(refreshCount);
        expect(mockReloadTable).toHaveBeenCalledTimes(refreshCount);
        expect(mockActiveSystem.current).toEqual(
          shouldRefresh ? undefined : activeSystem,
        );
        expect(mockAddNotification).toHaveBeenCalledWith(notification);
        expect(mockSetIsRemoving).toHaveBeenLastCalledWith(false);
        expect(mockSetIsOpen).toHaveBeenCalledWith(false);
      },
    );

    it('should show a generic notification and close the modal if deletion throws', async () => {
      mockSelected = new Map();
      mockDeleteSystemsBatched.mockRejectedValue(
        new Error('Backend error details'),
      );

      const { result } = renderHook(() =>
        useOnConfirm({
          selected: mockSelected,
          activeSystem: mockActiveSystem,
          deleteRemediationSystemsBatched: mockDeleteSystemsBatched,
          clearSelection: mockClearSelection,
          reloadTable: mockReloadTable,
          remediation: mockRemediation,
          refreshRemediation: mockRefreshRemediation,
          setIsRemoving: mockSetIsRemoving,
          setIsOpen: mockSetIsOpen,
          addNotification: mockAddNotification,
        }),
      );

      await act(async () => {
        await result.current();
      });

      expect(mockAddNotification).toHaveBeenCalledWith({
        title: 'Failed to remove systems',
        variant: 'danger',
        dismissable: true,
      });
      expect(mockRefreshRemediation).not.toHaveBeenCalled();
      expect(mockClearSelection).not.toHaveBeenCalled();
      expect(mockReloadTable).not.toHaveBeenCalled();
      expect(mockSetIsRemoving).toHaveBeenLastCalledWith(false);
      expect(mockSetIsOpen).toHaveBeenCalledWith(false);
    });
  });

  describe('Edge cases', () => {
    it('should handle undefined activeSystem gracefully', async () => {
      mockSelected = new Map();
      mockActiveSystem = { current: undefined };

      const { result } = renderHook(() =>
        useOnConfirm({
          selected: mockSelected,
          activeSystem: mockActiveSystem,
          deleteRemediationSystemsBatched: mockDeleteSystemsBatched,
          clearSelection: mockClearSelection,
          reloadTable: mockReloadTable,
          remediation: mockRemediation,
          refreshRemediation: mockRefreshRemediation,
          setIsOpen: mockSetIsOpen,
          addNotification: mockAddNotification,
        }),
      );

      await act(async () => {
        await result.current();
      });

      expect(mockDeleteSystemsBatched).toHaveBeenCalledWith(
        [{ undefined }],
        mockRemediation,
      );
      expect(mockActiveSystem.current).toBeUndefined();
    });

    it('should handle empty selected map', async () => {
      mockSelected = new Map();

      const { result } = renderHook(() =>
        useOnConfirm({
          selected: mockSelected,
          activeSystem: mockActiveSystem,
          deleteRemediationSystemsBatched: mockDeleteSystemsBatched,
          clearSelection: mockClearSelection,
          reloadTable: mockReloadTable,
          remediation: mockRemediation,
          refreshRemediation: mockRefreshRemediation,
          setIsOpen: mockSetIsOpen,
          addNotification: mockAddNotification,
        }),
      );

      await act(async () => {
        await result.current();
      });

      expect(mockSelected.size).toBe(0);
      expect(mockAddNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Removed 1 system from playbook',
        }),
      );
    });

    it('should handle concurrent executions', async () => {
      mockSelected = new Map();

      const { result } = renderHook(() =>
        useOnConfirm({
          selected: mockSelected,
          activeSystem: mockActiveSystem,
          deleteRemediationSystemsBatched: mockDeleteSystemsBatched,
          clearSelection: mockClearSelection,
          reloadTable: mockReloadTable,
          remediation: mockRemediation,
          refreshRemediation: mockRefreshRemediation,
          setIsOpen: mockSetIsOpen,
          addNotification: mockAddNotification,
        }),
      );

      // Execute multiple times concurrently
      await act(async () => {
        await Promise.all([
          result.current(),
          result.current(),
          result.current(),
        ]);
      });

      expect(mockDeleteSystemsBatched).toHaveBeenCalledTimes(3);
      expect(mockSetIsOpen).toHaveBeenCalledTimes(3);
      expect(mockAddNotification).toHaveBeenCalledTimes(3);
    });
  });
});
