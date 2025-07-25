import { useCallback } from 'react';
import useQuery from '../Utilities/Hooks/useQuery';
import useRemediationTableState from './useRemediationTableState';
import useFetchTotalBatched from '../Utilities/Hooks/useFetchTotalBatched';

/**
 *  @typedef {object} useRemediationQueryParams
 *
 *  @property {string} [filter]            Scoped search filter string for the endpoint
 *  @property {object} [pagination]        API pagination params
 *  @property {object} [pagination.offset] Pagination offset
 *  @property {object} [pagination.limit]  Pagination limit (maximum 100)
 *  @property {object} [sortBy]            SortBy string for the API (usually 'attribute=desc')
 *
 */

/**
 *
 * Hook to use a Remediation REST API v2 endpoint with useQuery.
 * Optionally support for using the serialised table state if a `<TableStateProvider/>` is available.
 *
 *  @param   {Function}                  endpoint                String of the javascript-clients export for the needed endpoint
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
  // const apiEndpoint = useRemediationsAPI(endpoint);
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
  } = useQuery(endpoint, {
    skip: batched ? true : skip,
    ...options,
    params,
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
