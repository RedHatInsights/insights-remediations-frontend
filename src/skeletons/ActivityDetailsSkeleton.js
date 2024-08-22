import React from 'react';
import PropTypes from 'prop-types';

import {
  PageHeader,
  PageHeaderTitle,
} from '@redhat-cloud-services/frontend-components/PageHeader';
import { Main } from '@redhat-cloud-services/frontend-components/Main';
import { Skeleton } from '@redhat-cloud-services/frontend-components/Skeleton';

import {
  Card,
  CardHeader,
  CardBody,
  Stack,
  StackItem,
  Breadcrumb,
  BreadcrumbItem,
  Split,
  SplitItem,
  Title,
} from '@patternfly/react-core';

import DescriptionList from '../components/Layouts/DescriptionList';

import './RemediationDetailsSkeleton.scss';
import { Th } from '@patternfly/react-table';
import { SkeletonTable } from '@patternfly/react-component-groups';

const ActivityDetailsSkeleton = ({ columns }) => {
  return (
    <React.Fragment>
      <PageHeader>
        <Breadcrumb>
          <BreadcrumbItem>
            <Skeleton size="lg" />
          </BreadcrumbItem>
          <BreadcrumbItem isActive>
            <Skeleton size="lg" />
          </BreadcrumbItem>
        </Breadcrumb>
        <Stack gutter>
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
                  title="Run status"
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
            <CardHeader className="rem-m-card__header-bold">
              <Title headingLevel="h4" size="xl">
                Results by connection
              </Title>
            </CardHeader>
            <CardBody>
              <SkeletonTable
                columns={columns.map((column) => (
                  <Th key={column.title}>{column.title}</Th>
                ))}
                rows={10}
              />
            </CardBody>
          </Card>
        </Stack>
      </Main>
    </React.Fragment>
  );
};

ActivityDetailsSkeleton.propTypes = {
  columns: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default ActivityDetailsSkeleton;
