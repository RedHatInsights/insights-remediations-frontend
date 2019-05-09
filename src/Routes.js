import { Switch, matchPath, Route } from 'react-router-dom';
import PropTypes from 'prop-types';
import React from 'react';
import Home from './routes/Home';
import RemediationDetails from './routes/RemediationDetails';

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
    details: '/:id'
};

function checkPaths(group, app) {
    return Object
    .values(routes)
    .some(
        route => {
            return matchPath(location.href, { path: `${document.baseURI}${group}/${app}${route}` });
        }
    );
}

export const Routes = ({ childProps: { history }}) => {
    const pathName = window.location.pathname.split('/');
    pathName.shift();

    if (pathName[0] === 'beta') {
        pathName.shift();
    }

    if (!checkPaths(pathName[0], pathName[1])) {
        history.push(routes.home);
    }

    return (
        <Switch>
            <InsightsRoute exact path={ routes.home } component={ Home } rootClass='remediations' />
            <InsightsRoute path={ routes.details } component={ RemediationDetails } rootClass='remediation-details' />
        </Switch>
    );
};

Routes.propTypes = {
    childProps: PropTypes.shape({
        history: PropTypes.shape({
            push: PropTypes.func
        })
    })
};
