import useRemediationsQuery from '../../../api/useRemediationsQuery';

//TODO: This is currently not used, but will be when upgraded to JS Clients
const convertToArray = (params) => {
  if (Array.isArray(params)) {
    return params;
  } else {
    const { policyId, tailoringId, assignRulesRequest } = params;

    return [
      policyId,
      tailoringId,
      undefined, // xRHIDENTITY,
      assignRulesRequest,
    ];
  }
};

const useRemedations = (options) =>
  useRemediationsQuery('remediations', { ...options, convertToArray });

export default useRemedations;
