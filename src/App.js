import PropTypes from 'prop-types';
import React, { createContext, Component } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { Routes } from './Routes';
import './App.scss';
import GlobalSkeleton from './skeletons/GlobalSkeleton';

// Notifications
import { NotificationsPortal } from '@redhat-cloud-services/frontend-components-notifications';

export const PermissionContext = createContext();

class App extends Component {

    constructor() {
        super();
        this.state = {
            readPermission: undefined,
            writePermission: undefined,
            executePermission: undefined,
            arePermissionLoaded: false
        };
    }

    handlePermissionUpdate = (hasRead, hasWrite, hasExecute) => this.setState({
        readPermission: hasRead,
        writePermission: hasWrite,
        executePermission: hasExecute,
        arePermissionLoaded: true
    });

    async componentDidMount () {
        insights.chrome.init();
        insights.chrome.identifyApp('remediations');

        // wait for auth first, otherwise the call to RBAC may 401
        await window.insights.chrome.auth.getUser();
        window.insights.chrome.getUserPermissions('remediations').then(
            remediationsPermissions => {
                const permissionList = remediationsPermissions.map(permissions => permissions.permission);
                if (permissionList.includes('remediations:*:*' || 'remediations:remediation:*')) {
                    this.handlePermissionUpdate(true, true, true);
                } else {
                    this.handlePermissionUpdate(
                        permissionList.includes('remediations:remediation:read' || 'remediations:*:read'),
                        permissionList.includes('remediations:remediation:write' || 'remediations:*:write'),
                        permissionList.includes('remediations:remediation:execute' || 'remediations:*:execute')
                    );
                }
            }
        );
    }

    componentWillUnmount () {
        this.appNav();
        this.buildNav();
    }

    render () {
        const { readPermission, writePermission, executePermission, arePermissionLoaded } = this.state;

        return (
            arePermissionLoaded ?
                <PermissionContext.Provider
                    value={ {
                        permissions: {
                            read: readPermission,
                            write: writePermission,
                            execute: executePermission
                        }
                    } }>
                    <NotificationsPortal />
                    <Routes childProps={ this.props } />
                </PermissionContext.Provider>
                : <GlobalSkeleton/>
        );
    }
}

App.propTypes = {
    history: PropTypes.object
};

/**
 * withRouter: https://reacttraining.com/react-router/web/api/withRouter
 * connect: https://github.com/reactjs/react-redux/blob/master/docs/api.md
 *          https://reactjs.org/docs/higher-order-components.html
 */
export default withRouter (connect()(App));

