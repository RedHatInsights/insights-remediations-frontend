import React from 'react';

import {
  Button,
  EmptyState,
  EmptyStateBody,
  EmptyStateIcon,
  Title,
  Bullseye,
} from '@patternfly/react-core';
import { CloudIcon } from '@patternfly/react-icons';

// TODO: Fill Learn more link

const ActivityTabUpsell = () => (
  <Bullseye>
    <EmptyState>
      <EmptyStateIcon icon={CloudIcon} />
      <Title headingLevel="h5" size="lg">
        Get more with Find it Fix it capabilities
      </Title>
      <EmptyStateBody>
        Upgrade to Red Hat Satellite to remediate all your systems, across
        regions and geographies directly from Red Hat Insights.
      </EmptyStateBody>
      <Button
        variant="link"
        component="a"
        ouiaId="learn_more"
        href="https://www.redhat.com/en/technologies/management/satellite"
      >
        Learn more
      </Button>
    </EmptyState>
  </Bullseye>
);

export default ActivityTabUpsell;
