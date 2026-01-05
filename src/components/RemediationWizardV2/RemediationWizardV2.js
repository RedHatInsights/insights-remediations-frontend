import React, { useState, useEffect, useMemo } from 'react';
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
  HelperText,
  HelperTextItem,
  Tooltip,
  Flex,
} from '@patternfly/react-core';
import { DownloadIcon, ExternalLinkAltIcon } from '@patternfly/react-icons';
import useRemediationsQuery from '../../api/useRemediationsQuery';
import useRemediations from '../../Utilities/Hooks/api/useRemediations';
import { RemediationsPopover } from '../../routes/RemediationsPopover';
import {
  calculateActionPoints,
  calculateActionPointsFromBoth,
  handleRemediationSubmit,
  renderExceedsLimitsAlert,
  wizardHelperText,
  normalizeRemediationData,
  handlePlaybookPreview,
  navigateToRemediation,
  countUniqueSystemsFromBoth,
  countUniqueIssuesFromBoth,
} from '../helpers';
import { remediationUrl } from '../../Utilities/utils';
import { PlanSummaryHeader } from './PlanSummaryHeader';
import { PlanSummaryCharts } from './PlanSummaryCharts';
import { PlaybookSelect } from './PlaybookSelect';
import { usePlaybookSelect } from './usePlaybookSelect';
import ModalStatusContent from './ModalStatusContent';
import { useAddNotification } from '@redhat-cloud-services/frontend-components-notifications/hooks';
import InsightsLink from '@redhat-cloud-services/frontend-components/InsightsLink';
import { postPlaybookPreview } from '../../routes/api';
import { downloadFile } from '../../Utilities/helpers';

export const RemediationWizardV2 = ({
  setOpen,
  data,
  isCompliancePrecedenceEnabled,
}) => {
  const addNotification = useAddNotification();
  const [isOpen, setIsOpen] = useState(true);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null); // 'complete_failure' | 'partial_failure'
  const [errorRemediationId, setErrorRemediationId] = useState(null);
  const [errorIsUpdate, setErrorIsUpdate] = useState(false);
  const [autoReboot, setAutoReboot] = useState(true);
  const [actionsCount, setActionsCount] = useState(0);
  const [systemsCount, setSystemsCount] = useState(0);
  const [issuesCount, setIssuesCount] = useState(0);

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

  const handleRequestClose = () => {
    setShowConfirmation(true);
  };

  const handleConfirmClose = () => {
    setShowConfirmation(false);
    setIsOpen(false);
    setOpen(false);
  };

  const handleGoBack = () => {
    setShowConfirmation(false);
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
      });
      if (
        result?.success &&
        result?.status === 'success' &&
        result?.remediationId
      ) {
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
    resetErrorState();
    setIsSubmitting(false);
  };

  const handleViewPlan = () => {
    navigateToRemediation(errorRemediationId);
  };
  const handlePreview = () => {
    handlePlaybookPreview({
      hasPlanSelection,
      isExistingPlanSelected,
      remediationDetailsSummary,
      data,
      autoReboot,
      postPlaybookPreview,
      addNotification,
      inputValue,
      selected,
      allRemediationsData,
      downloadFile,
      isCompliancePrecedenceEnabled,
    });
  };

  const renderMainContent = () => (
    <>
      <ModalHeader
        title={
          <>
            Plan a remediation <RemediationsPopover />
          </>
        }
        labelId="plan-a-remediation-title"
      />
      <ModalBody id="create-a-remediation-body">
        <span>
          Create or update a plan to remediate issues identified by Red Hat
          Lightspeed using Ansible playbooks. Once you generate a plan, you can
          review, download, or execute the plan.
        </span>
        <InsightsLink
          to={
            'https://docs.redhat.com/en/documentation/red_hat_lightspeed/1-latest/html-single/red_hat_lightspeed_remediations_guide/index#creating-remediation-plans_red-hat-lightspeed-remediation-guide'
          }
          target="_blank"
        >
          <Button
            icon={<ExternalLinkAltIcon />}
            variant="link"
            className="pf-v6-u-font-size-sm"
          >
            Learn more
          </Button>{' '}
        </InsightsLink>
        <Form>
          <FormGroup
            label="Select or create a playbook"
            isRequired
            fieldId="playbook-select"
          >
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
        <HelperText className="pf-v6-u-mt-sm">
          <HelperTextItem>
            *Action points (pts) per issue type: Advisor: 20 pts, Vulnerability:
            20 pts, Patch: 2 pts, and Compliance: 5 pts
          </HelperTextItem>
        </HelperText>
        {exceedsLimits &&
          renderExceedsLimitsAlert({
            exceededSystems,
            exceededActions,
            systemsCount,
            actionsCount,
          })}
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
          <Button
            key="preview"
            variant="secondary"
            onClick={handlePreview}
            isDisabled={!hasPlanSelection}
          >
            Preview <DownloadIcon size="md" />
          </Button>
          <Button key="cancel" variant="link" onClick={handleRequestClose}>
            Cancel
          </Button>
        </Flex>
      </ModalFooter>
    </>
  );

  //TODO: implement new UX copy once completed
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
        />
      );
    }

    if (isSubmitting) {
      return <ModalStatusContent status="submitting" />;
    }

    if (showConfirmation) {
      return (
        <ModalStatusContent
          status="confirmation"
          onConfirm={handleConfirmClose}
          onCancel={handleGoBack}
        />
      );
    }

    return null;
  };

  return (
    <Modal
      isOpen={isOpen}
      variant={ModalVariant.medium}
      onClose={isSubmitting || submitError ? undefined : handleRequestClose}
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
