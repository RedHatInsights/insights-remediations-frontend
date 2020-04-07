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
    Main, PageHeader, PageHeaderTitle, DateFormat, Skeleton,
    TableToolbar, ToolbarGroup, ToolbarItem, SimpleTableFilter, ConditionalFilter, conditionalFilterType
} from '@redhat-cloud-services/frontend-components';

import {
    Button,
    Card, CardHeader, CardBody,
    Stack, StackItem,
    Breadcrumb, BreadcrumbItem,
    Split, SplitItem
} from '@patternfly/react-core';
import { InProgressIcon, DownloadIcon } from '@patternfly/react-icons';

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
import PlaybookSystemDetails from './SystemDetails';
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
    const [ filteredSystems, setFilteredSystems ] = useState([]);
    const [ filter, setFilter ] = useState({ key: 'display_name', value: '' });
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

        getPlaybookRunSystems(id, run_id, executor_id, pageSize, pageSize * (page - 1));
    }, [ playbookRun ]);

    useEffect(() => {
        getPlaybookRun(id, run_id);
    }, [ playbookRunSystemDetails, playbookRunSystemDetails.status ]);

    useEffect(() => {
        setSystems(() => playbookRunSystems.data.map(({ system_id, system_name, status }) => ({
            id: system_id,
            display_name: system_name,
            status,
            isOpen: (systems.find(s => s.id === systems.id) || { isOpen: false }).isOpen,
            children: <PlaybookSystemDetails systemId={ system_id } />
        })));
    }, [ playbookRunSystems ]);

    useEffect(() => {
        setFilteredSystems(systems);
    }, [ systems ]);

    const systemsStatus = playbookRunSystems.data.reduce((acc, { status }) => ({ ...acc, [normalizeStatus(status)]: acc[normalizeStatus(status)] + 1 })
        , { pending: 0,
            running: 0,
            success: 0,
            failure: 0,
            canceled: 0 });

    const renderInventorycard = (status) => <Main>
        <Stack gutter="md">
            <Card>
                <CardHeader className='ins-m-card__header-bold'>
                    <TableToolbar>
                        <ConditionalFilter
                            items={ [
                                {   value: 'display_name',
                                    label: 'Name',
                                    filterValues: { placeholder: 'Filter by name', type: conditionalFilterType.text,
                                        value: filter.value,
                                        onChange: (e, selected) => {
                                            setFilter({ ...filter, value: selected });
                                            setFilteredSystems(systems.filter(s => s[filter.key].includes(selected)));
                                        },
                                        onSubmit: (e, selected) => {
                                            setFilteredSystems(systems.filter(s => s[selected].includes(filter.value)));
                                        }
                                    }
                                },
                                {
                                    value: 'status',
                                    label: 'Status',
                                    filterValues: { placeholder: 'Filter by status', type: conditionalFilterType.text,
                                        value: filter.value,
                                        onChange: (e, selected) => {
                                            setFilter({ ...filter, value: selected });
                                            setFilteredSystems(systems.filter(s => s[filter.key].includes(selected)));
                                        },
                                        onSubmit: (e, selected) => {
                                            setFilteredSystems(systems.filter(s => s[selected].includes(filter.value)));
                                        }
                                    }
                                }
                            ] }
                            value={ filter.key }
                            onChange={ (e, selected) => setFilter({ key: selected, value: '' }) }
                        />
                        <Button
                            variant='secondary' onClick={ () => downloadPlaybook(remediation.id) }>
                            <DownloadIcon /> { ' ' }
                            Download Playbook
                        </Button>
                    </TableToolbar>

                </CardHeader>

                <CardBody>

                    { InventoryTable && <InventoryTable
                        ref={ inventory }
                        items={ filteredSystems }
                        onRefresh={ onRefresh }
                        page={ page }
                        total={ filteredSystems.length }
                        perPage={ pageSize }
                        tableProps={ { onSelect: undefined } }
                        expandable
                        onExpandClick={ status === 'running'
                            ? (_e, _i, isOpen, { id }) => {
                                if (isOpen) {
                                    if (refreshInterval) {
                                        clearInterval(refreshInterval);
                                    }

                                    getPlaybookRunSystemDetails(remediation.id, run_id, id);
                                    refreshInterval = setInterval(() => getPlaybookRunSystemDetails(remediation.id, run_id, id), 5000);
                                }
                                else {
                                    clearInterval(refreshInterval);
                                }

                                onCollapseInventory(isOpen, id);

                            }
                            : (_e, _i, isOpen, { id }) => {
                                getPlaybookRunSystemDetails(remediation.id, run_id, id);
                                onCollapseInventory(isOpen, id);

                            } }
                    /> }
                </CardBody>
            </Card>
        </Stack>
    </Main>;

    const renderMain = (status) => ({
        running: renderInventorycard(status),
        success: renderInventorycard(status),
        failure: renderInventorycard(status),
        epicFailure: <Main>
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
            { renderMain('running') }
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
        getPlaybookRunSystems: (remediationId, runId, executorId, limit, offset) => dispatch(getPlaybookRunSystems(remediationId, runId, executorId, limit, offset)),
        getPlaybookRunSystemDetails: (remediationId, runId, systemId) => dispatch(getPlaybookRunSystemDetails(remediationId, runId, systemId)),
        onCollapseInventory: (isOpen, id) => dispatch(expandInventoryTable(id, isOpen)),
        loadRemediation: id => dispatch(loadRemediation(id))
    })
)(ExecutorDetails);
export default connected;
