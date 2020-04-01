/* eslint-disable camelcase */

import React, { useEffect, useContext } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import {
    Main,
    PageHeader, PageHeaderTitle, DateFormat
} from '@redhat-cloud-services/frontend-components';

import {
    Card, CardHeader, CardBody,
    Stack, StackItem,
    Breadcrumb, BreadcrumbItem,
    Split, SplitItem
} from '@patternfly/react-core';
import {
    Table,
    TableHeader,
    TableBody
} from '@patternfly/react-table';

import DescriptionList from './Layouts/DescriptionList';
import { getPlaybookRun, getPlaybookRunSystems, getPlaybookRuns, loadRemediation } from '../actions';
import './Status.scss';
import { StatusSummary, normalizeStatus } from './statusHelper';
import ActivityDetailsSkeleton from '../skeletons/ActivityDetailsSkeleton';
import { PermissionContext } from '../App';

import './ActivityDetails.scss';

const ActivityDetail = ({
    match: { params: { id, run_id }},
    remediation,
    playbookRun,
    playbookRunSystems,
    getPlaybookRun,
    getPlaybookRuns,
    getPlaybookRunSystems,
    loadRemediation
}) => {
    useEffect(() => {
        loadRemediation(id);
        getPlaybookRuns(id);
        getPlaybookRun(id, run_id);

    }, []);
    // const systemsStatus = playbookRunSystems.reduce((acc, { status }) => ({ ...acc, [normalizeStatus(status)]: acc[normalizeStatus(status)] + 1 })
    //     , {  running: 0, success: 0, failure: 0 });
    const systemsStatus = { running: 1, success: 2, failure: 1 };
    console.log('RENDER', remediation, playbookRun);
    const permission = useContext(PermissionContext);

    return remediation && playbookRun && playbookRun.data
        ? (
            <React.Fragment>
                <PageHeader>
                    <Breadcrumb>
                        <BreadcrumbItem>
                            <Link to={ `/${remediation.id}` }> { remediation.name } </Link>
                        </BreadcrumbItem>
                        <BreadcrumbItem isActive> <DateFormat type='exact' date={ playbookRun.data.created_at } /> </BreadcrumbItem>
                    </Breadcrumb>
                    <Stack gutter>
                        <StackItem>
                            <PageHeaderTitle title={ <DateFormat type='exact' date={ playbookRun.data.created_at } /> } />
                        </StackItem>
                        <StackItem>
                            <Split gutter>
                                <SplitItem>
                                    <DescriptionList className='ins-c-playbookSummary__settings' title='Run on'>
                                        <DateFormat type='exact' date={ playbookRun.data.created_at } />
                                    </DescriptionList>
                                </SplitItem>
                                <SplitItem>
                                    <DescriptionList className='ins-c-playbookSummary__settings' title='Run by'>
                                        { `${playbookRun.data.created_by.first_name} ${playbookRun.data.created_by.last_name}` }
                                    </DescriptionList>
                                </SplitItem>
                                <SplitItem>
                                    <DescriptionList className='ins-c-playbookSummary__settings' title='Run status'>
                                        <StatusSummary
                                            executorStatus={playbookRun.status}
                                            systemsStatus={systemsStatus}
                                            permission={permission}/>
                                    </DescriptionList>
                                </SplitItem>
                            </Split>
                        </StackItem>
                    </Stack>
                </PageHeader>
                <Main>
                    <Stack gutter="md">
                        <Card>
                            <CardHeader className='ins-m-card__header-bold'>Results by connection</CardHeader>
                            <CardBody>
                                <Table
                                    aria-label="Collapsible table"
                                    rows={ playbookRun.data.executors.map(e =>({
                                        cells: [
                                            { title: <Link to={ `/${remediation.id}/${playbookRun.data.id}/${e.executor_id}` }> { e.executor_name } </Link> },
                                            e.system_count,
                                            { title: <StatusSummary
                                                executorStatus={(normalizeStatus(e.status))}
                                                systemsStatus={systemsStatus}
                                                permission={permission}/>
                                            }
                                        ]
                                    })) }
                                    cells={ [{ title: 'Connection' }, { title: 'Systems' }, { title: 'Playbook run status' }] }>
                                    <TableHeader />
                                    <TableBody />
                                </Table>

                            </CardBody>
                        </Card>
                    </Stack>
                </Main>
            </React.Fragment>)
        : <ActivityDetailsSkeleton />;
};

ActivityDetail.propTypes = {
    remediation: PropTypes.object,
    issue: PropTypes.object,
    playbookRun: PropTypes.object,
    getPlaybookRun: PropTypes.func,
    getPlaybookRunSystems: PropTypes.func,
    match: PropTypes.object
};

ActivityDetail.defaultProps = {
};

const connected = connect(
    ({ playbookRun, playbookRunSystems, selectedRemediation }) => ({
        playbookRun,
        playbookRunSystems: playbookRunSystems.data,
        remediation: selectedRemediation.remediation
    }),
    (dispatch) => ({
        getPlaybookRun: (id, runId) => dispatch(getPlaybookRun(id, runId)),
        getPlaybookRunSystems: (remediationId, runId, executorId) => dispatch(getPlaybookRunSystems(remediationId, runId, executorId)),
        getPlaybookRuns: (remediationId) => dispatch(getPlaybookRuns(remediationId)),
        loadRemediation: id => dispatch(loadRemediation(id))
    })
)(ActivityDetail);
export default connected;

// export default ActivityDetail;
