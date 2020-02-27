import PropTypes from 'prop-types';
import React, { createContext, Component } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { Routes } from './Routes';
import './App.scss';

// Notifications
import { NotificationsPortal } from '@redhat-cloud-services/frontend-components-notifications';

export const PermissionContext = createContext();

class App extends Component {

    constructor() {
        super();
        this.state = {
            readPermission: false,
            writePermission: false,
            executePermission: false,
            isOrgAdmin: false
        };
    }

    handlePermissionUpdate = (hasRead, hasWrite, hasExecute) => this.setState({
        readPermission: hasRead,
        writePermission: hasWrite,
        executePermission: hasExecute
    });

    componentDidMount () {
        insights.chrome.init();
        insights.chrome.identifyApp('remediations');
        window.insights.chrome.getUserPermissions().then(
            allPermissions => {
                const permissionList = allPermissions.map(permissions => permissions.permission);
                this.handlePermissionUpdate(
                    permissionList.includes('remediations:remediation:read'),
                    permissionList.includes('remediations:remediation:write'),
                    permissionList.includes('remediations:remediation:execute')
                );
            }
        );
        window.insights.chrome.auth.getUser().then((user) => user.identity.user.is_org_admin && this.setState({ isOrgAdmin: true }));
    }

    componentWillUnmount () {
        this.appNav();
        this.buildNav();
    }

    render () {
        return (
            <PermissionContext.Provider
                value={ {
                    permissions: {
                        read: this.state.isOrgAdmin ? true : this.state.readPermission,
                        write: this.state.isOrgAdmin ? true : this.state.writePermission,
                        execute: this.state.isOrgAdmin ? true : this.state.executePermission
                    }
                } }>
                <NotificationsPortal />
                <Routes childProps={ this.props } />
            </PermissionContext.Provider>
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

