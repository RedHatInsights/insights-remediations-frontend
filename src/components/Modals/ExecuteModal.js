/* eslint-disable camelcase */
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Button, Modal, ModalVariant, TextContent, Text, TextVariants, Alert, Tooltip } from '@patternfly/react-core';
import { downloadPlaybook } from '../../api';
import { styledConnectionStatus } from '../statusHelper';
import { TableHeader, Table, TableBody, TableVariant } from '@patternfly/react-table';
import { Skeleton } from '@redhat-cloud-services/frontend-components';
import './ExecuteModal.scss';

export const ExecuteModal = ({
    isOpen,
    onClose,
    showRefresh,
    isLoading,
    data,
    remediationId,
    issueCount,
    runRemediation,
    etag,
    getEndpoint,
    sources,
    setEtag }) => {

    const [ isUserEntitled, setIsUserEntitled ] = useState(false);
    const [ connected, setConnected ] = useState([]);
    const [ disconnected, setDisconnected ] = useState([]);
    const isDebug = () => localStorage.getItem('remediations:debug') === 'true';

    useEffect(() => {
        window.insights.chrome.auth.getUser().then(user => setIsUserEntitled(user.entitlements.smart_management.is_entitled));
    }, []);

    const combineStatuses = (status, availability) => status === 'connected'
        ? availability ? availability.availability_status : 'loading'
        : status;

    useEffect(() => {
        const [ con, dis ] = data.reduce(
            ([ pass, fail ], e) => (
                e.connection_status === 'connected'
                    ? [ [ ...pass, { ...e, connection_status: 'loading' }], fail ]
                    : [ pass, [ ...fail, e ] ])
            , [ [], [] ]
        );
        setConnected(con);
        setDisconnected(dis);
        con.map(c => getEndpoint(c.endpoint_id));
    }, [ data ]);

    useEffect(() => {
        const isAvailable = (connectionStatus, sourcesStatus, data) => (
            combineStatuses(connectionStatus, sourcesStatus === 'fulfilled' && data) === 'available'
        );

        const updatedData = data.map(e => ({
            ...e,
            connection_status: combineStatuses(
                e.connection_status,
                sources.status === 'fulfilled' && sources.data[`${e.endpoint_id}`]
            )
        }));

        if (sources.status === 'fulfilled') {
            const [ con, dis ] = updatedData.reduce(
                ([ pass, fail ], e) => (
                    isAvailable(e.connection_status, sources.status, sources.data[`${e.endpoint_id}`])
                        ? [
                            [ ...pass, { ...e }], fail ]
                        : [ pass, [ ...fail, { ...e }] ]
                )
                , [ [], [] ]
            );
            setConnected(con);
            setDisconnected(dis);
        }
    }, [ sources ]);

    const rows = [ ...connected, ...disconnected ].map(con =>
        ({
            cells: [
                {
                    title: con.executor_name
                        ? <Tooltip content={ `${con.executor_name}` }>
                            <span>{ con.executor_name.length > 25 ? `${con.executor_name.slice(0, 22)}...` : con.executor_name }</span>
                        </Tooltip>
                        : 'Direct connection'

                },
                con.system_count,
                isUserEntitled && {
                    title: styledConnectionStatus(
                        con.connection_status,
                        sources.status === 'fulfilled' && sources.data[`${con.endpoint_id}`]
                        && sources.data[`${con.endpoint_id}`].availability_status_error
                    )
                }
            ]
        })
    );
    const connectedCount = connected.reduce((acc, e) => e.system_count + acc, 0);
    const systemCount = data.reduce((acc, e) => e.system_count + acc, 0);

    const pluralize = (number, str) => number > 1 ? `${number} ${str}s` : `${number} ${str}`;

    return (
        <Modal
            className="ins-c-execute-modal"
            variant={ isDebug() ? ModalVariant.large : ModalVariant.small }
            title={ 'Execute playbook' }
            isOpen={ isOpen }
            onClose={ onClose }
            isFooterLeftAligned
            actions={ [
                <Button
                    key="confirm"
                    variant="primary"
                    isDisabled={ connected.length === 0 }
                    onClick={ () => { runRemediation(remediationId, etag, disconnected.map(e => e.executor_id).filter(e => e)); } }>
                    { isLoading ? 'Execute playbook' : `Execute playbook on ${pluralize(connectedCount, 'system')}` }
                </Button>,
                <Button
                    key="download"
                    variant='secondary' onClick={ () => downloadPlaybook(remediationId) }>
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
                { showRefresh
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
    );
};

ExecuteModal.propTypes = {
    isOpen: PropTypes.bool,
    onClose: PropTypes.func,
    showRefresh: PropTypes.bool,
    isLoading: PropTypes.bool,
    data: PropTypes.array,
    remediationId: PropTypes.string,
    issueCount: PropTypes.number,
    runRemediation: PropTypes.func,
    etag: PropTypes.string,
    setEtag: PropTypes.func,
    getEndpoint: PropTypes.func,
    sources: PropTypes.object
};
