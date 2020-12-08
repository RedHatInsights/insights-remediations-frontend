import React from 'react';

import {
  Main,
  PageHeader,
  PageHeaderTitle,
  Spinner,
} from '@redhat-cloud-services/frontend-components';

const GlobalSkeleton = () => (
  <React.Fragment>
    <PageHeader className="ins-remediations__skeleton">
      <PageHeaderTitle className="ins-s-page-header" title="Remediations" />
    </PageHeader>
    <Main>
      <Spinner centered />
    </Main>
  </React.Fragment>
);

export default GlobalSkeleton;
