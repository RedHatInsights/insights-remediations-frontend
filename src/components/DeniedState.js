import React from 'react';

import {
  Button,
  EmptyState,
  EmptyStateVariant,
  EmptyStateIcon,
  EmptyStateBody, EmptyStateHeader, EmptyStateFooter,
} from '@patternfly/react-core';

import { LockIcon } from '@patternfly/react-icons';
import {
  PageHeader,
  PageHeaderTitle,
} from '@redhat-cloud-services/frontend-components/PageHeader';
import { Main } from '@redhat-cloud-services/frontend-components/Main';

const DeniedState = () => {
  return (
    <React.Fragment>
      <PageHeader>
        <PageHeaderTitle title="Remediations" />
      </PageHeader>
      <Main>
        <EmptyState
          variant={EmptyStateVariant.full}
          className="rem-c-denied-state"
        >
          <EmptyStateHeader titleText="You do not have access to Remediations" icon={<EmptyStateIcon icon={LockIcon} />} headingLevel="h5" />
          <EmptyStateBody>
            Contact your organization administrator(s) for more information.
          </EmptyStateBody><EmptyStateFooter>
          {document.referrer ? (
            <Button variant="primary" onClick={() => history.back()}>
              Return to previous page
            </Button>
          ) : (
            <Button variant="primary" component="a" href=".">
              Go to landing page
            </Button>
          )}
        </EmptyStateFooter></EmptyState>
      </Main>
    </React.Fragment>
  );
};

export default DeniedState;
