/* eslint-disable react/display-name */
/* eslint-disable camelcase */
import React, { useEffect, useState, useRef, useContext } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import orderBy from 'lodash/orderBy';
import * as pfReactTable from '@patternfly/react-table';
import * as reactCore from '@patternfly/react-core';
import * as reactIcons from '@patternfly/react-icons';
import * as reactRouterDom from 'react-router-dom';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { dark } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import {
    Main, PageHeader, PageHeaderTitle, DateFormat, Skeleton
} from '@redhat-cloud-services/frontend-components';

import {
    Button,
    Card, CardHeader, CardBody,
    Stack, StackItem,
    Breadcrumb, BreadcrumbItem,
    Split, SplitItem
} from '@patternfly/react-core';
import { InProgressIcon } from '@patternfly/react-icons';

import { getRegistry } from '@redhat-cloud-services/frontend-components-utilities/files/Registry';
import reducers from '../store/reducers';
import { getSystemName } from '../Utilities/model';
import DescriptionList from './Layouts/DescriptionList';
import {
    getPlaybookRuns,
    getPlaybookRun,
    getPlaybookRunSystems,
    getPlaybookRunSystemDetails,
    expandInventoryTable,
    loadRemediation
} from '../actions';
import { downloadPlaybook } from '../api';
import { normalizeStatus, renderStatus, StatusSummary  } from './statusHelper';
import ExecutorDetailsSkeleton from '../skeletons/ExecutorDetailsSkeleton';
import RunFailed from './Alerts/RunFailed';

import { PermissionContext } from '../App';
let refreshInterval;

const ExecutorDetails = ({
    match: { params: { executor_id, run_id, id }},
    remediation,
    playbookRun,
    playbookRunSystems,
    playbookRunSystemDetails,
    getPlaybookRun,
    getPlaybookRunSystems,
    getPlaybookRunSystemDetails,
    onCollapseInventory,
    loadRemediation
}) => {
    const [ executor, setExecutor ] = useState({});
    const [ systems, setSystems ] = useState([]);
    const [ InventoryTable, setInventoryTable ] = useState();
    const [ page, setPage ] = useState(1);
    const [ pageSize, setPageSize ] = useState(50);
    const inventory = useRef(null);

    const loadInventory = async () => {
        const {
            inventoryConnector,
            mergeWithEntities,
            INVENTORY_ACTION_TYPES
        } = await insights.loadInventory({
            react: React,
            reactRouterDom,
            reactCore,
            reactIcons,
            pfReactTable
        });

        getRegistry().register({
            ...mergeWithEntities(reducers.playbookActivityIntentory({
                INVENTORY_ACTION_TYPES, renderStatus: (status) => (<div className="ins-c-remediations-status-bar">
                    { renderStatus(normalizeStatus(status)) }
                </div>)
            })())
        });

        const { InventoryTable } = inventoryConnector();
        setInventoryTable(() => InventoryTable);
    };

    const onRefresh = (options) => {
        if (inventory && inventory.current) {
            setPage(options.page);
            setPageSize(options.per_page);
            inventory.current.onRefreshData(options);
        }
    };

    useEffect(() => {
        loadInventory();
        loadRemediation(id);
        getPlaybookRun(id, run_id);

        return () => {
            if (refreshInterval) {
                clearInterval(refreshInterval);
            }
        };

    }, []);
    useEffect(() => {
        if (playbookRun && playbookRun.data) {
            setExecutor(playbookRun.data.executors.find(executor => executor.executor_id === executor_id) || {});
        }

        getPlaybookRunSystems(id, run_id, executor_id);
    }, [ playbookRun ]);

    useEffect(() => {
        setSystems(() => playbookRunSystems.map(({ system_id, system_name, status }) => ({
            id: system_id,
            display_name: system_name,
            status,
            children: <Skeleton size='lg' />
        })));
    }, [ playbookRunSystems ]);

    useEffect(() => {
        setSystems(() => ([
            ...systems.filter(system => system.id !== playbookRunSystemDetails.system_id),
            { ...systems.find(system => system.id === playbookRunSystemDetails.system_id),
                isOpen: true,
                children: <SyntaxHighlighter language="yaml" style={ dark }>
                    { playbookRunSystemDetails && playbookRunSystemDetails.console || '' }
                </SyntaxHighlighter>
            }
        ]));
    }, [ playbookRunSystemDetails ]);

    const systemsStatus = playbookRunSystems.reduce((acc, { status }) => ({ ...acc, [normalizeStatus(status)]: acc[normalizeStatus(status)] + 1 })
        , { pending: 0,
            running: 0,
            success: 0,
            failure: 0,
            canceled: 0 });

    const renderMain = (status) => ({
        running: <Main>
            <Stack gutter="md">
                <Card>
                    <CardHeader className='ins-m-card__header-bold'>
                        <Button
                            variant='link' onClick={ () => downloadPlaybook(remediation.id) }>
                            Download Playbook
                        </Button>
                    </CardHeader>

                    <CardBody>
                        { InventoryTable && <InventoryTable
                            ref={ inventory }
                            items={ orderBy(systems, [ s => getSystemName(s), s => s.id ]) }
                            onRefresh={ onRefresh }
                            page={ page }
                            total={ systems.length }
                            perPage={ pageSize }
                            tableProps={ { onSelect: undefined } }
                            expandable
                            onExpandClick={ (_e, _i, isOpen, { id }) => {
                                if (isOpen) {
                                    if (refreshInterval) {
                                        clearInterval(refreshInterval);
                                    }

                                    getPlaybookRunSystemDetails(remediation.id, run_id, id);
                                    refreshInterval = setInterval(() => getPlaybookRunSystemDetails(remediation.id, run_id, id), 10000);
                                }
                                else {
                                    clearInterval(refreshInterval);
                                }

                                onCollapseInventory(isOpen, id);

                            } }
                        /> }
                    </CardBody>
                </Card>
            </Stack>
        </Main>,
        success: <Main>
            <Stack gutter="md">
                <Card>
                    <CardHeader className='ins-m-card__header-bold'>
                        <Button
                            variant='link' onClick={ () => downloadPlaybook(remediation.id) }>
                            Download Playbook
                        </Button>
                    </CardHeader>

                    <CardBody>
                        { InventoryTable && <InventoryTable
                            ref={ inventory }
                            items={ orderBy(systems, [ s => getSystemName(s), s => s.id ]) }
                            onRefresh={ onRefresh }
                            page={ page }
                            total={ systems.length }
                            perPage={ pageSize }
                            tableProps={ { onSelect: undefined } }
                            expandable
                            onExpandClick={ (_e, _i, isOpen, { id }) => {
                                getPlaybookRunSystemDetails(remediation.id, run_id, id);
                                onCollapseInventory(isOpen, id);

                            } }
                        /> }
                    </CardBody>
                </Card>
            </Stack>
        </Main>,
        failure: <Main>
            <Stack gutter="md">
                <Card>
                    <CardHeader className='ins-m-card__header-bold'>
                        <Button
                            variant='link' onClick={ () => downloadPlaybook(remediation.id) }>
                            Download Playbook
                        </Button>
                    </CardHeader>

                    <CardBody>
                        <RunFailed name={ executor.executor_name }/>
                    </CardBody>
                </Card>
            </Stack>
        </Main>
    })[normalizeStatus(status)];

    const permission = useContext(PermissionContext);

    return remediation && executor && playbookRun && playbookRun.data
        ? <React.Fragment>
            <PageHeader>
                <Breadcrumb>
                    <BreadcrumbItem>
                        <Link to={ `/${remediation.id}` }> { remediation.name } </Link>
                    </BreadcrumbItem>
                    <BreadcrumbItem>
                        <Link to={ `/${remediation.id}/${run_id}` }>  <DateFormat type='exact' date={ playbookRun.data.created_at } /> </Link>
                    </BreadcrumbItem>
                    <BreadcrumbItem isActive> { executor.executor_name } </BreadcrumbItem>
                </Breadcrumb>
                <Stack gutter>
                    <StackItem>
                        <PageHeaderTitle title={
                            normalizeStatus(executor.status) === 'Running'
                                ? <React.Fragment>
                                    <InProgressIcon
                                        className="ins-c-remediations-running"
                                        aria-label="connection status" />{ ' ' }
                                    { executor.executor_name }
                                </React.Fragment>
                                : executor.executor_name
                        } />
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
                                    { executor.status
                                        ? <StatusSummary
                                            executorStatus={ executor.status }
                                            counts={ systemsStatus }
                                            permission={ permission } />
                                        : <Skeleton size='lg' />

                                    }

                                </DescriptionList>
                            </SplitItem>
                        </Split>
                    </StackItem>
                </Stack>
            </PageHeader>
            { renderMain(executor.status) }
        </React.Fragment>
        : <ExecutorDetailsSkeleton />;
};

