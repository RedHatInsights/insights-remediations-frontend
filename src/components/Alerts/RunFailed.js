import React from 'react';
import PropTypes from 'prop-types';

import {
  Button,
  EmptyState,
  EmptyStateBody,
  EmptyStateIcon,
  Title,
  Bullseye,
} from '@patternfly/react-core';
import { ExclamationCircleIcon } from '@patternfly/react-icons';
import '../Status.scss';

const RunFailed = ({ name }) => (
  <Bullseye>
    <EmptyState>
      <EmptyStateIcon
        className="ins-c-remediations-failure"
        icon={ExclamationCircleIcon}
      />
      <Title headingLevel="h5" size="lg">
        Run failed
      </Title>
      <EmptyStateBody>
        Playbook failed to run on {name}. Connection was lost. Try executing the
        remediation again, and if the problem persist, constact your system
        administrator(s).
      </EmptyStateBody>
      <Button variant="link">Learn more</Button>
    </EmptyState>
  </Bullseye>
);

RunFailed.propTypes = {
  name: PropTypes.string,
};

export default RunFailed;
