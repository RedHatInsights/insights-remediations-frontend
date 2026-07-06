import { useEffect, useState } from 'react';
import useChrome from '@redhat-cloud-services/frontend-components/useChrome';

export function useIsOrgAdmin() {
  const chrome = useChrome();
  const [isOrgAdmin, setIsOrgAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const isOrgAdminFn = chrome?.visibilityFunctions?.isOrgAdmin;
    if (typeof isOrgAdminFn !== 'function') {
      setIsOrgAdmin(false);
      setIsLoading(false);
      return undefined;
    }

    Promise.resolve(isOrgAdminFn())
      .then((result) => {
        if (!cancelled) {
          setIsOrgAdmin(!!result);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setIsOrgAdmin(false);
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [chrome]);

  return { isOrgAdmin, isLoading };
}
