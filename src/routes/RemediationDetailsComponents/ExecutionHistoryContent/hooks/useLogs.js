// src/.../hooks/useLogs.js
import { useEffect, useState } from 'react';

/**
 * Poll the “system log” endpoint while the run is still *running*.
 *
 * @param {boolean}  isOpen   – modal open?
 * @param {object}   meta     – { runId, systemId, status, systemName }
 * @param {function} getLogs  – fn({ remId, playbook_run_id, system_id }) → Promise({ console })
 * @param {string}   remId    – remediation UUID
 */
const useLogs = ({ isOpen, meta, getLogs, remId }) => {
  const [loading, setLoading] = useState(false);
  const [lines, setLines] = useState([]);

  useEffect(() => {
    if (!isOpen || !meta) return;

    const fetchLogs = async () => {
      setLoading(true);
      try {
        const res = await getLogs({
          remId,
          playbook_run_id: meta.runId,
          system_id: meta.systemId,
        });
        const text = res.console ?? '';
        setLines(text ? text.split('\n') : ['running...']);
      } catch {
        setLines([`Failed to load logs for ${meta.systemName}`]);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();

    if (meta.status === 'running') {
      const id = setInterval(fetchLogs, 5_000);
      return () => clearInterval(id);
    }
  }, [isOpen, meta, getLogs, remId]);

  return { logLoading: loading, logLines: lines };
};

export default useLogs;
