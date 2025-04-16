import React from 'react';
import propTypes from 'prop-types';
import {
  EmptyState,
  EmptyStateBody,
  EmptyStateVariant,
  EmptyStateHeader,
  Button,
  EmptyStateIcon,
} from '@patternfly/react-core';
import { useNavigate } from 'react-router-dom';
import { CubesIcon, ExternalLinkAltIcon } from '@patternfly/react-icons';

export const NoResultsTable = () => {
  const navigate = useNavigate();
  return (
    <EmptyState variant={EmptyStateVariant.full}>
      <EmptyStateHeader
        titleText={<>No remediation plans</>}
        headingLevel="h5"
        icon={<EmptyStateIcon icon={CubesIcon} />}
      />
      <EmptyStateBody>
        Create remediation plans to address Advisor recommendations, Security
        CVEs, and
        <br />
        Content advisories on your Red Hat Enterprise Linux (RHEL)
        infrastructure.
      </EmptyStateBody>
      {/*TODO:  Need to link this somewhere */}
      <Button onClick={() => navigate('/')}>
        Learn More <ExternalLinkAltIcon />
      </Button>
    </EmptyState>
  );
};

NoResultsTable.propTypes = {
  kind: propTypes.string,
};

export default NoResultsTable;
