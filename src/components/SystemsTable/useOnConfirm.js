import { useCallback } from 'react';

const useOnConfirm = ({
  selected,
  activeSystem,
  deleteRemediationSystems,
  remediation,
  refreshRemediation,
  refetchConnectionStatus,
  setIsOpen,
  addNotification,
  clearSelection,
  reloadTable,
}) => {
  return useCallback(async () => {
    try {
      const selectedSystems =
        selected.size > 0
          ? Array.from(selected, ([, value]) => value)
          : [
              {
                ...activeSystem.current,
              },
            ];
      await deleteRemediationSystems(selectedSystems, remediation);
      await refreshRemediation();
      if (refetchConnectionStatus) {
        await refetchConnectionStatus();
      }

      activeSystem.current = undefined;

      clearSelection();
      reloadTable();

      const itemsToDelete = selected.size > 0 ? selected.size : 1;
      addNotification({
        title: `Removed ${itemsToDelete} ${
          itemsToDelete > 1 ? 'systems' : 'system'
        } from playbook`,
        description: '',
        variant: 'success',
        dismissable: true,
        autoDismiss: true,
      });

      setIsOpen(false);
    } catch (error) {
      addNotification({
        title: 'Failed to remove systems',
        description: error?.message || 'An error occurred',
        variant: 'danger',
        dismissable: true,
      });
      setIsOpen(false);
    }
  }, [
    selected,
    activeSystem,
    deleteRemediationSystems,
    remediation,
    refreshRemediation,
    refetchConnectionStatus,
    setIsOpen,
    addNotification,
    clearSelection,
    reloadTable,
  ]);
};

export default useOnConfirm;
