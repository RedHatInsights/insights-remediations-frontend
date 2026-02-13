import React, { useState, useEffect, useMemo, useRef } from 'react';
import propTypes from 'prop-types';
import {
  Modal,
  ModalVariant,
  Button,
  Form,
  FormGroup,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Divider,
  Tooltip,
  Flex,
  Skeleton,
} from '@patternfly/react-core';
import { ExternalLinkAltIcon } from '@patternfly/react-icons';
import useRemediationsQuery from '../../api/useRemediationsQuery';
import useRemediations from '../../Utilities/Hooks/api/useRemediations';
import { RemediationsPopover } from '../../routes/RemediationsPopover';
import {
  calculateActionPoints,
  calculateActionPointsFromBoth,
  handleRemediationSubmit,
  renderExceedsLimitsAlert,
  renderPreviewAlert,
  wizardHelperText,
  normalizeRemediationData,
  navigateToRemediation,
  countUniqueSystemsFromBoth,
  countUniqueIssuesFromBoth,
  preparePlaybookPreviewPayload,
} from '../helpers';
import { remediationUrl } from '../../Utilities/utils';
import { PlanSummaryHeader } from './PlanSummaryHeader';
import { PlanSummaryCharts } from './PlanSummaryCharts';
import { PlaybookSelect } from './PlaybookSelect';
import { usePlaybookSelect } from './usePlaybookSelect';
import ModalStatusContent from './ModalStatusContent';
import InsightsLink from '@redhat-cloud-services/frontend-components/InsightsLink';
import { postPlaybookPreview } from '../../routes/api';
import { downloadFile } from '../../Utilities/helpers';

