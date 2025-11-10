import React, { useContext, useEffect, useState, useMemo } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import useRemediations from '../Utilities/Hooks/api/useRemediations';
import { updateRemediationWrapper } from './api';
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
import PlanNotFound from './RemediationDetailsComponents/PlanNotFound';
import { useAxiosWithPlatformInterceptors } from '@redhat-cloud-services/frontend-components-utilities/interceptors';

const RemediationDetails = () => {
  const chrome = useChrome();
  const { id } = useParams();

  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const [showPlanNotFound, setShowPlanNotFound] = useState(false);
  const { isFedramp } = chrome;
  const context = useContext(PermissionContext);
  const axios = useAxiosWithPlatformInterceptors();
  const { result: allRemediations, refetch: refetchAllRemediations } =
    useRemediations('getRemediations', {
      params: { fieldsData: ['name'] },
    });

  const allRemediationsData = useMemo(
    () => allRemediations?.data,
    [allRemediations?.data],
  );

  const { result: isExecutable } = useRemediations('checkExecutable', {
    params: { id },
  });

  const {
    result: remediationDetailsSummary,
    refetch: refetchRemediationDetails,
    loading: detailsLoading,
    error: remediationDetailsError,
  } = useRemediations('getRemediation', {
    params: { id, format: 'summary' },
  });

  const {
    result: remediationPlaybookRuns,
    loading: isPlaybookRunsLoading,
    refetch: refetchRemediationPlaybookRuns,
  } = useRemediations('listPlaybookRuns', {
    params: { id },
  });

  const { fetch: updateRemPlan } = useRemediations(
    updateRemediationWrapper,
    {
      skip: true,
    },
  );

  useEffect(() => {
    remediationDetailsSummary &&
      chrome.updateDocumentTitle(
        `${remediationDetailsSummary.name} - Remediation Plans - Automation`,
      );
  }, [chrome, remediationDetailsSummary]);

  useEffect(() => {
    if (remediationDetailsError) {
      const isNotFound =
        remediationDetailsError?.status === 404 ||
        remediationDetailsError?.status === 400 ||
        remediationDetailsError?.errors?.[0]?.status === 404 ||
        remediationDetailsError?.errors?.[0]?.status === 400;

      if (isNotFound) {
        setShowPlanNotFound(true);
      }
    }
  }, [remediationDetailsError]);

  const [
    connectedSystems,
    totalSystems,
    areDetailsLoading,
    detailsError,
    connectedData,
    refetchConnectionStatus,
  ] = useConnectionStatus(remediationDetailsSummary?.id, axios);

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

  if (showPlanNotFound) {
    return <PlanNotFound planId={id} />;
  }

  return (
    remediationDetailsSummary && (
      <>
        <RemediationDetailsPageHeader
          remediation={remediationDetailsSummary}
          remediationStatus={remediationStatus}
          isFedramp={isFedramp}
          allRemediations={allRemediationsData}
          refetchAllRemediations={refetchAllRemediations}
          updateRemPlan={updateRemPlan}
          refetchRemediationDetails={refetchRemediationDetails}
          permissions={context.permissions}
          isExecutable={getIsExecutable(isExecutable)}
          refetchRemediationPlaybookRuns={refetchRemediationPlaybookRuns}
          detailsLoading={detailsLoading}
        />
        <Tabs
          activeKey={searchParams.get('activeTab') || 'general'}
          onSelect={handleTabClick}
          aria-label="Details Page Tabs"
          role="region"
        >
          {isRenameModalOpen && (
            <RenameModal
              remediation={remediationDetailsSummary}
              isRenameModalOpen={isRenameModalOpen}
              setIsRenameModalOpen={setIsRenameModalOpen}
              remediationsList={allRemediationsData}
              fetch={refetchRemediationDetails}
            />
          )}

          <Tab
            eventKey={'general'}
            title={<TabTitleText>General</TabTitleText>}
            aria-label="GeneralTab"
          >
            <DetailsGeneralContent
              details={remediationDetailsSummary}
              refetchAllRemediations={refetchAllRemediations}
              onRename={setIsRenameModalOpen}
              refetch={refetchRemediationDetails}
              remediationStatus={remediationStatus}
              updateRemPlan={updateRemPlan}
              onNavigateToTab={handleTabClick}
              allRemediations={allRemediationsData}
              permissions={context.permissions}
              remediationPlaybookRuns={remediationPlaybookRuns?.data[0]}
              detailsLoading={detailsLoading}
            />
          </Tab>
          <Tab
            eventKey={'actions'}
            aria-label="ActionTab"
            title={<TabTitleText>Actions</TabTitleText>}
          >
            <ActionsContent refetch={refetchRemediationDetails} />
          </Tab>
          <Tab
            eventKey={'systems'}
            aria-label="SystemTab"
            title={<TabTitleText>Systems</TabTitleText>}
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
