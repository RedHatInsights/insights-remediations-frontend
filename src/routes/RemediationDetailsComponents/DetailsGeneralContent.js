import React from 'react';
import { Alert, Grid, GridItem } from '@patternfly/react-core';
import PropTypes from 'prop-types';
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
  detailsLoading,
  remediationIssues,
}) => {
  const canExecute =
    permissions?.execute &&
    remediationStatus?.detailsError !== 403 &&
    remediationStatus?.connectedSystems !== 0;

  const isStillLoading =
    detailsLoading || remediationStatus?.areDetailsLoading || !permissions;
  const shouldShowAlert = !isStillLoading && !canExecute;

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
