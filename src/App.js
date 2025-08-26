import React, { createContext, useState, useEffect } from 'react';
import useChrome from '@redhat-cloud-services/frontend-components/useChrome';
import { connect } from 'react-redux';
import Routes from './Routes';

import { getIsReceptorConfigured } from './api';

import NotificationsProvider from '@redhat-cloud-services/frontend-components-notifications/NotificationsProvider';
import { Spinner } from '@patternfly/react-core';
import { NotAuthorized } from '@redhat-cloud-services/frontend-components/NotAuthorized';

export const PermissionContext = createContext();

const App = () => {
  const chrome = useChrome();
  const [
    { readPermission, writePermission, executePermission, arePermissionLoaded },
    setPermissions,
  ] = useState({
    readPermission: undefined,
    writePermission: undefined,
    executePermission: undefined,
    arePermissionLoaded: false,
  });
  const [isReceptorConfigured, setIsReceptorConfigured] = useState(undefined);

  const handlePermissionUpdate = (hasRead, hasWrite, hasExecute) =>
    setPermissions({
      readPermission: hasRead,
      writePermission: hasWrite,
      executePermission: hasExecute,
      arePermissionLoaded: true,
    });

  useEffect(() => {
    if (chrome) {
      chrome?.hideGlobalFilter?.();

      getIsReceptorConfigured()
        .then((isConfigured) =>
          setIsReceptorConfigured(isConfigured.data.length > 0),
        )
        .catch((error) => {
          console.error('Error loading receptor configuration:', error);
        });

      if (chrome && typeof chrome.getUserPermissions === 'function') {
        chrome
          .getUserPermissions('remediations')
          .then((remediationsPermissions) => {
            const permissionList = remediationsPermissions.map(
              (permissions) => permissions.permission,
            );
            if (
              permissionList.includes('remediations:*:*') ||
              permissionList.includes('remediations:remediation:*')
            ) {
              handlePermissionUpdate(true, true, true);
            } else {
              handlePermissionUpdate(
                permissionList.includes('remediations:remediation:read') ||
                  permissionList.includes('remediations:*:read'),
                permissionList.includes('remediations:remediation:write') ||
                  permissionList.includes('remediations:*:write'),
                permissionList.includes('remediations:remediation:execute') ||
                  permissionList.includes('remediations:*:execute'),
              );
            }
          })
          .catch((error) => {
            console.error('Error loading user permissions:', error);
          });
      } else {
        console.error('Chrome getUserPermissions method not available');
      }
    }
  }, []);

  const hasRequiredPermissions = readPermission || writePermission;
  return arePermissionLoaded ? (
    hasRequiredPermissions ? (
      <NotificationsProvider>
        <PermissionContext.Provider
          value={{
            permissions: {
              read: readPermission,
              write: writePermission,
              execute: executePermission,
            },
            isReceptorConfigured,
          }}
        >
          <Routes />
        </PermissionContext.Provider>
      </NotificationsProvider>
    ) : (
      <NotAuthorized serviceName="Remediation Plans" />
    )
  ) : (
    <Spinner />
  );
};

export default connect()(App);
