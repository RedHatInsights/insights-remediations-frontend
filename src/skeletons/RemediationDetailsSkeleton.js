import React from 'react';

import { Link } from 'react-router-dom';

import {
  PageHeader,
  PageHeaderTitle,
} from '@redhat-cloud-services/frontend-components/PageHeader';
import { Main } from '@redhat-cloud-services/frontend-components/Main';
import { Skeleton } from '@redhat-cloud-services/frontend-components/Skeleton';

import SkeletonTable from './SkeletonTable';
import SkeletonTableToolbar from './SkeletonTableToolbar';
import SkeletonTabs from './SkeletonTabs';

import {
  Dropdown,
  KebabToggle,
  Stack,
  StackItem,
  Level,
  LevelItem,
  Breadcrumb,
  BreadcrumbItem,
  Split,
  SplitItem,
  Button,
  Flex,
  FlexItem,
} from '@patternfly/react-core';
import { ChartDonutUtilization, ChartLabel } from '@patternfly/react-charts';

import DescriptionList from '../components/Layouts/DescriptionList';

import './RemediationDetailsSkeleton.scss';

const RemediationDetailsSkeleton = () => {
  return (
    <React.Fragment>
      <PageHeader className="ins-s-remediation-detail__header">
        <Breadcrumb>
          <BreadcrumbItem>
            <Link to="/"> Remediations </Link>
          </BreadcrumbItem>
          <BreadcrumbItem isActive>
            <Skeleton size="lg" />
          </BreadcrumbItem>
        </Breadcrumb>
        <Level className="ins-c-level">
          <LevelItem>
            <PageHeaderTitle
              className="rem-s-page-header"
              title={
                <React.Fragment>
                  <Skeleton size="md" />
                </React.Fragment>
              }
            />
          </LevelItem>
          <LevelItem>
            <Split hasGutter>
              <SplitItem>
                <Button isDisabled variant="link">
                  Download playbook
                </Button>
              </SplitItem>
              <SplitItem>
                <Dropdown
                  toggle={<KebabToggle isDisabled={true} />}
                  isOpen={false}
                  isPlain
                />
              </SplitItem>
            </Split>
          </LevelItem>
        </Level>
        <RemediationSummarySkeleton />
      </PageHeader>
      <Main>
        <Stack hasGutter>
          <StackItem className="ins-c-playbookSummary__tabs">
            <SkeletonTabs />
            <SkeletonTableToolbar />
            <SkeletonTable />
          </StackItem>
        </Stack>
      </Main>
    </React.Fragment>
  );
};

export default RemediationDetailsSkeleton;

const RemediationSummarySkeleton = () => {
  return (
    <Split>
      <SplitItem>
        <ChartDonutUtilization
          ariaDesc="Resolved issues count"
          ariaTitle="Resolved issues chart"
          constrainToVisibleArea={true}
          data={{ x: 'Resolved', y: 1 }}
          labels={({ datum }) => (datum.x ? `${datum.x}: ${datum.y}%` : null)}
          title={'Loading'}
          subTitle="Issues resolved"
          subTitleComponent={<ChartLabel y={102} />}
          thresholds={[{ value: 100, color: '#3E8635' }]}
          height={175}
          width={175}
          padding={{
            bottom: 20,
            left: 0,
            right: 20,
            top: 20,
          }}
        />
      </SplitItem>
      <SplitItem className="ins-c-remediation-summary__body">
        <Stack hasGutter>
          <StackItem>
            <Split>
              <SplitItem>
                <Flex>
                  <FlexItem spacer={{ default: 'spacer-lg' }}>
                    <DescriptionList title="Total systems">
                      <Skeleton size="md" />
                    </DescriptionList>
                  </FlexItem>
                </Flex>
              </SplitItem>
              <SplitItem>
                <Flex>
                  <FlexItem spacer={{ default: 'spacer-lg' }}>
                    <DescriptionList title="Latest activity">
                      <Skeleton size="md" />
                    </DescriptionList>
                  </FlexItem>
                </Flex>
              </SplitItem>
            </Split>
          </StackItem>
          <StackItem>
            <Flex>
              <FlexItem spacer={{ default: 'spacer-lg' }}>
                <DescriptionList title="Autoreboot">
                  <Skeleton size="md" />
                </DescriptionList>
              </FlexItem>
            </Flex>
          </StackItem>
        </Stack>
      </SplitItem>
    </Split>
  );
};
