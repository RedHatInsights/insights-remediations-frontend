import React from 'react';
import PropTypes from 'prop-types';
import { Modal, Button } from '@patternfly/react-core';
import { ExclamationTriangleIcon } from '@patternfly/react-icons';
import './WarningModal.scss';

export const WarningModal = ({ isOpen, onModalCancel, onConfirmCancel }) => (
    <Modal
        title={ <span className='ins-c-wizard__cancel-warning-header'>
            <ExclamationTriangleIcon size='md' className='ins-c-wizard__cancel-warning-header--icon'/>
        Cancel remediation process
        </span> }
        isSmall
        className='ins-c-wizard__cancel-warning'
        isOpen={ isOpen }
        onClose={ onModalCancel }
        actions={ [
            <Button key="confirm" variant="danger" onClick={ onConfirmCancel }>
        Cancel remediation process
            </Button>,
            <Button key="cancel" variant="link" onClick={ onModalCancel }>
        Cancel
            </Button>
        ] }
        isFooterLeftAligned>
        <span>
      Canceling a running remediation process only affects pending and running steps.
      It does not affect any previously succeeded or failed steps that have already run.
        </span>
    </Modal>
);

WarningModal.propTypes = {
    type: PropTypes.string,
    isOpen: PropTypes.bool,
    onModalCancel: PropTypes.func,
    onConfirmCancel: PropTypes.func
};
