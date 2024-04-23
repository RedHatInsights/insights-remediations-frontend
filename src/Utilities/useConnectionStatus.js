import { useAxiosWithPlatformInterceptors } from '@redhat-cloud-services/frontend-components-utilities/interceptors';
const { API_BASE } = require('../config');
import { useState, useEffect, useRef } from 'react';

export const useConnectionStatus = (remediation) => {
  const axios = useAxiosWithPlatformInterceptors();
  const [connectedSystems, setConnectedSystems] = useState(0);
  const [totalSystems, setTotalSystems] = useState(0);
  const [areDetailsLoading, setAreDetailsLoading] = useState(true);
  const [detailsError, setDetailsError] = useState();
  const mounted = useRef(false);
  let connectedSystemCount = 0;
  let totalSystemsCount = 0;
  useEffect(() => {
    mounted.current = true;
    const fetchData = async () => {
      try {
        const connection_status = await axios.get(
          `${API_BASE}/remediations/${remediation.id}/connection_status`
        );
        mounted.current &&
          (connection_status.data.forEach((connected_group) => {
            (totalSystemsCount += connected_group.system_count),
              connected_group.connection_status === 'connected' &&
                (connectedSystemCount = connected_group.system_count);
          }),
          setConnectedSystems(connectedSystemCount)),
          setTotalSystems(totalSystemsCount);
      } catch (error) {
        console.error(error);
        setDetailsError(error.errors[0].status);
      }
      setAreDetailsLoading(false);
    };

    remediation && fetchData();
    return () => {
      mounted.current = false;
    };
  }, [remediation]);

  return [connectedSystems, totalSystems, areDetailsLoading, detailsError];
};
