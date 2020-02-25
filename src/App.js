import PropTypes from 'prop-types';
import React, { createContext, Component, Fragment } from 'react';
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
            executePermission: false
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
        // TODO: Do the user check and set this function below to the right values
        this.handlePermissionUpdate(true, false, false);
    }

    componentWillUnmount () {
        this.appNav();
        this.buildNav();
    }

    render () {
        return (
            <PermissionContext.Provider value={{readPermission: this.state.readPermission, writePermission: this.state.writePermission, executePermission: this.state.executePermission}}>
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

