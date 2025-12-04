import React from 'react';
import PropTypes from 'prop-types';
import {
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Flex,
  Spinner,
  Bullseye,
} from '@patternfly/react-core';

const ModalStatusContent = ({
  status, // 'error' | 'confirmation' | 'submitting'
  errorType,
  isUpdate,
  remediationId,
  onClose,
  onViewPlan,
  onConfirm,
  onCancel,
}) => {
  if (status === 'submitting') {
    return (
      <>
        <ModalHeader
          title="Remediation plan creation is in progress"
          labelId="submitting-title"
          titleIconVariant="info"
        />
        <ModalBody>
          <Bullseye>
            <div style={{ textAlign: 'center' }}>
              <Spinner size="xl" className="pf-v6-u-mb-md" />
              <p>
                The actions and systems that you selected are being added to the
                plan. This could take some time to complete.
              </p>
            </div>
          </Bullseye>
        </ModalBody>
      </>
    );
  }

  if (status === 'confirmation') {
    return (
      <>
        <ModalHeader
          title="Are you sure you want to cancel?"
          labelId="cancel-confirmation-title"
          titleIconVariant="warning"
        />
        <ModalBody>
          <span>
            The systems and actions you selected are not added to this
            remediation plan.
          </span>
        </ModalBody>
        <ModalFooter>
          <Flex gap={{ default: 'gapMd' }}>
            <Button key="yes" variant="primary" onClick={onConfirm}>
              Yes
            </Button>
            <Button key="no" variant="link" onClick={onCancel}>
              No, go back
            </Button>
          </Flex>
        </ModalFooter>
      </>
    );
  }

  if (status === 'error') {
    const isCompleteFailure = errorType === 'complete_failure';
    const isPartialFailure = errorType === 'partial_failure';
    const errorTitle = isUpdate
      ? 'Remediation plan update failed'
      : 'Remediation plan creation failed';

    return (
      <>
        <ModalHeader
          title={errorTitle}
          labelId="error-title"
          titleIconVariant={isCompleteFailure ? 'danger' : 'warning'}
        />
        <ModalBody>
          <p>
            {isCompleteFailure
              ? isUpdate
                ? 'The plan update failed. The plan was not updated.'
                : 'The plan creation failed. The plan was not created.'
              : isUpdate
                ? 'The plan was partially updated. Some of the selected items were not added to the plan. Review the plan for changes before execution.'
                : 'The plan was partially created. Some of the selected items were not added to the plan.'}
          </p>
        </ModalBody>
        <ModalFooter>
          <Flex gap={{ default: 'gapMd' }}>
            {isPartialFailure && remediationId && (
              <Button variant="primary" onClick={onViewPlan}>
                View plan
              </Button>
            )}
            <Button
              variant={
                isPartialFailure && remediationId ? 'secondary' : 'primary'
              }
              onClick={onClose}
            >
              Close
            </Button>
          </Flex>
        </ModalFooter>
      </>
    );
  }

  return null;
};

ModalStatusContent.propTypes = {
  status: PropTypes.oneOf(['error', 'confirmation', 'submitting']).isRequired,
  // Error props
  errorType: PropTypes.oneOf(['complete_failure', 'partial_failure']),
  isUpdate: PropTypes.bool,
  remediationId: PropTypes.string,
  onClose: PropTypes.func,
  onViewPlan: PropTypes.func,
  // Confirmation props
  onConfirm: PropTypes.func,
  onCancel: PropTypes.func,
};

export default ModalStatusContent;
