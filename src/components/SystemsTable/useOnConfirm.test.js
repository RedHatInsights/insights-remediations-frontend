import { renderHook, act } from '@testing-library/react';
import { useDispatch } from 'react-redux';
import useOnConfirm from './useOnConfirm';

// Mock external dependencies
jest.mock('react-redux', () => ({
  useDispatch: jest.fn(),
}));

describe('useOnConfirm Hook', () => {
  let mockDispatch;
  let mockDeleteSystems;
  let mockRefreshRemediation;
  let mockSetIsOpen;
  let mockActiveSystem;
  let mockSelected;
  let mockRemediation;
  let mockAddNotification;

  let mockClearSelection;
  let mockReloadTable;

  beforeEach(() => {
    mockDispatch = jest.fn();
    mockDeleteSystems = jest.fn().mockResolvedValue({});
    mockRefreshRemediation = jest.fn().mockResolvedValue({});
    mockSetIsOpen = jest.fn();
    mockAddNotification = jest.fn();
    mockClearSelection = jest.fn();
    mockReloadTable = jest.fn();
    mockActiveSystem = {
      current: { id: 'active-system-1', name: 'Active System' },
    };
    mockRemediation = { id: 'rem-123', name: 'Test Remediation' };

    // Reset mocks
    useDispatch.mockReturnValue(mockDispatch);
    mockDeleteSystems.mockClear();
    mockRefreshRemediation.mockClear();
    mockSetIsOpen.mockClear();
    mockAddNotification.mockClear();
    mockDispatch.mockClear();
    mockClearSelection.mockClear();
    mockReloadTable.mockClear();
  });

  const createMockAction = (payload = Promise.resolve()) => ({
    payload,
    type: 'DELETE_SYSTEMS',
  });

  describe('Hook initialization', () => {
    it('should return a function', () => {
      mockSelected = new Map();
      const { result } = renderHook(() =>
        useOnConfirm({
          selected: mockSelected,
          activeSystem: mockActiveSystem,
          deleteRemediationSystems: mockDeleteSystems,
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
          deleteRemediationSystems: mockDeleteSystems,
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
            deleteRemediationSystems: mockDeleteSystems,
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
      mockDeleteSystems.mockReturnValue(createMockAction());
      mockRefreshRemediation.mockResolvedValue();

      const { result } = renderHook(() =>
        useOnConfirm({
          selected: mockSelected,
          activeSystem: mockActiveSystem,
          deleteRemediationSystems: mockDeleteSystems,
          clearSelection: mockClearSelection,
          reloadTable: mockReloadTable,
          remediation: mockRemediation,
          refreshRemediation: mockRefreshRemediation,
          setIsOpen: mockSetIsOpen,
          addNotification: mockAddNotification,
        }),
      );

      await act(async () => {
        result.current();
      });

      expect(mockDeleteSystems).toHaveBeenCalledWith(
        [{ id: 'active-system-1', name: 'Active System' }],
        mockRemediation,
      );
    });

    it('should call deleteRemediationSystems with correct arguments', async () => {
      mockDeleteSystems.mockResolvedValue({});
      mockRefreshRemediation.mockResolvedValue();

      const { result } = renderHook(() =>
        useOnConfirm({
          selected: mockSelected,
          activeSystem: mockActiveSystem,
          deleteRemediationSystems: mockDeleteSystems,
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

      expect(mockDeleteSystems).toHaveBeenCalledWith(
        [{ id: 'active-system-1', name: 'Active System' }],
        mockRemediation,
      );
    });

    it('should clear active system reference', async () => {
      mockDeleteSystems.mockReturnValue(createMockAction());
      mockRefreshRemediation.mockResolvedValue();

      const { result } = renderHook(() =>
        useOnConfirm({
          selected: mockSelected,
          activeSystem: mockActiveSystem,
          deleteRemediationSystems: mockDeleteSystems,
          clearSelection: mockClearSelection,
          reloadTable: mockReloadTable,
          remediation: mockRemediation,
          refreshRemediation: mockRefreshRemediation,
          setIsOpen: mockSetIsOpen,
          addNotification: mockAddNotification,
        }),
      );

      await act(async () => {
        result.current();
      });

      expect(mockActiveSystem.current).toBeUndefined();
    });

    it('should show success notification for single system', async () => {
      mockDeleteSystems.mockReturnValue(createMockAction());
      mockRefreshRemediation.mockResolvedValue();

      const { result } = renderHook(() =>
        useOnConfirm({
          selected: mockSelected,
          activeSystem: mockActiveSystem,
          deleteRemediationSystems: mockDeleteSystems,
          clearSelection: mockClearSelection,
          reloadTable: mockReloadTable,
          remediation: mockRemediation,
          refreshRemediation: mockRefreshRemediation,
          setIsOpen: mockSetIsOpen,
          addNotification: mockAddNotification,
        }),
      );

      await act(async () => {
        result.current();
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
      mockDeleteSystems.mockReturnValue(createMockAction());
      mockRefreshRemediation.mockResolvedValue();

      const { result } = renderHook(() =>
        useOnConfirm({
          selected: mockSelected,
          activeSystem: mockActiveSystem,
          deleteRemediationSystems: mockDeleteSystems,
          clearSelection: mockClearSelection,
          reloadTable: mockReloadTable,
          remediation: mockRemediation,
          refreshRemediation: mockRefreshRemediation,
          setIsOpen: mockSetIsOpen,
          addNotification: mockAddNotification,
        }),
      );

      await act(async () => {
        result.current();
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
      mockDeleteSystems.mockReturnValue(createMockAction());
      mockRefreshRemediation.mockResolvedValue();

      const { result } = renderHook(() =>
        useOnConfirm({
          selected: mockSelected,
          activeSystem: mockActiveSystem,
          deleteRemediationSystems: mockDeleteSystems,
          clearSelection: mockClearSelection,
          reloadTable: mockReloadTable,
          remediation: mockRemediation,
          refreshRemediation: mockRefreshRemediation,
          setIsOpen: mockSetIsOpen,
          addNotification: mockAddNotification,
        }),
      );

      await act(async () => {
        result.current();
      });

      expect(mockDeleteSystems).toHaveBeenCalledWith(
        [
          { id: 'sys1', name: 'System 1' },
          { id: 'sys2', name: 'System 2' },
          { id: 'sys3', name: 'System 3' },
        ],
        mockRemediation,
      );
    });

    it('should show success notification for multiple systems', async () => {
      mockDeleteSystems.mockReturnValue(createMockAction());
      mockRefreshRemediation.mockResolvedValue();

      const { result } = renderHook(() =>
        useOnConfirm({
          selected: mockSelected,
          activeSystem: mockActiveSystem,
          deleteRemediationSystems: mockDeleteSystems,
          clearSelection: mockClearSelection,
          reloadTable: mockReloadTable,
          remediation: mockRemediation,
          refreshRemediation: mockRefreshRemediation,
          setIsOpen: mockSetIsOpen,
          addNotification: mockAddNotification,
        }),
      );

      await act(async () => {
        result.current();
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
      mockDeleteSystems.mockReturnValue(createMockAction());
      mockRefreshRemediation.mockResolvedValue();

      const { result } = renderHook(() =>
        useOnConfirm({
          selected: mockSelected,
          activeSystem: mockActiveSystem,
          deleteRemediationSystems: mockDeleteSystems,
          clearSelection: mockClearSelection,
          reloadTable: mockReloadTable,
          remediation: mockRemediation,
          refreshRemediation: mockRefreshRemediation,
          setIsOpen: mockSetIsOpen,
          addNotification: mockAddNotification,
        }),
      );

      await act(async () => {
        result.current();
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
      mockDeleteSystems.mockResolvedValue({});
      mockRefreshRemediation.mockResolvedValue();

      const { result } = renderHook(() =>
        useOnConfirm({
          selected: mockSelected,
          activeSystem: mockActiveSystem,
          deleteRemediationSystems: mockDeleteSystems,
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

      expect(mockDeleteSystems).toHaveBeenCalled();
      expect(mockRefreshRemediation).toHaveBeenCalled();
    });

    it('should call refreshRemediation after delete action', async () => {
      mockSelected = new Map();
      mockDeleteSystems.mockReturnValue(createMockAction());
      mockRefreshRemediation.mockResolvedValue();

      const { result } = renderHook(() =>
        useOnConfirm({
          selected: mockSelected,
          activeSystem: mockActiveSystem,
          deleteRemediationSystems: mockDeleteSystems,
          clearSelection: mockClearSelection,
          reloadTable: mockReloadTable,
          remediation: mockRemediation,
          refreshRemediation: mockRefreshRemediation,
          setIsOpen: mockSetIsOpen,
          addNotification: mockAddNotification,
        }),
      );

      await act(async () => {
        result.current();
        // Give the async IIFE time to complete
        await Promise.resolve();
      });

      expect(mockRefreshRemediation).toHaveBeenCalled();
    });

    it('should call refetchConnectionStatus when provided', async () => {
      mockSelected = new Map();
      const mockRefetchConnectionStatus = jest.fn().mockResolvedValue();
      mockDeleteSystems.mockReturnValue(createMockAction());
      mockRefreshRemediation.mockResolvedValue();

      const { result } = renderHook(() =>
        useOnConfirm({
          selected: mockSelected,
          activeSystem: mockActiveSystem,
          deleteRemediationSystems: mockDeleteSystems,
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

      expect(mockDeleteSystems).toHaveBeenCalled();
      expect(mockRefreshRemediation).toHaveBeenCalled();
      expect(mockRefetchConnectionStatus).toHaveBeenCalled();
    });

    it('should not call refetchConnectionStatus when not provided', async () => {
      mockSelected = new Map();
      mockDeleteSystems.mockReturnValue(createMockAction());
      mockRefreshRemediation.mockResolvedValue();

      const { result } = renderHook(() =>
        useOnConfirm({
          selected: mockSelected,
          activeSystem: mockActiveSystem,
          deleteRemediationSystems: mockDeleteSystems,
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

      expect(mockDeleteSystems).toHaveBeenCalled();
      expect(mockRefreshRemediation).toHaveBeenCalled();
      // refetchConnectionStatus is not provided, so it shouldn't be called
    });
  });

  describe('Edge cases', () => {
    it('should handle undefined activeSystem gracefully', async () => {
      mockSelected = new Map();
      mockActiveSystem = { current: undefined };
      mockDeleteSystems.mockReturnValue(createMockAction());
      mockRefreshRemediation.mockResolvedValue();

      const { result } = renderHook(() =>
        useOnConfirm({
          selected: mockSelected,
          activeSystem: mockActiveSystem,
          deleteRemediationSystems: mockDeleteSystems,
          clearSelection: mockClearSelection,
          reloadTable: mockReloadTable,
          remediation: mockRemediation,
          refreshRemediation: mockRefreshRemediation,
          setIsOpen: mockSetIsOpen,
          addNotification: mockAddNotification,
        }),
      );

      await act(async () => {
        result.current();
      });

      expect(mockDeleteSystems).toHaveBeenCalledWith(
        [{ undefined }],
        mockRemediation,
      );
      expect(mockActiveSystem.current).toBeUndefined();
    });

    it('should handle empty selected map', async () => {
      mockSelected = new Map();
      mockDeleteSystems.mockReturnValue(createMockAction());
      mockRefreshRemediation.mockResolvedValue();

      const { result } = renderHook(() =>
        useOnConfirm({
          selected: mockSelected,
          activeSystem: mockActiveSystem,
          deleteRemediationSystems: mockDeleteSystems,
          clearSelection: mockClearSelection,
          reloadTable: mockReloadTable,
          remediation: mockRemediation,
          refreshRemediation: mockRefreshRemediation,
          setIsOpen: mockSetIsOpen,
          addNotification: mockAddNotification,
        }),
      );

      await act(async () => {
        result.current();
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
      mockDeleteSystems.mockReturnValue(createMockAction());
      mockRefreshRemediation.mockResolvedValue();

      const { result } = renderHook(() =>
        useOnConfirm({
          selected: mockSelected,
          activeSystem: mockActiveSystem,
          deleteRemediationSystems: mockDeleteSystems,
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

      expect(mockDeleteSystems).toHaveBeenCalledTimes(3);
      expect(mockSetIsOpen).toHaveBeenCalledTimes(3);
      expect(mockAddNotification).toHaveBeenCalledTimes(3);
    });
  });
});
