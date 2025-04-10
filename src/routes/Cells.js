import React from 'react';
import {
  Flex,
  Icon,
  Label,
  TextContent,
  Tooltip,
} from '@patternfly/react-core';
import PropTypes from 'prop-types';
import InsightsLink from '@redhat-cloud-services/frontend-components/InsightsLink';
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  InProgressIcon,
} from '@patternfly/react-icons';

const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return date.toLocaleDateString('en-US', options);
};
export const Name = ({ name, id, archived }) => (
  <InsightsLink to={id}>
    {name}
    {archived && (
      <Label color={'grey'} isCompact className="pf-v5-u-ml-md">
        Archived
      </Label>
    )}
  </InsightsLink>
);

export const LastExecutedCell = ({ playbook_runs }) => (
  <TextContent>
    {playbook_runs.length > 0
      ? formatDate(playbook_runs[0]?.created_at)
      : 'Never'}{' '}
  </TextContent>
);

export const ExecutionStatusCell = ({ playbook_runs }) => {
  if (!playbook_runs?.length) {
    return <TextContent>N/A</TextContent>;
  }
  const status = playbook_runs[0].status;
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
      <TextContent>{displayValue}</TextContent>
    </Flex>
  );
};

export const ActionsCell = ({ issue_count }) => (
  <TextContent style={{ justifySelf: 'center' }}>{issue_count} </TextContent>
);

export const SystemsCell = ({ system_count }) => (
  <TextContent style={{ justifySelf: 'center' }}>{system_count} </TextContent>
);

export const CreatedCell = ({ created_at }) => (
  <TextContent>{formatDate(created_at)} </TextContent>
);

const getTimeAgo = (date) => {
  const now = new Date();
  const diffMs = now - date;
  const diffMinutes = Math.floor(diffMs / 60000);

  if (diffMinutes < 1) {
    return 'Just now';
  } else if (diffMinutes < 60) {
    return `${diffMinutes} minute${diffMinutes === 1 ? '' : 's'} ago`;
  }
  //If less than 30 days, report days, if less than 12 months report months, then years
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
  }

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 30) {
    return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
  }
  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths < 12) {
    return `${diffMonths} month${diffMonths === 1 ? '' : 's'} ago`;
  }
  const diffYears = Math.floor(diffDays / 365);
  return `${diffYears} year${diffYears === 1 ? '' : 's'} ago`;
};

export const LastModifiedCell = ({ updated_at }) => {
  if (!updated_at) {
    return <TextContent>0</TextContent>;
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

  // Combine them with "at" and "UTC"
  const tooltipText = `${datePart} at ${timePart} UTC`;

  return (
    <Tooltip content={tooltipText}>
      <TextContent>{timeAgo}</TextContent>
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
