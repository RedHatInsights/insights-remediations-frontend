import { useCallback, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { selectEntity } from '../../actions';

const useBulkSelect = ({
  systemsRef,
  rows,
  selected,
  loaded,
  calculateChecked,
}) => {
  const dispatch = useDispatch();

  const bulkSelectCheck = useCallback(
    (data) => data?.filter((system) => system.selected === true),
    [],
  );

  const bulkSelectorSwitch = useCallback(
    (selection) => {
      switch (selection) {
        case 'none':
          systemsRef.current.map((system) =>
            dispatch(selectEntity(system.id, false)),
          );
          break;
        case 'page':
          dispatch(selectEntity(0, true));
          break;
        case 'deselect page':
          rows.map(() => dispatch(selectEntity(0, false)));
          break;
        case 'all':
          systemsRef.current.map((system) =>
            dispatch(selectEntity(system.id, true)),
          );
          break;
        case 'deselect all':
          systemsRef.current.map((system) =>
            dispatch(selectEntity(system.id, false)),
          );
          break;
      }
    },
    [dispatch, rows, systemsRef],
  );

  return useMemo(
    () => ({
      isDisabled: rows ? false : true,
      count: selected ? selected.size : 0,
      items: [
        {
          title: 'Select none (0)',
          onClick: () => bulkSelectorSwitch('none'),
        },
        ...(loaded && rows && rows.length > 0
          ? [
              {
                title: `Select page (${rows.length})`,
                onClick: () => {
                  !selected
                    ? bulkSelectorSwitch('page')
                    : bulkSelectCheck(rows).length === rows.length
                      ? bulkSelectorSwitch('deselect page')
                      : systemsRef.current.length > selected.size
                        ? bulkSelectorSwitch('page')
                        : bulkSelectorSwitch('deselect page');
                },
              },
            ]
          : []),
        ...(loaded && rows && rows.length > 0
          ? [
              {
                title: `Select all (${systemsRef.current.length})`,
                onClick: () => {
                  calculateChecked(systemsRef.current, selected)
                    ? bulkSelectorSwitch('deselect all')
                    : bulkSelectorSwitch('all');
                },
              },
            ]
          : []),
      ],
      checked: calculateChecked(systemsRef.current, selected),
      onSelect: () => {
        bulkSelectCheck(rows).length === rows.length
          ? bulkSelectorSwitch('deselect page')
          : bulkSelectorSwitch('page');
      },
    }),
    [
      rows,
      selected,
      loaded,
      calculateChecked,
      systemsRef,
      bulkSelectorSwitch,
      bulkSelectCheck,
    ],
  );
};

export default useBulkSelect;
