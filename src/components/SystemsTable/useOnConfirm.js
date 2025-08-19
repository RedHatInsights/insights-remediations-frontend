import { useCallback } from 'react';
import { useDispatch } from 'react-redux';

const useOnConfirm = ({
  selected,
  activeSystem,
  deleteSystems,
  remediation,
  refreshRemediation,
  setIsOpen,
  addNotification,
}) => {
  const dispatch = useDispatch();
  return useCallback(() => {
    (async () => {
      const selectedSystems =
        selected.size > 0
          ? Array.from(selected, ([, value]) => value)
          : [
              {
                ...activeSystem.current,
              },
            ];
      const action = deleteSystems(selectedSystems, remediation);
      dispatch(action);
      await action.payload;
      await refreshRemediation();
    })();
    activeSystem.current = undefined;
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
  }, [
    selected,
    activeSystem,
    deleteSystems,
    remediation,
    refreshRemediation,
    setIsOpen,
    addNotification,
    dispatch,
  ]);
};

export default useOnConfirm;
