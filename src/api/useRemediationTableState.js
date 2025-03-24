import { useDeepCompareMemo } from 'use-deep-compare';
import { useSerialisedTableState } from '../Frameworks/AsyncTableTools/AsyncTableTools/hooks/useTableState';

const useRemediationTableState = (useTableState, paramsOption) => {
  const serialisedTableState = useSerialisedTableState();
  const {
    filters: filterState,
    pagination: { offset, limit } = {},
    sort: sortBy,
  } = serialisedTableState || {};

  const params = useDeepCompareMemo(() => {
    if (!Array.isArray(paramsOption)) {
      const { filter: filterParam, ...paramsParam } = paramsOption || {};
      const sort = sortBy;

      return useTableState
        ? {
            ...paramsParam,
            limit,
            offset,
            sort,
            ...filterParam,
            ...filterState,
          }
        : paramsOption;
    } else {
      return paramsOption;
    }
  }, [useTableState, filterState, limit, offset, sortBy, paramsOption]);

  return { params, hasState: !!serialisedTableState };
};

export default useRemediationTableState;
