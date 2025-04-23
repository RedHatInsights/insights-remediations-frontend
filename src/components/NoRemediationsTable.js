import React from 'react';
import propTypes from 'prop-types';
import {
  EmptyState,
  EmptyStateBody,
  EmptyStateVariant,
  EmptyStateHeader,
  Button,
  EmptyStateIcon,
  Page,
} from '@patternfly/react-core';
import { Link } from 'react-router-dom';
import { CubesIcon, ExternalLinkAltIcon } from '@patternfly/react-icons';

export const NoRemediationsTable = () => {
  return (
    <Page>
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
        <Link
          to={
            'https://docs.redhat.com/en/documentation/red_hat_insights/1-latest/html/red_hat_insights_remediations_guide/creating-managing-playbooks_red-hat-insights-remediation-guide'
          }
        >
          <Button className="pf-v5-u-mt-lg">
            Learn More <ExternalLinkAltIcon className="pf-v5-u-ml-sm" />
          </Button>
        </Link>
      </EmptyState>
    </Page>
  );
};

NoRemediationsTable.propTypes = {
  kind: propTypes.string,
};

export default NoRemediationsTable;
