import React from 'react';
import { Flex, TextContent, Tooltip } from '@patternfly/react-core';
import PropTypes from 'prop-types';
import {
  ConnectedIcon,
  DisconnectedIcon,
  UnknownIcon,
} from '@patternfly/react-icons';

export const NameCell = ({ hostname }) => {
  return <TextContent>{hostname}</TextContent>;
};
export const TagsCell = ({ tags }) => {
  return <TextContent>{tags?.count ?? '0'}</TextContent>;
};
export const OSCell = ({ system_profile }) => {
  return (
    <TextContent>
      {`${
        system_profile?.os_release
          ? `REHL ${system_profile?.os_release}`
          : 'N/A'
      }`}
    </TextContent>
  );
};

export const ActionsCell = ({ actionCount }) => {
  return (
    <TextContent>
      {actionCount} action{actionCount !== 1 ? 's' : ''}
    </TextContent>
  );
};
export const RebootRequiredCell = ({ resolution }) => (
  <TextContent>{resolution?.needs_reboot ? 'Yes' : 'No'}</TextContent>
);

export const SystemsCell = ({ systems }) => (
  <TextContent>{`${systems?.length} system${
    systems?.length > 1 ? 's' : ''
  }`}</TextContent>
);

export const ConnectionStatusCell = ({ connection_status, executor_type }) => {
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
            'Remote Host Configuration (RHC) client communication is disconnected.'
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
      <Tooltip content={'Connection Status Unkown'}>
        <Flex spaceItems={{ default: 'spaceItemsXs' }}>
          <UnknownIcon className="pf-u-mr-xs" />
          <p style={{ maxWidth: 'fit-content' }}>Unknown</p>
        </Flex>
      </Tooltip>
    );
  }
};

ConnectionStatusCell.propTypes = {
  connection_status: PropTypes.string,
  executor_type: PropTypes.string,
};

NameCell.propTypes = {
  hostname: PropTypes.string.isRequired,
};
TagsCell.propTypes = {
  tags: PropTypes.string.isRequired,
};
OSCell.propTypes = {
  system_profile: PropTypes.string.isRequired,
};

ActionsCell.propTypes = {
  actionCount: PropTypes.number,
};
RebootRequiredCell.propTypes = {
  resolution: PropTypes.shape({ needs_reboot: PropTypes.bool }),
};
SystemsCell.propTypes = {
  systems: PropTypes.arrayOf(PropTypes.object),
};

ConnectionStatusCell.propTypes = {
  connection_status: PropTypes.string,
  executor_type: PropTypes.string,
};
