import React from 'react';
import {
  Bullseye,
  Button,
  EmptyState,
  EmptyStateBody,
  EmptyStateIcon,
  EmptyStateHeader,
  EmptyStateFooter,
} from '@patternfly/react-core';
import PropTypes from 'prop-types';
import { WrenchIcon } from '@patternfly/react-icons';

import './EmptyRemediations.scss';

export const EmptyRemediations = ({ archivedCount, setShowArchived }) => {
  return (
    <Bullseye className="rem-c-no-remediations pf-u-pt-2xl">
      <EmptyState>
        <EmptyStateHeader
          titleText="No remediation playbooks yet"
          icon={<EmptyStateIcon icon={WrenchIcon} size="sm" />}
          headingLevel="h5"
        />
        <EmptyStateBody>
          Insights uses Ansible Playbooks to remediate or mitigate configuration
          problems on your systems, and apply patches.
          <br />
          <br />
          To create a remediation playbook, select issues identified in Insights
          applications, then select
          <strong> Remediate</strong>.
        </EmptyStateBody>
        <EmptyStateFooter>
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
        </EmptyStateFooter>
      </EmptyState>
    </Bullseye>
  );
};

EmptyRemediations.propTypes = {
  archivedCount: PropTypes.number.isRequired,
  setShowArchived: PropTypes.func.isRequired,
};
