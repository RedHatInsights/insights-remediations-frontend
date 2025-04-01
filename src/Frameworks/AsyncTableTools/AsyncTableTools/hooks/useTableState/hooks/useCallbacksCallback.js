import { useEffect } from 'react';
import useStateCallbacks from './useStateCallbacks';

const useCallbacksCallback = (namespace, fn) => {
  const callbacks = useStateCallbacks();
  useEffect(() => {
    callbacks.current[namespace] = fn;
  }, [callbacks, namespace, fn]);
};

export default useCallbacksCallback;
