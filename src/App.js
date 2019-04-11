import PropTypes from 'prop-types';
import React, { Component, Fragment } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { Routes } from './Routes';
import './App.scss';
import { register } from './store';

// Notifications
import { NotificationsPortal, notifications } from '@red-hat-insights/insights-frontend-components/components/Notifications';
import '@red-hat-insights/insights-frontend-components/components/Notifications.css';

class App extends Component {

    componentDidMount () {
        register({ notifications });
        insights.chrome.init();
        insights.chrome.identifyApp('remediations');
    }

    render () {
        return (
            <Fragment>
                <NotificationsPortal />
                <Routes childProps={ this.props } />
            </Fragment>
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

