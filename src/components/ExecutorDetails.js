/* eslint-disable react/display-name */
/* eslint-disable camelcase */
import React, { useEffect, useState, useRef } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { withRouter, Link } from 'react-router-dom';
import orderBy from 'lodash/orderBy';
import * as pfReactTable from '@patternfly/react-table';
import * as reactCore from '@patternfly/react-core';
import * as reactIcons from '@patternfly/react-icons';
import * as reactRouterDom from 'react-router-dom';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { dark } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import {
    Main, PageHeader, PageHeaderTitle, DateFormat
} from '@redhat-cloud-services/frontend-components';

import {
    Button,
    Card, CardHeader, CardBody,
    Stack, StackItem,
    Level, LevelItem,
    Breadcrumb, BreadcrumbItem,
    Split, SplitItem, Expandable,
    Text, TextVariants
} from '@patternfly/react-core';
import {
    Table,
    TableHeader,
    TableBody,
    expandable
} from '@patternfly/react-table';
import { CheckCircleIcon } from '@patternfly/react-icons';

import { getRegistry } from '@redhat-cloud-services/frontend-components-utilities/files/Registry';
import reducers from '../store/reducers';
import { getSystemName } from '../Utilities/model';
import DescriptionList from './Layouts/DescriptionList';
import { getPlaybookRuns, getPlaybookRun, getPlaybookRunSystems, getPlaybookRunSystemDetails, expandInventoryTable, loadRemediation } from '../actions';
import { downloadPlaybook, remediations } from '../api';
import { normalizeStatus, renderStatus, statusSummary  } from './statusHelper';
import ExecutorDetailsSkeleton from '../skeletons/ExecutorDetailsSkeleton';

const ExecutorDetails = ({
    match: { params: { executor_id, run_id, id }},
    remediation,
    playbookRun,
    playbookRuns,
    playbookRunSystems,
    getPlaybookRun,
    getPlaybookRunSystems,
    onCollapseInventory, loadRemediation
}) => {
    const [ executor, setExecutor ] = useState({});
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
        getPlaybookRunSystems(id, run_id, executor_id);

    }, []);
    useEffect(() => {
        if (playbookRun && playbookRun.data) {
            setExecutor(playbookRun.data.executors.find(executor => executor.executor_id === executor_id) || {});
        }
    }, [ playbookRun ]);

    const systems = playbookRunSystems.map(({ system_id, system_name, status }) => ({
        id: system_id,
        display_name: system_name,
        status,
        children: () => (<SyntaxHighlighter language="yaml" style={ dark }>
            HERE IS PLAYBOOK LOG
        </SyntaxHighlighter>)
    }));

    const systemsStatus = playbookRunSystems.reduce((acc, { status }) => ({ ...acc, [normalizeStatus(status)]: acc[normalizeStatus(status)] + 1 })
        , {  running: 0, success: 0, failure: 0 });

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
                        <PageHeaderTitle title={ executor.executor_name } />
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
                                    { statusSummary(executor.status, systemsStatus) }
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
                                    onCollapseInventory(isOpen, id);
                                } }
                            /> }
                        </CardBody>
                    </Card>
                </Stack>
            </Main>
        </React.Fragment>
        : <ExecutorDetailsSkeleton />;
};

ExecutorDetails.propTypes = {
    selectedRemediation: PropTypes.object,
    issue: PropTypes.object

};

ExecutorDetails.defaultProps = {
    remediation: {}
};

const connected = connect(
    ({ playbookRuns, playbookRun, playbookRunSystems, selectedRemediation }) => ({
        playbookRuns: playbookRuns.data,
        playbookRun,
        playbookRunSystems: playbookRunSystems.data,
        remediation: selectedRemediation.remediation
    }),
    (dispatch) => ({
        getPlaybookRuns: (id) => dispatch(getPlaybookRuns(id)),
        getPlaybookRun: (id) => dispatch(getPlaybookRun(id)),
        getPlaybookRunSystems: (remediationId, runId) => dispatch(getPlaybookRunSystems(remediationId, runId)),
        onCollapseInventory: (isOpen, id) => dispatch(expandInventoryTable(id, isOpen)),
        loadRemediation: id => dispatch(loadRemediation(id))
    })
)(ExecutorDetails);
export default connected;
