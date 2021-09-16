import React from 'react';

import {
  PageHeader,
  PageHeaderTitle,
} from '@redhat-cloud-services/frontend-components/PageHeader';
import { Main } from '@redhat-cloud-services/frontend-components/Main';
import { Spinner } from '@redhat-cloud-services/frontend-components/Spinner';

const GlobalSkeleton = () => (
  <React.Fragment>
    <PageHeader className="ins-remediations__skeleton">
      <PageHeaderTitle className="rem-s-page-header" title="Remediations" />
    </PageHeader>
    <Main>
      <Spinner centered />
    </Main>
  </React.Fragment>
);

export default GlobalSkeleton;
