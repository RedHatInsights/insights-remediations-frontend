import React from 'react';
import PropTypes from 'prop-types';

import { Button, Modal, ModalVariant } from '@patternfly/react-core';
import './ConfirmationDialog.scss';

export default function ConfirmationDialog({
  isOpen = true,
  title = 'Remove system?',
  text = 'This action cannot be undone',
  confirmText = 'Remove system',
  onClose = (f) => f,
  selectedItems,
}) {
  return (
    <Modal
      title={title}
      className="remediations rem-c-dialog"
      variant={ModalVariant.small}
      isOpen={isOpen}
      onClose={() => onClose(false)}
      isFooterLeftAligned
      titleIconVariant={'warning'}
      actions={[
        <Button
          key="confirm"
          variant="primary"
          ouiaId="confirm"
          onClick={() => onClose(true)}
          isDisabled={selectedItems?.length === 0}
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
  selectedItems: PropTypes.array,
};
