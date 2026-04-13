import { useEffect, useRef, useState } from 'react';
import { useDeepCompareEffect, useDeepCompareMemo } from 'use-deep-compare';

import useRemediationTableState from '../../../../api/useRemediationTableState';

import { RUN_SYSTEMS_DEFAULT_SORT } from '../Columns';

const DEFAULT_PAGE_LIMIT = 10;

const normaliseSystemsResponse = (result) => {
  const data = result?.data;
  const rows = Array.isArray(data) ? data : (data?.data ?? []);
  const total = data?.meta?.total ?? result?.meta?.total ?? rows.length;
  return { rows, total };
};

const useRunSystems = (run, shouldFetch, remId, fetchSystems) => {
  const [systems, setSystems] = useState();
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const prevStatusRef = useRef(run?.status);
  const fetchSystemsRef = useRef(fetchSystems);
  fetchSystemsRef.current = fetchSystems;

  const { params: tableParams } = useRemediationTableState(true, {
    remId,
    playbook_run_id: run?.id,
  });

  const limit = tableParams?.limit ?? DEFAULT_PAGE_LIMIT;
  const offset = tableParams?.offset ?? 0;

  const fetchParams = useDeepCompareMemo(
    () => ({
      remId,
      playbook_run_id: run?.id,
      limit,
      offset,
      sort: tableParams?.sort ?? RUN_SYSTEMS_DEFAULT_SORT,
      ...(tableParams?.filter && { filter: tableParams.filter }),
    }),
    [remId, run?.id, limit, offset, tableParams?.sort, tableParams?.filter],
  );

  useDeepCompareEffect(() => {
    if (!shouldFetch || !run) return undefined;

    let cancelled = false;
    setLoading(true);

    fetchSystemsRef
      .current(fetchParams)
      .then((result) => {
        if (cancelled) return;
        const { rows, total: nextTotal } = normaliseSystemsResponse(result);
        setSystems(rows);
        setTotal(nextTotal);
      })
      .catch((error) => {
        if (!cancelled) {
          console.error('Failed to fetch systems:', error);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // Do not depend on fetchSystems — useQuery's fetch is a new callback whenever its internal loading/params change.
  }, [shouldFetch, run?.id, fetchParams]);

  useEffect(() => {
    if (!shouldFetch || !run) return;

    const hasJustFinished =
      prevStatusRef.current === 'running' && run.status !== 'running';

    prevStatusRef.current = run.status;
    if (!hasJustFinished) return;

    setLoading(true);
    fetchSystemsRef
      .current(fetchParams)
      .then((result) => {
        const { rows, total: nextTotal } = normaliseSystemsResponse(result);
        setSystems(rows);
        setTotal(nextTotal);
      })
      .catch((error) => {
        console.error('Failed to fetch systems:', error);
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [run?.status, shouldFetch, run?.id, remId, fetchParams]);

  return { systems, loading, total };
};

export default useRunSystems;
