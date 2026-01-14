import React from 'react';
import PropTypes from 'prop-types';
import { Progress } from '@patternfly/react-core';

// Reusable Progress bar component
const ProgressBar = ({ value, variant, label }) => (
  <>
    {label && <p className="pf-v6-u-mb-sm">{label}</p>}
    <Progress
      value={value}
      variant={variant}
      aria-label={`Progress: ${value}%`}
      className="pf-v6-u-mb-sm"
    />
  </>
);

ProgressBar.propTypes = {
  value: PropTypes.number.isRequired,
  variant: PropTypes.string,
  label: PropTypes.string,
  percentage: PropTypes.number,
};

export default ProgressBar;
