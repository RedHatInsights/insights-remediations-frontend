import React from 'react';
import PropTypes from 'prop-types';
import { Button, Modal, ModalVariant } from '@patternfly/react-core';

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
    actions={[
      <Button
        key="remove-confirm"
        variant="primary"
        onClick={onConfirm}
        ouiaId="confirm-delete"
      >
        Remove
      </Button>,
      <Button key="remove-cancel" variant="link" onClick={onClose}>
        Cancel
      </Button>,
    ]}
  >
    <span>
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
