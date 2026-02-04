import { useEffect, useRef, useState } from 'react';
import useChrome from '@redhat-cloud-services/frontend-components/useChrome';
import { useSelfAccessCheck } from '@project-kessel/react-kessel-access-check';
import { getKesselAccessCheckParams } from '@redhat-cloud-services/frontend-components-utilities/kesselPermissions';
import { matchPermissions } from '../utils';
import {
  KESSEL_REMEDIATIONS_VIEW,
  KESSEL_REMEDIATIONS_EDIT,
  KESSEL_REMEDIATIONS_EXECUTE,
} from '../../constants';

const RBAC_READ = 'remediations:remediation:read';
const RBAC_WRITE = 'remediations:remediation:write';
const RBAC_EXECUTE = 'remediations:remediation:execute';

const KESSEL_RELATIONS = [
  KESSEL_REMEDIATIONS_VIEW,
  KESSEL_REMEDIATIONS_EDIT,
  KESSEL_REMEDIATIONS_EXECUTE,
];

/**
 * Hook for remediation permissions when Kessel is enabled (kessel-for-remediations).
 * Must be used inside AccessCheck.Provider.
 * Uses getKesselAccessCheckParams from frontend-components-utilities.
 *
 *  @param   {string|null}                                                                                                       workspaceId - Workspace ID (e.g. from chrome.appObjectId())
 *  @returns {{ permissions: { read: boolean, write: boolean, execute: boolean }, isLoading: boolean, error: object|undefined }}
 */
export function useKesselRemediationPermissions(workspaceId) {
  const params = getKesselAccessCheckParams({
    requiredPermissions: KESSEL_RELATIONS,
    resourceIdOrIds: workspaceId || undefined,
  });

  const {
    data: permissionChecks,
    loading,
    error,
  } = useSelfAccessCheck(workspaceId ? params : { resources: [] });

  const read =
    permissionChecks?.find(
      (check) => check.relation === KESSEL_REMEDIATIONS_VIEW,
    )?.allowed ?? false;
  const write =
    permissionChecks?.find(
      (check) => check.relation === KESSEL_REMEDIATIONS_EDIT,
    )?.allowed ?? false;
  const execute =
    permissionChecks?.find(
      (check) => check.relation === KESSEL_REMEDIATIONS_EXECUTE,
    )?.allowed ?? false;

  return {
    permissions: { read, write, execute },
    isLoading: loading,
    error,
  };
}

/**
 * Hook for remediation permissions when using RBAC v1 (chrome.getUserPermissions).
 * Use when kessel-for-remediations feature flag is off.
 *
 *  @returns {{ permissions: { read: boolean, write: boolean, execute: boolean }, isLoading: boolean }}
 */
export function useRbacV1RemediationPermissions() {
  const chrome = useChrome();
  const [permissions, setPermissions] = useState({
    read: false,
    write: false,
    execute: false,
  });
  const [isLoading, setIsLoading] = useState(true);
  const didLoadRef = useRef(false);

  useEffect(() => {
    if (didLoadRef.current) return;
    if (!chrome?.getUserPermissions) {
      return;
    }
    didLoadRef.current = true;

    let cancelled = false;

    chrome
      .getUserPermissions('remediations')
      .then((list) => {
        if (cancelled) return;
        const perms = (list || [])
          .map(({ permission }) => permission)
          .filter((p) => typeof p === 'string');
        setPermissions({
          read: perms.some((p) => matchPermissions(p, RBAC_READ)),
          write: perms.some((p) => matchPermissions(p, RBAC_WRITE)),
          execute: perms.some((p) => matchPermissions(p, RBAC_EXECUTE)),
        });
        setIsLoading(false);
      })
      .catch((error) => {
        console.error('Error loading user permissions:', error);
        if (!cancelled) {
          setPermissions({ read: false, write: false, execute: false });
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [chrome]);

  return { permissions, isLoading };
}
