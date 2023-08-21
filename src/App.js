import React, { createContext, useState, useEffect } from 'react';
import useChrome from '@redhat-cloud-services/frontend-components/useChrome';
import { connect } from 'react-redux';
import Routes from './Routes';
import './App.scss';
import GlobalSkeleton from './skeletons/GlobalSkeleton';

import { getIsReceptorConfigured } from './api';

// Notifications
import NotificationsPortal from '@redhat-cloud-services/frontend-components-notifications/NotificationPortal';

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

      getIsReceptorConfigured().then((isConfigured) =>
        setIsReceptorConfigured(isConfigured.data.length > 0)
      );

      chrome
        .getUserPermissions('remediations')
        .then((remediationsPermissions) => {
          const permissionList = remediationsPermissions.map(
            (permissions) => permissions.permission
          );
          if (
            permissionList.includes(
              'remediations:*:*' || 'remediations:remediation:*'
            )
          ) {
            handlePermissionUpdate(true, true, true);
          } else {
            handlePermissionUpdate(
              permissionList.includes(
                'remediations:remediation:read' || 'remediations:*:read'
              ),
              permissionList.includes(
                'remediations:remediation:write' || 'remediations:*:write'
              ),
              permissionList.includes(
                'remediations:remediation:execute' || 'remediations:*:execute'
              )
            );
          }
        });
    }
  }, []);

  return arePermissionLoaded ? (
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
      <NotificationsPortal />
      <Routes />
    </PermissionContext.Provider>
  ) : (
    <GlobalSkeleton />
  );
};

export default connect()(App);
