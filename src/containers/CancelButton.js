import React, { useState } from 'react';
import PropTypes from 'prop-types';

import { Button } from '@patternfly/react-core';
import { WarningModal } from '../components/Modals/WarningModal';

import { useDispatch } from 'react-redux';
import { cancelPlaybookRuns } from '../actions';
import { addNotification } from '@redhat-cloud-services/frontend-components-notifications/esm/actions';

export const CancelButton = ({ remediationName, remediationId, playbookId }) => {

    const [ cancelWarningVisible, setcancelWarningVisible ] = useState(false);
    const dispatch = useDispatch();

    const cancelRun = (remediationName, remediationId, playbookId) => {
        dispatch(cancelPlaybookRuns(remediationId, playbookId));
        dispatch(addNotification({
            variant: 'success',
            title: `Canceling playbook ${remediationName} successful`,
            dismissDelay: 8000,
            dismissable: false
        }));
        setcancelWarningVisible(false);
    };

    return (
        <React.Fragment>
            <Button variant='link' onClick={ () => setcancelWarningVisible(true) }> Cancel process </Button>
            <WarningModal
                isOpen={ cancelWarningVisible }
                onModalCancel={ () => setcancelWarningVisible(false) }
                onConfirmCancel={ () => cancelRun(remediationName, remediationId, playbookId) }/>
        </React.Fragment>
    );
};

CancelButton.propTypes = {
    remediationName: PropTypes.string,
    remediationId: PropTypes.string,
    playbookId: PropTypes.string
};
