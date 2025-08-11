import { EmptyState, EmptyStateBody } from '@patternfly/react-core';
import { SearchIcon } from '@patternfly/react-icons';
import React from 'react';

const TableEmptyState = () => {
  return (
    <EmptyState
      headingLevel="h4"
      icon={SearchIcon}
      titleText="No results found"
    >
      <EmptyStateBody>Adjust your filters and try again</EmptyStateBody>
    </EmptyState>
  );
};

export default TableEmptyState;
