import React from 'react';
import PropTypes from 'prop-types';

const ErrorList = ({ errors }) => {
  if (!errors || errors.length === 0) return null;
  return (
    <ul className="pf-v6-u-mt-sm pf-v6-u-mb-sm">
      {errors.map((errorTitle, index) => (
        <li key={index}>{errorTitle}</li>
      ))}
    </ul>
  );
};

ErrorList.propTypes = {
  errors: PropTypes.arrayOf(PropTypes.string),
};

export default ErrorList;
