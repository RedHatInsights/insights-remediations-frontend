import React from 'react';
import PropTypes from 'prop-types';
import { Flex, Icon, Text } from '@patternfly/react-core';
import InsightsLink from '@redhat-cloud-services/frontend-components/InsightsLink';
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  InProgressIcon,
} from '@patternfly/react-icons';

export const SystemNameCell = ({ system_name, system_id }) => (
  <InsightsLink app="inventory" to={`/${system_id}`}>
    <Text>{system_name}</Text>
  </InsightsLink>
);

export const InsightsConnectCell = ({ executor_name }) => {
  return <Text>{executor_name ?? ''}</Text>;
};
export const ExecutionStatusCell = ({ status }) => {
  let icon;
  let displayValue;
  if (status === 'success') {
    (icon = (
      <Icon status="success">
        <CheckCircleIcon />
      </Icon>
    )),
      (displayValue = 'Succeeded');
  } else if (status === 'running') {
    (icon = (
      <Icon>
        <InProgressIcon color="var(--pf-v5-global--icon--Color--light--dark)" />
      </Icon>
    )),
      (displayValue = 'In progress');
  } else if (status === 'failure') {
    (icon = (
      <Icon status="danger">
        <ExclamationCircleIcon />
      </Icon>
    )),
      (displayValue = 'Failed');
  }
  return (
    <Flex spaceItems={{ default: 'spaceItemsXs' }}>
      {icon}
      <Text>{displayValue}</Text>
    </Flex>
  );
};

SystemNameCell.propTypes = {
  system_id: PropTypes.string.isRequired,
  system_name: PropTypes.string.isRequired,
};
InsightsConnectCell.propTypes = {
  executor_name: PropTypes.array.isRequired,
};
ExecutionStatusCell.propTypes = {
  status: PropTypes.string.isRequired,
};
