import React, { useMemo, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Content,
  Flex,
  HelperText,
  HelperTextItem,
  Icon,
  Label,
  Tab,
  Tabs,
  TabTitleText,
} from '@patternfly/react-core';
import { ExclamationCircleIcon } from '@patternfly/react-icons';
import { PlanSummaryCharts } from '../../components/RemediationWizardV2/PlanSummaryCharts';
import { calculateActionPointsFromSummary } from '../../components/helpers';
import ActionsContent from './ActionsContent/ActionsContent';
import SystemsTable from '../../components/SystemsTable/SystemsTable';
import './PlannedRemediationsContent.scss';

const PlannedRemediationsContent = ({
  remediationDetailsSummary,
  remediationStatus,
  refetchRemediationDetails,
  refetchConnectionStatus,
  detailsLoading,
  initialNestedTab = 'actions',
  onOpenResolutionDrawer,
  selectedIssueForResolutionId,
}) => {
  const [nestedActiveTab, setNestedActiveTab] = useState(initialNestedTab);

  // Sync nested tab when initialNestedTab prop changes (e.g., from URL navigation)
  useEffect(() => {
    setNestedActiveTab(initialNestedTab);
  }, [initialNestedTab]);

  // Use summary endpoint data for counts
  const { actionsCount, systemsCount, issuesCount } = useMemo(() => {
    const actionsPoints = calculateActionPointsFromSummary(
      remediationDetailsSummary?.issue_count_details,
    );
    const systems = remediationDetailsSummary?.system_count || 0;
    const issuesTotal = remediationDetailsSummary?.issue_count || 0;

    return {
      actionsCount: actionsPoints,
      systemsCount: systems,
      issuesCount: issuesTotal,
    };
  }, [remediationDetailsSummary]);

  // Check if limits are exceeded
  const ACTIONS_MAX = 1000;
  const SYSTEMS_MAX = 100;
  const exceedsActionsLimit = actionsCount > ACTIONS_MAX;
  const exceedsSystemsLimit = systemsCount > SYSTEMS_MAX;
  const exceedsLimits = exceedsActionsLimit || exceedsSystemsLimit;

  const handleNestedTabClick = (_event, tabName) => {
    setNestedActiveTab(tabName);
  };

  return (
    <div>
      {/* Summary Charts */}
      <div style={{ width: '100%', maxWidth: '1000px' }}>
        <Content component="h2" className="pf-v6-u-ml-md pf-v6-u-mt-md">
          Planned remediation action and systems{' '}
          {exceedsLimits && (
            <Label status="danger" variant="outline" className="pf-v6-u-ml-sm">
              Exceeds limits
            </Label>
          )}
        </Content>

        <Content component="p" className="pf-v6-u-ml-md">
          To execute a remediation plan using Lightspeed, it must be within the
          limit of 100 systems and 1000 action points.
        </Content>
        <PlanSummaryCharts
          actionsCount={actionsCount}
          systemsCount={systemsCount}
          issuesCount={issuesCount}
          detailsLoading={detailsLoading}
          isExistingPlanSelected={true}
          smallerFont
        />
        <HelperText className="pf-v6-u-mt-sm pf-v6-u-ml-md">
          <HelperTextItem>
            *Action points (pts) per issue type: Advisor: 20 pts, Vulnerability:
            20 pts, Patch: 2 pts, and Compliance: 5 pts
          </HelperTextItem>
        </HelperText>
      </div>
      {/* Nested Tabs */}
      <div className="ins-c-planned-remediations-tabs">
        <Tabs
          activeKey={nestedActiveTab}
          onSelect={handleNestedTabClick}
          aria-label="Planned Remediations Nested Tabs"
          className="pf-v6-u-mt-lg"
          isBox
        >
          <Tab
            eventKey="actions"
            title={
              <TabTitleText>
                <Flex spaceItems={{ default: 'spaceItemsSm' }}>
                  {exceedsActionsLimit && (
                    <Icon status="danger">
                      <ExclamationCircleIcon />
                    </Icon>
                  )}
                  <span>{issuesCount} actions</span>
                </Flex>
              </TabTitleText>
            }
            aria-label="ActionsTab"
          >
            <ActionsContent
              refetch={refetchRemediationDetails}
              onOpenResolutionDrawer={onOpenResolutionDrawer}
              selectedIssueForResolutionId={selectedIssueForResolutionId}
            />
          </Tab>
          <Tab
            eventKey="systems"
            title={
              <TabTitleText>
                <Flex spaceItems={{ default: 'spaceItemsSm' }}>
                  {exceedsSystemsLimit && (
                    <Icon status="danger">
                      <ExclamationCircleIcon />
                    </Icon>
                  )}
                  <span>{systemsCount} systems</span>
                </Flex>
              </TabTitleText>
            }
            aria-label="SystemsTab"
          >
            <section
              className={
                'pf-v6-l-page__main-section pf-v6-c-page__main-section'
              }
            >
              <SystemsTable
                remediation={remediationDetailsSummary}
                connectedData={remediationStatus?.connectedData}
                areDetailsLoading={remediationStatus?.areDetailsLoading}
                refreshRemediation={refetchRemediationDetails}
                refetchConnectionStatus={refetchConnectionStatus}
              />
            </section>
          </Tab>
        </Tabs>
      </div>
    </div>
  );
};

PlannedRemediationsContent.propTypes = {
  remediationDetailsSummary: PropTypes.object,
  remediationStatus: PropTypes.object,
  refetchRemediationDetails: PropTypes.func,
  refetchConnectionStatus: PropTypes.func,
  detailsLoading: PropTypes.bool,
  initialNestedTab: PropTypes.string,
  onOpenResolutionDrawer: PropTypes.func,
  selectedIssueForResolutionId: PropTypes.string,
};

export default PlannedRemediationsContent;
