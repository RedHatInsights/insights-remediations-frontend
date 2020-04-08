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
    Split, SplitItem, Button
} from '@patternfly/react-core';

import DescriptionList from '../components/Layouts/DescriptionList';

import './RemediationDetailsSkeleton.scss';

const ExecutorDetailsSkeleton = () => {

    return <React.Fragment>
        <PageHeader>
            <Breadcrumb>
                <BreadcrumbItem>
                    <Skeleton size='lg' />
                </BreadcrumbItem>
                <BreadcrumbItem>
                    <Skeleton size='lg' />
                </BreadcrumbItem>
                <BreadcrumbItem isActive> <Skeleton size='lg' /> </BreadcrumbItem>
            </Breadcrumb>
            <Stack gutter='md'>
                <StackItem>
                    <PageHeaderTitle title={ <Skeleton size='lg' /> } />
                </StackItem>
                <StackItem>
                    <Split gutter='md'>
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
                            <DescriptionList className='ins-c-playbookSummary__settings' title='Run by'>
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
                        <Button>
                        Download Playbook
                        </Button>
                    </CardHeader>

                    <CardBody>
                        <SkeletonTable />
                    </CardBody>
                </Card>
            </Stack>
        </Main>
    </React.Fragment>;
};

export default ExecutorDetailsSkeleton;
