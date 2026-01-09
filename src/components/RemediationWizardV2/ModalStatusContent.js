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
  Progress,
  ProgressVariant,
  Alert,
} from '@patternfly/react-core';

const ModalStatusContent = ({
  status,
  errorType,
  isUpdate,
  remediationId,
  onClose,
  onViewPlan,
  onConfirm,
  onCancel,
  progressTotalBatches,
  progressCompletedBatches,
  progressFailedBatches,
  progressErrors,
  progressIsComplete,
}) => {
  if (status === 'progress') {
    // Calculate progress percentage
    const totalCalls = progressTotalBatches || 1;
    const completedCalls = progressCompletedBatches || 0;
    const failedCalls = progressFailedBatches || 0;
    const progressPercentage = Math.round((completedCalls / totalCalls) * 100);
    const hasFailures = failedCalls > 0;

    // Determine variant: warning (yellow) only if complete AND there are failures
    const progressVariant =
      progressIsComplete && hasFailures ? ProgressVariant.warning : undefined;

    const progressBarText = isUpdate
      ? 'Updating remediation plan'
      : 'Creating remediation plan';

    const bodyMessage = isUpdate
      ? 'The update is in progress. You cannot change or cancel the update. To make changes, wait for the process to complete, and then update the plan again.'
      : 'The plan creation is in progress. You cannot change or cancel this operation. To make changes to the plan, wait for the process to complete and then update the plan.';

    return (
      <>
        <ModalHeader title="Plan a remediation" labelId="progress-title" />
        <ModalBody>
          <div>
            <p className="pf-v6-u-color-200 pf-v6-u-mb-md">
              Remediation plan {isUpdate ? 'update' : 'creation'} progress
            </p>
            <p className="pf-v6-u-mb-md">{bodyMessage}</p>
            <p className="pf-v6-u-mb-sm">{progressBarText}</p>
            <Progress
              value={progressPercentage}
              variant={progressVariant}
              aria-label={`Progress: ${progressPercentage}%`}
              className="pf-v6-u-mb-sm"
            />
            <div className="pf-v6-u-text-align-right">
              {progressPercentage}%
            </div>
          </div>
        </ModalBody>
      </>
    );
  }

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

    const showCompleteFailureProgress =
      isCompleteFailure &&
      (progressCompletedBatches === 0 ||
        !remediationId ||
        progressTotalBatches === 0);

    if (showCompleteFailureProgress) {
      const descriptionText = isUpdate
        ? 'Remediation plan update failed'
        : 'Remediation plan creation failed';
      const progressBarText = isUpdate
        ? 'Could not update'
        : 'Could not create';
      // Build error message with error details if available
      const baseMessage = isUpdate
        ? 'The plan was not updated due to an unknown error.'
        : 'The plan was not created due to an unknown error.';

      const errorDetails = progressErrors && progressErrors.length > 0;
      const errorList = errorDetails ? (
        <ul className="pf-v6-u-mt-sm pf-v6-u-mb-sm">
          {progressErrors.map((errorTitle, index) => (
            <li key={index}>{errorTitle}</li>
          ))}
        </ul>
      ) : null;

      const closingMessage = 'Close this dialog to try again.';

      return (
        <>
          <ModalHeader title="Plan a remediation" labelId="error-title" />
          <ModalBody>
            <div>
              <p className="pf-v6-u-color-200 pf-v6-u-mb-md">
                {descriptionText}
              </p>
              <p className="pf-v6-u-mb-sm">{progressBarText}</p>
              <Progress
                value={0}
                variant={ProgressVariant.danger}
                aria-label="Progress: 0%"
                className="pf-v6-u-mb-sm"
              />
              <div className="pf-v6-u-text-align-right pf-v6-u-mb-md">0%</div>
              <Alert
                variant="danger"
                isInline
                title="Unknown error"
                className="pf-v6-u-mb-md"
              >
                <p>{baseMessage}</p>
                {errorList}
                <p>{closingMessage}</p>
              </Alert>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="link" onClick={onClose}>
              Close
            </Button>
          </ModalFooter>
        </>
      );
    }

    // For partial failure, show progress bar with warning and alert
    if (isPartialFailure && progressTotalBatches > 0) {
      const descriptionText = isUpdate
        ? 'Remediation plan update error'
        : 'Remediation plan creation error';
      const progressBarText = 'Could not add all items';
      const alertTitle = isUpdate
        ? 'An error occurred while updating the plan'
        : 'An error occurred while creating the plan';

      // Calculate progress percentage based on successful batches
      const totalCalls = progressTotalBatches || 1;
      const completedCalls = progressCompletedBatches || 0;
      const progressPercentage = Math.round(
        (completedCalls / totalCalls) * 100,
      );

      // Build alert message with error details if available
      const baseMessage = isUpdate
        ? 'Some of the selected items were not added to the plan. We cannot automatically revert the plan to its original state.'
        : 'Some of the selected items were not added to the plan.';

      const errorDetails = progressErrors && progressErrors.length > 0;
      const errorList = errorDetails ? (
        <ul className="pf-v6-u-mt-sm pf-v6-u-mb-sm">
          {progressErrors.map((errorTitle, index) => (
            <li key={index}>{errorTitle}</li>
          ))}
        </ul>
      ) : null;

      const closingMessage = isUpdate
        ? 'Select View plan to review the contents of the partially updated plan, or close this dialog to try again.'
        : 'Select View plan to review the contents of the plan, or close this dialog to try again.';

      return (
        <>
          <ModalHeader title="Plan a remediation" labelId="error-title" />
          <ModalBody>
            <div>
              <p className="pf-v6-u-color-200 pf-v6-u-mb-md">
                {descriptionText}
              </p>
              <p className="pf-v6-u-mb-sm">{progressBarText}</p>
              <Progress
                value={progressPercentage}
                variant={ProgressVariant.warning}
                aria-label={`Progress: ${progressPercentage}%`}
                className="pf-v6-u-mb-sm"
              />
              <div className="pf-v6-u-text-align-right pf-v6-u-mb-md">
                {progressPercentage}%
              </div>
              <Alert
                variant="warning"
                isInline
                title={alertTitle}
                className="pf-v6-u-mb-md"
              >
                <p>{baseMessage}</p>
                {errorList}
                <p>{closingMessage}</p>
              </Alert>
            </div>
          </ModalBody>
          <ModalFooter>
            <Flex gap={{ default: 'gapMd' }}>
              {remediationId && (
                <Button variant="primary" onClick={onViewPlan}>
                  View plan
                </Button>
              )}
              <Button variant="link" onClick={onClose}>
                Close
              </Button>
            </Flex>
          </ModalFooter>
        </>
      );
    }

    // For complete failure or partial failure without progress data, show standard error
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
  status: PropTypes.oneOf(['error', 'confirmation', 'submitting', 'progress'])
    .isRequired,
  // Error props
  errorType: PropTypes.oneOf(['complete_failure', 'partial_failure']),
  isUpdate: PropTypes.bool,
  remediationId: PropTypes.string,
  onClose: PropTypes.func,
  onViewPlan: PropTypes.func,
  // Confirmation props
  onConfirm: PropTypes.func,
  onCancel: PropTypes.func,
  // Progress props
  progressTotalBatches: PropTypes.number,
  progressCompletedBatches: PropTypes.number,
  progressFailedBatches: PropTypes.number,
  progressErrors: PropTypes.arrayOf(PropTypes.string),
  progressIsComplete: PropTypes.bool,
};

export default ModalStatusContent;
