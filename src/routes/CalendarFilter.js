import React from 'react';
import PropTypes from 'prop-types';
import { DatePicker } from '@patternfly/react-core';

export const CalendarFilter = ({ value, onChange }) => {
  return <DatePicker value={value?.[0]} onChange={onChange} />;
};

CalendarFilter.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
};

export default CalendarFilter;
