import React from 'react';
import PropTypes from 'prop-types';

import { Button, Modal, ModalVariant } from '@patternfly/react-core';
import { ExclamationTriangleIcon } from '@patternfly/react-icons';
import './ConfirmationDialog.scss';

export default function ConfirmationDialog({
  isOpen = true,
  title = 'Remove system?',
  text = 'This action cannot be undone',
  confirmText = 'Remove system',
  onClose = (f) => f,
}) {
  return (
    <Modal
      title={
        <div>
          <ExclamationTriangleIcon className="rem-m-alert rem-c-delete-icon pf-u-mr-xs" />
          {title}
        </div>
      }
      className="remediations rem-c-dialog"
      variant={ModalVariant.small}
      isOpen={isOpen}
      onClose={() => onClose(false)}
      isFooterLeftAligned
      actions={[
        <Button
          key="confirm"
          variant="danger"
          ouiaId="confirm"
          onClick={() => onClose(true)}
        >
          {confirmText}
        </Button>,
        <Button
          key="cancel"
          variant="link"
          ouiaId="cancel"
          onClick={() => onClose(false)}
        >
          Cancel
        </Button>,
      ]}
    >
      <h2>{text}</h2>
    </Modal>
  );
}

ConfirmationDialog.propTypes = {
  isOpen: PropTypes.bool,
  title: PropTypes.string,
  text: PropTypes.string,
  confirmText: PropTypes.string,
  onClose: PropTypes.func,
};
