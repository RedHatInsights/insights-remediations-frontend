import { useEffect, useRef, useState } from 'react';

const useLogs = (isOpen, meta, fetchLogs, remId, updateRunStatus, setMeta) => {
  const [logLines, setLines] = useState([]);

  const timerIdRef = useRef(null);
  const prevStatusRef = useRef(meta?.status);
  const fetchLogsRef = useRef(fetchLogs);

  fetchLogsRef.current = fetchLogs;

  useEffect(() => {
    clearInterval(timerIdRef.current);

    if (!isOpen || !meta) {
      setLines([]);
      return;
    }

    const params = {
      remId,
      playbook_run_id: meta.runId,
      system_id: meta.systemId,
    };

    const grabLogs = async () => {
      try {
        const { console: text = '', status } = await fetchLogsRef.current(
          params
        );

        if (status && status !== prevStatusRef.current) {
          prevStatusRef.current = status;
          updateRunStatus(meta.runId, meta.systemId, status);
          setMeta((p) => ({ ...p, status }));
          if (status !== 'running') clearInterval(timerIdRef.current);
        }

        const lines = text
          .split('\n')
          .filter(Boolean)
          .concat(status === 'running' ? 'Running…' : [])
          .concat(text ? [] : ['No logs']);

        setLines(lines);
      } catch {
        setLines([`Failed to load logs for ${meta.systemName}`]);
      }
    };

    grabLogs();

    if (meta.status === 'running') {
      timerIdRef.current = setInterval(grabLogs, 5_000);
    }

    return () => clearInterval(timerIdRef.current);
  }, [isOpen, meta, remId, updateRunStatus, setMeta]);

  return { logLines };
};

export default useLogs;
