import React from 'react';
import PropTypes from 'prop-types';
import { Button } from '@patternfly/react-core';
import { Modal, ModalVariant } from '@patternfly/react-core/deprecated';

const RemoveSystemModal = ({
  isOpen,
  selected,
  onConfirm,
  onClose,
  remediationName,
}) => (
  <Modal
    variant={ModalVariant.medium}
    title={`Remove selected system${selected?.length > 1 ? 's' : ''}?`}
    isOpen={isOpen}
    onClose={onClose}
    titleIconVariant={'warning'}
    data-testid="modal"
    actions={[
      <Button
        key="remove-confirm"
        variant="primary"
        onClick={onConfirm}
        data-testid="confirm-delete"
      >
        Remove
      </Button>,
      <Button key="remove-cancel" variant="link" onClick={onClose}>
        Cancel
      </Button>,
    ]}
  >
    <span data-testid="modal-content">
      {`Are you sure you want to remove the ${
        selected?.length
      } selected system${
        selected?.length > 1 ? 's' : ''
      } for the remediation plan `}
      <strong>{remediationName}</strong>? After removal, when you execute the
      plan, the remedial actions will not run on these systems.
    </span>
  </Modal>
);

RemoveSystemModal.propTypes = {
  selected: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      display_name: PropTypes.string,
    }),
  ).isRequired,
  remediationName: PropTypes.string.isRequired,
  isOpen: PropTypes.bool.isRequired,
  onConfirm: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default RemoveSystemModal;
