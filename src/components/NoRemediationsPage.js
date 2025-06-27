import React from 'react';
import propTypes from 'prop-types';
import {
  EmptyState,
  EmptyStateBody,
  EmptyStateVariant,
  EmptyStateHeader,
  Button,
  EmptyStateIcon,
  PageSection,
  Page,
  EmptyStateActions,
  EmptyStateFooter,
} from '@patternfly/react-core';
import { CubesIcon, OpenDrawerRightIcon } from '@patternfly/react-icons';
import useChrome from '@redhat-cloud-services/frontend-components/useChrome';

export const NoRemediationsPage = () => {
  const { quickStarts } = useChrome();

  return (
    <Page>
      <PageSection isFilled>
        <EmptyState variant={EmptyStateVariant.full}>
          <EmptyStateHeader
            titleText={<>No remediation plans</>}
            headingLevel="h5"
            icon={<EmptyStateIcon icon={CubesIcon} />}
          />
          <EmptyStateBody>
            Create remediation plans to address Advisor recommendations,
            Security CVEs, and
            <br />
            Content advisories on your Red Hat Enterprise Linux (RHEL)
            infrastructure.
          </EmptyStateBody>
          <EmptyStateFooter>
            <EmptyStateActions>
              <Button
                onClick={() =>
                  quickStarts?.activateQuickstart(
                    'insights-remediate-plan-create',
                  )
                }
              >
                Launch Quick Start{' '}
                <OpenDrawerRightIcon className="pf-v5-u-ml-sm" />
              </Button>
            </EmptyStateActions>
          </EmptyStateFooter>
        </EmptyState>
      </PageSection>
    </Page>
  );
};

NoRemediationsPage.propTypes = {
  kind: propTypes.string,
};

export default NoRemediationsPage;
