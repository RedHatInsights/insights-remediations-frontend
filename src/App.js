import PropTypes from 'prop-types';
import React, { createContext, Component } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { Routes } from './Routes';
import './App.scss';
import GlobalSkeleton from './skeletons/GlobalSkeleton';

import { getIsReceptorConfigured } from './api';

// Notifications
import NotificationsPortal from '@redhat-cloud-services/frontend-components-notifications/NotificationPortal';

export const PermissionContext = createContext();

class App extends Component {
  unregister;
  constructor() {
    super();
    this.state = {
      readPermission: undefined,
      writePermission: undefined,
      executePermission: undefined,
      isReceptorConfigured: undefined,
      arePermissionLoaded: false,
      hasSmartManagement: undefined,
    };
  }

  handlePermissionUpdate = (hasRead, hasWrite, hasExecute) =>
    this.setState({
      readPermission: hasRead,
      writePermission: hasWrite,
      executePermission: hasExecute,
      arePermissionLoaded: true,
    });

  componentWillUnmount() {
    if (typeof this.unregister === 'function') {
      this.unregister();
    }
  }
  async componentDidMount() {
    insights.chrome.init();
    insights.chrome?.hideGlobalFilter?.();
    insights.chrome.identifyApp('remediations');
    // wait for auth first, otherwise the call to RBAC may 401
    await window.insights.chrome.auth.getUser().then((user) =>
      this.setState({
        hasSmartManagement: user.entitlements.smart_management.is_entitled,
      })
    );
    getIsReceptorConfigured().then((isConfigured) =>
      this.setState({
        isReceptorConfigured: isConfigured.data.length > 0,
      })
    );
    this.unregister = insights.chrome.on('APP_NAVIGATION', (event) => {
      if (typeof event?.domEvent?.href === 'string') {
        this.props.history.push('/');
      }
    });
    window.insights.chrome
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
          this.handlePermissionUpdate(true, true, true);
        } else {
          this.handlePermissionUpdate(
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

  render() {
    const {
      readPermission,
      writePermission,
      executePermission,
      arePermissionLoaded,
      isReceptorConfigured,
      hasSmartManagement,
    } = this.state;

    return arePermissionLoaded ? (
      <PermissionContext.Provider
        value={{
          permissions: {
            read: readPermission,
            write: writePermission,
            execute: executePermission,
          },
          isReceptorConfigured,
          hasSmartManagement,
        }}
      >
        <NotificationsPortal />
        <Routes childProps={this.props} />
      </PermissionContext.Provider>
    ) : (
      <GlobalSkeleton />
    );
  }
}

App.propTypes = {
  history: PropTypes.object,
};

/**
 * withRouter: https://reacttraining.com/react-router/web/api/withRouter
 * connect: https://github.com/reactjs/react-redux/blob/master/docs/api.md
 *          https://reactjs.org/docs/higher-order-components.html
 */
export default withRouter(connect()(App));
