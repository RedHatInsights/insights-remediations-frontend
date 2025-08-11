import React from 'react';
import PropTypes from 'prop-types';
import { Content, Tooltip } from '@patternfly/react-core';
import { renderConnectionStatus } from '../../routes/helpers';

export const SystemsCell = ({ system_count }) => (
  <Content component="p">{system_count}</Content>
);
SystemsCell.propTypes = { system_count: PropTypes.number };

export const ConnectionTypeCell = ({
  connection_status,
  executor_name,
  executor_id,
}) => {
  if (connection_status !== 'connected') {
    return <Content component="p">Not available</Content>;
  }

  // Direct‑connected systems have no executor_id
  if (!executor_id) {
    return <Content component="p">Direct connection</Content>;
  }

  if (!executor_name) {
    return <Content component="p">—</Content>;
  }

  const truncated =
    executor_name.length > 25
      ? `${executor_name.slice(0, 22)}...`
      : executor_name;
  return (
    <Tooltip content={executor_name} position="top">
      <span>{truncated}</span>
    </Tooltip>
  );
};
ConnectionTypeCell.propTypes = {
  connection_status: PropTypes.string,
  executor_name: PropTypes.string,
  executor_id: PropTypes.string,
};

export const ConnectionStatusCell = ({ connection_status }) => (
  <>{renderConnectionStatus(connection_status)}</>
);
ConnectionStatusCell.propTypes = { connection_status: PropTypes.string };
