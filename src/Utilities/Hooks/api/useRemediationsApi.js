import { useMemo, useEffect } from 'react';
import { APIFactory } from '@redhat-cloud-services/javascript-clients-shared';
import * as remediationsApi from '@redhat-cloud-services/remediations-client';
import { useAxiosWithPlatformInterceptors } from '@redhat-cloud-services/frontend-components-utilities/interceptors';

const BASE_URL = '/api/remediations/v1';

/**
 *
 * Hook to get a  Remediations javascript-client or specific endpoint function
 *
 *  @param   {string|Function} [endpoint] String of the javascript-clients export for the needed endpoint, or a function wrapper
 *
 *  @returns {object|Function}            Remediations javascript-client or specific endpoint function
 *
 *  @category Remediations
 *  @subcategory Hooks
 *
 */
const useRemediationsApi = (endpoint) => {
  const axios = useAxiosWithPlatformInterceptors();

  const apiEndpoint = useMemo(() => {
    // If endpoint is already a function (wrapper), return it directly
    if (typeof endpoint === 'function') {
      return endpoint;
    }
    const apiInstance = APIFactory(BASE_URL, remediationsApi, { axios });
    return endpoint ? apiInstance[endpoint] : apiInstance;
  }, [axios, endpoint]);

  useEffect(() => {
    if (endpoint && typeof endpoint !== 'function' && !apiEndpoint) {
      console.warn('Available endpoints:', Object.keys(remediationsApi));
      console.error(`Endpoint "${endpoint}" does not exist!`);
    }
  }, [endpoint, apiEndpoint]);

  return apiEndpoint;
};

export default useRemediationsApi;
