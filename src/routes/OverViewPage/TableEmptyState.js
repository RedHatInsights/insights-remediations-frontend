import {
  EmptyState,
  EmptyStateBody,
  EmptyStateHeader,
  EmptyStateIcon,
} from '@patternfly/react-core';
import { SearchIcon } from '@patternfly/react-icons';
import React from 'react';

const TableEmptyState = () => {
  return (
    <EmptyState>
      <EmptyStateHeader
        titleText="No results found"
        headingLevel="h4"
        icon={<EmptyStateIcon icon={SearchIcon} />}
      />
      <EmptyStateBody>Adjust your filters and try again</EmptyStateBody>
    </EmptyState>
  );
};

export default TableEmptyState;
