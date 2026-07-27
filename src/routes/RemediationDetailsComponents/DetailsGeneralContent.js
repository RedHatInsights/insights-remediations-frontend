import React, { useMemo, useState, useEffect } from 'react';
import {
  Alert,
  AlertActionCloseButton,
  Flex,
  FlexItem,
  Grid,
  GridItem,
} from '@patternfly/react-core';
import PropTypes from 'prop-types';
import useChrome from '@redhat-cloud-services/frontend-components/useChrome';
import { calculateActionPointsFromSummary } from '../../components/helpers';
import { calculateExecutionLimits } from './helpers';
import DetailsCard from './DetailsCard';
import ProgressCard from './ProgressCard';
import ActivityCard from './ActivityCard';

const DetailsGeneralContent = ({
  details,
  refetch,
  remediationStatus,
  updateRemPlan,
  onNavigateToTab,
  allRemediations,
  permissions,
  lastRemediationPlaybookRun,
  refetchAllRemediations,
  isPlaybookRunsLoading,
  retentionPolicyRefreshNonce,
  actionPoints: actionPointsProp,
}) => {
  const chrome = useChrome();
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
    !remediationStatus?.connectionError &&
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
              onClick={() =>
                chrome.analytics?.track(
                  'remediations - AAP Trial Link Clicked',
                  {
                    module: 'remediations',
                    remediation_id: details.id,
                  },
                )
              }
            >
              Get a 30-day free trial of Red Hat Ansible Automation Platform
            </a>
          </p>
        </Alert>
      )}

      <Grid hasGutter>
        <GridItem span={12} md={6}>
          <Flex
            direction={{ default: 'column' }}
            spaceItems={{ default: 'spaceItemsMd' }}
          >
            <FlexItem>
              <DetailsCard
                details={details}
                refetch={refetch}
                updateRemPlan={updateRemPlan}
                onNavigateToTab={onNavigateToTab}
                allRemediations={allRemediations}
                refetchAllRemediations={refetchAllRemediations}
              />
            </FlexItem>
            <FlexItem>
              <ActivityCard
                details={details}
                lastRemediationPlaybookRun={lastRemediationPlaybookRun}
                isPlaybookRunsLoading={isPlaybookRunsLoading}
                onNavigateToTab={onNavigateToTab}
                retentionPolicyRefreshNonce={retentionPolicyRefreshNonce}
              />
            </FlexItem>
          </Flex>
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
  refetch: PropTypes.func.isRequired,
  remediationStatus: PropTypes.object.isRequired,
  updateRemPlan: PropTypes.func,
  onNavigateToTab: PropTypes.func,
  allRemediations: PropTypes.array,
  permissions: PropTypes.object,
  lastRemediationPlaybookRun: PropTypes.any,
  refetchAllRemediations: PropTypes.func,
  isPlaybookRunsLoading: PropTypes.bool,
  retentionPolicyRefreshNonce: PropTypes.number,
  actionPoints: PropTypes.number,
};

export default DetailsGeneralContent;
