import React, { useState, useEffect, useRef } from 'react';

import * as pfReactTable from '@patternfly/react-table';
import * as reactCore from '@patternfly/react-core';
import * as reactIcons from '@patternfly/react-icons';
import * as reactRouterDom from 'react-router-dom';
import { connect } from 'react-redux';

import PropTypes from 'prop-types';
import {
    Button, Modal
} from '@patternfly/react-core';
import { getRegistry } from '@redhat-cloud-services/frontend-components-utilities/files/Registry';
import reducers from '../store/reducers';
import RemediationDetailsSystemDropdown from './RemediationDetailsSystemDropdown';
import ConfirmationDialog from './ConfirmationDialog';
import { deleteRemediationIssueSystem } from '../actions';
import { getSystemName } from '../Utilities/model';

const SystemForActionButton = ({ issue, remediation, onDelete }) => {
    const [ deleteDialogOpen, setDeleteDialogOpen ] = useState(false);
    const [ InventoryTable, setInventoryTable ] = useState();
    const [ open, setOpen ] = useState(false);
    const [ system, setSystem ] = useState({});
    const [ page, setPage ] = useState(1);
    const [ pageSize, setPageSize ] = useState(50);
    const inventory = useRef(null);

    // eslint-disable-next-line react/display-name
    const detailDropdown = (remediation, issue) => (system) => (
        <RemediationDetailsSystemDropdown remediation={ remediation } issue={ issue } system={ system } />
    );

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
            ...mergeWithEntities(reducers.inventoryEntitiesReducer({ INVENTORY_ACTION_TYPES, detailDropdown: detailDropdown(remediation, issue) })())
        });

        const { InventoryTable } = inventoryConnector();
        setInventoryTable(() => InventoryTable);
    };

    useEffect(() => {
        loadInventory();
    }, []);

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
                variant='link' onClick={ () => setOpen(true) }>
                { issue.systems.length }
            </Button>
            <Modal
                className="ins-c-dialog"
                width={ '50%' }
                title={ `System for action ${issue.description}` }
                isOpen={ open }
                onClose={ () => setOpen(false) }
                isFooterLeftAligned
            >
                { InventoryTable && <InventoryTable
                    ref={ inventory }
                    items={ issue.systems }
                    onRefresh={ onRefresh }
                    page={ page }
                    total={ issue.systems.length }
                    perPage={ pageSize }
                    tableProps={ { onSelect: undefined } }
                    actions= { [
                        {
                            title: (
                                <Button
                                    className=' ins-c-button__danger-link'
                                    onClick={ () => setDeleteDialogOpen(true) }
                                    variant="link"
                                >
                                    Remove system
                                </Button>
                            ),
                            onClick: (event, rowId, rowData) => {
                                setSystem(rowData);
                                setDeleteDialogOpen(true);
                            }
                        }] }
                /> }
            </Modal>
            <ConfirmationDialog
                isOpen={ deleteDialogOpen }
                text={ `This playbook will not address ${issue.description} on ${getSystemName(system)}` }
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
