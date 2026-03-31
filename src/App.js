import React, { createContext, useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import useChrome from '@redhat-cloud-services/frontend-components/useChrome';
import { connect } from 'react-redux';
import NotificationsProvider from '@redhat-cloud-services/frontend-components-notifications/NotificationsProvider';
import { Spinner } from '@patternfly/react-core';
import { NotAuthorized } from '@redhat-cloud-services/frontend-components/NotAuthorized';
import { RBACProvider } from '@redhat-cloud-services/frontend-components/RBACProvider';
import { AccessCheck } from '@project-kessel/react-kessel-access-check';

import Routes from './Routes';
import { useFeatureFlag } from './Utilities/Hooks/useFeatureFlag';
import { useKesselRemediationPermissionState } from './Utilities/Hooks/useKesselRemediationPermissionState';
import { getChromePerms } from './Utilities/remediationsPermissions';
import { KESSEL_API_BASE_URL } from './constants';

export const PermissionContext = createContext();

const SERVICE_NAME = 'Remediation Plans';

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
  // RBAC v1 path: call `chrome.getUserPermissions('remediations')` once and get booleans.
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
    if (!chrome) return;
    didLoadRef.current = true;

    if (typeof chrome.getUserPermissions !== 'function') {
      console.error('Chrome getUserPermissions method not available');
      return;
    }

    let cancelled = false;

    chrome
      .getUserPermissions('remediations')
      .then((list) => {
        if (cancelled) return;

        setPermissions(getChromePerms(list));

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

  return <PermissionsLayout isLoading={isLoading} permissions={permissions} />;
};

const KesselPermissionsGate = ({ baseUrl }) => {
  const { permissions, isLoading } =
    useKesselRemediationPermissionState(baseUrl);

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
