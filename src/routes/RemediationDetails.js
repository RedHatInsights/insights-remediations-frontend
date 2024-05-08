import React, { useEffect, useState, useContext } from 'react';
import Link from '@redhat-cloud-services/frontend-components/InsightsLink';
import useNavigate from '@redhat-cloud-services/frontend-components-utilities/useInsightsNavigate';
import { useSearchParams, useParams } from 'react-router-dom';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import * as actions from '../actions';
import { downloadPlaybook } from '../api';
import RemediationDetailsTable from '../components/RemediationDetailsTable';
import SystemsTable from '../components/SystemsTable/SystemsTable';
import RemediationActivityTable from '../components/RemediationActivityTable';
import RemediationDetailsDropdown from '../components/RemediationDetailsDropdown';
import { normalizeStatus } from '../components/statusHelper';
import { ExecutePlaybookButton } from '../containers/ExecuteButtons';
import { addNotification } from '@redhat-cloud-services/frontend-components-notifications/redux';
import useChrome from '@redhat-cloud-services/frontend-components/useChrome';
import UpsellBanner from '../components/Alerts/UpsellBanner';
import ActivityTabUpsell from '../components/EmptyStates/ActivityTabUpsell';
import DeniedState from '../components/DeniedState';
import SkeletonTable from '../skeletons/SkeletonTable';
import '../components/Status.scss';
import {
  PageHeader,
  PageHeaderTitle,
} from '@redhat-cloud-services/frontend-components/PageHeader';
import { Main } from '@redhat-cloud-services/frontend-components/Main';
import { InvalidObject } from '@redhat-cloud-services/frontend-components/InvalidObject';

import {
  Stack,
  StackItem,
  Level,
  LevelItem,
  Breadcrumb,
  BreadcrumbItem,
  Button,
  Split,
  SplitItem,
  Tabs,
  Tab,
} from '@patternfly/react-core';

import RemediationDetailsSkeleton from '../skeletons/RemediationDetailsSkeleton';
import EmptyActivityTable from '../components/EmptyStates/EmptyActivityTable';

import { PermissionContext } from '../App';

import './RemediationDetails.scss';
import NoReceptorBanner from '../components/Alerts/NoReceptorBanner';
import { RemediationSummary } from '../components/RemediationSummary';
import { dispatchNotification } from '../Utilities/dispatcher';
import { useConnectionStatus } from '../Utilities/useConnectionStatus';
import { useRemediationsList } from '../Utilities/useRemediationsList';

