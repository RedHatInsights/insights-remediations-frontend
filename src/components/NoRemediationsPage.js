import React from 'react';
import propTypes from 'prop-types';
import {
  EmptyState,
  EmptyStateBody,
  EmptyStateVariant,
  Button,
  EmptyStateActions,
  EmptyStateFooter,
} from '@patternfly/react-core';
import { CubesIcon, OpenDrawerRightIcon } from '@patternfly/react-icons';
import useChrome from '@redhat-cloud-services/frontend-components/useChrome';

export const NoRemediationsPage = () => {
  const { quickStarts } = useChrome();

  return (
    <EmptyState
      headingLevel="h5"
      icon={CubesIcon}
      titleText={<>No remediation plans</>}
      variant={EmptyStateVariant.full}
    >
      <EmptyStateBody>
        Create remediation plans to address Advisor recommendations, Security
        CVEs, and
        <br />
        Content advisories on your Red Hat Enterprise Linux (RHEL)
        infrastructure.
      </EmptyStateBody>
      <EmptyStateFooter>
        <EmptyStateActions>
          <Button
            icon={<OpenDrawerRightIcon className="pf-v6-u-ml-sm" />}
            onClick={() =>
              quickStarts?.activateQuickstart('insights-remediate-plan-create')
            }
          >
            Launch Quick Start{' '}
          </Button>
        </EmptyStateActions>
      </EmptyStateFooter>
    </EmptyState>
  );
};

NoRemediationsPage.propTypes = {
  kind: propTypes.string,
};

export default NoRemediationsPage;
