import React, { useMemo, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Content,
  Flex,
  Icon,
  Tab,
  Tabs,
  TabTitleText,
} from '@patternfly/react-core';
import { ExclamationCircleIcon } from '@patternfly/react-icons';
import { PlanSummaryCharts } from '../../components/RemediationWizardV2/PlanSummaryCharts';
import { calculateActionPoints } from '../../components/helpers';
import ActionsContent from './ActionsContent/ActionsContent';
import SystemsTable from '../../components/SystemsTable/SystemsTable';

const PlannedRemediationsContent = ({
  remediationDetailsSummary,
  remediationIssues,
  remediationStatus,
  refetchRemediationDetails,
  refetchConnectionStatus,
  detailsLoading,
  initialNestedTab = 'actions',
}) => {
  const [nestedActiveTab, setNestedActiveTab] = useState(initialNestedTab);

  // Sync nested tab when initialNestedTab prop changes (e.g., from URL navigation)
  useEffect(() => {
    setNestedActiveTab(initialNestedTab);
  }, [initialNestedTab]);

  // Calculate counts from remediation data
  const { actionsCount, systemsCount, issuesCount } = useMemo(() => {
    const issues = remediationIssues?.data || [];
    const actionsPoints = calculateActionPoints(issues);
    const systems = remediationDetailsSummary?.system_count || 0;
    const issuesTotal = remediationIssues?.meta?.total || issues.length;

    return {
      actionsCount: actionsPoints,
      systemsCount: systems,
      issuesCount: issuesTotal,
    };
  }, [remediationIssues, remediationDetailsSummary]);

  // Check if limits are exceeded
  const ACTIONS_MAX = 1000;
  const SYSTEMS_MAX = 100;
  const exceedsActionsLimit = actionsCount > ACTIONS_MAX;
  const exceedsSystemsLimit = systemsCount > SYSTEMS_MAX;

  const handleNestedTabClick = (_event, tabName) => {
    setNestedActiveTab(tabName);
  };

  return (
    <div>
      {/* Summary Charts */}
      <div style={{ maxWidth: '60%' }}>
        <Content component="h2" className="pf-v6-u-ml-md pf-v6-u-mt-md">
          Planned remediation action and systems
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
      </div>

      {/* Nested Tabs */}
      <Tabs
        activeKey={nestedActiveTab}
        onSelect={handleNestedTabClick}
        aria-label="Planned Remediations Nested Tabs"
        className="pf-v6-u-mt-lg"
        isBox
        variant="secondary"
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
          <ActionsContent refetch={refetchRemediationDetails} />
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
            className={'pf-v6-l-page__main-section pf-v6-c-page__main-section'}
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
  );
};

PlannedRemediationsContent.propTypes = {
  remediationDetailsSummary: PropTypes.object,
  remediationIssues: PropTypes.object,
  remediationStatus: PropTypes.object,
  refetchRemediationDetails: PropTypes.func,
  refetchConnectionStatus: PropTypes.func,
  detailsLoading: PropTypes.bool,
  initialNestedTab: PropTypes.string,
};

export default PlannedRemediationsContent;
