import React from 'react';
import { Text } from '@patternfly/react-core';
import PropTypes from 'prop-types';
import InsightsLink from '@redhat-cloud-services/frontend-components/InsightsLink';

export const SystemNameCell = ({ id, display_name }) => {
  return (
    <Text>
      <InsightsLink app={'inventory'} to={`/${id}`}>
        {display_name}
      </InsightsLink>
    </Text>
  );
};

SystemNameCell.propTypes = {
  display_name: PropTypes.string.isRequired,
  id: PropTypes.string.isRequired,
};
