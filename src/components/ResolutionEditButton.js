import React, { useState, useRef } from 'react';
import PropTypes from 'prop-types';

import { Button, Modal, ModalVariant } from '@patternfly/react-core';
import ResolutionStep from './ResolutionModal/ResolutionStep';

const ResolutionEditButton = ({
  remediation,
  issue,
  onResolutionSelected,
  getResolutions,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const openModal = () => setIsOpen(true);

  const resolutionStep = useRef();

  const onModalClose = (result) => {
    setIsOpen(false);
    const resolution = resolutionStep.current?.getSelectedResolution();

    if (result && issue.resolution.id !== resolution.id) {
      onResolutionSelected(remediation.id, issue.id, resolution.id);
    }
  };

  return (
    <React.Fragment>
      <a onClick={openModal}>Edit</a>
      {isOpen && (
        <Modal
          variant={ModalVariant.medium}
          className="rem-c-resolution-modal"
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title="Edit resolution"
          actions={[
            <Button key="confirm" variant="primary" onClick={onModalClose}>
              Save
            </Button>,
            <Button
              key="cancel"
              variant="secondary"
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </Button>,
          ]}
        >
          <ResolutionStep
            key="ResolutionStep"
            issue={issue}
            ref={resolutionStep}
            getResolutions={getResolutions}
          />
        </Modal>
      )}
    </React.Fragment>
  );
};

ResolutionEditButton.propTypes = {
  remediation: PropTypes.object.isRequired,
  issue: PropTypes.object.isRequired,
  onResolutionSelected: PropTypes.func.isRequired,
  getResolutions: PropTypes.func.isRequired,
};

export default ResolutionEditButton;