export const RemediationWizardV2 = ({
  setOpen,
  data,
  isCompliancePrecedenceEnabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null); // 'complete_failure' | 'partial_failure'
  const [errorRemediationId, setErrorRemediationId] = useState(null);
  const [errorIsUpdate, setErrorIsUpdate] = useState(false);
  const [autoReboot, setAutoReboot] = useState(true);
  const [actionsCount, setActionsCount] = useState(0);
  const [systemsCount, setSystemsCount] = useState(0);
  const [issuesCount, setIssuesCount] = useState(0);
  const [previewStatus, setPreviewStatus] = useState(null); // null, 'success', 'failure'
  const [previewLoading, setPreviewLoading] = useState(false);
  // Progress tracking for batched requests
  const [progressTotalBatches, setProgressTotalBatches] = useState(0);
  const [progressCompletedBatches, setProgressCompletedBatches] = useState(0);
  const [progressFailedBatches, setProgressFailedBatches] = useState(0);
  const [progressErrors, setProgressErrors] = useState([]);
  const [progressIsComplete, setProgressIsComplete] = useState(false);
  const isFirstRender = useRef(true);
  const totalBatchesRef = useRef(0);

  // Normalize data structure to ensure systems array exists
  const normalizedData = useMemo(() => normalizeRemediationData(data), [data]);
  const { result: allRemediations, loading: isLoadingRemediationsList } =
    useRemediationsQuery('getRemediations', {
      params: {
        fieldsData: ['name'],
      },
      skip: !isOpen,
    });

  const allRemediationsData = useMemo(
    () => allRemediations?.data,
    [allRemediations?.data],
  );

  const playbookSelect = usePlaybookSelect({
    allRemediationsData,
  });

  const { selected, inputValue, isExistingPlanSelected, isSelectOpen } =
    playbookSelect;

  const { result: remediationDetailsSummary, loading: detailsLoading } =
    //dont use summary format to calculate action points
    useRemediations('getRemediation', {
      params: { id: selected },
      skip: !isExistingPlanSelected || !isOpen,
    });

  const { fetch: createRemediationFetch } = useRemediations(
    'createRemediation',
    {
      skip: true,
    },
  );

  const { fetch: updateRemediationFetch } = useRemediations(
    'updateRemediation',
    {
      skip: true,
    },
  );

  // Update autoReboot when remediation is selected
  useEffect(() => {
    if (isExistingPlanSelected && remediationDetailsSummary) {
      const needsReboot = remediationDetailsSummary.auto_reboot ?? true;
      setAutoReboot(needsReboot);
    } else if (!isExistingPlanSelected) {
      setAutoReboot(true);
    }
  }, [remediationDetailsSummary, isExistingPlanSelected]);

  // Update counts when remediation details are fetched for an existing plan
  // or when creating a new plan with data prop
  useEffect(() => {
    // Calculate action points from normalized data issues
    const baseActionsPoints = calculateActionPoints(normalizedData?.issues);
    const baseIssuesCount = normalizedData?.issues?.length ?? 0;
    const baseSystemsCount = normalizedData?.systems?.length ?? 0;

    if (isExistingPlanSelected && remediationDetailsSummary) {
      // Existing plan selected: merge plan's counts with data prop counts
      // Calculate action points from both sources, deduplicating issues by ID
      const uniqueActionsPoints = calculateActionPointsFromBoth(
        remediationDetailsSummary,
        normalizedData,
      );

      // Count unique systems from both sources, deduplicating across both
      const uniqueSystemsCount = countUniqueSystemsFromBoth(
        remediationDetailsSummary,
        normalizedData,
      );

      // Count unique issues from both sources
      const uniqueIssuesCount = countUniqueIssuesFromBoth(
        remediationDetailsSummary,
        normalizedData,
      );

      setActionsCount(uniqueActionsPoints);
      setSystemsCount(uniqueSystemsCount);
      setIssuesCount(uniqueIssuesCount);
    } else {
      // Creating new plan, no plan selected, or loading: use counts from data prop
      // Handle both data formats: flat systems array or nested systems within issues
      setActionsCount(baseActionsPoints);
      setSystemsCount(baseSystemsCount);
      setIssuesCount(baseIssuesCount);
    }
  }, [
    remediationDetailsSummary,
    isExistingPlanSelected,
    normalizedData,
    selected,
  ]);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    // Clear preview status when any of these values change
    setPreviewStatus(null);
  }, [selected, inputValue, autoReboot]);

  const exceedsLimits = useMemo(() => {
    return actionsCount > 1000 || systemsCount > 100;
  }, [actionsCount, systemsCount]);

  // Determine which limits are exceeded for alert message
  const exceededActions = useMemo(() => actionsCount > 1000, [actionsCount]);
  const exceededSystems = useMemo(() => systemsCount > 100, [systemsCount]);

  // Disable while typing (dropdown is open) unless an existing plan is selected
  const hasPlanSelection = useMemo(() => {
    // If an existing plan is selected, always allow submission
    if (isExistingPlanSelected) {
      return true;
    }
    // If dropdown is open (user is typing), disable button
    if (isSelectOpen) {
      return false;
    }
    // Otherwise, enable if there's input value
    return inputValue.trim().length > 0;
  }, [isExistingPlanSelected, inputValue, isSelectOpen]);

  const handleClose = () => {
    setIsOpen(false);
    setOpen(false);
  };

  const resetErrorState = () => {
    setSubmitError(null);
    setErrorRemediationId(null);
    setErrorIsUpdate(false);
  };

  const handleSubmit = async () => {
    if (!hasPlanSelection) {
      return;
    }
    setIsSubmitting(true);
    resetErrorState();
    totalBatchesRef.current = 0;
    setProgressTotalBatches(0);
    setProgressCompletedBatches(0);
    setProgressFailedBatches(0);
    setProgressErrors([]);
    setProgressIsComplete(false);

    // Progress callback to update state as batches complete
    const onProgress = (
      totalBatches,
      successfulBatches,
      failedBatches,
      errors,
      isComplete,
    ) => {
      totalBatchesRef.current = totalBatches;
      setProgressTotalBatches(totalBatches);
      setProgressCompletedBatches(successfulBatches);
      setProgressFailedBatches(failedBatches);
      setProgressErrors(errors || []);
      setProgressIsComplete(isComplete);
    };

    try {
      // Pass original data to preserve nested systems structure for payload
      const result = await handleRemediationSubmit({
        isExistingPlanSelected,
        selected,
        inputValue,
        data,
        autoReboot,
        createRemediationFetch,
        updateRemediationFetch,
        isCompliancePrecedenceEnabled,
        onProgress,
      });
      if (
        result?.success &&
        result?.status === 'success' &&
        result?.remediationId
      ) {
        // If there's only one batch (no batching occurred), add a 3-second delay
        if (totalBatchesRef.current === 1) {
          await new Promise((resolve) => setTimeout(resolve, 3000));
        }
        // Navigate to remediation details page on success
        const url = remediationUrl(result.remediationId);
        window.location.href = url;
      } else if (
        result?.status === 'complete_failure' ||
        result?.status === 'partial_failure'
      ) {
        setIsSubmitting(false);
        setSubmitError(result.status);
        setErrorRemediationId(result.remediationId || null);
        setErrorIsUpdate(result.isUpdate || false);
        // Store errors from result if available
        if (result.errors) {
          setProgressErrors(result.errors);
        }
      }
    } catch (error) {
      console.error(error);
      setIsSubmitting(false);
      setSubmitError('complete_failure');
      setErrorRemediationId(null);
      setErrorIsUpdate(false);
    }
  };

  const handleCloseError = () => {
    handleClose();
    resetErrorState();
    setIsSubmitting(false);
  };

  const handleViewPlan = () => {
    navigateToRemediation(errorRemediationId);
  };
  const handlePreview = async () => {
    if (!hasPlanSelection) {
      return;
    }

    setPreviewStatus(null);
    setPreviewLoading(true);
    try {
      const payload = preparePlaybookPreviewPayload({
        isExistingPlanSelected,
        remediationDetailsSummary,
        data,
        autoReboot,
        enablePrecedence: isCompliancePrecedenceEnabled,
      });

      const response = await postPlaybookPreview(payload, {
        responseType: 'blob',
      });

      // Determine playbook name for filename
      let playbookName = 'remediation-preview-playbook';
      if (isExistingPlanSelected && remediationDetailsSummary?.name) {
        playbookName = remediationDetailsSummary.name;
      } else if (inputValue?.trim()) {
        playbookName = inputValue.trim();
      } else if (isExistingPlanSelected && selected) {
        // Fallback: find name from allRemediationsData
        const selectedRemediation = allRemediationsData?.find(
          (r) => r.id === selected,
        );
        if (selectedRemediation?.name) {
          playbookName = selectedRemediation.name;
        }
      }

      const sanitizedFilename = playbookName
        .replace(/[^a-z0-9]/gi, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');

      downloadFile(response, sanitizedFilename, 'yml');
      setPreviewStatus('success');
    } catch (error) {
      console.error('Error generating playbook preview:', error);
      setPreviewStatus('failure');
    } finally {
      setPreviewLoading(false);
    }
  };

  const renderMainContent = () => (
    <>
      <ModalHeader
        title={'Plan a remediation'}
        labelId="plan-a-remediation-title"
        help={<RemediationsPopover />}
      />
      <ModalBody id="create-a-remediation-body">
        <div>
          <p className="pf-v6-u-mb-sm">
            Create or update a plan to remediate issues identified by Red Hat
            Lightspeed using Ansible playbooks. Once you generate a plan, you
            can review, download, or execute the plan.
            <InsightsLink
              to={
                'https://docs.redhat.com/en/documentation/red_hat_lightspeed/1-latest/html-single/red_hat_lightspeed_remediations_guide/index#creating-remediation-plans_red-hat-lightspeed-remediation-guide'
              }
              target="_blank"
              className="pf-v6-u-ml-sm pf-v6-u-font-size-sm"
            >
              Learn more
              <ExternalLinkAltIcon className="pf-v6-u-ml-sm" />
            </InsightsLink>
          </p>
        </div>
        <Form>
          <FormGroup label="Plan name" isRequired fieldId="playbook-select">
            <PlaybookSelect
              {...playbookSelect}
              isLoadingRemediationsList={isLoadingRemediationsList}
              exceedsLimits={exceedsLimits}
            />
            {wizardHelperText(exceedsLimits)}
          </FormGroup>
        </Form>

        <Divider className="pf-v6-u-my-lg" />

        <PlanSummaryHeader
          autoReboot={autoReboot}
          onAutoRebootChange={setAutoReboot}
        />

        <PlanSummaryCharts
          actionsCount={actionsCount}
          systemsCount={systemsCount}
          issuesCount={issuesCount}
          detailsLoading={detailsLoading}
          isExistingPlanSelected={isExistingPlanSelected}
        />

        {detailsLoading ? (
          <div className="pf-v6-u-mt-lg">
            <Skeleton height="120px" width="100%" />
          </div>
        ) : exceedsLimits ? (
          renderExceedsLimitsAlert({
            exceededSystems,
            exceededActions,
            systemsCount,
            actionsCount,
          })
        ) : (
          renderPreviewAlert({
            hasPlanSelection,
            onPreviewClick: handlePreview,
            previewStatus,
            previewLoading,
          })
        )}
      </ModalBody>
      <ModalFooter>
        <Flex gap={{ default: 'gapMd' }}>
          {!hasPlanSelection ? (
            <Tooltip content="Enter or select a name">
              <Button
                key="confirm"
                variant="primary"
                onClick={handleSubmit}
                isAriaDisabled={!hasPlanSelection}
              >
                {isExistingPlanSelected ? 'Update' : 'Create'} plan
              </Button>
            </Tooltip>
          ) : (
            <Button
              key="confirm"
              variant="primary"
              onClick={handleSubmit}
              isDisabled={!hasPlanSelection}
            >
              {isExistingPlanSelected ? 'Update' : 'Create'} plan
            </Button>
          )}
          <Button key="cancel" variant="link" onClick={handleClose}>
            Cancel
          </Button>
        </Flex>
      </ModalFooter>
    </>
  );

  const renderStatusContent = () => {
    if (submitError) {
      return (
        <ModalStatusContent
          status="error"
          errorType={submitError}
          isUpdate={errorIsUpdate}
          remediationId={errorRemediationId}
          onClose={handleCloseError}
          onViewPlan={handleViewPlan}
          progressTotalBatches={progressTotalBatches}
          progressCompletedBatches={progressCompletedBatches}
          progressFailedBatches={progressFailedBatches}
          progressErrors={progressErrors}
          progressIsComplete={progressIsComplete}
        />
      );
    }

    if (isSubmitting) {
      return (
        <ModalStatusContent
          status="progress"
          isUpdate={isExistingPlanSelected}
          progressTotalBatches={progressTotalBatches}
          progressCompletedBatches={progressCompletedBatches}
          progressFailedBatches={progressFailedBatches}
          progressErrors={progressErrors}
          progressIsComplete={progressIsComplete}
        />
      );
    }

    return null;
  };

  // Only show close button when not submitting (on mainContent or after error)
  let handleModalClose;
  if (isSubmitting) {
    handleModalClose = undefined;
  } else if (submitError) {
    handleModalClose = handleCloseError;
  } else {
    handleModalClose = handleClose;
  }

  return (
    <Modal
      isOpen={isOpen}
      variant={ModalVariant.medium}
      onClose={handleModalClose}
    >
      {renderStatusContent() || renderMainContent()}
    </Modal>
  );
};

RemediationWizardV2.propTypes = {
  setOpen: propTypes.func.isRequired,
  data: propTypes.shape({
    issues: propTypes.arrayOf(
      propTypes.shape({
        description: propTypes.string,
        id: propTypes.string,
      }),
    ),
    systems: propTypes.arrayOf(propTypes.string),
    onRemediationCreated: propTypes.func,
  }).isRequired,
  basePath: propTypes.string,
  isCompliancePrecedenceEnabled: propTypes.bool,
};

export default RemediationWizardV2;
