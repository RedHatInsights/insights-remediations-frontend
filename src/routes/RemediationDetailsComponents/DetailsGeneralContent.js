import React, { useState, useMemo } from 'react';
import {
  Alert,
  AlertActionCloseButton,
  Grid,
  GridItem,
} from '@patternfly/react-core';
import PropTypes from 'prop-types';
import DetailsCard from './DetailsCard';
import ProgressCard from './ProgressCard';
import { calculateActionPoints } from '../../components/helpers';
import { calculateExecutionLimits } from './helpers';

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
  detailsLoading,
  remediationIssues,
}) => {
  const [aapAlertOpen, setAapAlertOpen] = useState(true);

  const canExecute =
    permissions?.execute &&
    remediationStatus?.detailsError !== 403 &&
    remediationStatus?.connectedSystems !== 0;

  const isStillLoading =
    detailsLoading || remediationStatus?.areDetailsLoading || !permissions;
  const shouldShowAlert = !isStillLoading && !canExecute;

  // const actionPoints = useMemo(() => {
  //   return calculateActionPoints(remediationIssues);
  // }, [remediationIssues]);

  // const executionLimits = useMemo(() => {
  //   return calculateExecutionLimits(details, actionPoints);
  // }, [details, actionPoints]);

  const shouldShowAapAlert = true;
  // !isStillLoading && aapAlertOpen && executionLimits.exceedsExecutionLimits;

  return (
    <section className="pf-v6-l-page__main-section pf-v6-c-page__main-section">
      {shouldShowAlert && (
        <Alert
          isInline
          variant="danger"
          title="Remediation plan cannot be executed"
          className="pf-v6-u-mb-md"
        >
          <p>
            One or more prerequisites for executing this remediation plan were
            not met. See the <strong>Execution readiness</strong> section for
            more information.
          </p>
        </Alert>
      )}

      {shouldShowAapAlert && (
        <Alert
          isInline
          variant="info"
          title="Remediate at scale with Red Hat Ansible Automation Platform (AAP)"
          className="pf-v6-u-mb-md"
          actionClose={
            <AlertActionCloseButton
              title="Close alert"
              onClose={() => setAapAlertOpen(false)}
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
            remediationIssues={remediationIssues}
          />
        </GridItem>
        <GridItem span={12} md={6}>
          <ProgressCard
            remediationStatus={remediationStatus}
            permissions={permissions}
            readyOrNot={canExecute}
            onNavigateToTab={onNavigateToTab}
            details={details}
            remediationIssues={remediationIssues}
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
  remediationIssues: PropTypes.array,
};

export default DetailsGeneralContent;
