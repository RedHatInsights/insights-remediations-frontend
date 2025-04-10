import React, { useContext, useEffect, useState } from 'react';
import TableStateProvider from '../Frameworks/AsyncTableTools/AsyncTableTools/components/TableStateProvider';
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

const getRemediations = (axios) => (params) => {
  return axios.get(`${API_BASE}/remediations/${params.remId}`, { params });
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
  const { result: remediationDetails, refetch: fetchRemediations } =
    useRemediationsQuery(getRemediations(axios), {
      params: { remId: id },
      // params: { hide_archived: showArchived, 'fields[data]': 'playbook_runs' },
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
              fetch={fetchRemediations}
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
              refetch={fetchRemediations}
              remediationStatus={remediationStatus}
              updateRemPlan={updateRemPlan}
              onNavigateToTab={handleTabClick}
              allRemediations={allRemediations}
              permissions={context.permissions}
            />
          </Tab>
          <Tab
            eventKey={'actions'}
            aria-label="ActionTab"
            title={<TabTitleText>Actions</TabTitleText>}
          >
            Content here for Actions
          </Tab>
          <Tab
            eventKey={'systems'}
            aria-label="SystemTab"
            title={<TabTitleText>Systems</TabTitleText>}
          >
            Content here for Systems
          </Tab>
          <Tab
            eventKey={'executionHistory'}
            aria-label="ExecutionHistoryTab"
            title={<TabTitleText>Execution History</TabTitleText>}
          >
            Content here for Exec History
          </Tab>
        </Tabs>
      </>
    )
  );
};

const RemediationDetailsProvider = () => {
  return (
    <TableStateProvider>
      <RemediationDetailsV2 />
    </TableStateProvider>
  );
};

export default RemediationDetailsProvider;
