import React from 'react';

import { Link } from 'react-router-dom';

import {
    Main,
    PageHeader, PageHeaderTitle,
    Skeleton,
    TableToolbar,
    SimpleTableFilter
} from '@redhat-cloud-services/frontend-components';

import SkeletonTable from './SkeletonTable';

import {
    Flex, FlexItem,
    Card, CardHeader, CardBody,
    Dropdown, KebabToggle,
    // Progress, ProgressMeasureLocation,
    Stack, StackItem,
    Level, LevelItem,
    Breadcrumb, BreadcrumbItem,
    Split, SplitItem,
    Button,
    ToolbarItem, ToolbarGroup,
    Title
} from '@patternfly/react-core';

import { isBeta } from '../config';

import DescriptionList from '../components/Layouts/DescriptionList';

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
                                <Skeleton size='md'/>
                            </React.Fragment>
                        }/>
                    </LevelItem>
                    <LevelItem>
                        <Split gutter="md">
                            <SplitItem><Button isDisabled variant='link'> Download playbook </Button></SplitItem>
                            <SplitItem>
                                <Dropdown
                                    toggle={ <KebabToggle isDisabled={ true } /> }
                                    isOpen={ false }
                                    isPlain
                                />
                            </SplitItem>
                        </Split>
                    </LevelItem>
                </Level>
            </PageHeader>
            <Main>
                <Stack gutter="md">
                    <StackItem>
                        <Card>
                            <CardHeader className='ins-m-card__header-bold'>
                                <Title headingLevel="h4" size="xl">Playbook summary</Title>
                            </CardHeader>
                            <CardBody>
                                <Flex className='ins-c-playbookSummary' direction={ { default: 'column' } }>
                                    <Flex className='ins-c-playbookSummary__overview'>
                                        <FlexItem spacer={ { default: 'spacer-xl' } }>
                                            <DescriptionList
                                                isBold
                                                title='Total systems'
                                                className='ins-m-flex-children'>
                                                <Skeleton size='sm' className='ins-m-isInline-sm'/> systems
                                            </DescriptionList>
                                        </FlexItem>
                                    </Flex>
                                    <DescriptionList className='ins-c-playbookSummary__settings' title='Playbook settings'>
                                        <Flex>
                                            <FlexItem className='ins-m-inline-flex' spacer={ { default: 'spacer-xl' } }>
                                                Auto reboot: <Skeleton className='ins-m-isInline-md' size='md'/>
                                            </FlexItem>
                                            <FlexItem className='ins-m-inline-flex'>
                                                <Skeleton className='ins-m-isInline-sm' size='sm'/> systems require reboot
                                            </FlexItem>
                                        </Flex>
                                    </DescriptionList>
                                    <Button
                                        isDisabled
                                        variant='link'>
                                        Turn <Skeleton className='ins-m-isInline' size='sm'/> auto reboot
                                    </Button>
                                </Flex>
                            </CardBody>
                        </Card>
                    </StackItem>
                    <StackItem>
                        <TableToolbar className='ins-c-remediations-details-table__toolbar'>
                            <ToolbarGroup>
                                <ToolbarItem>
                                    <SimpleTableFilter
                                        buttonTitle=""
                                        placeholder="Search Actions"
                                        aria-label="Search Actions Loading"
                                    />
                                </ToolbarItem>
                            </ToolbarGroup>
                            {
                                isBeta &&
                                <ToolbarGroup>
                                    <ToolbarItem>
                                        <Button isDisabled={ true }> Add Action </Button>
                                    </ToolbarItem>
                                </ToolbarGroup>
                            }
                            <Skeleton size='sm' />
                        </TableToolbar>
                        <SkeletonTable/>
                    </StackItem>
                </Stack>
            </Main>
        </React.Fragment>
    );
};

export default RemediationDetailsSkeleton;
