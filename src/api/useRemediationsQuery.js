import { useMemo } from 'react';
// import useRemediationsApi from '../Utilities/Hooks/api/useRemediationsApi';
import useQuery from '../Utilities/Hooks/useQuery';
import { useSerialisedTableState } from '../Frameworks/AsyncTableTools/AsyncTableTools/hooks/useTableState';

/**
 *  @typedef {object} useComplianceQueryParams
 *
 *  @property {string} [filter]            Scoped search filter string for the endpoint
 *  @property {object} [pagination]        API pagination params
 *  @property {object} [pagination.offset] Pagination offset
 *  @property {object} [pagination.limit]  Pagination limit (maximum 100)
 *  @property {object} [sortBy]            SortBy string for the API (usually 'attribute:desc')
 *
 */

/**
 *
 * Hook to use a Compliance REST API v2 endpoint with useQuery.
 * Optionally support for using the serialised table state if a `<TableStateProvider/>` is available.
 *
 *  @param   {Function}                 endpoint                String of the javascript-clients export for the needed endpoint
 *
 *  @param   {object}                   [options]               Options for useRemediationsQuery & useQuery
 *  @param   {useComplianceQueryParams} [options.params]        API endpoint params
 *  @param   {boolean}                  [options.useTableState] Use the serialised table state
 *
 *  @returns {useQueryReturn}                                   An object containing a data, loading and error state, as well as a fetch and refetch function.
 *
 *  @category Compliance
 *  @subcategory Hooks
 *
 * @example
 *
 */
const useRemediationsQuery = (
  endpoint,
  { params, useTableState = false, ...options } = {}
) => {
  console.log(endpoint, 'endpoint here');
  //TODO: remove everything thats here with params, log the table state and integrate pagination/stuff to pass on to api/function
  //TODO: adapt it to work with api

  // const apiEndpoint = useRemediationsApi(endpoint);
  const serialisedTableState = useSerialisedTableState();
  const {
    filters,
    pagination: { offset, limit } = {},
    sort: sortBy,
  } = serialisedTableState || {};

  const filter = useMemo(
    () =>
      params?.filter
        ? `(${params.filter})${filters ? ` AND ${filters}` : ''}`
        : filters,
    [params, filters]
  );

  const paramsFromSerialisedTableState = useMemo(
    () => ({
      limit,
      offset,
      sortBy,
      ...params,
      filter,
    }),
    [limit, offset, filter, sortBy, params]
  );

  const query = useQuery(endpoint, {
    params: useTableState ? paramsFromSerialisedTableState : params,
    skip: useTableState && !serialisedTableState,
    ...options,
  });

  console.log('useQuery called here with', endpoint);
  return query;
};

export default useRemediationsQuery;
