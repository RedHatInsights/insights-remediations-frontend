import React from 'react';

import {
    Main,
    PageHeader, PageHeaderTitle,
    Skeleton
} from '@redhat-cloud-services/frontend-components';

import SkeletonTable from './SkeletonTable';

import {
    Card, CardHeader, CardBody,
    Stack, StackItem,
    Breadcrumb, BreadcrumbItem,
    Split, SplitItem,
    Title
} from '@patternfly/react-core';

import DescriptionList from '../components/Layouts/DescriptionList';

import './RemediationDetailsSkeleton.scss';

const ActivityDetailsSkeleton = () => {

    return <React.Fragment>
        <PageHeader>
            <Breadcrumb>
                <BreadcrumbItem><Skeleton size='lg' /></BreadcrumbItem>
                <BreadcrumbItem isActive> <Skeleton size='lg' /> </BreadcrumbItem>
            </Breadcrumb>
            <Stack gutter>
                <StackItem>
                    <PageHeaderTitle title={ <Skeleton size='lg' /> } />
                </StackItem>
                <StackItem>
                    <Split gutter="md">
                        <SplitItem>
                            <DescriptionList className='ins-c-playbookSummary__settings' title='Run on'>
                                <Skeleton size='lg' />
                            </DescriptionList>
                        </SplitItem>
                        <SplitItem>
                            <DescriptionList className='ins-c-playbookSummary__settings' title='Run by'>
                                <Skeleton size='lg' />
                            </DescriptionList>
                        </SplitItem>
                        <SplitItem>
                            <DescriptionList className='ins-c-playbookSummary__settings' title='Run status'>
                                <Skeleton size='lg' />
                            </DescriptionList>
                        </SplitItem>
                    </Split>
                </StackItem>
            </Stack>
        </PageHeader>
        <Main>
            <Stack gutter="md">
                <Card>
                    <CardHeader className='ins-m-card__header-bold'>
                        <Title headingLevel="h4" size="xl">Results by connection</Title>
                    </CardHeader>
                    <CardBody>
                        <SkeletonTable />
                    </CardBody>
                </Card>
            </Stack>
        </Main>
    </React.Fragment>;
};

export default ActivityDetailsSkeleton;
