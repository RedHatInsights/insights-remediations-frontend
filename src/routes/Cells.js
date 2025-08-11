import React from 'react';
import { Flex, Icon, Content, Tooltip } from '@patternfly/react-core';
import PropTypes from 'prop-types';
import InsightsLink from '@redhat-cloud-services/frontend-components/InsightsLink';
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  InProgressIcon,
} from '@patternfly/react-icons';
import { getTimeAgo } from './RemediationDetailsComponents/helpers';

export const formatDate = (dateStr) => {
  if (!dateStr) {
    return 'Invalid Date';
  }
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) {
    return 'Invalid Date';
  }
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return date.toLocaleDateString('en-US', options);
};
export const Name = ({ name, id }) => {
  return <InsightsLink to={id}>{name}</InsightsLink>;
};

export const LastExecutedCell = ({ playbook_runs }) => {
  return (
    <Content component="p">
      {playbook_runs && playbook_runs.length > 0
        ? formatDate(playbook_runs[0]?.created_at)
        : 'Never'}{' '}
    </Content>
  );
};

export const ExecutionStatusCell = ({ playbook_runs }) => {
  if (!playbook_runs?.length) {
    return <Content component="p">N/A</Content>;
  }
  const status = playbook_runs[0].status;
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
        <InProgressIcon color="var(--pf-v6-global--icon--Color--light--dark)" />
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
    <Flex spaceItems={{ default: 'spaceItemsXs' }}>
      {icon}
      <Content component="p">{displayValue}</Content>
    </Flex>
  );
};

export const ActionsCell = ({ issue_count }) => (
  <Content component="p" style={{ justifySelf: 'center' }}>
    {issue_count}{' '}
  </Content>
);

export const SystemsCell = ({ system_count }) => (
  <Content component="p" style={{ justifySelf: 'center' }}>
    {system_count}{' '}
  </Content>
);

export const CreatedCell = ({ created_at }) => (
  <Content component="p">{formatDate(created_at)} </Content>
);

export const LastModifiedCell = ({ updated_at }) => {
  if (!updated_at) {
    return <Content component="p">0</Content>;
  }

  const date = new Date(updated_at);
  const timeAgo = getTimeAgo(date);

  // Build the date part, e.g. "March 29, 2025"
  const datePart = date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });

  // Build the time part in 24-hour format, e.g. "10:28"
  const timePart = date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'UTC',
  });

  const tooltipText = `${datePart} at ${timePart} UTC`;

  return (
    <Tooltip content={tooltipText}>
      <Content component="p">{timeAgo}</Content>
    </Tooltip>
  );
};

Name.propTypes = {
  name: PropTypes.string,
  id: PropTypes.string,
  archived: PropTypes.string,
};
LastExecutedCell.propTypes = {
  playbook_runs: PropTypes.object,
};
ExecutionStatusCell.propTypes = {
  playbook_runs: PropTypes.string,
};
ActionsCell.propTypes = {
  issue_count: PropTypes.number,
};
SystemsCell.propTypes = {
  system_count: PropTypes.number,
};
CreatedCell.propTypes = {
  created_at: PropTypes.string,
};
LastModifiedCell.propTypes = {
  updated_at: PropTypes.string,
};
