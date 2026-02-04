import React, {
  createContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import PropTypes from 'prop-types';
import useChrome from '@redhat-cloud-services/frontend-components/useChrome';
import { connect } from 'react-redux';
import NotificationsProvider from '@redhat-cloud-services/frontend-components-notifications/NotificationsProvider';
import { Spinner } from '@patternfly/react-core';
import { NotAuthorized } from '@redhat-cloud-services/frontend-components/NotAuthorized';
import { RBACProvider } from '@redhat-cloud-services/frontend-components/RBACProvider';
import {
  AccessCheck,
  fetchDefaultWorkspace,
  useSelfAccessCheck,
} from '@project-kessel/react-kessel-access-check';
import { getKesselAccessCheckParams } from '@redhat-cloud-services/frontend-components-utilities/kesselPermissions';

import Routes from './Routes';
import { useFeatureFlag } from './Utilities/Hooks/useFeatureFlag';
import {
  KESSEL_API_BASE_URL,
  KESSEL_REMEDIATIONS_EDIT,
  KESSEL_REMEDIATIONS_EXECUTE,
  KESSEL_REMEDIATIONS_VIEW,
} from './constants';
import { useRbacV1RemediationPermissions } from './Utilities/Hooks/useRemediationPermissions';

export const PermissionContext = createContext();

const SERVICE_NAME = 'Remediation Plans';

const KESSEL_RELATIONS = [
  KESSEL_REMEDIATIONS_VIEW,
  KESSEL_REMEDIATIONS_EDIT,
  KESSEL_REMEDIATIONS_EXECUTE,
];

const getAllowed = (checks, relation) =>
  checks?.find((check) => check.relation === relation)?.allowed ?? false;

const PermissionsLayout = ({ isLoading, permissions }) => {
  if (isLoading) {
    return <Spinner />;
  }

  if (!(permissions.read || permissions.write)) {
    return <NotAuthorized serviceName={SERVICE_NAME} />;
  }

  return (
    <NotificationsProvider>
      <PermissionContext.Provider value={{ permissions }}>
        <Routes />
      </PermissionContext.Provider>
    </NotificationsProvider>
  );
};

PermissionsLayout.propTypes = {
  isLoading: PropTypes.bool.isRequired,
  permissions: PropTypes.shape({
    read: PropTypes.bool.isRequired,
    write: PropTypes.bool.isRequired,
    execute: PropTypes.bool.isRequired,
  }).isRequired,
};

const RbacPermissionsGate = () => {
  const { permissions, isLoading } = useRbacV1RemediationPermissions();
  return <PermissionsLayout isLoading={isLoading} permissions={permissions} />;
};

const KesselPermissionsGate = ({ baseUrl }) => {
  const chrome = useChrome();
  const [workspaceId, setWorkspaceId] = useState(undefined);
  const [workspaceLoading, setWorkspaceLoading] = useState(true);
  const didResolveWorkspaceRef = useRef(false);

  useEffect(() => {
    if (didResolveWorkspaceRef.current) return;
    didResolveWorkspaceRef.current = true;

    let cancelled = false;

    const chromeWorkspaceId = chrome?.appObjectId?.();
    if (chromeWorkspaceId) {
      setWorkspaceId(chromeWorkspaceId);
      setWorkspaceLoading(false);
      return () => {
        cancelled = true;
      };
    }

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
  }, [chrome, baseUrl]);

  const params = useMemo(
    () =>
      getKesselAccessCheckParams({
        requiredPermissions: KESSEL_RELATIONS,
        resourceIdOrIds: workspaceId,
      }),
    [workspaceId],
  );

  const { data: checks, loading: checksLoading } = useSelfAccessCheck(
    workspaceId ? params : { resources: [] },
  );

  const permissions = useMemo(() => {
    const read = getAllowed(checks, KESSEL_REMEDIATIONS_VIEW);
    const write = getAllowed(checks, KESSEL_REMEDIATIONS_EDIT);
    const execute = getAllowed(checks, KESSEL_REMEDIATIONS_EXECUTE);
    return { read, write, execute };
  }, [checks]);

  const isLoading = workspaceLoading || (workspaceId ? checksLoading : false);

  return <PermissionsLayout isLoading={isLoading} permissions={permissions} />;
};

KesselPermissionsGate.propTypes = {
  baseUrl: PropTypes.string.isRequired,
};

const App = () => {
  const chrome = useChrome();
  const isKesselEnabled = useFeatureFlag('kessel-for-remediations');
  const baseUrl = window.location.origin || 'https://console.redhat.com';

  useEffect(() => {
    chrome?.hideGlobalFilter?.(true);
  }, [chrome]);

  return isKesselEnabled ? (
    <AccessCheck.Provider baseUrl={baseUrl} apiPath={KESSEL_API_BASE_URL}>
      <KesselPermissionsGate baseUrl={baseUrl} />
    </AccessCheck.Provider>
  ) : (
    <RBACProvider appName="remediations">
      <RbacPermissionsGate />
    </RBACProvider>
  );
};

export default connect()(App);
