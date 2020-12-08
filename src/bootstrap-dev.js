import React from 'react';
import ReactDOM from 'react-dom';
import logger from 'redux-logger';
import Remediations from './AppEntry';

ReactDOM.render(<Remediations logger={ logger } />, document.getElementById('root'));
