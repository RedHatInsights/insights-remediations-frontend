import React from 'react';
import PropTypes from 'prop-types';
import { Fragment } from 'react';
import { ConnectedIcon, DisconnectedIcon } from '@patternfly/react-icons';

const ConnectionStatusColumn = ({ connection_status }) => {
  return (
    <Fragment>
      {connection_status === 'connected' ? (
        <span>
          {' '}
          <ConnectedIcon className="pf-u-mr-xs" /> Connected
        </span>
      ) : (
        <span>
          {' '}
          <DisconnectedIcon className="pf-u-mr-xs" />
          Disconnected
        </span>
      )}
    </Fragment>
  );
};

ConnectionStatusColumn.propTypes = {
  connection_status: PropTypes.string,
};

export default ConnectionStatusColumn;
