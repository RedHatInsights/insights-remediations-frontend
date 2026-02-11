import React from 'react';
import PropTypes from 'prop-types';
import {
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Flex,
  ProgressVariant,
  Alert,
} from '@patternfly/react-core';
import {
  getActionText,
  getActionNoun,
  calculateProgress,
} from './ModalStatusComponents/helpers';
import ErrorList from './ModalStatusComponents/ErrorList';
import ProgressBar from './ModalStatusComponents/ProgressBar';
import { RemediationsPopover } from '../../routes/RemediationsPopover';

const ModalStatusContent = ({
  status,
  errorType,
  isUpdate,
  remediationId,
  onClose,
  onViewPlan,
  progressTotalBatches,
  progressCompletedBatches,
  progressFailedBatches,
  progressErrors,
  progressIsComplete,
}) => {
  if (status === 'progress') {
    const progressPercentage = calculateProgress(
      progressTotalBatches,
      progressCompletedBatches,
    );
    const hasFailures = (progressFailedBatches || 0) > 0;
    const progressVariant =
      progressIsComplete && hasFailures ? ProgressVariant.warning : undefined;

    const actionNoun = getActionNoun(isUpdate);
    const progressBarText = getActionText(
      isUpdate,
      'Updating remediation plan',
      'Creating remediation plan',
    );
    const bodyMessage = getActionText(
      isUpdate,
      'The update is in progress. You cannot change or cancel the update. To make changes, wait for the process to complete, and then update the plan again.',
      'The plan creation is in progress. You cannot change or cancel this operation. To make changes to the plan, wait for the process to complete and then update the plan.',
    );

    return (
      <>
        <ModalHeader
          title="Plan a remediation"
          labelId="progress-title"
          help={<RemediationsPopover />}
        />
        <ModalBody>
          <div>
            <p className="pf-v6-u-color-200 pf-v6-u-mb-md">
              Remediation plan {actionNoun} progress
            </p>
            <p className="pf-v6-u-mb-md">{bodyMessage}</p>
            <ProgressBar
              value={progressPercentage}
              variant={progressVariant}
              label={progressBarText}
            />
          </div>
        </ModalBody>
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
      const descriptionText = getActionText(
        isUpdate,
        'Remediation plan update failed',
        'Remediation plan creation failed',
      );
      const progressBarText = getActionText(
        isUpdate,
        'Could not update',
        'Could not create',
      );
      const baseMessage = getActionText(
        isUpdate,
        'The plan was not updated due to an unknown error.',
        'The plan was not created due to an unknown error.',
      );

      return (
        <>
          <ModalHeader
            title="Plan a remediation"
            labelId="error-title"
            help={<RemediationsPopover />}
          />
          <ModalBody>
            <div>
              <p className="pf-v6-u-color-200 pf-v6-u-mb-md">
                {descriptionText}
              </p>
              <ProgressBar
                value={0}
                variant={ProgressVariant.danger}
                label={progressBarText}
              />
              <Alert variant="danger" isInline title="Unknown error">
                <p>{baseMessage} Close this dialog to try again.</p>
                <ErrorList errors={progressErrors} />
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
      const descriptionText = getActionText(
        isUpdate,
        'Remediation plan update error',
        'Remediation plan creation error',
      );
      const alertTitle = getActionText(
        isUpdate,
        'An error occurred while updating the plan',
        'An error occurred while creating the plan',
      );
      const baseMessage = getActionText(
        isUpdate,
        'Some of the selected items were not added to the plan. We cannot automatically revert the plan to its original state.',
        'Some of the selected items were not added to the plan.',
      );
      const closingMessage = getActionText(
        isUpdate,
        'Select View plan to review the contents of the partially updated plan, or close this dialog to try again.',
        'Select View plan to review the contents of the plan, or close this dialog to try again.',
      );

      const progressPercentage = calculateProgress(
        progressTotalBatches,
        progressCompletedBatches,
      );

      return (
        <>
          <ModalHeader
            title="Plan a remediation"
            labelId="error-title"
            help={<RemediationsPopover />}
          />
          <ModalBody>
            <div>
              <p className="pf-v6-u-color-200 pf-v6-u-mb-md">
                {descriptionText}
              </p>
              <ProgressBar
                value={progressPercentage}
                variant={ProgressVariant.warning}
                label="Could not add all items"
              />
              <Alert
                variant="warning"
                isInline
                title={alertTitle}
                className="pf-v6-u-mb-md"
              >
                <p>{baseMessage}</p>
                <ErrorList errors={progressErrors} />
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
    const errorTitle = getActionText(
      isUpdate,
      'Remediation plan update failed',
      'Remediation plan creation failed',
    );

    const errorMessage = isCompleteFailure
      ? getActionText(
          isUpdate,
          'The plan update failed. The plan was not updated.',
          'The plan creation failed. The plan was not created.',
        )
      : getActionText(
          isUpdate,
          'The plan was partially updated. Some of the selected items were not added to the plan. Review the plan for changes before execution.',
          'The plan was partially created. Some of the selected items were not added to the plan.',
        );

    return (
      <>
        <ModalHeader
          title={errorTitle}
          labelId="error-title"
          titleIconVariant={isCompleteFailure ? 'danger' : 'warning'}
          help={<RemediationsPopover />}
        />
        <ModalBody>
          <p>{errorMessage}</p>
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
  status: PropTypes.oneOf(['error', 'progress']).isRequired,
  errorType: PropTypes.oneOf(['complete_failure', 'partial_failure']),
  isUpdate: PropTypes.bool,
  remediationId: PropTypes.string,
  onClose: PropTypes.func,
  onViewPlan: PropTypes.func,
  progressTotalBatches: PropTypes.number,
  progressCompletedBatches: PropTypes.number,
  progressFailedBatches: PropTypes.number,
  progressErrors: PropTypes.arrayOf(PropTypes.string),
  progressIsComplete: PropTypes.bool,
};

export default ModalStatusContent;
