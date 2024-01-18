import { useAxiosWithPlatformInterceptors } from '@redhat-cloud-services/frontend-components-utilities/interceptors';
const { API_BASE } = require('../config');
import { useState, useEffect } from 'react';

export const useConnectionStatus = (remediation) => {
  const axios = useAxiosWithPlatformInterceptors();
  const [isConnected, setisConnected] = useState();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const connection_status =
          remediation &&
          (await axios.get(
            `${API_BASE}/remediations/${remediation.id}/connection_status`
          ));
        setisConnected(
          connection_status.data?.[0].connection_status === 'connected'
        );
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
  }, [remediation]);

  return isConnected;
};
