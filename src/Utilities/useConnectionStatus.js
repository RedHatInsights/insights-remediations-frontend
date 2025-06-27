import { useAxiosWithPlatformInterceptors } from '@redhat-cloud-services/frontend-components-utilities/interceptors';
import { useState, useEffect, useRef } from 'react';
import { API_BASE } from '../routes/api';

export const useConnectionStatus = (remediation) => {
  const axios = useAxiosWithPlatformInterceptors();
  const [connectedSystems, setConnectedSystems] = useState(0);
  const [totalSystems, setTotalSystems] = useState(0);
  const [areDetailsLoading, setAreDetailsLoading] = useState(true);
  const [detailsError, setDetailsError] = useState();
  const [connectedData, setConnectedData] = useState([]);
  const mounted = useRef(false);

  const fetchConnectionData = async () => {
    let connectedSystemCount = 0;
    let totalSystemsCount = 0;

    try {
      setAreDetailsLoading(true);
      setDetailsError(undefined);

      const connection_status = await axios.get(
        `${API_BASE}/remediations/${remediation.id}/connection_status`,
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
      setDetailsError(error?.errors[0].status || '');
      setConnectedData(error?.errors[0].status);
    } finally {
      if (mounted.current) {
        setAreDetailsLoading(false);
      }
    }
  };

  useEffect(() => {
    mounted.current = true;
    if (remediation) {
      fetchConnectionData();
    }
    return () => {
      mounted.current = false;
    };
  }, [remediation?.id]);

  return [
    connectedSystems,
    totalSystems,
    areDetailsLoading,
    detailsError,
    connectedData,
    fetchConnectionData,
  ];
};
