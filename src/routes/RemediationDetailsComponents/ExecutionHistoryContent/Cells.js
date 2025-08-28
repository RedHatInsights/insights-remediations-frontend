import React from 'react';
import PropTypes from 'prop-types';
import { Flex, Icon } from '@patternfly/react-core';
import InsightsLink from '@redhat-cloud-services/frontend-components/InsightsLink';
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  InProgressIcon,
} from '@patternfly/react-icons';

export const SystemNameCell = ({ system_name, system_id }) => (
  <InsightsLink
    app="inventory"
    to={`/${system_id}`}
    data-testid="insights-link"
  >
    <p data-testid="text">{system_name}</p>
  </InsightsLink>
);

export const InsightsConnectCell = ({ executor_name }) => {
  return <p data-testid="text">{executor_name ?? ''}</p>;
};

export const RedHatLightSpeedCell = ({ executor_name }) => {
  return <p data-testid="text">{executor_name ?? ''}</p>;
};
export const ExecutionStatusCell = ({ status }) => {
  let icon;
  let displayValue;
  if (status === 'success') {
    ((icon = (
      <Icon status="success">
        <CheckCircleIcon />
      </Icon>
    )),
      (displayValue = 'Succeeded'));
  } else if (status === 'running') {
    ((icon = (
      <Icon>
        <InProgressIcon />
      </Icon>
    )),
      (displayValue = 'In progress'));
  } else if (status === 'failure') {
    ((icon = (
      <Icon status="danger">
        <ExclamationCircleIcon />
      </Icon>
    )),
      (displayValue = 'Failed'));
  }
  return (
    <Flex spaceItems={{ default: 'spaceItemsXs' }} data-testid="flex">
      {icon}
      <p data-testid="text">{displayValue || ''}</p>
    </Flex>
  );
};

SystemNameCell.propTypes = {
  system_id: PropTypes.string.isRequired,
  system_name: PropTypes.string.isRequired,
};
InsightsConnectCell.propTypes = {
  executor_name: PropTypes.string,
};
RedHatLightSpeedCell.propTypes = {
  executor_name: PropTypes.string,
};
ExecutionStatusCell.propTypes = {
  status: PropTypes.string,
};
