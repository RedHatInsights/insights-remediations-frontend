/* eslint-disable camelcase */
import React, { useState, useEffect } from 'react';

import PropTypes from 'prop-types';
import { downloadPlaybook } from '../api';
import {
    Button, Modal, TextContent, Text, TextVariants } from '@patternfly/react-core';
import { TableHeader, Table, TableBody, TableVariant } from '@patternfly/react-table';
import { CheckCircleIcon, ExclamationCircleIcon } from '@patternfly/react-icons';
import { Skeleton } from '@redhat-cloud-services/frontend-components';
import './ExecuteButton.scss';

const styledConnectionStatus = (status) => ({
    connected: (
        <TextContent>
            <Text component={ TextVariants.p }>
                <CheckCircleIcon
                    className="ins-c-remediations-reboot-check-circle ins-c-remediations-connection-status"
                    aria-label="connection status" />
            Ready
            </Text>
        </TextContent>),
    disconnected: (
        <TextContent>
            <Text component={ TextVariants.p }>
                Connection issue
            </Text>
            <Text component={ TextVariants.small }>
                Receptor not responding
            </Text>
            <Button
                key="troubleshoot"
                // eslint-disable-next-line no-console
                variant='link' onClick={ () => console.log('TODO: add link') }>
                Troubleshoot
            </Button>
        </TextContent>),
    no_executor: (
        <TextContent>
            <Text component={ TextVariants.p }>

                Cannot remediate - Direct connection.
            </Text>
            <Text component={ TextVariants.small }>
                 Connect your systems to Satellite to automatically remediate.
            </Text>
            <Button
                key="download"
                // eslint-disable-next-line no-console
                variant='link' onClick={ () => console.log('TODO: add link') }>
               Learn how to connect
            </Button>
        </TextContent>),
    no_source: (<TextContent>
        <Text component={ TextVariants.p }>
            Cannot remediate - Satellite not configured
        </Text>
        <Text component={ TextVariants.small }>
           Satellite not registered for Playbook execution
        </Text>
        <Button
            key="register"
            // eslint-disable-next-line no-console
            variant='link' onClick={ () => console.log('TODO: add link') }>
            Learn how to register Satellite
        </Button>
    </TextContent>),
    no_receptor: (<TextContent>
        <Text component={ TextVariants.p }>
            <ExclamationCircleIcon
                className="ins-c-remediations-connection-status-error ins-c-remediations-connection-status"
                aria-label="connection status" />
            Cannot remediate - Receptor not configured
        </Text>
        <Text component={ TextVariants.small }>
            Configure Receptor to automatically remediate
        </Text>
        <Button
            key="configure"
            // eslint-disable-next-line no-console
            variant='link' onClick={ () => console.log('TODO: add link') }>
            Learn how to configure
        </Button>
    </TextContent>)
})[status];

const ExecuteButton = ({ isLoading, data, getConnectionStatus, toggleExecutePlaybookBanner, remediationId, issueCount }) => {
    const [ open, setOpen ] = useState(false);
    const [ isUserEntitled, setIsUserEntitled ] = useState(false);
    const isEnabled = () => localStorage.getItem('remediations:fifi:debug') === 'true';

    useEffect(() => {
        window.insights.chrome.auth.getUser().then(user => setIsUserEntitled(user.entitlements.smart_management.is_entitled));
    }, []);

    const [ connected, disconnected ] = data.reduce(
        ([ pass, fail ], e) => (e.connection_status === 'connected' ? [ [ ...pass, e ], fail ] : [ pass, [ ...fail, e ] ])
        , [ [], [] ]
    );

    const rows = [ ...connected, ...disconnected ].map(con =>
        ({ cells: [ con.executor_name || 'Direct connection', con.system_count, { title: styledConnectionStatus(con.connection_status) }]})
    );
    const connectedCount = connected.reduce((acc, e) => e.system_count + acc, 0);
    const systemCount = data.reduce((acc, e) => e.system_count + acc, 0);

    const pluralize = (number, str) => number > 1 ? `${number} ${str}s` : `${number} ${str}`;
    return (isUserEntitled && isEnabled()
        ?  <React.Fragment>
            <Button
                onClick={ () => { setOpen(true); getConnectionStatus(remediationId); } }>
        Execute Playbook
            </Button>
            <Modal
                className="ins-c-dialog"
                width={ '50%' }
                title={ 'Execute Playbook' }
                isOpen={ open }
                onClose={ () => setOpen(false) }
                isFooterLeftAligned
                actions={ [
                    <Button
                        key="confirm"
                        variant="primary"
                        disabled={ connected.length > 0 }
                        onClick={ () => { setOpen(false); toggleExecutePlaybookBanner(); } }>
                        { `Execute Playbook on ${pluralize(connectedCount, 'system')}` }
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
                            Playbook contains <b>{ `${pluralize(issueCount, 'issue')}` }</b> affecting
                            <b> { `${pluralize(systemCount, 'system')}.` } </b>
                        </Text>
                        <Text component={ TextVariants.p }>
                        Systems connected to a Satellite instance and configured with Receptor can be automatically remediated.
                            To remediate other systems, download the Ansible Playbook for this plan.

                        </Text>
                        <Text component={ TextVariants.h4 }>Connection status of systems</Text>
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
    toggleExecutePlaybookBanner: PropTypes.func,
    remediationId: PropTypes.string,
    issueCount: PropTypes.number
};

ExecuteButton.defaultProps = {
    data: []
};

export default ExecuteButton;
