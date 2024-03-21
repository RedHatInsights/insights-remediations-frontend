import React from 'react';
import propTypes from 'prop-types';

import {
  Alert,
  AlertActionCloseButton,
  Stack,
  StackItem,
} from '@patternfly/react-core';

const NoReceptorBanner = ({ onClose, ...props }) => {
  return (
    <Alert
      variant="info"
      isInline
      title="Do more with your Find it Fix it capabilities"
      actionClose={<AlertActionCloseButton onClose={onClose} />}
      {...props}
    >
      <Stack hasGutter>
        <StackItem>
          Configure your systems with Cloud Connector to fix systems across all
          your Satellite instances.
        </StackItem>
        <StackItem>
          {/* eslint-disable-next-line max-len */}
          <a href="https://access.redhat.com/documentation/en-us/red_hat_insights/1-latest/html/red_hat_insights_remediations_guide/index">
            Learn how to configure
          </a>
        </StackItem>
      </Stack>
    </Alert>
  );
};

export default NoReceptorBanner;

NoReceptorBanner.propTypes = {
  onClose: propTypes.func,
};

/* eslint-disable no-console */
NoReceptorBanner.defaultProps = {
  onClose: () => undefined,
};
