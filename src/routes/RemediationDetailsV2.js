import React, { useContext, useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import useRemediationsQuery from '../api/useRemediationsQuery';
import { useAxiosWithPlatformInterceptors } from '@redhat-cloud-services/frontend-components-utilities/interceptors';
import { API_BASE } from '../config';
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

const getRemediations = (axios) => (params) => {
  return axios.get(`${API_BASE}/remediations/${params.remId}`, { params });
};
const getRemediationPlaybook = (axios) => (params) => {
  return axios.get(`${API_BASE}/remediations/${params.remId}/playbook_runs`, {
    params,
  });
};

const getRemediationPlaybookSystemsList = (axios) => (params) => {
  return axios.get(
    `${API_BASE}/remediations/${params.remId}/playbook_runs/${params.playbook_run_id}/systems`,
    {
      params,
    }
  );
};

const getPlaybookLogs = (axios) => (params) => {
  return axios.get(
    `${API_BASE}/remediations/${params.remId}/playbook_runs/${params.playbook_run_id}/systems/${params.system_id}`,
    {
      params,
    }
  );
};

const getRemediationsList = (axios) => () => {
  return axios.get(`${API_BASE}/remediations/?fields[data]=name`);
};

const updateRemediationPlans = (axios) => (params) => {
  const { id, ...updateData } = params;
  return axios.patch(`${API_BASE}/remediations/${id}`, updateData);
};

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
  const { result: remediationDetails, refetch: fetchRemediation } =
    useRemediationsQuery(getRemediations(axios), {
      params: { remId: id },
    });

  const { result: remediationPlaybookRuns } = useRemediationsQuery(
    getRemediationPlaybook(axios),
    {
      params: { remId: id },
    }
  );

  const { fetch: getRemediationPlaybookSystems } = useRemediationsQuery(
    getRemediationPlaybookSystemsList(axios),
    {
      skip: true,
    }
  );
  const { fetch: getRemediationPlaybookLogs } = useRemediationsQuery(
    getPlaybookLogs(axios),
    {
      skip: true,
    }
  );

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
    // checkExecutable(remediationDetails?.id);
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
              getRemediationPlaybookSystems={({ playbook_run_id }) =>
                getRemediationPlaybookSystems({ remId: id, playbook_run_id })
              }
              getRemediationPlaybookLogs={({ playbook_run_id, system_id }) =>
                getRemediationPlaybookLogs({
                  remId: id,
                  playbook_run_id,
                  system_id,
                })
              }
            />
          </Tab>
        </Tabs>
      </>
    )
  );
};

export default RemediationDetailsV2;
