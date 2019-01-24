import React from 'react';

import { Link } from 'react-router-dom';

import {
    Main,
    PageHeader, PageHeaderTitle,
    Skeleton
} from '@red-hat-insights/insights-frontend-components';

import {
    Grid, GridItem,
    Card, CardHeader, CardBody,
    // Progress, ProgressMeasureLocation,
    Stack, StackItem,
    Level, LevelItem,
    Breadcrumb, BreadcrumbItem,
    Split, SplitItem
} from '@patternfly/react-core';

import './RemediationDetailsSkeleton.scss';

const RemediationDetailsSkeleton = () => {
    return (
        <React.Fragment>
            <PageHeader className='ins-s-remediation-detail__header'>
                <Breadcrumb>
                    <BreadcrumbItem><Link to='/'> Home </Link></BreadcrumbItem>
                    <BreadcrumbItem isActive><Skeleton size='lg'/></BreadcrumbItem>
                </Breadcrumb>
                <PageHeaderTitle title={
                    <React.Fragment>
                        <span>Remediation: </span>
                        <Skeleton className='ins-s-inline' size='xs'/>
                    </React.Fragment>
                }/>
            </PageHeader>
            <Main>
                <Stack gutter="md">
                    <StackItem>
                        <Grid gutter="md" sm={ 12 } md={ 4 } className='ins-c-summary-cards'>
                            <GridItem>
                                <Card className='ins-c-card__actions-resolved'>
                                    <CardHeader>
                                        <Level>
                                            <LevelItem className='ins-m-card__header-bold'>
                                                Actions Resolved
                                            </LevelItem>
                                        </Level>
                                    </CardHeader>
                                    <CardBody>
                                        { /*
                                        <Progress
                                            value={ 19 }
                                            label='16 of 62'
                                            measureLocation={ ProgressMeasureLocation.outside } />
                                        */ }
                                        <Skeleton size='xs'/>
                                    </CardBody>
                                </Card>
                            </GridItem>
                            <GridItem>
                                <Card className='ins-c-card__system-reboot'>
                                    <CardHeader className='ins-m-card__header-bold'> Systems Reboot </CardHeader>
                                    <CardBody>
                                        <Grid gutter="md" md={ 4 } sm={ 4 }>
                                            <GridItem>
                                                <Stack>
                                                    <StackItem className='ins-m-text-emphesis'><Skeleton size='xs'/></StackItem>
                                                    <StackItem>No reboot</StackItem>
                                                </Stack>
                                            </GridItem>
                                            <GridItem>
                                                <Stack>
                                                    <StackItem className='ins-m-text-emphesis'><Skeleton size='xs'/></StackItem>
                                                    <StackItem>Reboot Required</StackItem>
                                                </Stack>
                                            </GridItem>
                                            <GridItem>
                                                <Stack>
                                                    <StackItem className='ins-c-reboot-switch'>
                                                        <Skeleton size='xs'/>
                                                    </StackItem>
                                                    <StackItem>Auto Reboot</StackItem>
                                                </Stack>
                                            </GridItem>
                                        </Grid>
                                    </CardBody>
                                </Card>
                            </GridItem>
                            <GridItem>
                                <Card className='ins-c-card__plan-details'>
                                    <CardHeader>
                                        <Level>
                                            <LevelItem className='ins-m-card__header-bold'>
                                                Remediation Details
                                            </LevelItem>
                                            <LevelItem className='ins-c-subheader-small'>
                                                <Skeleton size='xs'/>
                                            </LevelItem>
                                        </Level>
                                    </CardHeader>
                                    <CardBody>
                                        <Stack>
                                            <StackItem><Skeleton size='md'/></StackItem>
                                            <StackItem><Skeleton size='md'/></StackItem>
                                            <StackItem><Skeleton size='md'/></StackItem>
                                        </Stack>
                                    </CardBody>
                                </Card>
                            </GridItem>
                        </Grid>
                    </StackItem>
                    <StackItem>
                        <Skeleton size='md'/>
                    </StackItem>
                </Stack>
            </Main>
        </React.Fragment>
    );
};

export default RemediationDetailsSkeleton;
