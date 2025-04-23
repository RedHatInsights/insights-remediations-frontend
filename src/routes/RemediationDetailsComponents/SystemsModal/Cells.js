import React from 'react';
import { TextContent } from '@patternfly/react-core';
import PropTypes from 'prop-types';
import InsightsLink from '@redhat-cloud-services/frontend-components/InsightsLink';

export const SystemNameCell = ({ id, display_name }) => {
  return (
    <TextContent>
      <InsightsLink app={'inventory'} to={`/${id}`}>
        {display_name}
      </InsightsLink>
    </TextContent>
  );
};

SystemNameCell.propTypes = {
  display_name: PropTypes.string.isRequired,
  id: PropTypes.string.isRequired,
};
