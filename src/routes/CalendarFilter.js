import React from 'react';
import PropTypes from 'prop-types';
import { DatePicker } from '@patternfly/react-core';

export const CalendarFilter = ({ value, onChange }) => {
  const onChangeHandler = (_e, value) => {
    return onChange(value);
  };
  return <DatePicker value={value?.[0]} onChange={onChangeHandler} />;
};

CalendarFilter.propTypes = {
  value: PropTypes.array,
  onChange: PropTypes.func.isRequired,
};

export default CalendarFilter;
