import React from 'react';
import PropTypes from 'prop-types';
import { Modal, ModalVariant, Button, Title } from '@patternfly/react-core';
import { ExclamationTriangleIcon } from '@patternfly/react-icons';
import './WarningModal.scss';

export const WarningModal = ({ isOpen, onModalCancel, onConfirmCancel }) => (
    <Modal
        header={ <Title headingLevel='h1' size='2xl'className='ins-c-modal__cancel-run-warning-header'>
            <ExclamationTriangleIcon size='md' className='ins-c-modal__cancel-run-warning-header--icon'/>
            Cancel remediation process
        </Title> }
        title='Cancel remediation process'
        hideTitle
        variant={ ModalVariant.small }
        className='ins-c-modal__cancel-run-warning'
        isOpen={ isOpen }
        onClose={ onModalCancel }
        actions={ [
            <Button key="confirm" variant="danger" onClick={ onConfirmCancel }>
        Cancel playbook process
            </Button>,
            <Button key="cancel" variant="link" onClick={ onModalCancel }>
        Cancel
            </Button>
        ] }
        isFooterLeftAligned>
        <span>
      Canceling a running playbook process only affects pending and running tasks.
      It does not affect any previously succeeded or failed tasks that have already run.
        </span>
    </Modal>
);

WarningModal.propTypes = {
    type: PropTypes.string,
    isOpen: PropTypes.bool,
    onModalCancel: PropTypes.func,
    onConfirmCancel: PropTypes.func
};
