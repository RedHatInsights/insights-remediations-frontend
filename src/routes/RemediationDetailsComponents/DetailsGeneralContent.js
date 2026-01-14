import React, { useMemo, useState, useEffect } from 'react';
import {
  Alert,
  AlertActionCloseButton,
  Grid,
  GridItem,
} from '@patternfly/react-core';
import PropTypes from 'prop-types';
import { calculateActionPoints } from '../../components/helpers';
import { calculateExecutionLimits } from './helpers';
import DetailsCard from './DetailsCard';
import ProgressCard from './ProgressCard';

const DetailsGeneralContent = ({
  details,
  remediationDetailsFull,
  onRename,
  refetch,
  remediationStatus,
  updateRemPlan,
  onNavigateToTab,
  allRemediations,
  permissions,
  remediationPlaybookRuns,
  refetchAllRemediations,
  detailsLoading,
  remediationIssues,
}) => {
  const canExecute =
    permissions?.execute &&
    remediationStatus?.connectionError?.errors?.[0]?.status !== 403 &&
    remediationStatus?.connectedSystems !== 0;

  const isStillLoading =
    detailsLoading || remediationStatus?.areDetailsLoading || !permissions;
  const shouldShowAlert = !isStillLoading && !canExecute;

  const actionPoints = useMemo(() => {
    // TODO: Remove remediationDetailsFull when BE summary endpoint is completed
    const issues = remediationDetailsFull?.issues || remediationIssues || [];
    return calculateActionPoints(issues);
  }, [remediationDetailsFull, remediationIssues]);

  const executionLimits = useMemo(() => {
    return calculateExecutionLimits(details, actionPoints);
  }, [details, actionPoints]);

  const exceedsExecutionLimits =
    executionLimits?.exceedsExecutionLimits || false;
  const shouldShowAapAlert = exceedsExecutionLimits;

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
      {shouldShowAlert && (
        <Alert
          isInline
          variant="danger"
          title="Remediation plan cannot be executed"
          className="pf-v6-u-mb-sm"
        >
          <p>
            One or more prerequisites for executing this remediation plan were
            not met. See the <strong>Execution readiness</strong> section for
            more information.
          </p>
        </Alert>
      )}

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
              href="https://www.redhat.com/en/technologies/management/ansible/trial"
              target="_blank"
              rel="noopener noreferrer"
            >
              Get a 60-day free trial of Red Hat Ansible Automation Platform
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
          />
        </GridItem>
        <GridItem span={12} md={6}>
          <ProgressCard
            remediationStatus={remediationStatus}
            permissions={permissions}
            readyOrNot={canExecute}
            onNavigateToTab={onNavigateToTab}
            details={details}
            remediationDetailsFull={remediationDetailsFull}
            remediationIssues={remediationIssues}
          />
        </GridItem>
      </Grid>
    </section>
  );
};

DetailsGeneralContent.propTypes = {
  details: PropTypes.object.isRequired,
  remediationDetailsFull: PropTypes.object,
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
  remediationIssues: PropTypes.array,
};

export default DetailsGeneralContent;
