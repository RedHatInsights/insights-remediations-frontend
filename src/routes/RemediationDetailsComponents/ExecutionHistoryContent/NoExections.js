import React from 'react';
import { EmptyState, EmptyStateBody, Title } from '@patternfly/react-core';
import { CubesIcon } from '@patternfly/react-icons';

const NoExecutions = () => {
  return (
    <EmptyState
      headingLevel="h4"
      icon={CubesIcon}
      titleText={<Title headingLevel="h4">No execution history</Title>}
      variant="lg"
    >
      <EmptyStateBody>
        This remediation plan has not yet been executed.
      </EmptyStateBody>
    </EmptyState>
  );
};

export default NoExecutions;
