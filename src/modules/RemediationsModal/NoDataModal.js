import React from 'react';
import propTypes from 'prop-types';
import { Button } from '@patternfly/react-core';
import { Modal, ModalVariant } from '@patternfly/react-core/deprecated';
import { useFeatureFlag } from '../../Utilities/Hooks/useFeatureFlag';

export const NoDataModal = ({ isOpen, setOpen, patchNoAdvisoryText }) => {
  const isLightspeedRebrandEnabled = useFeatureFlag(
    'platform.lightspeed-rebrand',
  );

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
          {isLightspeedRebrandEnabled
            ? 'Back to Red Hat Lightspeed'
            : 'Back to Insights'}
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
