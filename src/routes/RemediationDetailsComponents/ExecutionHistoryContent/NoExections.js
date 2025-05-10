import {
  EmptyState,
  EmptyStateBody,
  EmptyStateHeader,
  EmptyStateIcon,
  Title,
} from '@patternfly/react-core';
import { CubesIcon } from '@patternfly/react-icons';
import React from 'react';

const NoExecutions = () => {
  return (
    //There is currently no mock for emptyState. This will be replaced once UX has created one
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
