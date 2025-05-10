import { useEffect, useRef, useState } from 'react';

const useRunSystems = (run, shouldFetch, remId, fetchSystems) => {
  const [systems, setSystems] = useState();
  const [loading, setLoading] = useState(false);

  const fetchedOnce = useRef(false);
  const prevStatusRef = useRef(run?.status);

  useEffect(() => {
    if (!shouldFetch || !run || fetchedOnce.current) return;

    fetchedOnce.current = true;
    setLoading(true);

    fetchSystems({ remId, playbook_run_id: run.id })
      .then(({ data }) => {
        const exec = run.executors.find((e) => e.executor_id === run.id);
        setSystems(
          (data ?? [])
            .filter((s) => s.playbook_run_executor_id === run.id)
            .map((s) => ({ ...s, executor_name: exec?.executor_name }))
        );
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
            .map((s) => ({ ...s, executor_name: exec?.executor_name }))
        );
      })
      .finally(() => setLoading(false));
  }, [run?.status, shouldFetch, run, remId, fetchSystems]);

  return { systems, loading };
};

export default useRunSystems;
