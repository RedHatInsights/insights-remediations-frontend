import React, { useState, useEffect } from 'react';

import PropTypes from 'prop-types';
import { downloadPlaybook } from '../api';
import {
    Button, Modal, TextContent, Text, TextVariants } from '@patternfly/react-core';
import { TableHeader, Table, TableBody, TableVariant } from '@patternfly/react-table';
import { CheckCircleIcon } from '@patternfly/react-icons';
import { Skeleton } from '@redhat-cloud-services/frontend-components';
import './ExecuteButton.scss';

const ExecuteButton = ({ isLoading, data, getConnectionStatus, remediationId, issueCount }) => {
    const [ open, setOpen ] = useState(false);
    const [ isUserEntitled, setIsUserEntitled ] = useState(false);
    useEffect(() => {
        window.insights.chrome.auth.getUser().then(user => setIsUserEntitled(user.entitlements.smart_management.is_entitled));
    }, []);

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
    const [ connected, disconnected ] = data.reduce(
        ([ pass, fail ], e) => (e.connection_status === 'connected' ? [ [ ...pass, e ], fail ] : [ pass, [ ...fail, e ] ])
        , [ [], [] ]
    );

    const rows = [ ...connected, ...disconnected ].map(con =>
        ({ cells: [ con.executor_name || 'Direct connection', con.system_count, { title: styledConnectionStatus(con.connection_status) }]})
    );
    const systemCount = connected.reduce((acc, e) => e.system_count + acc, 0);

    const pluralize = (number, str) => number > 1 ? `number ${str}s` : `${number} ${str}`;
    return (isUserEntitled
        ?  <React.Fragment>
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
                isFooterLeftAligned
                actions={ [
                    <Button
                        key="confirm"
                        variant="primary"
                        disabled={ connected.length > 0 }
                        onClick={ () => setOpen(false) }>
                        { `Execute Playbook on ${systemCount} items` }
                    </Button>,
                    <Button
                        key="download"
                        variant='link' onClick={ () => downloadPlaybook(remediationId) }>
                        Download Playbook
                    </Button>
                ] }
            >
                <div>
                    <TextContent>
                        <Text component={ TextVariants.p }>
                            { `Playbook contains ${pluralize(issueCount, 'issue')} affecting ${pluralize(systemCount, 'system')}.` }
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
        : null
    );
};

ExecuteButton.propTypes = {
    isLoading: PropTypes.bool,
    data: PropTypes.array,
    getConnectionStatus: PropTypes.func,
    remediationId: PropTypes.string,
    issueCount: PropTypes.number
};

ExecuteButton.defaultProps = {
    data: []
};

export default ExecuteButton;
