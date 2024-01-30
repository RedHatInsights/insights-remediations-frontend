import React from 'react';
import {
  EmptyState,
  EmptyStateIcon,
  EmptyStateBody,
  EmptyStateHeader,
} from '@patternfly/react-core';
import DesktopIcon from '@patternfly/react-icons/dist/js/icons/desktop-icon';
import PropTypes from 'prop-types';

const EmptyExecutePlaybookState = () => {
  return (
    <EmptyState>
      <EmptyStateHeader
        titleText="This playbook has no systems associated with it."
        icon={<EmptyStateIcon icon={DesktopIcon} />}
        headingLevel="h4"
      />
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
