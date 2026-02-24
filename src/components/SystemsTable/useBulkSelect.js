import { useCallback, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { selectEntity } from '../../actions';
import { compileTitle } from './helpers';

//TODO: Replace with bastillian table tools hook
const useBulkSelect = ({
  systemsRef,
  rows,
  selected,
  loaded,
  calculateChecked,
  totalCount = 0,
  fetchAllSystems,
}) => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);

  const bulkSelectCheck = useCallback(
    (data) => data?.filter((system) => system.selected === true),
    [],
  );

  const bulkSelectorSwitch = useCallback(
    (selection) => {
      switch (selection) {
        case 'none':
        case 'deselect all':
          dispatch(selectEntity(-1, false));
          break;
        case 'page':
          dispatch(selectEntity(0, true));
          break;
        case 'deselect page':
          dispatch(selectEntity(0, false));
          break;
      }
    },
    [dispatch],
  );

  const handleSelectAll = useCallback(async () => {
    if (!fetchAllSystems) return;
    setLoading(true);
    try {
      const allSystems = await fetchAllSystems();
      allSystems.forEach((system) => dispatch(selectEntity(system.id, true)));
    } finally {
      setLoading(false);
    }
  }, [dispatch, fetchAllSystems]);

  return useMemo(() => {
    const systems = systemsRef.current || [];
    const isPageSelected =
      rows && rows.length > 0 && bulkSelectCheck(rows).length === rows.length;
    const isAllSelected = totalCount > 0 && selected?.size === totalCount;
    const selectedIdsTotal = selected ? selected.size : 0;
    const title = compileTitle(selectedIdsTotal, loading);

    return {
      isDisabled: !rows,
      ...(loading
        ? { toggleProps: { children: [title] } }
        : { count: selectedIdsTotal }),
      items: [
        {
          title: 'Select none (0)',
          onClick: () => bulkSelectorSwitch('none'),
        },
        ...(loaded && rows && rows.length > 0
          ? [
              {
                title: isPageSelected
                  ? `Deselect page (${rows.length})`
                  : `Select page (${rows.length})`,
                onClick: () => {
                  !selected
                    ? bulkSelectorSwitch('page')
                    : bulkSelectCheck(rows).length === rows.length
                      ? bulkSelectorSwitch('deselect page')
                      : systems.length > selected.size
                        ? bulkSelectorSwitch('page')
                        : bulkSelectorSwitch('deselect page');
                },
              },
            ]
          : []),
        ...(loaded && fetchAllSystems
          ? [
              {
                title: isAllSelected
                  ? `Deselect all (${totalCount})`
                  : `Select all (${totalCount})`,
                onClick: () => {
                  if (isAllSelected) {
                    bulkSelectorSwitch('deselect all');
                  } else {
                    return handleSelectAll();
                  }
                },
              },
            ]
          : []),
      ],
      checked:
        selected?.size > 0 && (!loaded || !rows || rows.length === 0)
          ? true
          : calculateChecked(rows, selected),
      onSelect: () => {
        bulkSelectCheck(rows).length === rows.length
          ? bulkSelectorSwitch('deselect page')
          : bulkSelectorSwitch('page');
      },
    };
  }, [
    rows,
    selected,
    loaded,
    totalCount,
    fetchAllSystems,
    calculateChecked,
    systemsRef,
    bulkSelectorSwitch,
    bulkSelectCheck,
    handleSelectAll,
    loading,
  ]);
};

export default useBulkSelect;