ExecutorDetails.propTypes = {
    match: PropTypes.object,
    remediation: PropTypes.object,
    playbookRun: PropTypes.object,
    playbookRunSystems: PropTypes.array,
    playbookRunSystemDetails: PropTypes.object,
    getPlaybookRun: PropTypes.func,
    getPlaybookRunSystems: PropTypes.func,
    getPlaybookRunSystemDetails: PropTypes.func,
    onCollapseInventory: PropTypes.func,
    loadRemediation: PropTypes.func
};

ExecutorDetails.defaultProps = {
    remediation: {}
};

const connected = connect(
    ({ playbookRuns, playbookRun, playbookRunSystems, playbookRunSystemDetails, selectedRemediation }) => ({
        playbookRuns: playbookRuns.data,
        playbookRun,
        playbookRunSystemDetails,
        playbookRunSystems: playbookRunSystems.data,
        remediation: selectedRemediation.remediation
    }),
    (dispatch) => ({
        getPlaybookRuns: (id) => dispatch(getPlaybookRuns(id)),
        getPlaybookRun: (id, runId) => dispatch(getPlaybookRun(id, runId)),
        getPlaybookRunSystems: (remediationId, runId, executorId) => dispatch(getPlaybookRunSystems(remediationId, runId, executorId)),
        getPlaybookRunSystemDetails: (remediationId, runId, systemId) => dispatch(getPlaybookRunSystemDetails(remediationId, runId, systemId)),
        onCollapseInventory: (isOpen, id) => dispatch(expandInventoryTable(id, isOpen)),
        loadRemediation: id => dispatch(loadRemediation(id))
    })
)(ExecutorDetails);
export default connected;
