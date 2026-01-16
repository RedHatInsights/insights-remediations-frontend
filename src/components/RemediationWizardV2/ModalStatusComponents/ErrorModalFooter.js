import React from 'react';
import PropTypes from 'prop-types';
import { ModalFooter, Button, Flex } from '@patternfly/react-core';

// Reusable ModalFooter with View plan button
const ErrorModalFooter = ({ remediationId, onViewPlan, onClose }) => (
  <ModalFooter>
    <Flex gap={{ default: 'gapMd' }}>
      {remediationId && (
        <Button variant="primary" onClick={onViewPlan}>
          View plan
        </Button>
      )}
      <Button variant="link" onClick={onClose}>
        Close
      </Button>
    </Flex>
  </ModalFooter>
);

ErrorModalFooter.propTypes = {
  remediationId: PropTypes.string,
  onViewPlan: PropTypes.func,
  onClose: PropTypes.func.isRequired,
};

export default ErrorModalFooter;
