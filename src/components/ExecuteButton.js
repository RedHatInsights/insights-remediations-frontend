/* eslint-disable camelcase */
import React, { useState, useEffect } from 'react';

import PropTypes from 'prop-types';
import { downloadPlaybook } from '../api';
import { Button, Modal, TextContent, Text, TextVariants, Alert, Tooltip } from '@patternfly/react-core';
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
                <Text component={ TextVariants.small } style={ { margin: '0px' } }>
                    Receptor not responding
                </Text>
                <Button
                    style={ { padding: '0px' } }
                    key="troubleshoot"
                    // eslint-disable-next-line no-console
                    variant='link' onClick={ () => console.log('TODO: add link') }>
                    Troubleshoot
                </Button>
            </Text>
        </TextContent>),
    no_executor: (
        <TextContent>
            <Text component={ TextVariants.p }>
                Cannot remediate - Direct connection.
                <Text component={ TextVariants.small } style={ { margin: '0px' } }>
                    Connect your systems to Satellite to automatically remediate.
                </Text>
                <Button
                    style={ { padding: '0px' } }
                    key="download"
                    // eslint-disable-next-line no-console
                    variant='link' onClick={ () => console.log('TODO: add link') }>
                    Learn how to connect
                </Button>
            </Text>
        </TextContent>),
    no_source: (<TextContent>
        <Text component={ TextVariants.p }>
            Cannot remediate - Satellite not configured
            <Text component={ TextVariants.small } style={ { margin: '0px' } }>
                Satellite not registered for Playbook execution
            </Text>
            <Button
                style={ { padding: '0px' } }
                key="configure"
                // eslint-disable-next-line no-console
                variant='link' onClick={ () => console.log('TODO: add link') }>
                Learn how to register Satellite
            </Button>
        </Text>
    </TextContent>),
    no_receptor: (<TextContent>
        <Text component={ TextVariants.p }>
            <ExclamationCircleIcon
                className="ins-c-remediations-failure ins-c-remediations-connection-status"
                aria-label="connection status" />
            Cannot remediate - Receptor not configured
            <Text component={ TextVariants.small } style={ { margin: '0px' } }>
                Configure Receptor to automatically remediate
            </Text>
            <Button
                style={ { padding: '0px' } }
                key="configure"
                // eslint-disable-next-line no-console
                variant='link' onClick={ () => console.log('TODO: add link') }>
                Learn how to configure
            </Button>
        </Text>
    </TextContent>)
})[status];

const ExecuteButton = ({
    isLoading,
    isDisabled,
    data,
    getConnectionStatus,
    remediationId,
    issueCount,
    runRemediation,
    etag,
    remediationStatus,
    setEtag }) => {
    const [ open, setOpen ] = useState(false);
    const [ isUserEntitled, setIsUserEntitled ] = useState(false);
    const [ showRefreshMessage, setShowRefreshMessage ] = useState(false);
    const isEnabled = () => true || localStorage.getItem('remediations:fifi:debug') === 'true';
    const isDebug = () => localStorage.getItem('remediations:debug') === 'true';

    useEffect(() => {
        window.insights.chrome.auth.getUser().then(user => setIsUserEntitled(user.entitlements.smart_management.is_entitled));
    }, []);

    useEffect(() => {
        if (remediationStatus === 'changed') {
            getConnectionStatus(remediationId);
            setShowRefreshMessage(true);
        } else if (remediationStatus === 'fulfilled') {
            setOpen(false);
        }
    }, [ remediationStatus ]);

    const [ connected, disconnected ] = data.reduce(
        ([ pass, fail ], e) => (e.connection_status === 'connected' ? [ [ ...pass, e ], fail ] : [ pass, [ ...fail, e ] ])
        , [ [], [] ]
    );

    const rows = [ ...connected, ...disconnected ].map(con =>
        ({ cells: [
            {
                title: (<Tooltip content={ `${con.executor_name}` }>
                    <span>{ con.executor_name.length > 25 ? `${ con.executor_name.slice(0, 22)}...` : con.executor_name }</span>
                </Tooltip> || 'Direct connection')

            },
            con.system_count,
            isUserEntitled && { title: styledConnectionStatus(con.connection_status) }
        ]})
    );
    const connectedCount = connected.reduce((acc, e) => e.system_count + acc, 0);
    const systemCount = data.reduce((acc, e) => e.system_count + acc, 0);

    const pluralize = (number, str) => number > 1 ? `${number} ${str}s` : `${number} ${str}`;
    return (isUserEntitled && isEnabled()
        ? <React.Fragment>
            <Button
                isDisabled={ isDisabled }
                onClick={ () => { setOpen(true); getConnectionStatus(remediationId); } }>
        Execute playbook
            </Button>
            <Modal
                className="ins-c-dialog"
                width={ '50%' }
                title={ 'Execute playbook' }
                isOpen={ open }
                onClose={ () => {
                    setShowRefreshMessage(false);
                    setOpen(false);
                } }
                isFooterLeftAligned
                actions={ [
                    <Button
                        key="confirm"
                        variant="primary"
                        isDisabled={ connected.length === 0 }
                        onClick={ () => { runRemediation(remediationId, etag); } }>
                        { isLoading ? 'Execute playbook' : `Execute playbook on ${pluralize(connectedCount, 'system')}` }
                    </Button>,
                    <Button
                        key="download"
                        variant='link' onClick={ () => downloadPlaybook(remediationId) }>
                        Download playbook
                    </Button>,
                    (isDebug()
                        ? <Button
                            key="reset-etag"
                            onClick={ () => setEtag('test') }>
                        Reset etag
                        </Button>
                        : null)
                ] }
            >
                <div>
                    { showRefreshMessage
                        ? <Alert variant="warning" isInline
                            title="The connection status of systems associated with this Playbook has changed. Please review again." />
                        : null }
                    <TextContent>
                        { isLoading
                            ? <Skeleton size='lg'/>
                            : <Text component={ TextVariants.p }>
                                Playbook contains <b>{ `${pluralize(issueCount, 'action')}` }</b> affecting
                                <b>  { `${pluralize(systemCount, 'system')}.` } </b>
                            </Text> }
                        <Text component={ TextVariants.p }>
                        Systems connected to a Satellite instance and configured with Receptor can be automatically remediated.
                            To remediate other systems, download the Ansible Playbook.

                        </Text>
                        <Text component={ TextVariants.h4 }>Connection status of systems</Text>
                    </TextContent>
                    { isLoading
                        ? <Skeleton size='lg'/>
                        : <Table
                            variant={ TableVariant.compact }
                            aria-label="Systems"
                            cells={ [{
                                title: 'Connection type', value: 'type'
                            }, {
                                title: 'Systems', value: 'count'
                            }, isUserEntitled && {
                                title: 'Connection status', value: 'status'
                            } ] }
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
    runRemediation: PropTypes.func,
    remediationId: PropTypes.string,
    remediationStatus: PropTypes.string,
    issueCount: PropTypes.number,
    etag: PropTypes.string,
    setEtag: PropTypes.func,
    isDisabled: PropTypes.bool
};

ExecuteButton.defaultProps = {
    data: [],
    isDisabled: false
};

export default ExecuteButton;
