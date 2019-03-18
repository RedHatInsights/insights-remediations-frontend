import { Switch, Redirect, matchPath } from 'react-router-dom';
import PropTypes from 'prop-types';
import React from 'react';
import Home from './routes/Home';
import RemediationDetails from './routes/RemediationDetails';

const InsightsRoute = ({ component: Component, rootClass, ...rest }) => {
    const root = document.getElementById('root');
    root.removeAttribute('class');
    root.classList.add(`page__${rootClass}`, 'pf-l-page__main');
    root.classList.add(`page__${rootClass}`, 'pf-c-page__main');

    return (<Component { ...rest } />);
};

InsightsRoute.propTypes = {
    component: PropTypes.func,
    rootClass: PropTypes.string
};

export const routes = {
    home: '/',
    details: '/:id'
};

function checkPaths(app) {
    return Object
    .values(routes)
    .some(
        route => {
            return matchPath(location.href, { path: `${document.baseURI}${app}/remediations${route}` });
        }
    );
}

export const Routes = ({ childProps: { history }}) => {

    const pathName = window.location.pathname.split('/');

    if (!checkPaths(pathName[1] === 'beta' ? pathName[2] : pathName[1])) {
        history.push(routes.table);
    }

    return (
        <Switch>
            <InsightsRoute exact path={ routes.home } component={ Home } rootClass='remediations' />
            <InsightsRoute exact path={ routes.details } component={ RemediationDetails } rootClass='remediation-details' />
            <Redirect to='/' />
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
