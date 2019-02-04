import React from 'react';

import { Link } from 'react-router-dom';

import {
    Main,
    PageHeader, PageHeaderTitle,
    Skeleton,
    TableToolbar
} from '@red-hat-insights/insights-frontend-components';

import SkeletonTable from '../components/SkeletonTable';

import {
    Grid, GridItem,
    Card, CardHeader, CardBody,
    // Progress, ProgressMeasureLocation,
    Stack, StackItem,
    Level, LevelItem,
    Breadcrumb, BreadcrumbItem,
    Split, SplitItem,
    Button, TextInput
} from '@patternfly/react-core';

import { isBeta } from '../config';

import './RemediationDetailsSkeleton.scss';

const RemediationDetailsSkeleton = () => {
    return (
        <React.Fragment>
            <PageHeader className='ins-s-remediation-detail__header'>
                <Breadcrumb>
                    <BreadcrumbItem><Link to='/'> Remediations </Link></BreadcrumbItem>
                    <BreadcrumbItem isActive><Skeleton size='lg'/></BreadcrumbItem>
                </Breadcrumb>
                <Level className="ins-c-level">
                    <LevelItem>
                        <PageHeaderTitle className='ins-s-page-header' title={
                            <React.Fragment>
                                <span>Playbook: </span>
                                <Skeleton size='md'/>
                            </React.Fragment>
                        }/>
                    </LevelItem>
                    <LevelItem>
                        <Split gutter="md">
                            <SplitItem><Button isDisabled> Download Playbook </Button></SplitItem>
                            <SplitItem><Button isDisabled> Delete </Button></SplitItem>
                        </Split>
                    </LevelItem>
                </Level>
            </PageHeader>
            <Main>
                <Stack gutter="md">
                    <StackItem>
                        <Grid gutter="md" sm={ 12 } md={ isBeta ? 4 : 6 } className='ins-c-summary-cards'>
                            {
                                isBeta &&
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
                            }
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
                                                Playbook Details
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
                                            {
                                                isBeta &&
                                                <StackItem className='ins-m-border-top'><Skeleton size='md'/></StackItem>
                                            }
                                        </Stack>
                                    </CardBody>
                                </Card>
                            </GridItem>
                        </Grid>
                    </StackItem>
                    <StackItem>
                        <TableToolbar className='ins-c-remediations-details-table__toolbar'>
                            <Level>
                                <LevelItem>
                                    <TextInput
                                        type="text"
                                        value='Search Actions'
                                        aria-label="disabled text input example"
                                        isDisabled
                                    />
                                </LevelItem>
                                <LevelItem>
                                    <Split gutter="md">
                                        <SplitItem><Button isDisabled> Remove Action </Button></SplitItem>
                                    </Split>
                                </LevelItem>
                            </Level>
                        </TableToolbar>
                        <SkeletonTable/>
                    </StackItem>
                </Stack>
            </Main>
        </React.Fragment>
    );
};

export default RemediationDetailsSkeleton;
