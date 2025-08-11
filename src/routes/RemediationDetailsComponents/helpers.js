import { Flex, Icon } from '@patternfly/react-core';
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  InProgressIcon,
} from '@patternfly/react-icons';
import React from 'react';

export const execStatus = (status, date) => {
  let icon;
  let displayValue = 'N/A';

  if (!date || !status) {
    return (
      <Flex spaceItems={{ default: 'spaceItemsSm' }} data-testid="flex">
        <div data-testid="text-content">{displayValue}</div>
      </Flex>
    );
  }

  if (status === 'success') {
    ((icon = (
      <Icon status="success" data-testid="icon">
        <CheckCircleIcon />
      </Icon>
    )),
      (displayValue = 'Succeeded'));
  } else if (status === 'running') {
    ((icon = (
      <Icon data-testid="icon">
        <InProgressIcon
          color="var(--pf-v6-global--icon--Color--light--dark)"
          data-testid="in-progress-icon"
        />
      </Icon>
    )),
      (displayValue = 'In progress'));
  } else if (status === 'failure') {
    ((icon = (
      <Icon status="danger" data-testid="icon">
        <ExclamationCircleIcon />
      </Icon>
    )),
      (displayValue = 'Failed'));
  }
  return (
    <Flex spaceItems={{ default: 'spaceItemsSm' }} data-testid="flex">
      {icon}
      <span data-testid="text-content">{`${displayValue} ${getTimeAgo(date)}`}</span>
    </Flex>
  );
};

export const getTimeAgo = (date) => {
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

// eslint-disable-next-line react/display-name
export const renderComponent = (Component, props) => (_data, _id, entity) => (
  <Component {...entity} {...props} />
);
