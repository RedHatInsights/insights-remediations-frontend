import React from 'react';
import PropTypes from 'prop-types';
import { Progress } from '@patternfly/react-core';

const ProgressBar = ({ value, variant, label }) => (
  <>
    {label && <p className="pf-v6-u-mb-sm">{label}</p>}
    <Progress
      value={value}
      variant={variant}
      aria-label={`Progress: ${value}%`}
      className="pf-v6-u-mb-lg"
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
