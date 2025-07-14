import React from 'react';
import {
  EmptyState,
  EmptyStateBody,
  EmptyStateHeader,
  EmptyStateIcon,
  Title,
} from '@patternfly/react-core';
import { CubesIcon } from '@patternfly/react-icons';

const NoExecutions = () => {
  return (
    <EmptyState variant="lg">
      <EmptyStateHeader
        icon={<EmptyStateIcon icon={CubesIcon} />}
        titleText={<Title headingLevel="h4">No execution history</Title>}
        headingLevel="h4"
      />
      <EmptyStateBody>
        This remediation plan has not yet been executed.
      </EmptyStateBody>
    </EmptyState>
  );
};

export default NoExecutions;
