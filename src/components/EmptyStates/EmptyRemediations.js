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
import { appUrl } from '../../Utilities/urls';

import './EmptyRemediations.scss';

export const EmptyRemediations = ({ archivedCount, setShowArchived }) => {
  return (
    <Bullseye className="rem-c-no-remediations pf-u-pt-2xl">
      <EmptyState>
        <EmptyStateIcon icon={WrenchIcon} size="sm" />
        <Title size="lg" headingLevel="h5">
          No remediation playbooks
        </Title>
        <EmptyStateBody>
          Create an Ansible Playbook to remediate or mitigate vulnerabilities or
          configuration issues.
          <br />
          <br />
          To create a new remediation Playbook, select issues identified in
          <br />
          <a href={appUrl('advisor').toString()}>Recommendations</a>,&nbsp;
          <a href={appUrl('compliance').toString()}>Compliance</a> or&nbsp;
          <a href={appUrl('vulnerabilities').toString()}>Vulnerability</a>&nbsp;
          and select
          <br />
          <strong>Remediate with Ansible.</strong>
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
