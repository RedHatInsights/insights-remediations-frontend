import useContextOrInternalStateAndRefs from './useContextOrInternalStateAndRefs';

const useStateCallbacks = () => {
  const { callbacks } = useContextOrInternalStateAndRefs();
  return callbacks;
};

export default useStateCallbacks;
