import { useState, useEffect, useRef, useCallback } from 'react';
import { API_BASE } from '../routes/api';

export const useConnectionStatus = (remediationId, axios) => {
  const [connectedSystems, setConnectedSystems] = useState(0);
  const [totalSystems, setTotalSystems] = useState(0);
  const [areDetailsLoading, setAreDetailsLoading] = useState(true);
  const [connectedData, setConnectedData] = useState([]);
  const [connectionError, setConnectionError] = useState(null);
  const mounted = useRef(false);

  const fetchData = useCallback(async () => {
    if (!remediationId) {
      return;
    }

    setAreDetailsLoading(true);
    setConnectionError(null);
    let connectedSystemCount = 0;
    let totalSystemsCount = 0;

    try {
      const connection_status = await axios.get(
        `${API_BASE}/remediations/${remediationId}/connection_status`,
      );
      if (mounted.current) {
        connection_status.data.forEach((connected_group) => {
          totalSystemsCount += connected_group.system_count;
          if (connected_group.connection_status === 'connected') {
            connectedSystemCount = connected_group.system_count;
          }
        });
        setConnectedSystems(connectedSystemCount);
        setTotalSystems(totalSystemsCount);
        setConnectedData(connection_status.data);
      }
    } catch (error) {
      console.error(error);
      if (mounted.current) {
        setConnectedData(error?.errors?.[0]?.status);
        setConnectionError(error);
      }
    } finally {
      if (mounted.current) {
        setAreDetailsLoading(false);
      }
    }
  }, [remediationId, axios]);

  useEffect(() => {
    mounted.current = true;
    fetchData();
    return () => {
      mounted.current = false;
    };
  }, [fetchData]);

  return [
    connectedSystems,
    totalSystems,
    areDetailsLoading,
    connectedData,
    fetchData,
    connectionError,
  ];
};
