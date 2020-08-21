import React, { useState, useEffect, useRef } from 'react';

import * as pfReactTable from '@patternfly/react-table';
import * as reactRouterDom from 'react-router-dom';
import * as ReactRedux from 'react-redux';
import { reactCore } from '@redhat-cloud-services/frontend-components-utilities/files/inventoryDependencies';
import { connect, useStore } from 'react-redux';
import orderBy from 'lodash/orderBy';

import PropTypes from 'prop-types';
import {
    Button, Modal, ToolbarItem, ToolbarGroup
} from '@patternfly/react-core';
import { getRegistry } from '@redhat-cloud-services/frontend-components-utilities/files/Registry';
import { TableToolbar, ConditionalFilter, conditionalFilterType } from '@redhat-cloud-services/frontend-components';
import { inventoryUrlBuilder } from '../Utilities/urls';
import reducers from '../store/reducers';
import RemediationDetailsSystemDropdown from './RemediationDetailsSystemDropdown';
import ConfirmationDialog from './ConfirmationDialog';
import { deleteRemediationIssueSystem } from '../actions';
import { getSystemName } from '../Utilities/model';
import './SystemForActionButton.scss';

const SystemForActionButton = ({ issue, remediation, onDelete }) => {
    const [ deleteDialogOpen, setDeleteDialogOpen ] = useState(false);
    const [ InventoryTable, setInventoryTable ] = useState();
    const [ open, setOpen ] = useState(false);
    const [ system, setSystem ] = useState({});
    const [ page, setPage ] = useState(1);
    const [ pageSize, setPageSize ] = useState(50);
    const [ filter, setFilter ] = useState('');
    const inventory = useRef(null);
    const store = useStore();

    // eslint-disable-next-line react/display-name
    const detailDropdown = (remediation, issue) => (system) => (
        <RemediationDetailsSystemDropdown remediation={ remediation } issue={ issue } system={ system } />
    );

    const urlBuilder = inventoryUrlBuilder(issue);

    const loadInventory = async () => {
        const {
            inventoryConnector,
            mergeWithEntities,
            INVENTORY_ACTION_TYPES
        } = await insights.loadInventory({
            ReactRedux,
            react: React,
            reactRouterDom,
            pfReactTable,
            pfReact: reactCore
        });

        getRegistry().register({
            ...mergeWithEntities(reducers.inventoryEntitiesReducer({
                INVENTORY_ACTION_TYPES, detailDropdown: detailDropdown(remediation, issue), urlBuilder
            })())
        });

        const { InventoryTable } = inventoryConnector(store);
        setInventoryTable(() => InventoryTable);
    };

    useEffect(() => {
        if (open && inventory && !inventory.current) {
            loadInventory();
        }

    }, [ open ]);

    const onRefresh = (options) => {
        if (inventory && inventory.current) {
            setPage(options.page);
            setPageSize(options.per_page);
            inventory.current.onRefreshData(options);
        }
    };

    return (
        <React.Fragment>
            <Button
                className="ins-c-systems-button"
                variant='link' onClick={ () => setOpen(true) }>
                { issue.systems.length }
            </Button>
            <Modal
                className="ins-c-dialog"
                width={ '50%' }
                title={ `System${issue.systems.length > 1 ? 's' : ''} for action ${issue.description}` }
                isOpen={ open }
                onClose={ () => setOpen(false) }
                isFooterLeftAligned
            >
                <div className="ins-c-toolbar__filter">
                    { InventoryTable && <InventoryTable
                        ref={ inventory }
                        items={ orderBy(issue.systems.filter(s => getSystemName(s).includes(filter)), [ s => getSystemName(s), s => s.id ]) }
                        onRefresh={ onRefresh }
                        page={ page }
                        total={ issue.systems.length }
                        perPage={ pageSize }
                        hasCheckbox={ false }
                        actions= { [
                            {
                                title: ' Remove system',
                                onClick: (event, rowId, rowData) => {
                                    setSystem(rowData);
                                    setDeleteDialogOpen(true);
                                }
                            }] }
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
                                                    onChange: (e, selected) => setFilter(selected)
                                                }
                                            }
                                        ] }
                                    />
                                </ToolbarItem>
                            </ToolbarGroup>
                        </TableToolbar>
                    </InventoryTable> }
                </div>
            </Modal>
            <ConfirmationDialog
                isOpen={ deleteDialogOpen }
                text={ `Removing the system ${getSystemName(system)} from the action ${issue.description}
                    will remove this system’s remediation from the playbook.` }
                onClose={ value => {
                    setDeleteDialogOpen(false);
                    value && onDelete(remediation.id, issue.id, system.id);
                } } />
        </React.Fragment>
    );
};

SystemForActionButton.propTypes = {
    issue: PropTypes.object.isRequired,
    remediation: PropTypes.object.isRequired,
    onDelete: PropTypes.func
};

SystemForActionButton.defaultProps = {
};

const connected = reactRouterDom.withRouter(connect(
    null,
    (dispatch) => ({
        onDelete: (id, issue, system) => dispatch(deleteRemediationIssueSystem(id, issue, system))
    })
)(SystemForActionButton));
export default connected;
