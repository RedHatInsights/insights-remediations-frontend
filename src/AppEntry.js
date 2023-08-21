import React from 'react';
import PropTypes from 'prop-types';
import { Provider } from 'react-redux';
import { init } from './store';
import App from './App';

const Remediations = ({ logger }) => (
  <Provider store={init(logger).getStore()}>
    <App />
  </Provider>
);

Remediations.propTypes = {
  logger: PropTypes.func,
};

export default Remediations;
