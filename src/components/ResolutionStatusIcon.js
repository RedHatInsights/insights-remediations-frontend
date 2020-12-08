import React from 'react';
import PropTypes from 'prop-types';

import './ResolutionStatusIcon.scss';

import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  QuestionCircleIcon,
} from '@patternfly/react-icons';

export default function ResolutionStatusIcon({ status }) {
  switch (status) {
    case true:
      return (
        <CheckCircleIcon
          className="ins-c-resolution-status-icon--resolved"
          title="Resolved"
        />
      );
    case false:
      return (
        <ExclamationCircleIcon
          className="ins-c-resolution-status-icon--unresolved"
          title="Unresolved"
        />
      );
    default:
      return (
        <QuestionCircleIcon
          className="ins-c-resolution-status-icon--unknown"
          title="Unknown"
        />
      );
  }
}

ResolutionStatusIcon.propTypes = {
  status: PropTypes.bool,
};
