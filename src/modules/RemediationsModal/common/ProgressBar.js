import React from 'react';
import propTypes from 'prop-types';
import {
  Progress,
  ProgressVariant,
} from '@patternfly/react-core/dist/js/components/Progress';

const ProgressBar = ({ percent, failed }) => {
  let variant;
  let title;

  if (percent === 100) {
    title = 'Completed';
    variant = 'success';
  } else if (failed) {
    title = 'Error';
    variant = 'danger';
  } else {
    title = 'In progress';
    variant = 'info';
  }

  return (
    <Progress
      id={'finished-create-remediation'}
      value={percent}
      title={title}
      variant={variant}
    />
  );
};

ProgressBar.propTypes = {
  percent: propTypes.number,
  failed: propTypes.bool,
};

export default ProgressBar;
