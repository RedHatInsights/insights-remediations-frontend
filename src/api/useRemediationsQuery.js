import { useCallback } from 'react';
import useQuery from '../Utilities/Hooks/useQuery';
import useRemediationTableState from './useRemediationTableState';
import useFetchTotalBatched from '../Utilities/Hooks/useFetchTotalBatched';
import useRemediationsApi from '../Utilities/Hooks/api/useRemediationsApi';

/**
 * Helper function to transform filter object to bracket notation
 * Converts {filter: {name: 'value'}} to {'filter[name]': 'value'}
 * The API client doesn't properly handle nested filter objects,
 * so we need to pass them as extra query params through axios
 *
 *  @param   {object} filter - The filter object to transform
 *  @returns {object}        - Transformed filter params in bracket notation
 */
const transformFilterParams = (filter) => {
  const extraParams = {};
  if (filter && typeof filter === 'object') {
    Object.entries(filter).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        extraParams[`filter[${key}]`] = value;
      }
    });
  }
  return extraParams;
};

/**
 * Helper function to transform params object that contains filters
 *
 *  @param   {object} params - The params object with all API parameters
 *  @returns {object}        - Transformed params with filter in bracket notation
 */
const transformParams = (params) => {
  if (!params || typeof params !== 'object') {
    return params;
  }

  const { filter, options, ...restParams } = params;

  // If no filter, return original params
  if (!filter) {
    return params;
  }

  // Transform filter to bracket notation
  const transformedFilters = transformFilterParams(filter);

  // Merge with options.params if it exists
  const mergedOptions = {
    ...options,
    params: {
      ...options?.params,
      ...transformedFilters,
    },
  };

  return {
    ...restParams,
    options: mergedOptions,
  };
};

/**
 * Convert params object to array format for remediations API client.
 * Remediations API methods accept a single params object as their first argument.
 * Also transforms filter parameters to bracket notation for the API.
 *
 *  @param   {object} params - The params object with all API parameters
 *  @returns {Array}         - Array with transformed params object as first element
 */
const convertToArray = (params) => {
  if (Array.isArray(params)) {
    return params;
  }

  // Transform filter params if present, then wrap in an array
  const transformedParams = transformParams(params);
  return [transformedParams];
};

/**
 *  @typedef {object} useRemediationQueryParams
 *
 *  @property {object} [filter]            Filter object for the endpoint (e.g., {name: 'value', status: 'active'})
 *  @property {object} [pagination]        API pagination params
 *  @property {object} [pagination.offset] Pagination offset
 *  @property {object} [pagination.limit]  Pagination limit (maximum 100)
 *  @property {object} [sortBy]            SortBy string for the API (usually 'attribute=desc')
 *
 */

/**
 *
 * Hook to use a Remediation REST API endpoint with useQuery.
 * Optionally support for using the serialised table state if a `<TableStateProvider/>` is available.
 * Automatically transforms filter parameters from {filter: {key: 'value'}} to {'filter[key]': 'value'} format.
 *
 *  @param   {Function|string}           endpoint                API client method or endpoint string for useRemediationsApi
 *
 *  @param   {object}                    [options]               Options for useRemediationsQuery & useQuery
 *  @param   {useRemediationQueryParams} [options.params]        API endpoint params
 *  @param   {boolean}                   [options.useTableState] Use the serialised table state
 *  @param   {boolean}                   [options.onlyTotal]     Enables a predefined "compileResult" function for the useQuery to only return the meta.total as the `data`
 *
 *  @param                               options.batched
 *  @param                               options.skip
 *  @param                               options.batch
 *  @returns {useQueryReturn}                                    An object containing a data, loading and error state, as well as a fetch and refetch function.
 *
 *  @category Remediation
 *  @subcategory Hooks
 *
 * @example
 * useRemediationsQuery('getRemediations', {
 *   params: { filter: { name: 'test' }, limit: 10 }
 * });
 *
 */
const useRemediationsQuery = (
  endpoint,
  {
    params: paramsOption,
    useTableState = false,
    batched = false,
    skip: skipOption,
    batch = {},
    ...options
  } = {},
) => {
  const apiEndpoint = useRemediationsApi(endpoint);
  const { params, hasState } = useRemediationTableState(
    useTableState,
    paramsOption,
  );
  const skip = !!(skipOption || (useTableState && !hasState));

  const {
    result: queryData,
    error: queryError,
    loading: queryLoading,
    fetch: queryFetch,
    refetch: queryRefetch,
  } = useQuery(apiEndpoint, {
    skip: batched ? true : skip,
    ...options,
    params,
    convertToArray,
  });
  const fetchForBatch = useCallback(
    async (offset, limit, params) =>
      await queryFetch({ limit, offset, ...params }, false),
    [queryFetch],
  );
  const {
    loading: batchedLoading,
    result: batchedData,
    error: batchedError,
    fetch: batchedFetch,
  } = useFetchTotalBatched(fetchForBatch, {
    skip: !batched ? true : skip,
    ...batch,
  });

  const exporter = async () => (await batchedFetch()).data;

  const fetchAllIds = async () =>
    (await batchedFetch()).data.map(({ id }) => id);
  return {
    ...(batched
      ? {
          result: batchedData,
          error: batchedError,
          loading: batchedLoading,
        }
      : {
          result: queryData,
          error: queryError,
          loading: queryLoading,
          refetch: queryRefetch,
        }),
    fetch: queryFetch,
    fetchBatched: batchedFetch,
    fetchAllIds,
    exporter,
  };
};
export default useRemediationsQuery;
