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
  Spinner,
  Bullseye,
} from '@patternfly/react-core';
import { DownloadIcon, ExternalLinkAltIcon } from '@patternfly/react-icons';
import useRemediationsQuery from '../../api/useRemediationsQuery';
import useRemediations from '../../Utilities/Hooks/api/useRemediations';
import { RemediationsPopover } from '../../routes/RemediationsPopover';
import {
  calculateActionPoints,
  handleRemediationSubmit,
  renderExceedsLimitsAlert,
  wizardHelperText,
  normalizeRemediationData,
  handlePlaybookPreview,
} from '../helpers';
import { remediationUrl } from '../../Utilities/utils';
import { PlanSummaryHeader } from './PlanSummaryHeader';
import { PlanSummaryCharts } from './PlanSummaryCharts';
import { PlaybookSelect } from './PlaybookSelect';
import { usePlaybookSelect } from './usePlaybookSelect';
import { useAddNotification } from '@redhat-cloud-services/frontend-components-notifications/hooks';
import InsightsLink from '@redhat-cloud-services/frontend-components/InsightsLink';
import { postPlaybookPreview } from '../../routes/api';
import { downloadFile } from '../../Utilities/helpers';

export const RemediationWizardV2 = ({ setOpen, data }) => {
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

  // Update counts when remediation details are fetched for an existing plan
  // or when creating a new plan with data prop
  useEffect(() => {
    // Calculate action points from normalized data issues
    const baseActionsPoints = calculateActionPoints(normalizedData?.issues);
    const baseSystemsCount = normalizedData?.systems?.length ?? 0;
    const baseIssuesCount = normalizedData?.issues?.length ?? 0;

    if (isExistingPlanSelected) {
      // Existing plan selected: add plan's counts to data prop counts
      if (remediationDetailsSummary) {
        // Plan details loaded: calculate points from plan issues and add to base
        const planIssues = remediationDetailsSummary.issues || [];
        const planActionsPoints = calculateActionPoints(planIssues);
        const planSystemsCount = remediationDetailsSummary.system_count ?? 0;
        const planIssuesCount = planIssues.length;
        setActionsCount(baseActionsPoints + planActionsPoints);
        setSystemsCount(baseSystemsCount + planSystemsCount);
        setIssuesCount(baseIssuesCount + planIssuesCount);
      } else {
        // Loading: reset to base counts while loading new plan data
        setActionsCount(baseActionsPoints);
        setSystemsCount(baseSystemsCount);
        setIssuesCount(baseIssuesCount);
      }
    } else {
      // Creating new plan or no plan selected: use counts from data prop
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
  const exceededActions = actionsCount > 1000;
  const exceededSystems = systemsCount > 100;

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
    setShowConfirmation(true);
  };

  const handleConfirmCancel = () => {
    setShowConfirmation(false);
    setIsOpen(false);
    setOpen(false);
  };

  const handleGoBack = () => {
    setShowConfirmation(false);
  };

  const handleSubmit = async () => {
    if (!hasPlanSelection) {
      return;
    }
    setIsSubmitting(true);
    setSubmitError(null);
    setErrorRemediationId(null);
    setErrorIsUpdate(false);
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
    setSubmitError(null);
    setErrorRemediationId(null);
    setErrorIsUpdate(false);
    setIsSubmitting(false);
  };

  const handleViewPlan = () => {
    if (errorRemediationId) {
      const url = remediationUrl(errorRemediationId);
      window.location.href = url;
    }
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
            'https://docs.redhat.com/en/documentation/red_hat_lightspeed/1-latest/html-single/red_hat_lightspeed_remediations_guide/index#creating-managing-playbooks_red-hat-lightspeed-remediation-guide'
          }
          target="_blank"
        >
          <Button
            icon={<ExternalLinkAltIcon />}
            variant="link"
            className="pf-v6-u-font-size-sm"
          >
            Learn More
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
          <Button key="cancel" variant="link" onClick={handleClose}>
            Cancel
          </Button>
        </Flex>
      </ModalFooter>
    </>
  );

  const renderConfirmationContent = () => (
    <>
      <ModalHeader
        title={'Are you sure you want to cancel?'}
        labelId="cancel-confirmation-title"
        titleIconVariant={'warning'}
      />
      <ModalBody>
        <span>
          The systems and actions you selected are not added to this remediation
          plan.
        </span>
      </ModalBody>
      <ModalFooter>
        <Flex gap={{ default: 'gapMd' }}>
          <Button key="yes" variant="primary" onClick={handleConfirmCancel}>
            Yes
          </Button>
          <Button key="no" variant="link" onClick={handleGoBack}>
            No, go back
          </Button>
        </Flex>
      </ModalFooter>
    </>
  );

  const renderSubmittingContent = () => (
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

  const renderErrorContent = () => {
    const isCompleteFailure = submitError === 'complete_failure';
    const isPartialFailure = submitError === 'partial_failure';
    const errorTitle = errorIsUpdate
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
              ? errorIsUpdate
                ? 'The plan update failed. The plan was not updated.'
                : 'The plan creation failed. The plan was not created.'
              : errorIsUpdate
                ? 'The plan was partially updated. Some of the selected items were not added to the plan. Review the plan for changes before execution.'
                : 'The plan was partially created. Some of the selected items were not added to the plan.'}
          </p>
        </ModalBody>
        <ModalFooter>
          <Flex gap={{ default: 'gapMd' }}>
            {isPartialFailure && errorRemediationId && (
              <Button variant="primary" onClick={handleViewPlan}>
                View plan
              </Button>
            )}
            <Button
              variant={
                isPartialFailure && errorRemediationId ? 'secondary' : 'primary'
              }
              onClick={handleCloseError}
            >
              Close
            </Button>
          </Flex>
        </ModalFooter>
      </>
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      variant={ModalVariant.medium}
      onClose={isSubmitting || submitError ? undefined : handleClose}
    >
      {submitError
        ? renderErrorContent()
        : isSubmitting
          ? renderSubmittingContent()
          : showConfirmation
            ? renderConfirmationContent()
            : renderMainContent()}
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
};

export default RemediationWizardV2;
