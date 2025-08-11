import { useEffect, useRef, useState } from 'react';

const useRunSystems = (run, shouldFetch, remId, fetchSystems) => {
  const [systems, setSystems] = useState();
  const [loading, setLoading] = useState(false);

  const fetchedOnce = useRef(false);
  const prevStatusRef = useRef(run?.status);
  const prevRemIdRef = useRef(remId);
  const prevFetchSystemsRef = useRef(fetchSystems);
  const prevRunIdRef = useRef(run?.id);

  useEffect(() => {
    // Reset fetchedOnce if remId, fetchSystems, or run.id changed
    if (
      prevRemIdRef.current !== remId ||
      prevFetchSystemsRef.current !== fetchSystems ||
      prevRunIdRef.current !== run?.id
    ) {
      fetchedOnce.current = false;
      prevRemIdRef.current = remId;
      prevFetchSystemsRef.current = fetchSystems;
      prevRunIdRef.current = run?.id;
    }

    if (!shouldFetch || !run || fetchedOnce.current) return;

    fetchedOnce.current = true;
    setLoading(true);

    fetchSystems({ remId, playbook_run_id: run.id })
      .then(({ data }) => {
        const exec = run.executors.find((e) => e.executor_id === run.id);
        setSystems(
          (data ?? [])
            .filter((s) => s.playbook_run_executor_id === run.id)
            .map((s) => ({ ...s, executor_name: exec?.executor_name })),
        );
      })
      .catch((error) => {
        console.error('Failed to fetch systems:', error);
      })
      .finally(() => setLoading(false));
  }, [shouldFetch, run, remId, fetchSystems]);

  useEffect(() => {
    if (!fetchedOnce.current || !shouldFetch || !run) return;

    const hasJustFinished =
      prevStatusRef.current === 'running' && run.status !== 'running';

    prevStatusRef.current = run.status;
    if (!hasJustFinished) return;

    const exec = run.executors.find((e) => e.executor_id === run.id);

    setLoading(true);
    fetchSystems({ remId, playbook_run_id: run.id })
      .then(({ data }) => {
        setSystems(
          (data ?? [])
            .filter((s) => s.playbook_run_executor_id === run.id)
            .map((s) => ({ ...s, executor_name: exec?.executor_name })),
        );
      })
      .catch((error) => {
        console.error('Failed to fetch systems:', error);
      })
      .finally(() => setLoading(false));
  }, [run?.status, shouldFetch, run, remId, fetchSystems]);

  return { systems, loading };
};

export default useRunSystems;
