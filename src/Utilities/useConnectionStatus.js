import { useState, useEffect, useRef } from 'react';
import { API_BASE } from '../routes/api';

export const useConnectionStatus = (remediationId, axios) => {
  const [connectedSystems, setConnectedSystems] = useState(0);
  const [totalSystems, setTotalSystems] = useState(0);
  const [areDetailsLoading, setAreDetailsLoading] = useState(true);
  const [detailsError, setDetailsError] = useState();
  const [connectedData, setConnectedData] = useState([]);
  const mounted = useRef(false);
  useEffect(() => {
    mounted.current = true;
    let connectedSystemCount = 0;
    let totalSystemsCount = 0;
    const fetchData = async () => {
      try {
        const connection_status = await axios.get(
          `${API_BASE}/remediations/${remediationId}/connection_status`,
        );
        (mounted.current &&
          (connection_status.data.forEach((connected_group) => {
            ((totalSystemsCount += connected_group.system_count),
              connected_group.connection_status === 'connected' &&
                (connectedSystemCount = connected_group.system_count));
          }),
          setConnectedSystems(connectedSystemCount)),
          setTotalSystems(totalSystemsCount),
          setConnectedData(connection_status.data));
      } catch (error) {
        console.error(error);
        setDetailsError(error?.errors[0].status || '');
        setConnectedData(error?.errors[0].status);
        //When backend endpoint fails, it will stop here and not continue - forever loading
        setAreDetailsLoading(false);
      }
      setAreDetailsLoading(false);
    };

    remediationId && fetchData();
    return () => {
      mounted.current = false;
    };
  }, [axios, remediationId]);

  return [
    connectedSystems,
    totalSystems,
    areDetailsLoading,
    detailsError,
    connectedData,
  ];
};
