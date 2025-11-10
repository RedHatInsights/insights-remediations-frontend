import useRemediationsQuery from '../../../api/useRemediationsQuery';
/*
 * Transform { filter: { key: value } } to bracket notation params in according to remediations Backend API..
 * @param {object} filter
 * @returns {object}
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

/*
 * Transform params by moving filter to axios params bracket notation.
 * @param {object} params
 * @returns {object}
 */
const transformParams = (params) => {
  if (!params || typeof params !== 'object') {
    return params;
  }

  const { filter, options, ...restParams } = params;

  if (!filter) {
    return params;
  }

  const transformedFilters = transformFilterParams(filter);
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

/*
 * Ensure the API client receives an arguments array; wraps transformed params.
 * @param {Array|object} params
 * @returns {Array}
 */
const convertToArray = (params) => {
  if (Array.isArray(params)) {
    return params;
  }
  const transformedParams = transformParams(params);
  return [transformedParams];
};

/**
 *
 * Hook for remediations API endpoints using the JS client.
 * Centralizes parameter transformation so all endpoints receive params consistently.
 * - Transforms `{ filter: { key: 'value' } }` into axios bracket notation via `options.params.options.params`
 * - Wraps params into an array for the javascript-client calling convention
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
const useRemediations = (endpoint, options = {}) =>
  useRemediationsQuery(endpoint, {
    ...options,
    convertToArray,
  });

export default useRemediations;
