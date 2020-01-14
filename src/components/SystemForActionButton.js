import React, { useState, useEffect, useRef } from 'react';

import * as pfReactTable from '@patternfly/react-table';
import * as reactCore from '@patternfly/react-core';
import * as reactIcons from '@patternfly/react-icons';
import * as reactRouterDom from 'react-router-dom';

import PropTypes from 'prop-types';
import {
    Button, Modal, TextContent, Text, TextVariants
} from '@patternfly/react-core';
import { getRegistry } from '@redhat-cloud-services/frontend-components-utilities/files/Registry';
import { Skeleton } from '@redhat-cloud-services/frontend-components';
import reducers from '../store/reducers';

let page = 1;
let pageSize = 50;

const SystemForActionButton = ({ issue }) => {
    const [ open, setOpen ] = useState(false);
    const [ InventoryTable, setInventoryTable ] = useState();
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
            ...mergeWithEntities(reducers.inventoryEntitiesReducer(INVENTORY_ACTION_TYPES))
        });

        const { InventoryTable } = inventoryConnector();
        setInventoryTable(() => InventoryTable);
    };

    useEffect(() => {
        loadInventory();
    }, []);

    const onRefresh = (options) => {
        if (inventory && inventory.current) {
            page = options.page;
            pageSize = options.per_page;
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

                /> }
            </Modal>
        </React.Fragment>
    );
};

SystemForActionButton.propTypes = {
    issue: PropTypes.object.isRequired
};

SystemForActionButton.defaultProps = {
};

export default SystemForActionButton;
