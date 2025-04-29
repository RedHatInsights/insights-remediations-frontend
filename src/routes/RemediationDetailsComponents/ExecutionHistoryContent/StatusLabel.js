import React from 'react';
import PropTypes from 'prop-types';
import { Label } from '@patternfly/react-core';
import {
  CheckCircleIcon,
  InProgressIcon,
  ExclamationCircleIcon,
} from '@patternfly/react-icons';

const StatusLabel = ({ status }) => {
  const config = {
    success: {
      color: 'green',
      text: 'Succeeded',
      icon: <CheckCircleIcon />,
    },
    running: {
      color: 'gold',
      text: 'In progress',
      icon: <InProgressIcon />,
    },
    failure: {
      color: 'red',
      text: 'Failed',
      icon: <ExclamationCircleIcon />,
    },
  };

  const key = String(status || '').toLowerCase();
  const entry = config[key];

  if (!entry) return null;

  return (
    <Label color={entry.color} icon={entry.icon} isCompact>
      {entry.text}
    </Label>
  );
};

StatusLabel.propTypes = {
  status: PropTypes.string,
};

export default StatusLabel;
