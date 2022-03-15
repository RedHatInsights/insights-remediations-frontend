import React from 'react';
import propTypes from 'prop-types';
import { Button, Modal, ModalVariant } from '@patternfly/react-core';

export const NoDataModal = ({ isOpen, setOpen }) => {
  return (
    <Modal
      variant={ModalVariant.small}
      title="Remediate with Ansible"
      isOpen={isOpen}
      onClose={() => setOpen(false)}
      actions={[
        <Button key="confirm" variant="primary" onClick={() => setOpen(false)}>
          Back to Insights
        </Button>,
      ]}
    >
      None of the selected issues can be remediated with Ansible.
      <br />
      <br />
      To remediate these issues, review the manual remediation steps associated
      with each.
    </Modal>
  );
};

NoDataModal.propTypes = {
  isOpen: propTypes.bool,
  setOpen: propTypes.func,
};

export default NoDataModal;
