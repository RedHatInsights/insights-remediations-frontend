import React from 'react';

import {
  PageHeader,
  PageHeaderTitle,
} from '@redhat-cloud-services/frontend-components/PageHeader';
import { Main } from '@redhat-cloud-services/frontend-components/Main';
import { Skeleton } from '@redhat-cloud-services/frontend-components/Skeleton';

import {
  Card,
  CardBody,
  Stack,
  StackItem,
  Breadcrumb,
  BreadcrumbItem,
  Split,
  SplitItem,
  Spinner,
  Bullseye,
} from '@patternfly/react-core';

import DescriptionList from '../components/Layouts/DescriptionList';

import './RemediationDetailsSkeleton.scss';

const ExecutorDetailsSkeleton = () => {
  return (
    <React.Fragment>
      <PageHeader>
        <Breadcrumb>
          <BreadcrumbItem>
            <Skeleton size="lg" />
          </BreadcrumbItem>
          <BreadcrumbItem>
            <Skeleton size="lg" />
          </BreadcrumbItem>
          <BreadcrumbItem isActive>
            <Skeleton size="lg" />
          </BreadcrumbItem>
        </Breadcrumb>
        <Stack hasGutter>
          <StackItem>
            <PageHeaderTitle title={<Skeleton size="lg" />} />
          </StackItem>
          <StackItem>
            <Split hasGutter>
              <SplitItem>
                <DescriptionList
                  className="rem-c-playbookSummary__settings"
                  title="Run on"
                >
                  <Skeleton size="lg" />
                </DescriptionList>
              </SplitItem>
              <SplitItem>
                <DescriptionList
                  className="rem-c-playbookSummary__settings"
                  title="Run by"
                >
                  <Skeleton size="lg" />
                </DescriptionList>
              </SplitItem>
              <SplitItem>
                <DescriptionList
                  className="rem-c-playbookSummary__settings"
                  title="Run by"
                >
                  <Skeleton size="lg" />
                </DescriptionList>
              </SplitItem>
            </Split>
          </StackItem>
        </Stack>
      </PageHeader>
      <Main>
        <Stack hasGutter>
          <Card>
            <CardBody>
              <Bullseye>
                <Spinner />
              </Bullseye>
            </CardBody>
          </Card>
        </Stack>
      </Main>
    </React.Fragment>
  );
};

export default ExecutorDetailsSkeleton;
