/* eslint-disable react/display-name */
/* eslint-disable camelcase */
import React, { useEffect, useState, useRef, useContext } from 'react';
import { connect, useStore } from 'react-redux';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import AwesomeDebouncePromise from 'awesome-debounce-promise';
import * as pfReactTable from '@patternfly/react-table';
import * as reactRouterDom from 'react-router-dom';
import {
    Main, PageHeader, PageHeaderTitle, DateFormat, Skeleton,
    TableToolbar, ConditionalFilter, conditionalFilterType
} from '@redhat-cloud-services/frontend-components';

import {
    Button,
    Card, CardHeader, CardBody,
    Stack, StackItem,
    Breadcrumb, BreadcrumbItem,
    Split, SplitItem, ToolbarItem, ToolbarGroup
} from '@patternfly/react-core';
import { InProgressIcon } from '@patternfly/react-icons/dist/esm/icons/in-progress-icon';


import { getRegistry } from '@redhat-cloud-services/frontend-components-utilities/files/Registry';
import reducers from '../store/reducers';
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
import PlaybookSystemDetails from './SystemDetails';
import ExecutorDetailsSkeleton from '../skeletons/ExecutorDetailsSkeleton';
import RunFailed from './Alerts/RunFailed';
import { inventoryUrlBuilder } from '../Utilities/urls';
import './ExecutorDetails.scss';
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
    const [ filter, setFilter ] = useState('');
    const [ InventoryTable, setInventoryTable ] = useState();
    const [ page, setPage ] = useState(1);
    const [ pageSize, setPageSize ] = useState(50);
    const [ openId, setOpenId ] = useState();
    const [ firstExpand, setFirstExpand ] = useState(false);
    const [ debouncedGetPlaybookRunSystems, setDebounce ] = useState();
    const inventory = useRef(null);
    const store = useStore();

    const urlBuilder = inventoryUrlBuilder({ id: 'default' });

    const loadInventory = async () => {
        const {
            inventoryConnector,
            mergeWithEntities,
            INVENTORY_ACTION_TYPES
        } = await insights.loadInventory({
            react: React,
            reactRouterDom,
            pfReactTable
        });

        getRegistry().register({
            ...mergeWithEntities(reducers.playbookActivityIntentory({
                INVENTORY_ACTION_TYPES, renderStatus: (status) => (<div className="ins-c-remediations-status-bar">
                    { renderStatus(normalizeStatus(status)) }
                </div>), urlBuilder
            })())
        });

        const { InventoryTable } = inventoryConnector(store);
        setInventoryTable(() => InventoryTable);
    };

    const onRefresh = (options) => {
        if (inventory && inventory.current) {
            getPlaybookRunSystems(id, run_id, executor_id, options.per_page, options.per_page * (options.page - 1));
            setPage(options.page);
            setPageSize(options.per_page);
            inventory.current.onRefreshData(options);
        }
    };

    useEffect(() => {
        loadInventory();
        loadRemediation(id);
        getPlaybookRun(id, run_id);
        // eslint-disable-next-line new-cap
        setDebounce(() => AwesomeDebouncePromise(getPlaybookRunSystems, 500));

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

        if (playbookRunSystems.status !== 'pending') {
            getPlaybookRunSystems(id, run_id, executor_id, pageSize, pageSize * (page - 1), filter);
        }

    }, [ playbookRun ]);

    useEffect(() => {
        if (!firstExpand) {
            getPlaybookRun(id, run_id);
        }

        if (normalizeStatus(playbookRunSystemDetails.status) !== 'running' && refreshInterval) {
            clearInterval(refreshInterval);
        }

        setFirstExpand(false);
    }, [ playbookRunSystemDetails.status ]);

    useEffect(() => {
        setSystems(() => playbookRunSystems.data.map(({ system_id, system_name, status }) => ({
            id: system_id,
            display_name: system_name,
            status,
            isOpen: openId === system_id,
            children: <PlaybookSystemDetails systemId={ system_id } />
        })));
    }, [ playbookRunSystems ]);

    const renderInventorycard = (status) => <Main>
        <Stack gutter="md">
            <Card className='ins-c-card__playbook-log'>
                <CardBody>
                    { InventoryTable && <InventoryTable
                        ref={ inventory }
                        items={ playbookRunSystems.status !== 'pending' ? systems : [] }
                        isLoaded={ playbookRunSystems.status !== 'pending' }
                        onRefresh={ onRefresh }
                        page={ page }
                        total={ playbookRunSystems.meta.total }
                        perPage={ pageSize }
                        hasCheckbox={ false }
                        expandable
                        showTags
                        onExpandClick={ status === 'running'
                            ? (_e, _i, isOpen, { id }) => {
                                setFirstExpand(true);
                                if (isOpen) {
                                    setOpenId(id);
                                    if (refreshInterval) {
                                        clearInterval(refreshInterval);
                                    }

                                    getPlaybookRunSystemDetails(remediation.id, run_id, id);
                                    refreshInterval = setInterval(() => getPlaybookRunSystemDetails(remediation.id, run_id, id), 5000);
                                }
                                else {
                                    setOpenId(undefined);
                                    clearInterval(refreshInterval);
                                }

                                onCollapseInventory(isOpen, id);

                            }
                            : (_e, _i, isOpen, { id }) => {
                                setFirstExpand(true);
                                if (isOpen) {
                                    setOpenId(id);
                                    getPlaybookRunSystemDetails(remediation.id, run_id, id);

                                } else {
                                    setOpenId(undefined);
                                }

                                clearInterval(refreshInterval);
                                onCollapseInventory(isOpen, id);

                            } }
                    >
                        <TableToolbar>
                            <ToolbarGroup>
                                <ToolbarItem>
                                    <ConditionalFilter
                                        items={ [
                                            {
                                                value: 'display_name',
                                                label: 'Name',
                                                filterValues: {
                                                    placeholder: 'Filter by name', type: conditionalFilterType.text,
                                                    value: filter,
                                                    onChange: (e, selected) => {
                                                        setFilter(selected);
                                                        setPage(1);
                                                        debouncedGetPlaybookRunSystems(id, run_id, executor_id, pageSize, 0, selected);

                                                    }
                                                }
                                            }
                                        ] }
                                    />
                                </ToolbarItem>
                            </ToolbarGroup>
                            <ToolbarGroup>
                                <ToolbarItem>
                                    <Button
                                        variant='secondary' onClick={ () => downloadPlaybook(remediation.id) }>
                                Download playbook
                                    </Button>
                                </ToolbarItem>
                            </ToolbarGroup>
                        </TableToolbar>
                    </InventoryTable> }
                </CardBody>
            </Card>
        </Stack>
    </Main>;

    const renderMain = (status) => ({
        running: renderInventorycard(status),
        success: renderInventorycard(status),
        failure: renderInventorycard(status),
        canceled: renderInventorycard(status),
        epicFailure: <Main>
            <Stack gutter="md">
                <Card>
                    <CardHeader className='ins-m-card__header-bold'>
                        <Button
                            variant='secondary' onClick={ () => downloadPlaybook(remediation.id) }>
                            Download playbook
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
                        <Link to={ `/` }> Remediations </Link>
                    </BreadcrumbItem>
                    <BreadcrumbItem>
                        <Link to={ `/${remediation.id}` }> { remediation.name } </Link>
                    </BreadcrumbItem>
                    <BreadcrumbItem>
                        <Link to={ `/${remediation.id}/${run_id}` }>  <DateFormat type='exact' date={ playbookRun.data.created_at } /> </Link>
                    </BreadcrumbItem>
                    <BreadcrumbItem isActive> { executor.executor_name } </BreadcrumbItem>
                </Breadcrumb>
                <Stack gutter="md">
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
                        <Split gutter="md">
                            <SplitItem>
                                <DescriptionList className='ins-c-playbookSummary__settings' title='Run status'>
                                    { executor.status
                                        ? <StatusSummary
                                            executorStatus={ executor.status }
                                            counts={ executor.counts }
                                            permission={ permission } />
                                        : <Skeleton size='lg' />

                                    }
                                </DescriptionList>
                            </SplitItem>
                            <SplitItem>
                                <DescriptionList className='ins-c-playbookSummary__settings' title='Run by'>
                                    { `${playbookRun.data.created_by.first_name} ${playbookRun.data.created_by.last_name}` }
                                </DescriptionList>
                            </SplitItem>
                            <SplitItem>
                                <DescriptionList className='ins-c-playbookSummary__settings' title='Run on'>
                                    <DateFormat type='exact' date={ playbookRun.data.created_at } />
                                </DescriptionList>
                            </SplitItem>
                        </Split>
                    </StackItem>
                </Stack>
            </PageHeader>
            { renderMain(normalizeStatus(executor.status)) }
        </React.Fragment>
        : <ExecutorDetailsSkeleton />;
};

ExecutorDetails.propTypes = {
    match: PropTypes.object,
    remediation: PropTypes.object,
    playbookRun: PropTypes.object,
    playbookRunSystems: PropTypes.object,
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
        playbookRunSystems,
        remediation: selectedRemediation.remediation
    }),
    (dispatch) => ({
        getPlaybookRuns: (id) => dispatch(getPlaybookRuns(id)),
        getPlaybookRun: (id, runId) => dispatch(getPlaybookRun(id, runId)),
        getPlaybookRunSystems: (remediationId, runId, executorId, limit, offset, ansibleHost) =>
            dispatch(getPlaybookRunSystems(remediationId, runId, executorId, limit, offset, ansibleHost)),
        getPlaybookRunSystemDetails: (remediationId, runId, systemId) => dispatch(getPlaybookRunSystemDetails(remediationId, runId, systemId)),
        onCollapseInventory: (isOpen, id) => dispatch(expandInventoryTable(id, isOpen)),
        loadRemediation: id => dispatch(loadRemediation(id))
    })
)(ExecutorDetails);
export default connected;
