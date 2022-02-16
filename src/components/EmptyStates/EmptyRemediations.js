import React from 'react';
import {
  Bullseye,
  Button,
  EmptyState,
  EmptyStateBody,
  EmptyStateIcon,
  Title,
} from '@patternfly/react-core';
import PropTypes from 'prop-types';
import { WrenchIcon } from '@patternfly/react-icons';

import './EmptyRemediations.scss';

export const EmptyRemediations = ({ archivedCount, setShowArchived }) => {
  return (
    <Bullseye className="rem-c-no-remediations pf-u-pt-2xl">
      <EmptyState>
        <EmptyStateIcon icon={WrenchIcon} size="sm" />
        <Title size="lg" headingLevel="h5">
          No remediation playbooks yet
        </Title>
        <EmptyStateBody>
          Insights uses Ansible Playbooks to remediate or mitigate configuration
          problems on your systems, and apply patches.
          <br />
          <br />
          To create a remediation playbook, select issues identified in Insights
          applications, then select
          <strong> Remediate</strong>.
        </EmptyStateBody>
        <br />
        {archivedCount > 0 && (
          <Button
            variant="link"
            onClick={() => setShowArchived(true)}
            ouiaId="show-archived-playbooks"
          >
            Show {archivedCount} archived playbooks
          </Button>
        )}
      </EmptyState>
    </Bullseye>
  );
};

EmptyRemediations.propTypes = {
  archivedCount: PropTypes.number.isRequired,
  setShowArchived: PropTypes.func.isRequired,
};
