import PropTypes from 'prop-types';
import React, { createContext, useState, useEffect } from 'react';
import useChrome from '@redhat-cloud-services/frontend-components/useChrome';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { Routes } from './Routes';
import './App.scss';
import GlobalSkeleton from './skeletons/GlobalSkeleton';

import { getIsReceptorConfigured } from './api';

// Notifications
import NotificationsPortal from '@redhat-cloud-services/frontend-components-notifications/NotificationPortal';

export const PermissionContext = createContext();

const App = (props) => {
  console.log("Do not merge");
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
    let unregister;
    if (chrome) {
      chrome.identifyApp('remediations');
      chrome?.hideGlobalFilter?.();

      getIsReceptorConfigured().then((isConfigured) =>
        setIsReceptorConfigured(isConfigured.data.length > 0)
      );

      unregister = chrome.on('APP_NAVIGATION', (event) =>
        history.push(`/${event.navId}`)
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
    return () => {
      unregister();
    };
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
      <Routes childProps={props} />
    </PermissionContext.Provider>
  ) : (
    <GlobalSkeleton />
  );
};

App.propTypes = {
  history: PropTypes.object,
};

/**
 * withRouter: https://reacttraining.com/react-router/web/api/withRouter
 * connect: https://github.com/reactjs/react-redux/blob/master/docs/api.md
 *          https://reactjs.org/docs/higher-order-components.html
 */
export default withRouter(connect()(App));
