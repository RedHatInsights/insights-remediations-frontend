import React from 'react';
import PropTypes from 'prop-types';
import { Fragment } from 'react';

const RebootColumn = ({ rebootRequired }) => {
  return (
    <Fragment>
      <span>{rebootRequired ? 'Yes' : 'No'}</span>
    </Fragment>
  );
};

RebootColumn.propTypes = {
  rebootRequired: PropTypes.bool,
};

export default RebootColumn;
