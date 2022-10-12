import React from 'react';
import PropTypes from 'prop-types';
import { BrowserRouter as Router } from 'react-router-dom';
import { Provider } from 'react-redux';
import { init } from './store';
import App from './App';
import { getBaseName } from '@redhat-cloud-services/frontend-components-utilities/helpers';

window.remReact = React;
const pathName = window.location.pathname.split('/');
pathName.shift();

const Remediations = ({ logger }) => (
  <Provider store={init(logger).getStore()}>
    <Router basename={getBaseName(window.location.pathname)}>
      <App basename={`${pathName[0]}/${pathName[1]}`} />
    </Router>
  </Provider>
);

Remediations.propTypes = {
  logger: PropTypes.func,
};

export default Remediations;
