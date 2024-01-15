import React from 'react';

import {
  Button,
  EmptyState,
  EmptyStateBody,
  EmptyStateIcon,
  Bullseye, EmptyStateHeader, EmptyStateFooter,
} from '@patternfly/react-core';
import { WrenchIcon } from '@patternfly/react-icons';

// TODO: Fill Learn how to configure link

const NotConfigured = () => (
  <Bullseye>
    <EmptyState>
      <EmptyStateHeader titleText="Do more with Find it Fix it." icon={<EmptyStateIcon icon={WrenchIcon} />} headingLevel="h5" />
      <EmptyStateBody>
        Configure Cloud Connector to connect cloud.redhat.com with your
        Satellite instances and execute remediation across all regions,
        geographies, and Satellites in one place.
      </EmptyStateBody><EmptyStateFooter>
      <Button
        variant="link"
        component="a"
        ouiaId="learn-configure"
        // eslint-disable-next-line max-len
        href="https://access.redhat.com/documentation/en-us/red_hat_insights/2023/html-single/using_cloud_connector_to_remediate_issues_across_your_red_hat_satellite_infrastructure/index"
      >
        Learn how to configure
      </Button>
    </EmptyStateFooter></EmptyState>
  </Bullseye>
);

export default NotConfigured;
