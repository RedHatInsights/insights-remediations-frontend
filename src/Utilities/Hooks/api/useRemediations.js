import useRemediationsQuery from '../../../api/useRemediationsQuery';

/**
 *
 * Hook for remediations API endpoints using the JS client.
 * This is a simple wrapper around useRemediationsQuery for backwards compatibility.
 * Filter transformation is now handled automatically in useRemediationsQuery.
 *
 *  @param   {Function|string} endpoint - The remediations API client method or endpoint string
 *  @param   {object}          options  - Options to pass to useRemediationsQuery
 *  @returns {object}                   - Query result with data, loading, error states and fetch functions
 *
 *  @example
 *  const { result, loading } = useRemediations(
 *    remediationsApi.getRemediations,
 *    { useTableState: true, params: { filter: { name: 'test' } } }
 *  );
 *
 */
const useRemediations = (endpoint, options) =>
  useRemediationsQuery(endpoint, options);

export default useRemediations;
