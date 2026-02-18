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
}) => {
  const actionPoints = useMemo(() => {
    return calculateActionPointsFromSummary(details?.issue_count_details);
  }, [details?.issue_count_details]);

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
            To execute a remediation plan using Lightspeed it must be within the
            limit of 100 systems or 1000 action points. We recommend executing
            this plan with Red Hat® Ansible® Automation Platform for at-scale
            automation. You download the plan to run with Red Hat® Ansible®
            Automation Platform (AAP) or execute using a connected AAP
            integration.
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
};

export default DetailsGeneralContent;
