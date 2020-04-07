import React from 'react';
import PropTypes from 'prop-types';
import { Modal, Button, BaseSizes, Title, TitleLevel } from '@patternfly/react-core';
import { ExclamationTriangleIcon } from '@patternfly/react-icons';
import './WarningModal.scss';

export const WarningModal = ({ isOpen, onModalCancel, onConfirmCancel }) => (
    <Modal
        header={ <Title headingLevel={ TitleLevel.h1 } size={ BaseSizes['2xl'] } className='ins-c-modal__cancel-run-warning-header'>
            <ExclamationTriangleIcon size='md' className='ins-c-wizard__cancel-warning-header--icon'/>
            Cancel remediation process
        </Title> }
        title='Cancel remediation process'
        hideTitle
        isSmall
        className='ins-c-modal__cancel-run-warning'
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
