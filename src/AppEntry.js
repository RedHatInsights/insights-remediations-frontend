import React from 'react';
import PropTypes from 'prop-types';
import { BrowserRouter as Router } from 'react-router-dom';
import { Provider } from 'react-redux';
import { init } from './store';
import App from './App';

window.remReact = React;
const pathName = window.location.pathname.split('/');
pathName.shift();

let release = '/';
if (pathName[0] === 'beta') {
  release = `/${pathName.shift()}/`;
}

const Remediations = ({ logger }) => (
  <Provider store={init(logger).getStore()}>
    <Router basename={`${release}${pathName[0]}/${pathName[1]}`}>
      <App basename={`${pathName[0]}/${pathName[1]}`} />
    </Router>
  </Provider>
);

Remediations.propTypes = {
  logger: PropTypes.func,
};

export default Remediations;
