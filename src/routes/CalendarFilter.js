import React from 'react';
import { DatePicker } from '@patternfly/react-core';
export const CalanderFilter = () => (
  <DatePicker
    onBlur={(_event, str, date) => console.log('onBlur', str, date)}
    onChange={(_event, str, date) => console.log('onChange', str, date)}
  />
);
