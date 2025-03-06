import { useMemo, useEffect } from 'react';
import { APIFactory } from '@redhat-cloud-services/javascript-clients-shared';
import * as remediationsApi from '@redhat-cloud-services/remediations-client';
import { useAxiosWithPlatformInterceptors } from '@redhat-cloud-services/frontend-components-utilities/interceptors';

const BASE_URL = '/api/remediations';

/**
 *
 * Hook to get a  Remediations javascript-client or specific endpoint function
 *
 *  @param   {string}          [endpoint] String of the javascript-clients export for the needed endpoint
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
    const apiInstance = APIFactory(BASE_URL, remediationsApi, axios);
    return endpoint ? apiInstance[endpoint] : apiInstance;
  }, [axios, endpoint]);

  useEffect(() => {
    if (endpoint && !apiEndpoint) {
      console.warn('Available endpoints:', Object.keys(remediationsApi));
      throw `Endpoint ${endpoint} does not exist!`;
    }
  }, [endpoint, apiEndpoint]);

  return apiEndpoint;
};

export default useRemediationsApi;