const RemediationDetails = ({
  selectedRemediation,
  selectedRemediationStatus,
  loadRemediation,
  loadRemediationStatus,
  switchAutoReboot,
  playbookRuns,
  getPlaybookRuns,
  checkExecutable,
  executable,
}) => {
  const chrome = useChrome();
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  const { isFedramp, isBeta } = chrome;
  const context = useContext(PermissionContext);

  const [upsellBannerVisible, setUpsellBannerVisible] = useState(
    localStorage.getItem('remediations:bannerStatus') !== 'dismissed'
  );
  const [noReceptorBannerVisible, setNoReceptorBannerVisible] = useState(
    localStorage.getItem('remediations:receptorBannerStatus') !== 'dismissed'
  );

  const handleUpsellToggle = () => {
    setUpsellBannerVisible(false);
    localStorage.setItem('remediations:bannerStatus', 'dismissed');
  };

  const handleNoReceptorToggle = () => {
    setNoReceptorBannerVisible(false);
    localStorage.setItem('remediations:receptorBannerStatus', 'dismissed');
  };

  const handleTabClick = (event, tabName) =>
    setSearchParams({
      ...Object.fromEntries(searchParams),
      activeTab: tabName,
    });

  useEffect(() => {
    loadRemediation(id).catch((e) => {
      if (e && e.response && e.response.status === 404) {
        navigate('/');
        return;
      }

      throw e;
    });

    if (isBeta?.()) {
      loadRemediationStatus(id);
    }
    checkExecutable(id);
  }, []);

  useEffect(() => {
    getPlaybookRuns(id);
  }, [getPlaybookRuns]);

  useEffect(() => {
    playbookRuns;
    if (
      playbookRuns &&
      playbookRuns.length &&
      normalizeStatus(playbookRuns[0].status) === 'running'
    ) {
      const interval = setInterval(() => getPlaybookRuns(id), 10000);
      return () => {
        clearInterval(interval);
      };
    }
  }, [playbookRuns]);

  const renderActivityState = (isEntitled, playbookRuns, remediation) => {
    if (!isEntitled) {
      return <ActivityTabUpsell />;
    }

    if (Array.isArray(playbookRuns) && playbookRuns.length) {
      return (
        <RemediationActivityTable
          remediation={remediation}
          playbookRuns={playbookRuns}
        />
      );
    }

    if (Array.isArray(playbookRuns) && !playbookRuns.length) {
      return <EmptyActivityTable />;
    }

    return <SkeletonTable />;
  };

  const { status, remediation } = selectedRemediation;

  const [
    connectedSystems,
    totalSystems,
    areDetailsLoading,
    detailsError,
    connectedData,
  ] = useConnectionStatus(remediation);

  const remediationsList = useRemediationsList(remediation);

  useEffect(() => {
    remediation &&
      chrome.updateDocumentTitle(
        `${remediation.name} - Remediations - Automation`
      );
  }, [chrome, remediation]);

  if (status !== 'fulfilled' && status !== 'rejected') {
    return <RemediationDetailsSkeleton />;
  }

  if (status === 'rejected') {
    return <InvalidObject />;
  }

  if (status === 'fulfilled') {
    return context.permissions.read === false ? (
      <DeniedState />
    ) : (
      <div className="page__remediation-details">
        <PageHeader>
          <Breadcrumb>
            <BreadcrumbItem>
              <Link to="/"> Remediations </Link>
            </BreadcrumbItem>
            <BreadcrumbItem isActive> {remediation.name} </BreadcrumbItem>
          </Breadcrumb>
          <Level className="rem-l-level">
            <LevelItem>
              <PageHeaderTitle title={remediation.name} />
            </LevelItem>
            <LevelItem>
              <Split hasGutter>
                <SplitItem>
                  <ExecutePlaybookButton
                    isDisabled={
                      connectedSystems === 0 ||
                      !context.permissions.execute ||
                      !executable ||
                      isFedramp
                    }
                    connectedSystems={connectedSystems}
                    totalSystems={totalSystems}
                    areDetailsLoading={areDetailsLoading}
                    detailsError={detailsError}
                    permissions={context.permissions.execute}
                    remediation={remediation}
                  ></ExecutePlaybookButton>
                </SplitItem>
                <SplitItem>
                  <Button
                    isDisabled={!remediation.issues.length}
                    variant="secondary"
                    onClick={() => {
                      downloadPlaybook(remediation.id);
                      dispatchNotification({
                        title: 'Preparing playbook for download.',
                        description:
                          'Once complete, your download will start automatically.',
                        variant: 'info',
                        dismissable: true,
                        autoDismiss: true,
                      });
                    }}
                  >
                    Download playbook
                  </Button>
                </SplitItem>
                <SplitItem>
                  <RemediationDetailsDropdown
                    remediation={remediation}
                    remediationsList={remediationsList}
                  />
                </SplitItem>
              </Split>
            </LevelItem>
          </Level>
          <RemediationSummary
            remediation={remediation}
            playbookRuns={playbookRuns}
            switchAutoReboot={switchAutoReboot}
            context={context}
          />
        </PageHeader>
        <Main>
          <Stack hasGutter>
            {!executable && upsellBannerVisible && (
              <StackItem>
                <UpsellBanner onClose={() => handleUpsellToggle()} />
              </StackItem>
            )}
            {executable && noReceptorBannerVisible && (
              <StackItem>
                <NoReceptorBanner onClose={() => handleNoReceptorToggle()} />
              </StackItem>
            )}
            <StackItem className="ins-c-playbookSummary__tabs">
              <Tabs
                activeKey={searchParams.get('activeTab') || 'issues'}
                onSelect={handleTabClick}
              >
                <Tab eventKey={'issues'} title="Actions">
                  <RemediationDetailsTable
                    remediation={remediation}
                    status={selectedRemediationStatus}
                  />
                </Tab>
                <Tab eventKey={'systems'} title="Systems">
                  <SystemsTable
                    remediation={remediation}
                    connectedData={connectedData}
                  />
                </Tab>
                <Tab eventKey={'activity'} title="Activity">
                  {renderActivityState(executable, playbookRuns, remediation)}
                </Tab>
              </Tabs>
            </StackItem>
          </Stack>
        </Main>
      </div>
    );
  }
};

RemediationDetails.propTypes = {
  selectedRemediation: PropTypes.object,
  selectedRemediationStatus: PropTypes.object,
  loadRemediation: PropTypes.func.isRequired,
  loadRemediationStatus: PropTypes.func.isRequired,
  switchAutoReboot: PropTypes.func.isRequired,
  deleteRemediation: PropTypes.func.isRequired,
  executePlaybookBanner: PropTypes.shape({
    isVisible: PropTypes.bool,
  }),
  addNotification: PropTypes.func.isRequired,
  playbookRuns: PropTypes.array,
  getPlaybookRuns: PropTypes.func,
  checkExecutable: PropTypes.func,
  executable: PropTypes.object,
};

export default connect(
  ({
    selectedRemediation,
    selectedRemediationStatus,
    executePlaybookBanner,
    playbookRuns,
    executable,
  }) => ({
    selectedRemediation,
    selectedRemediationStatus,
    executePlaybookBanner,
    playbookRuns: playbookRuns.data,
    remediation: selectedRemediation.remediation,
    executable,
  }),
  (dispatch) => ({
    loadRemediation: (id) => dispatch(actions.loadRemediation(id)),
    loadRemediationStatus: (id) => dispatch(actions.loadRemediationStatus(id)),
    // eslint-disable-next-line camelcase
    switchAutoReboot: (id, auto_reboot) =>
      dispatch(actions.patchRemediation(id, { auto_reboot })),
    deleteRemediation: (id) => dispatch(actions.deleteRemediation(id)),
    addNotification: (content) => dispatch(addNotification(content)),
    getPlaybookRuns: (id) => dispatch(actions.getPlaybookRuns(id)),
    checkExecutable: (id) => dispatch(actions.checkExecutable(id)),
  })
)(RemediationDetails);
