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
    setEtag }) => {

    const [ isUserEntitled, setIsUserEntitled ] = useState(false);
    const isDebug = () => localStorage.getItem('remediations:debug') === 'true';

    useEffect(() => {
        window.insights.chrome.auth.getUser().then(user => setIsUserEntitled(user.entitlements.smart_management.is_entitled));
    }, []);

    const [ connected, disconnected ] = data.reduce(
        ([ pass, fail ], e) => (e.connection_status === 'connected' ? [ [ ...pass, e ], fail ] : [ pass, [ ...fail, e ] ])
        , [ [], [] ]
    );

    const rows = [ ...connected, ...disconnected ].map(con =>
        ({ cells: [
            {
                title: con.executor_name
                    ? <Tooltip content={ `${con.executor_name}` }>
                        <span>{ con.executor_name.length > 25 ? `${ con.executor_name.slice(0, 22)}...` : con.executor_name }</span>
                    </Tooltip>
                    : 'Direct connection'

            },
            con.system_count,
            isUserEntitled && { title: styledConnectionStatus(con.connection_status) }
        ]})
    );
    const connectedCount = connected.reduce((acc, e) => e.system_count + acc, 0);
    const systemCount = data.reduce((acc, e) => e.system_count + acc, 0);

    const pluralize = (number, str) => number > 1 ? `${number} ${str}s` : `${number} ${str}`;

    return (
        <Modal
            className="ins-c-dialog"
            variant={ ModalVariant.small }
            title={ 'Execute playbook' }
            isOpen={ isOpen }
            onClose={ onClose }
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
    data: PropTypes.object,
    remediationId: PropTypes.string,
    issueCount: PropTypes.number,
    runRemediation: PropTypes.func,
    etag: PropTypes.string,
    setEtag: PropTypes.func
};
