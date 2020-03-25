import React, { useEffect } from 'react';
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
    Split, SplitItem,
    Text, TextVariants
} from '@patternfly/react-core';
import {
    Table,
    TableHeader,
    TableBody
} from '@patternfly/react-table';
import { CheckCircleIcon, TimesCircleIcon, InProgressIcon } from '@patternfly/react-icons';

import DescriptionList from './Layouts/DescriptionList';
import { getPlaybookRun, getPlaybookRunSystems } from '../actions';
import './Status.scss';

export const normalizeStatus = (status) => ({
    running: 'running',
    pending: 'running',
    failure: 'failure',
    canceled: 'failure',
    success: 'success',
    acked: 'success'
})[status];

export const renderStatus = (status, text) => ({
    running: <Text component={ TextVariants.p } >
        <InProgressIcon
            className="ins-c-remediations-running"
            aria-label="connection status" />
        { text || 'Running' }
    </Text >,
    success: <Text component={ TextVariants.p }>
        <CheckCircleIcon
            className="ins-c-remediations-success"
            aria-label="connection status" />
        { text || 'Success' }
    </Text>,
    failure: <Text component={ TextVariants.p }>
        <TimesCircleIcon
            className="ins-c-remediations-failure"
            aria-label="connection status" />
        { text || 'Failed' }
    </Text>
})[status];

const statusText = (executorStatus) => ({
    running: <Text component={ TextVariants.p } >
        Running
    </Text >,
    success: <Text className="ins-c-remediations-success" component={ TextVariants.p }>
        Suceeded
    </Text>,
    failure: <Text className="ins-c-remediations-failure" component={ TextVariants.p }>
        Failed
    </Text>
})[executorStatus];

const statusSummary = (executorStatus, systemsStatus) => {
    console.log(executorStatus, systemsStatus);
    return <Split style={ { display: 'flex' } } className="ins-c-remediations-status-bar">
        <SplitItem>
            { statusText('success') }
        </SplitItem>
        <SplitItem>
            { renderStatus('success', systemsStatus.success) }
        </SplitItem>
        <SplitItem>
            { renderStatus('failure', systemsStatus.failure) }
        </SplitItem>
        <SplitItem>
            { renderStatus('running', systemsStatus.running) }
        </SplitItem>
    </Split>;
};

const ActivityDetail = ({
    remediation,
    playbookRun,
    playbookRunSystems,
    getPlaybookRun,
    getPlaybookRunSystems
}) => {
    useEffect(() => {
        getPlaybookRun();
        getPlaybookRunSystems();

    }, []);

    // const systemsStatus = playbookRunSystems.reduce((acc, { status }) => ({ ...acc, [normalizeStatus(status)]: acc[normalizeStatus(status)] + 1 })
    //     , {  running: 0, success: 0, failure: 0 });
    const systemsStatus = { running: 1, success: 2, failure: 1 };

    return (
        <React.Fragment>
            <PageHeader>
                <Breadcrumb>
                    <BreadcrumbItem>
                        <Link to={`/${remediation.id}`}> {remediation.name } </Link>
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
                                    { statusSummary(playbookRun.status, systemsStatus) }
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
                                        { title: <Link to={`/${remediation.id}/${playbookRun.data.id}/${e.executor_id}` }> { e.executor_name } </Link> },
                                        e.system_count,
                                        statusSummary(normalizeStatus(e.status), systemsStatus)
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
        </React.Fragment>);
};

ActivityDetail.propTypes = {
    remediation: PropTypes.object,
    issue: PropTypes.object,
    playbookRun: PropTypes.object,
    getPlaybookRun: PropTypes.func,
    getPlaybookRunSystems: PropTypes.func

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
        getPlaybookRun: (id) => dispatch(getPlaybookRun(id)),
        getPlaybookRunSystems: (remediationId, runId) => dispatch(getPlaybookRunSystems(remediationId, runId))
    })
)(ActivityDetail);
export default connected;

// export default ActivityDetail;
