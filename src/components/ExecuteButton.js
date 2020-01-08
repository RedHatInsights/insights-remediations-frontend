import React, { useState } from 'react';

import PropTypes from 'prop-types';

import {
    Button, Modal, TextContent, Text, TextVariants } from '@patternfly/react-core';
import { TableHeader, Table, TableBody, TableVariant } from '@patternfly/react-table';
import { CheckCircleIcon } from '@patternfly/react-icons';
import { Skeleton } from '@redhat-cloud-services/frontend-components';

import { addNotification } from '@redhat-cloud-services/frontend-components-notifications';

import './ExecuteButton.scss';

const ExecuteButton = ({ isLoading, data, getConnectionStatus, remediationId }) => {
    const [ open, setOpen ] = useState(false);
    const styledConnectionStatus = (status) => (
        status === 'connected'
            ? (<div>
                <CheckCircleIcon
                    className="ins-c-remediations-reboot-check-circle ins-c-remediations-connection-status"
                    aria-label="connection status"/>
                Ready
            </div>)
            : status
    );
    const rows = data.map(con => ({ cells: [ con.executor_name, con.system_count, { title: styledConnectionStatus(con.connection_status) }]}));

    return (
        <React.Fragment>
            <Button
                onClick={ () => { setOpen(true); getConnectionStatus(remediationId); } }>
        Execute playbook
            </Button>
            <Modal
                className="ins-c-dialog"
                width={ '50%' }
                title={ 'Execute playbook' }
                isOpen={ open }
                onClose={ () => setOpen(false) }
                actions={ [
                    <Button key="cancel" variant="secondary" onClick={ () => setOpen(false) }>Cancel</Button>,
                    <Button key="confirm" variant="primary" onClick={ () => setOpen(false) }>Confirm</Button>
                ] }
            >
                <div>
                    <TextContent>
                        <Text component={ TextVariants.p }>
                            Playbook contains X issues affecting X systems.
                        </Text>
                        <Text component={ TextVariants.p }>
                        Systems connected to a Satelite instance and configured with Receptor can be automatically remediated.
                            To remediate other systems, download the Ansible playbook for this plan.

                        </Text>
                        <Text component={ TextVariants.h2 }>Connection status of systems</Text>
                    </TextContent>
                    { isLoading
                        ? <Skeleton />
                        : <Table
                            variant={ TableVariant.compact }
                            aria-label="Systems"
                            cells={ [{
                                title: 'Connection type', value: 'type'
                            }, {
                                title: 'Systems', value: 'count'
                            }, {
                                title: 'Connection status', value: 'status'
                            }] }
                            rows={ rows }
                        >
                            <TableHeader />
                            <TableBody />
                        </Table> }
                </div>
            </Modal>

        </React.Fragment>
    );
};

ExecuteButton.propTypes = {
    isLoading: PropTypes.bool,
    data: PropTypes.array,
    getConnectionStatus: PropTypes.func,
    remediationId: PropTypes.string
};

ExecuteButton.defaultProps = {
    data: []
};

export default ExecuteButton;
