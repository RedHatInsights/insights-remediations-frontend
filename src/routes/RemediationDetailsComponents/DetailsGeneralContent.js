import React, { useMemo, useState, useEffect } from 'react';
import {
  Alert,
  AlertActionCloseButton,
  Grid,
  GridItem,
} from '@patternfly/react-core';
import PropTypes from 'prop-types';
import { calculateActionPointsFromSummary } from '../../components/helpers';
import { calculateExecutionLimits } from './helpers';
import DetailsCard from './DetailsCard';
import ProgressCard from './ProgressCard';

const DetailsGeneralContent = ({
  details,
  onRename,
  refetch,
  remediationStatus,
  updateRemPlan,
  onNavigateToTab,
  allRemediations,
  permissions,
  remediationPlaybookRuns,
  refetchAllRemediations,
  isPlaybookRunsLoading,
  actionPoints: actionPointsProp,
}) => {
  const actionPointsComputed = useMemo(() => {
    return calculateActionPointsFromSummary(details?.issue_count_details);
  }, [details?.issue_count_details]);

  const actionPoints =
    typeof actionPointsProp === 'number'
      ? actionPointsProp
      : actionPointsComputed;

  const executionLimits = useMemo(() => {
    return calculateExecutionLimits(details, actionPoints);
  }, [details, actionPoints]);

  const exceedsExecutionLimits =
    executionLimits?.exceedsExecutionLimits || false;
  const shouldShowAapAlert = exceedsExecutionLimits;

  const canExecute =
    permissions?.execute &&
    remediationStatus?.connectionError?.errors?.[0]?.status !== 403 &&
    remediationStatus?.connectionError?.errors?.[0]?.status !== 503 &&
    remediationStatus?.connectionError?.errors?.[0]?.code !==
      'DEPENDENCY_UNAVAILABLE' &&
    remediationStatus?.connectedSystems !== 0 &&
    !exceedsExecutionLimits;

  const [isAapAlertDismissed, setIsAapAlertDismissed] = useState(false);

  // Reset dismissed state when exceedsExecutionLimits changes from false to true
  useEffect(() => {
    if (exceedsExecutionLimits) {
      setIsAapAlertDismissed(false);
    }
  }, [exceedsExecutionLimits]);

  const handleAapAlertClose = () => {
    setIsAapAlertDismissed(true);
  };

  return (
    <section className="pf-v6-l-page__main-section pf-v6-c-page__main-section">
      {shouldShowAapAlert && !isAapAlertDismissed && (
        <Alert
          isInline
          variant="info"
          title="Remediate at scale with Red Hat Ansible Automation Platform (AAP)"
          className="pf-v6-u-mb-md"
          actionClose={
            <AlertActionCloseButton
              title="Close alert"
              onClose={handleAapAlertClose}
            />
          }
        >
          <p>
            We recommend executing this plan with Red Hat® Ansible® Automation
            Platform for at-scale automation. Download the plan to run with Red
            Hat® Ansible® Automation Platform (AAP) or execute using{' '}
            <a
              href="https://docs.redhat.com/en/documentation/red_hat_ansible_automation_platform/2.5/html/using_automation_execution/controller-setting-up-insights#controller-setting-up-insights"
              target="_blank"
              rel="noopener noreferrer"
            >
              a connected AAP integration
            </a>
            .
          </p>
          <p>
            <a
              href="http://sandbox.redhat.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              Get a 30-day free trial of Red Hat Ansible Automation Platform
            </a>
          </p>
        </Alert>
      )}

      <Grid hasGutter>
        <GridItem span={12} md={6}>
          <DetailsCard
            details={details}
            onRename={onRename}
            refetch={refetch}
            remediationStatus={remediationStatus}
            updateRemPlan={updateRemPlan}
            onNavigateToTab={onNavigateToTab}
            allRemediations={allRemediations}
            remediationPlaybookRuns={remediationPlaybookRuns}
            refetchAllRemediations={refetchAllRemediations}
            isPlaybookRunsLoading={isPlaybookRunsLoading}
          />
        </GridItem>
        <GridItem span={12} md={6}>
          <ProgressCard
            remediationStatus={remediationStatus}
            permissions={permissions}
            readyOrNot={canExecute}
            onNavigateToTab={onNavigateToTab}
            details={details}
            actionPoints={actionPoints}
          />
        </GridItem>
      </Grid>
    </section>
  );
};

DetailsGeneralContent.propTypes = {
  details: PropTypes.object.isRequired,
  onRename: PropTypes.func.isRequired,
  refetch: PropTypes.func.isRequired,
  remediationStatus: PropTypes.object.isRequired,
  updateRemPlan: PropTypes.func,
  onNavigateToTab: PropTypes.func,
  allRemediations: PropTypes.array,
  permissions: PropTypes.object,
  remediationPlaybookRuns: PropTypes.any,
  refetchAllRemediations: PropTypes.func,
  detailsLoading: PropTypes.bool,
  isPlaybookRunsLoading: PropTypes.bool,
  actionPoints: PropTypes.number,
};

export default DetailsGeneralContent;
