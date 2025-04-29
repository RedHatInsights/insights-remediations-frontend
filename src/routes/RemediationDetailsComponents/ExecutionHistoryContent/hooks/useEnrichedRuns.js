import { useEffect, useState } from 'react';

/**
 *  Given a list of playbook-runs, fetch each run’s systems and
 *  return a new array consumable by both the modal and tables
 *
 * @param {object[]} runs               – remediationPlaybookRuns.data
 * @param {string}   remId              – remediation UUID
 * @param {function} fetchSystems       – fn({ remId, playbook_run_id }) → Promise<{ data }>
 * @returns { [enrichedRuns, loading] }
 */
const useEnrichedRuns = (runs, remId, fetchSystems) => {
  const [enriched, setEnriched] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const base = runs ?? [];
    if (!base.length) {
      setEnriched([]);
      return;
    }

    setLoading(true);

    Promise.all(
      base.map((run) =>
        fetchSystems({ remId, playbook_run_id: run.id }).then(({ data }) => {
          const exec = run.executors.find((e) => e.executor_id === run.id);
          return {
            ...run,
            systems: data
              .filter((s) => s.playbook_run_executor_id === run.id)
              .map((s) => ({ ...s, executor_name: exec?.executor_name })),
          };
        })
      )
    )
      .then(setEnriched)
      .finally(() => setLoading(false));
  }, [runs, remId]);

  return [enriched, loading];
};

export default useEnrichedRuns;
