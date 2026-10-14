import { useCallback } from 'react';
import { pluralize } from '../../Utilities/utils';

const useOnConfirm = ({
  selected,
  activeSystem,
  deleteRemediationSystemsBatched,
  remediation,
  refreshRemediation,
  refetchConnectionStatus,
  setIsRemoving,
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
      const itemsToDelete = selectedSystems.length;
      setIsRemoving?.(true);
      const { status } = await deleteRemediationSystemsBatched(
        selectedSystems,
        remediation,
      );

      if (status !== 'complete_failure') {
        await refreshRemediation();
        if (refetchConnectionStatus) {
          await refetchConnectionStatus();
        }

        activeSystem.current = undefined;

        clearSelection();
        reloadTable();
      }

      if (status === 'success') {
        addNotification({
          title: `Removed ${pluralize(itemsToDelete, 'system')} from playbook`,
          description: '',
          variant: 'success',
          dismissable: true,
          autoDismiss: true,
        });
      } else if (status === 'partial_failure') {
        addNotification({
          title: 'Some selected systems may not have been removed',
          description:
            'The system list has been refreshed to show the current state.',
          variant: 'warning',
          dismissable: true,
          autoDismiss: true,
        });
      } else {
        addNotification({
          title: 'Failed to remove systems',
          variant: 'danger',
          dismissable: true,
        });
      }
    } catch {
      addNotification({
        title: 'Failed to remove systems',
        variant: 'danger',
        dismissable: true,
      });
    } finally {
      setIsRemoving?.(false);
      setIsOpen(false);
    }
  }, [
    selected,
    activeSystem,
    deleteRemediationSystemsBatched,
    remediation,
    refreshRemediation,
    refetchConnectionStatus,
    setIsRemoving,
    setIsOpen,
    addNotification,
    clearSelection,
    reloadTable,
  ]);
};

export default useOnConfirm;
