import { useCallback } from 'react';
import { pluralize } from '../../Utilities/utils';

const useOnConfirm = ({
  selected,
  activeSystem,
  deleteRemediationSystemsBatched,
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
      const deleteSystems =
        deleteRemediationSystemsBatched || deleteRemediationSystems;
      const selectedSystems =
        selected.size > 0
          ? Array.from(selected, ([, value]) => value)
          : [
              {
                ...activeSystem.current,
              },
            ];
      const itemsToDelete = selectedSystems.length;
      const rawResult = await deleteSystems(selectedSystems, remediation);
      const result = rawResult?.status
        ? rawResult
        : {
            status: 'success',
            successfullBatches: 1,
            failedBatches: 0,
            errors: [],
          };

      if (result.status !== 'complete_failure') {
        await refreshRemediation();
        if (refetchConnectionStatus) {
          await refetchConnectionStatus();
        }

        activeSystem.current = undefined;

        clearSelection();
        reloadTable();
      }

      if (result.status === 'success') {
        addNotification({
          title: `Removed ${pluralize(itemsToDelete, 'system')} from playbook`,
          description: '',
          variant: 'success',
          dismissable: true,
          autoDismiss: true,
        });
      } else if (result.status === 'partial_failure') {
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
          description: result?.errors?.[0] || 'An error occurred',
          variant: 'danger',
          dismissable: true,
        });
      }
    } catch (error) {
      addNotification({
        title: 'Failed to remove systems',
        description: error?.message || 'An error occurred',
        variant: 'danger',
        dismissable: true,
      });
    } finally {
      setIsOpen(false);
    }
  }, [
    selected,
    activeSystem,
    deleteRemediationSystemsBatched,
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
