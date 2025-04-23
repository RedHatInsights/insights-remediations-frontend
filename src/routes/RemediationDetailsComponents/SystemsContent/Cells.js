import React from 'react';
import { TextContent } from '@patternfly/react-core';
import PropTypes from 'prop-types';

export const NameCell = ({ hostname }) => {
  return <TextContent>{hostname}</TextContent>;
};
export const TagsCell = ({ tags }) => {
  return <TextContent>{tags?.count ?? '0'}</TextContent>;
};
export const OSCell = ({ system_profile }) => {
  return <TextContent>RHEL {system_profile?.os_release ?? 'N/A'}</TextContent>;
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
export const ConnectionStatusCell = ({ connection_status }) => (
  <TextContent>{connection_status}</TextContent>
);

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
};
