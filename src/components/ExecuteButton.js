/* eslint-disable camelcase */
import React, { useState, useEffect } from 'react';

import PropTypes from 'prop-types';
import { Button, Tooltip } from '@patternfly/react-core';
import { ExecuteModal } from './Modals/ExecuteModal';
import './ExecuteButton.scss';
import './Status.scss';

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
    getEndpoint,
    sources,
    setEtag }) => {
    const [ open, setOpen ] = useState(false);
    const [ isUserEntitled, setIsUserEntitled ] = useState(false);
    const [ showRefreshMessage, setShowRefreshMessage ] = useState(false);

    const isEnabled = () => true || localStorage.getItem('remediations:fifi:debug') === 'true';

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

    const buttonWithTooltip = (isDisabled) => {
        return (
            isDisabled
                ? <Tooltip content='Your account must be configured with Cloud Connector to execute playbooks.'
                    position='auto'>
                    <Button isAriaDisabled>
                    Execute playbook
                    </Button>
                </Tooltip>
                : <Button
                    onClick={ () => { setOpen(true); getConnectionStatus(remediationId); } }>
                Execute playbook
                </Button>
        );
    };

    return (isUserEntitled && isEnabled()
        ? <React.Fragment>
            {
                buttonWithTooltip(isDisabled)
            }
            { open &&
                <ExecuteModal
                    isOpen = { open }
                    onClose = { () => { setShowRefreshMessage(false); setOpen(false); } }
                    showRefresh = { showRefreshMessage }
                    remediationId = { remediationId }
                    data = { data }
                    etag = { etag }
                    isLoading = { isLoading }
                    issueCount = { issueCount }
                    runRemediation = { runRemediation }
                    setEtag = { setEtag }
                    getEndpoint = { getEndpoint }
                    sources = { sources }
                />
            }
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
    isDisabled: PropTypes.bool,
    getEndpoint: PropTypes.func,
    sources: PropTypes.object
};

ExecuteButton.defaultProps = {
    data: [],
    isDisabled: false
};

export default ExecuteButton;
