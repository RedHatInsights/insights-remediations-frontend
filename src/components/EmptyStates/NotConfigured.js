import React from 'react';

import {
  Button,
  EmptyState,
  EmptyStateBody,
  EmptyStateIcon,
  Title,
  Bullseye,
} from '@patternfly/react-core';
import { WrenchIcon } from '@patternfly/react-icons';

// TODO: Fill Learn how to configure link

const NotConfigured = () => (
  <Bullseye>
    <EmptyState>
      <EmptyStateIcon icon={WrenchIcon} />
      <Title headingLevel="h5" size="lg">
        Do more with Find it Fix it.
      </Title>
      <EmptyStateBody>
        Configure Cloud Connector to connect cloud.redhat.com with your
        Satellite instances and execute remediation across all regions,
        geographies, and Satellites in one place.
      </EmptyStateBody>
      <Button
        variant="link"
        component="a"
        ouiaId="learn-configure"
        // eslint-disable-next-line max-len
        href="https://access.redhat.com/documentation/en-us/red_hat_insights/2022/html-single/using_cloud_connector_to_remediate_issues_across_your_red_hat_satellite_infrastructure/index"
      >
        Learn how to configure
      </Button>
    </EmptyState>
  </Bullseye>
);

export default NotConfigured;
