import { useAxiosWithPlatformInterceptors } from '@redhat-cloud-services/frontend-components-utilities/interceptors';
import { useState, useEffect, useRef } from 'react';
import { API_BASE } from '../routes/api';

export const useRemediationsList = (remediation) => {
  const axios = useAxiosWithPlatformInterceptors();
  const [remediationsList, setRemediationsList] = useState();
  const mounted = useRef(false);

  useEffect(() => {
    mounted.current = true;
    const fetchData = async () => {
      try {
        const nameList = await axios.get(
          `${API_BASE}/remediations/?fields[data]=name`,
        );
        mounted.current && setRemediationsList(nameList.data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
    return () => {
      mounted.current = false;
    };
  }, [remediation]);

  return remediationsList;
};
