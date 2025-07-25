import React, { useContext, useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import useRemediationsQuery from '../api/useRemediationsQuery';
import { Tab, Tabs, TabTitleText } from '@patternfly/react-core';
import DetailsGeneralContent from './RemediationDetailsComponents/DetailsGeneralContent';
import RenameModal from '../components/RenameModal';
import { useConnectionStatus } from '../Utilities/useConnectionStatus';
import useChrome from '@redhat-cloud-services/frontend-components/useChrome';
import RemediationDetailsPageHeader from './RemediationDetailsComponents/DetailsPageHeader';
import { PermissionContext } from '../App';
import ActionsContent from './RemediationDetailsComponents/ActionsContent/ActionsContent';
// import SystemsContent from './RemediationDetailsComponents/SystemsContent/SystemsContent';
import SystemsTable from '../components/SystemsTable/SystemsTable';
import ExecutionHistoryTab from './RemediationDetailsComponents/ExecutionHistoryContent/ExecutionHistoryContent';
import {
  checkExecutableStatus,
  getRemediationDetails,
  getRemediationPlaybook,
  getRemediationsList,
  updateRemediationPlans,
} from './api';
import { useAxiosWithPlatformInterceptors } from '@redhat-cloud-services/frontend-components-utilities/interceptors';

const RemediationDetails = () => {
  const chrome = useChrome();
  const { id } = useParams();
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const { isFedramp } = chrome;
  const context = useContext(PermissionContext);
  const axios = useAxiosWithPlatformInterceptors();
  const { result: allRemediations, refetch: refetchAllRemediations } =
    useRemediationsQuery(getRemediationsList);

  const { result: isExecutable } = useRemediationsQuery(checkExecutableStatus, {
    params: { remId: id },
  });

  const {
    result: remediationDetails,
    refetch: refetchRemediationDetails,
    loading: detailsLoading,
  } = useRemediationsQuery(getRemediationDetails, {
    params: { remId: id },
  });

  const {
    result: remediationPlaybookRuns,
    loading: isPlaybookRunsLoading,
    refetch: refetchRemediationPlaybookRuns,
  } = useRemediationsQuery(getRemediationPlaybook, {
    params: { remId: id },
  });

  const { fetch: updateRemPlan } = useRemediationsQuery(
    updateRemediationPlans,
    {
      skip: true,
    },
  );

  useEffect(() => {
    remediationDetails &&
      chrome.updateDocumentTitle(
        `${remediationDetails.name} - Remediation Plans - Automation`,
      );
  }, [chrome, remediationDetails]);

  const [
    connectedSystems,
    totalSystems,
    areDetailsLoading,
    detailsError,
    connectedData,
  ] = useConnectionStatus(remediationDetails?.id, axios);

  const remediationStatus = {
    connectedSystems,
    totalSystems,
    areDetailsLoading,
    detailsError,
    connectedData,
  };

  const handleTabClick = (_event, tabName) =>
    setSearchParams({
      ...Object.fromEntries(searchParams),
      activeTab: tabName,
    });

  const getIsExecutable = (item) => String(item).trim().toUpperCase() === 'OK';
  return (
    remediationDetails && (
      <>
        <RemediationDetailsPageHeader
          remediation={remediationDetails}
          remediationStatus={remediationStatus}
          isFedramp={isFedramp}
          allRemediations={allRemediations?.data}
          refetchAllRemediations={refetchAllRemediations}
          updateRemPlan={updateRemPlan}
          refetch={refetchRemediationDetails}
          permissions={context.permissions}
          isExecutable={getIsExecutable(isExecutable)}
          refetchRemediationPlaybookRuns={refetchRemediationPlaybookRuns}
        />
        <Tabs
          activeKey={searchParams.get('activeTab') || 'general'}
          onSelect={handleTabClick}
          aria-label="Details Page Tabs"
          role="region"
        >
          {isRenameModalOpen && (
            <RenameModal
              remediation={remediationDetails}
              isRenameModalOpen={isRenameModalOpen}
              setIsRenameModalOpen={setIsRenameModalOpen}
              remediationsList={allRemediations?.data}
              fetch={refetchRemediationDetails}
            />
          )}

          <Tab
            eventKey={'general'}
            title={<TabTitleText>General</TabTitleText>}
            aria-label="GeneralTab"
          >
            <DetailsGeneralContent
              details={remediationDetails}
              refetchAllRemediations={refetchAllRemediations}
              onRename={setIsRenameModalOpen}
              refetch={refetchRemediationDetails}
              remediationStatus={remediationStatus}
              updateRemPlan={updateRemPlan}
              onNavigateToTab={handleTabClick}
              allRemediations={allRemediations}
              permissions={context.permissions}
              remediationPlaybookRuns={remediationPlaybookRuns?.data[0]}
            />
          </Tab>
          <Tab
            eventKey={'actions'}
            aria-label="ActionTab"
            title={<TabTitleText>Actions</TabTitleText>}
          >
            <ActionsContent
              remediationDetails={remediationDetails}
              refetch={refetchRemediationDetails}
              loading={detailsLoading}
            />
          </Tab>
          <Tab
            eventKey={'systems'}
            aria-label="SystemTab"
            title={<TabTitleText>Systems</TabTitleText>}
          >
            {/* We will eventually migrate away from systemsTable, and use SystemsContent */}
            {/* <SystemsContent
              remediationDetails={remediationDetails}
              remediationStatus={remediationStatus}
              refetch={refetchRemediationDetails}
            /> */}
            <section
              className={
                'pf-v5-l-page__main-section pf-v5-c-page__main-section'
              }
            >
              <SystemsTable
                remediation={remediationDetails}
                connectedData={remediationStatus?.connectedData}
                areDetailsLoading={remediationStatus?.areDetailsLoading}
                refreshRemediation={refetchRemediationDetails}
              />
            </section>
          </Tab>
          <Tab
            eventKey={'executionHistory'}
            aria-label="ExecutionHistoryTab"
            title={<TabTitleText>Execution History</TabTitleText>}
          >
            <ExecutionHistoryTab
              remediationPlaybookRuns={remediationPlaybookRuns}
              isPlaybookRunsLoading={isPlaybookRunsLoading}
              refetchRemediationPlaybookRuns={refetchRemediationPlaybookRuns}
            />
          </Tab>
        </Tabs>
      </>
    )
  );
};

export default RemediationDetails;
