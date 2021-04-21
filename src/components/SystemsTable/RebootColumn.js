import React from 'react';
import PropTypes from 'prop-types';
import { RedoIcon, TimesIcon } from '@patternfly/react-icons';
import { Fragment } from 'react';

const RebootColumn = ({ rebootRequired }) => {
  const Icon = rebootRequired ? RedoIcon : TimesIcon;
  return (
    <Fragment>
      <Icon /> {rebootRequired ? 'Yes' : 'No'}
    </Fragment>
  );
};

RebootColumn.propTypes = {
  rebootRequired: PropTypes.bool,
};

export default RebootColumn;
