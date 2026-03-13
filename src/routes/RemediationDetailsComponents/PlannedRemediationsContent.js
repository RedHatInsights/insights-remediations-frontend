import React, { useMemo, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Content,
  Flex,
  Label,
  Tab,
  Tabs,
  TabTitleText,
} from '@patternfly/react-core';
import { PlanSummaryCharts } from '../../components/RemediationWizardV2/PlanSummaryCharts';
import { calculateActionPointsFromSummary } from '../../components/helpers';
import { EXECUTION_LIMITS_DESCRIPTION } from './helpers';
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
  remediationId,
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
      <div
        style={{
          width: '100%',
          maxWidth: '1000px',
        }}
      >
        <Content component="h2" className="pf-v6-u-ml-md pf-v6-u-mt-md">
          Planned remediations{' '}
          {exceedsLimits && (
            <Label status="warning" variant="outline" className="pf-v6-u-ml-sm">
              Exceeds limits
            </Label>
          )}
        </Content>

        <Content component="p" className="pf-v6-u-ml-md">
          {EXECUTION_LIMITS_DESCRIPTION}
        </Content>
        <PlanSummaryCharts
          actionsCount={actionsCount}
          systemsCount={systemsCount}
          issuesCount={issuesCount}
          detailsLoading={detailsLoading}
          isExistingPlanSelected={true}
          smallerFont
        />
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
                  <span>Actions</span>
                </Flex>
              </TabTitleText>
            }
            aria-label="ActionsTab"
          >
            <ActionsContent
              refetch={refetchRemediationDetails}
              remediationId={remediationId}
              refetchRemediationDetails={refetchRemediationDetails}
            />
          </Tab>
          <Tab
            eventKey="systems"
            title={
              <TabTitleText>
                <Flex spaceItems={{ default: 'spaceItemsSm' }}>
                  <span>Systems</span>
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
  remediationId: PropTypes.string,
};

export default PlannedRemediationsContent;
