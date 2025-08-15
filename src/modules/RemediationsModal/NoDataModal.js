import React from 'react';
import propTypes from 'prop-types';
import { Button } from '@patternfly/react-core';
import { Modal, ModalVariant } from '@patternfly/react-core/deprecated';

export const NoDataModal = ({ isOpen, setOpen, patchNoAdvisoryText }) => {
  return (
    <Modal
      variant={ModalVariant.small}
      title="Remediate with Ansible"
      isOpen={isOpen}
      onClose={() => setOpen(false)}
      actions={[
        <Button
          key="confirm"
          variant="primary"
          onClick={() => setOpen(false)}
          data-testid="action-0"
        >
          Back to Insights
        </Button>,
      ]}
      data-testid="modal"
    >
      <div data-testid="modal-content">
        {patchNoAdvisoryText ? (
          patchNoAdvisoryText
        ) : (
          <>
            None of the selected issues can be remediated with Ansible.
            <br />
            <br />
            To remediate these issues, review the manual remediation steps
            associated with each.
          </>
        )}
      </div>
    </Modal>
  );
};

NoDataModal.propTypes = {
  isOpen: propTypes.bool,
  setOpen: propTypes.func,
  patchNoAdvisoryText: propTypes.string,
};

export default NoDataModal;
