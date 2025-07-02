import React from 'react';
import PropTypes from 'prop-types';
import {
  ConnectedIcon,
  DisconnectedIcon,
  UnknownIcon,
} from '@patternfly/react-icons';
import { Flex, Tooltip } from '@patternfly/react-core';

const ConnectionStatusColumn = ({ connection_status, executor_type }) => {
  let status = connection_status;
  let execType = executor_type;
  // Convert to lowercase if connection_status is a string
  if (typeof connection_status === 'string') {
    status = connection_status.toLowerCase();
  }
  if (typeof executor_type === 'string') {
    execType = executor_type.toLowerCase();
  }

  if (status === 'connected') {
    return (
      <span>
        <ConnectedIcon className="pf-u-mr-xs" /> Connected
      </span>
    );
    //When execType === 'none' connection_status is no_rhc
  } else if (execType === 'none') {
    return (
      <Tooltip
        position="left"
        content={
          <Flex
            direction={{ default: 'column' }}
            spaceItems={{ default: 'spaceItemsNone' }}
          >
            There are no connections configured for this system.
          </Flex>
        }
      >
        <Flex spaceItems={{ default: 'spaceItemsXs' }}>
          <DisconnectedIcon className="pf-u-mr-xs" />
          <p style={{ maxWidth: 'fit-content' }}>Not configured</p>
        </Flex>
      </Tooltip>
    );
  } else if (status === 'disconnected') {
    if (execType === 'rhc') {
      return (
        <Tooltip
          position="left"
          content={
            'The Remote Host Configuration (RHC) client is not configured for one or more systems in this plan.'
          }
        >
          <Flex spaceItems={{ default: 'spaceItemsXs' }}>
            <DisconnectedIcon className="pf-u-mr-xs" />
            <p style={{ maxWidth: 'fit-content' }}>Disconnected</p>
          </Flex>
        </Tooltip>
      );
    } else if (execType === 'rhc-satellite') {
      return (
        <Tooltip
          position="left"
          content={
            'The Red Hat Satellite instance that this system is registered to is disconnected from Red Hat Insights.'
          }
        >
          <Flex spaceItems={{ default: 'spaceItemsXs' }}>
            <DisconnectedIcon className="pf-u-mr-xs" />
            <p style={{ maxWidth: 'fit-content' }}>Disconnected</p>
          </Flex>
        </Tooltip>
      );
    }
  } else {
    return (
      <Tooltip content={'Connection Status Unknown'}>
        <Flex spaceItems={{ default: 'spaceItemsXs' }}>
          <UnknownIcon className="pf-u-mr-xs" />
          <p style={{ maxWidth: 'fit-content' }}>Unknown</p>
        </Flex>
      </Tooltip>
    );
  }
};
ConnectionStatusColumn.propTypes = {
  connection_status: PropTypes.string,
  executor_type: PropTypes.string,
};

export default ConnectionStatusColumn;
