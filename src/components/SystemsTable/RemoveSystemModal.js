import React from 'react';
import PropTypes from 'prop-types';
import {
  Button,
  Modal,
  ModalVariant,
  Split,
  SplitItem,
  Stack,
  StackItem,
} from '@patternfly/react-core';
import { ExclamationTriangleIcon } from '@patternfly/react-icons';
import { pluralize } from '../statusHelper';

const RemoveSystemModal = ({
  isOpen,
  selected,
  onConfirm,
  onClose,
  remediationName,
}) => (
  <Modal
    variant={ModalVariant.medium}
    title={`Remove selected systems from ${remediationName}`}
    isOpen={isOpen}
    onClose={onClose}
    appendTo={document.getElementsByClassName('remediations')[0]}
    actions={[
      <Button
        key="remove-confirm"
        variant="danger"
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
    <Split hasGutter>
      <SplitItem>
        <ExclamationTriangleIcon size="xl" className="ins-m-alert" />
      </SplitItem>
      <SplitItem isFilled>
        <Stack hasGutter>
          <StackItem>
            This action will remove{' '}
            <b>
              {selected.length === 1
                ? selected[0]?.display_name
                : selected.length}
            </b>{' '}
            {pluralize(selected.length, 'system')} from <b>{remediationName}</b>{' '}
            Remediation.
          </StackItem>
          <StackItem>
            Removing {pluralize(selected.length, 'system')} from this
            Remediation will remove it from all associated issues in{' '}
            <b>{remediationName}</b> Remediation. Be careful as you can end up
            with Remediation without any systems.
          </StackItem>
        </Stack>
      </SplitItem>
    </Split>
  </Modal>
);

RemoveSystemModal.propTypes = {
  selected: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      display_name: PropTypes.string,
    })
  ).isRequired,
  remediationName: PropTypes.string.isRequired,
  isOpen: PropTypes.bool.isRequired,
  onConfirm: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default RemoveSystemModal;
