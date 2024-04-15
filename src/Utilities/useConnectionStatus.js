import { useAxiosWithPlatformInterceptors } from '@redhat-cloud-services/frontend-components-utilities/interceptors';
const { API_BASE } = require('../config');
import { useState, useEffect, useRef } from 'react';

export const useConnectionStatus = (remediation) => {
  const axios = useAxiosWithPlatformInterceptors();
  const [isConnected, setisConnected] = useState();
  const [areDetailsLoading, setAreDetailsLoading] = useState(true);
  const [connectionDetails, setConnectionDetails] = useState();
  const [detailsError, setDetailsError] = useState();
  const mounted = useRef(false);

  useEffect(() => {
    mounted.current = true;
    const fetchData = async () => {
      try {
        const connection_status = await axios.get(
          `${API_BASE}/remediations/${remediation.id}/connection_status`
        );
        mounted.current &&
          setisConnected(
            connection_status.data?.[0].connection_status === 'connected'
          );
        setConnectionDetails(connection_status.data[0]);
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

  return [isConnected, connectionDetails, areDetailsLoading, detailsError];
};
