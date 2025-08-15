import React from 'react';
import { Content } from '@patternfly/react-core';
import PropTypes from 'prop-types';
import InsightsLink from '@redhat-cloud-services/frontend-components/InsightsLink';

export const SystemNameCell = ({ id, display_name }) => {
  return (
    <Content component="p">
      <InsightsLink app={'inventory'} to={`/${id}`}>
        {display_name}
      </InsightsLink>
    </Content>
  );
};

SystemNameCell.propTypes = {
  display_name: PropTypes.string.isRequired,
  id: PropTypes.string.isRequired,
};
