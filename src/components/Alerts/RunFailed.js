import React from 'react';
import PropTypes from 'prop-types';

import {
  Button,
  EmptyState,
  EmptyStateBody,
  EmptyStateIcon,
  Bullseye, EmptyStateHeader, EmptyStateFooter,
} from '@patternfly/react-core';
import { ExclamationCircleIcon } from '@patternfly/react-icons';
import '../Status.scss';

const RunFailed = ({ name }) => (
  <Bullseye>
    <EmptyState>
      <EmptyStateHeader titleText="Run failed" icon={<EmptyStateIcon className="rem-c-failure" icon={ExclamationCircleIcon} />} headingLevel="h5" />
      <EmptyStateBody>
        Playbook failed to run on {name}. Connection was lost. Try executing the
        remediation again, and if the problem persist, constact your system
        administrator(s).
      </EmptyStateBody><EmptyStateFooter>
      <Button variant="link">Learn more</Button>
    </EmptyStateFooter></EmptyState>
  </Bullseye>
);

RunFailed.propTypes = {
  name: PropTypes.string,
};

export default RunFailed;
