import { useAxiosWithPlatformInterceptors } from '@redhat-cloud-services/frontend-components-utilities/interceptors';
const { API_BASE } = require('../config');
import { useState, useEffect } from 'react';

export const useConnectionStatus = (
  remediation,
  context,
  executable,
  isFedramp
) => {
  const axios = useAxiosWithPlatformInterceptors();
  const [isDisabled, setIsDisabled] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const connection_status =
          remediation &&
          (await axios.get(
            `${API_BASE}/remediations/${remediation.id}/connection_status`
          ));
        let connected =
          connection_status.data.length > 0
            ? connection_status.data[0].connection_status !== 'connected'
            : false;
        if (!connected) {
          setIsDisabled(true);
        } else {
          setIsDisabled(
            !context.permissions.execute ||
              !executable ||
              isFedramp ||
              connected
          );
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
  }, [remediation, context, executable, isFedramp]);

  return isDisabled;
};
