import { Flex, Icon, TextContent } from '@patternfly/react-core';
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  InProgressIcon,
} from '@patternfly/react-icons';
import React from 'react';
import { formatDate } from '../Cells';

export const execStatus = (status, date) => {
  let icon;
  let displayValue = 'N/A';
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
      <TextContent>{`${displayValue} ${formatDate(date)}`}</TextContent>
    </Flex>
  );
};
