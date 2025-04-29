import React, { useContext, useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import useRemediationsQuery from '../api/useRemediationsQuery';
import { useAxiosWithPlatformInterceptors } from '@redhat-cloud-services/frontend-components-utilities/interceptors';
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
<<<<<<< HEAD
  getRemediationPlaybook,
  getRemediations,
  getRemediationsList,
  updateRemediationPlans,
} from './api';
=======
  getPlaybookLogs,
  getRemediationPlaybook,
  getRemediationPlaybookSystemsList,
  getRemediationsList,
  updateRemediationPlans,
} from './api';
import { getRemediations } from '../api';
>>>>>>> 112bd74 (fix execution button and clean up)

const RemediationDetailsV2 = () => {
  const chrome = useChrome();
  const { id } = useParams();
  const axios = useAxiosWithPlatformInterceptors();
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const { isFedramp } = chrome;
  const context = useContext(PermissionContext);

  const { result: allRemediations } = useRemediationsQuery(
    getRemediationsList(axios)
  );

  const { result: isExecutable } = useRemediationsQuery(
    checkExecutableStatus(axios),
    {
      params: { remId: id },
    }
  );

  const { result: remediationDetails, refetch: fetchRemediation } =
    useRemediationsQuery(getRemediations(axios), {
      params: { remId: id },
    });

  const { result: remediationPlaybookRuns, loading: isPlaybookRunsLoading } =
    useRemediationsQuery(getRemediationPlaybook(axios), {
      params: { remId: id },
    });

  const { fetch: updateRemPlan } = useRemediationsQuery(
    updateRemediationPlans(axios),
    {
      skip: true,
    }
  );

  useEffect(() => {
    remediationDetails &&
      chrome.updateDocumentTitle(
        `${remediationDetails.name} - Remediations - Automation`
      );
  }, [chrome, remediationDetails]);

  const [
    connectedSystems,
    totalSystems,
    areDetailsLoading,
    detailsError,
    connectedData,
  ] = useConnectionStatus({ id });

  const remediationStatus = {
    connectedSystems,
    totalSystems,
    areDetailsLoading,
    detailsError,
    connectedData,
  };

  const handleTabClick = (event, tabName) =>
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
          allRemediations={allRemediations}
          updateRemPlan={updateRemPlan}
          refetch={fetchRemediation}
          permissions={context.permissions}
          isExecutable={getIsExecutable(isExecutable)}
        />
        <Tabs
          activeKey={searchParams.get('activeTab') || 'general'}
          onSelect={handleTabClick}
          aria-label="Tabs in the default example"
          role="region"
        >
          {isRenameModalOpen && (
            <RenameModal
              remediation={remediationDetails}
              isRenameModalOpen={isRenameModalOpen}
              setIsRenameModalOpen={setIsRenameModalOpen}
              remediationsList={allRemediations.data}
              fetch={fetchRemediation}
            />
          )}

          <Tab
            eventKey={'general'}
            title={<TabTitleText>General</TabTitleText>}
            aria-label="GeneralTab"
          >
            <DetailsGeneralContent
              details={remediationDetails}
              onRename={setIsRenameModalOpen}
              refetch={fetchRemediation}
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
              refetch={fetchRemediation}
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
              refetch={fetchRemediation}
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
            />
          </Tab>
        </Tabs>
      </>
    )
  );
};

export default RemediationDetailsV2;
