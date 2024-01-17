import React from 'react';

import {
  Button,
  EmptyState,
  EmptyStateBody,
  EmptyStateIcon,
  Bullseye, EmptyStateHeader, EmptyStateFooter,
} from '@patternfly/react-core';
import { CloudIcon } from '@patternfly/react-icons';

// TODO: Fill Learn more link

const ActivityTabUpsell = () => (
  <Bullseye>
    <EmptyState>
      <EmptyStateHeader titleText="Get more with Find it Fix it capabilities" icon={<EmptyStateIcon icon={CloudIcon} />} headingLevel="h5" />
      <EmptyStateBody>
        Upgrade to Red Hat Satellite to remediate all your systems, across
        regions and geographies directly from Red Hat Insights.
      </EmptyStateBody><EmptyStateFooter>
      <Button
        variant="link"
        component="a"
        ouiaId="learn_more"
        href="https://www.redhat.com/en/technologies/management/satellite"
      >
        Learn more
      </Button>
    </EmptyStateFooter></EmptyState>
  </Bullseye>
);

export default ActivityTabUpsell;
