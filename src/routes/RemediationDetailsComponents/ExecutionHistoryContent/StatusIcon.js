import React from 'react';
import PropTypes from 'prop-types';
import {
  InProgressIcon,
  ExclamationCircleIcon,
  BanIcon,
  CheckIcon,
} from '@patternfly/react-icons';

const StatusIcon = ({ status, size = 'sm' }) => {
  const map = {
    success: {
      Icon: CheckIcon,
    },
    running: {
      Icon: InProgressIcon,
    },
    failure: {
      Icon: ExclamationCircleIcon,
    },
    canceled: {
      Icon: BanIcon,
    },
  };

  const entry = map[status];

  if (!entry) return null;

  const { Icon } = entry;
  return <Icon size={size} aria-label={status} />;
};

StatusIcon.propTypes = {
  status: PropTypes.string.isRequired,
  size: PropTypes.string,
};

export default StatusIcon;
