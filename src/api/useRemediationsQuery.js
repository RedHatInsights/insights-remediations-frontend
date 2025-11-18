import { useCallback } from 'react';
import useQuery from '../Utilities/Hooks/useQuery';
import useRemediationTableState from './useRemediationTableState';
import useFetchTotalBatched from '../Utilities/Hooks/useFetchTotalBatched';
import useRemediationsApi from '../Utilities/Hooks/api/useRemediationsApi';

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
 * Parameter transformation (including filter bracket notation) is handled by the wrapper in `useRemediations`.
 *
 *  @param   {Function|string}           endpoint                API client method or endpoint string for useRemediationsApi
 *
 *  @param   {object}                    [options]               Options for useRemediationsQuery & useQuery
 *  @param   {useRemediationQueryParams} [options.params]        API endpoint params
 *  @param   {boolean}                   [options.useTableState] Use the serialised table state
 *  @param   {boolean}                   [options.onlyTotal]     Enables a predefined "compileResult" function for the useQuery to only return the meta.total as the `data`
 *  @param   {boolean}                   [options.batched]       Enable batched fetching using useFetchTotalBatched
 *  @param   {boolean}                   [options.skip]          Skip the initial fetch
 *  @param   {object}                    [options.batch]         Options for batched fetching
 *
 *  @returns {object}                                            An object containing a data, loading and error state, as well as a fetch and refetch function.
 *
 *  @category Remediation
 *  @subcategory Hooks
 *
 * @example
 * // Preferred: use the higher-level wrapper which handles param conversion
 * // This is used when useTableState is true
 * // const { result, loading } = useRemediations('getRemediations', {
 * //   params: { filter: { name: 'test' }, limit: 10 }
 * // });
 *
 * @example
 * // Direct usage (no automatic param transformation):
 * // If your endpoint doesn't need filter bracketization, you can call this hook directly:
 * useRemediationsQuery('getRemediation', {
 *   params: { id }
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
