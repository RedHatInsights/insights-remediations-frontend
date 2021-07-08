import React from 'react';
import {
  Title,
  EmptyState,
  EmptyStateIcon,
  EmptyStateBody,
} from '@patternfly/react-core';
import DesktopIcon from '@patternfly/react-icons/dist/js/icons/desktop-icon';
import PropTypes from 'prop-types';

const EmptyExecutePlaybookState = () => {
  return (
    <EmptyState>
      <EmptyStateIcon icon={DesktopIcon} />
      <Title headingLevel="h4" size="lg">
        This playbook has no systems associated with it.
      </Title>
      <EmptyStateBody>
        Add at least one system and action to this playbook to use remote
        execution.
      </EmptyStateBody>
    </EmptyState>
  );
};

export default EmptyExecutePlaybookState;

EmptyExecutePlaybookState.propTypes = {
  onClose: PropTypes.func.isRequired,
};
