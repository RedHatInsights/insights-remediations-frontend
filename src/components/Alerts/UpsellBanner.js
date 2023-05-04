import React from 'react';
import propTypes from 'prop-types';

import {
  Alert,
  AlertActionCloseButton,
  Stack,
  StackItem,
} from '@patternfly/react-core';

const UpsellBanner = ({ onClose, ...props }) => {
  return (
    <Alert
      variant="info"
      isInline
      title="Put Insights into action"
      actionClose={<AlertActionCloseButton onClose={onClose} />}
      {...props}
    >
      <Stack hasGutter>
        <StackItem>
          Enable push-button remediation across your hybrid cloud environment
          with Red Hat Satellite.
        </StackItem>
        <StackItem>
          <a href="https://www.redhat.com/en/technologies/management/satellite">
            Learn more
          </a>
        </StackItem>
      </Stack>
    </Alert>
  );
};

export default UpsellBanner;

UpsellBanner.propTypes = {
  onClose: propTypes.func,
};

/* eslint-disable no-console */
UpsellBanner.defaultProps = {
  onClose: () => undefined,
};
