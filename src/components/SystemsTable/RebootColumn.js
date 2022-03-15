import React from 'react';
import PropTypes from 'prop-types';
import { Fragment } from 'react';

const RebootColumn = ({ rebootRequired }) => {
  return (
    <Fragment>
      <span>{rebootRequired ? 'Required' : 'Not required'}</span>
    </Fragment>
  );
};

RebootColumn.propTypes = {
  rebootRequired: PropTypes.bool,
};

export default RebootColumn;
