import { useEffect, useMemo, useRef, useState } from 'react';
import {
  fetchDefaultWorkspace,
  useSelfAccessCheck,
} from '@project-kessel/react-kessel-access-check';

import {
  KESSEL_REMEDIATIONS_EDIT,
  KESSEL_REMEDIATIONS_EXECUTE,
  KESSEL_REMEDIATIONS_VIEW,
} from '../../constants';

const KESSEL_RELATIONS = [
  KESSEL_REMEDIATIONS_VIEW,
  KESSEL_REMEDIATIONS_EDIT,
  KESSEL_REMEDIATIONS_EXECUTE,
];

/** workspace + rbac reporter, aligned with fec kesselPermissions defaults */
const REMEDIATIONS_WORKSPACE_RESOURCE = {
  type: 'workspace',
  reporter: { type: 'rbac' },
};

function remediationsBulkSelfAccessParams(workspaceId) {
  if (!workspaceId) {
    return { resources: [] };
  }

  return {
    resources: KESSEL_RELATIONS.map((relation) => ({
      id: workspaceId,
      ...REMEDIATIONS_WORKSPACE_RESOURCE,
      relation,
    })),
  };
}

const getAllowed = (checks, relation) =>
  checks?.find((check) => check.relation === relation)?.allowed ?? false;

/**
 * Kessel self-check for remediations (view / edit / execute).
 * Resolves default workspace, then one checkselfbulk for all relations.
 * Must render under AccessCheck.Provider (see App.js).
 *
 *  @param   {string} baseUrl Origin used to resolve default workspace.
 *  @returns {object}         Resolved permission flags and loading state.
 */
export function useKesselRemediationPermissionState(baseUrl) {
  const [workspaceId, setWorkspaceId] = useState(undefined);
  const [workspaceLoading, setWorkspaceLoading] = useState(true);
  const didResolveWorkspaceRef = useRef(false);

  useEffect(() => {
    if (didResolveWorkspaceRef.current) return;
    didResolveWorkspaceRef.current = true;

    let cancelled = false;

    fetchDefaultWorkspace(baseUrl)
      .then((ws) => {
        if (!cancelled) {
          setWorkspaceId(ws.id);
        }
      })
      .catch((error) => {
        console.error(
          'Unable to resolve default workspace for Kessel checks:',
          error,
        );
        if (!cancelled) {
          setWorkspaceId(undefined);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setWorkspaceLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [baseUrl]);

  const bulkAccessParams = useMemo(
    () => remediationsBulkSelfAccessParams(workspaceId),
    [workspaceId],
  );

  const { data: checks, loading: checksLoading } =
    useSelfAccessCheck(bulkAccessParams);

  const permissions = useMemo(() => {
    const read = getAllowed(checks, KESSEL_REMEDIATIONS_VIEW);
    const write = getAllowed(checks, KESSEL_REMEDIATIONS_EDIT);
    const execute = getAllowed(checks, KESSEL_REMEDIATIONS_EXECUTE);
    return { read, write, execute };
  }, [checks]);

  const isLoading = workspaceLoading || (workspaceId ? checksLoading : false);

  return { permissions, isLoading };
}
