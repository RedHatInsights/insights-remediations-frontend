import { Switch, Route, Redirect } from 'react-router-dom';
import PropTypes from 'prop-types';
import React from 'react';
import Home from './routes/Home';
import RemediationDetails from './routes/RemediationDetails';
import ActivityDetails from './components/ActivityDetails';
import ExecutorDetails from './components/ExecutorDetails';

const InsightsRoute = ({ component: Component, rootClass, ...rest }) => {
    const root = document.getElementById('root');
    root.removeAttribute('class');
    root.classList.add(`page__${rootClass}`, 'pf-l-page__main');
    root.classList.add(`page__${rootClass}`, 'pf-c-page__main');

    return (<Route component={ Component } { ...rest } />);
};

InsightsRoute.propTypes = {
    component: PropTypes.func,
    rootClass: PropTypes.string
};

export const routes = {
    home: '/',
    details: '/:id',
    runDetails: '/:id/:run_id',
    executorDetails: '/:id/:run_id/:executor_id'
};

export const Routes = () => (
    <Switch>
        <InsightsRoute exact path={ routes.home } component={ Home } rootClass='remediations' />
        <InsightsRoute exact path={ routes.details } component={ RemediationDetails } rootClass='remediation-details' />
        <InsightsRoute exact path={ routes.runDetails } render={ (props) => (<ActivityDetails  remediation={ {} } { ...props } />) } />
        <InsightsRoute exact path={ routes.executorDetails } render={ (props) => (<ExecutorDetails   { ...props } />) } />
        <Redirect path='*' to={ routes.home } push />
    </Switch>
);

Routes.propTypes = {
    childProps: PropTypes.shape({
        history: PropTypes.shape({
            push: PropTypes.func
        })
    })
};

