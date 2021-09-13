import React, { useEffect, useState, useContext } from 'react';
import { withRouter, Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import * as actions from '../actions';
import { downloadPlaybook } from '../api';
import RemediationDetailsTable from '../components/RemediationDetailsTable';
import SystemsTable from '../components/SystemsTable/SystemsTable';
import RemediationActivityTable from '../components/RemediationActivityTable';
import RemediationDetailsDropdown from '../components/RemediationDetailsDropdown';
import { normalizeStatus } from '../components/statusHelper';
import { isBeta } from '../config';
import { ExecutePlaybookButton } from '../containers/ExecuteButtons';
import { addNotification } from '@redhat-cloud-services/frontend-components-notifications/redux';
import useChrome from '@redhat-cloud-services/frontend-components/useChrome';
import UpsellBanner from '../components/Alerts/UpsellBanner';
import ActivityTabUpsell from '../components/EmptyStates/ActivityTabUpsell';
import DeniedState from '../components/DeniedState';
import SkeletonTable from '../skeletons/SkeletonTable';
import PlaybookToastAlerts, {
  generateUniqueId,
} from '../components/Alerts/PlaybookToastAlerts';
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

const tabMapper = ['issues', 'systems', 'activity'];

const RemediationDetails = ({
  match,
  location,
  selectedRemediation,
  selectedRemediationStatus,
  history,
  loadRemediation,
  loadRemediationStatus,
  switchAutoReboot,
  playbookRuns,
  getPlaybookRuns,
  checkExecutable,
  executable,
}) => {
  const id = match.params.id;
  const [upsellBannerVisible, setUpsellBannerVisible] = useState(
    localStorage.getItem('remediations:bannerStatus') !== 'dismissed'
  );
  const [noReceptorBannerVisible, setNoReceptorBannerVisible] = useState(
    localStorage.getItem('remediations:receptorBannerStatus') !== 'dismissed'
  );
  const [activeTabKey, setActiveTabKey] = useState(0);
  const [activeToastAlert, setActiveToastAlert] = useState({
    key: '',
    title: '',
    description: '',
    variant: '',
  });

  const context = useContext(PermissionContext);

  const { isFedramp } = useChrome();
  const handleUpsellToggle = () => {
    setUpsellBannerVisible(false);
    localStorage.setItem('remediations:bannerStatus', 'dismissed');
  };

  const handleNoReceptorToggle = () => {
    setNoReceptorBannerVisible(false);
    localStorage.setItem('remediations:receptorBannerStatus', 'dismissed');
  };

  const handleTabClick = (event, tabIndex) => {
    setActiveTabKey(tabIndex);
    history.push(`?${tabMapper[tabIndex]}`);
  };

  const getDisabledStateText = () => {
    if (!context.permissions.execute) {
      return 'You do not have the required execute permissions to perform this action.';
    } else if (!executable) {
      return 'Your account must be entitled to Smart Management to execute playbooks.';
    }
    return 'Unable to execute playbook.';
  };

  useEffect(() => {
    loadRemediation(id).catch((e) => {
      if (e && e.response && e.response.status === 404) {
        history.push('/');
        return;
      }

      throw e;
    });

    const tabIndex = tabMapper.findIndex(
      (item) => item === location.search.split('?')[1]
    );
    setActiveTabKey(tabIndex !== -1 ? tabIndex : 0);
    history.push(`?${tabMapper[tabIndex !== -1 ? tabIndex : 0]}`);

    if (isBeta) {
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

  if (remediation) {
    document.title = `${remediation.name} | Remediations | Red Hat Insights`;
  }

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
          {activeToastAlert.title && (
            <PlaybookToastAlerts
              key={activeToastAlert.key}
              title={activeToastAlert.title}
              description={activeToastAlert.description}
              variant={activeToastAlert.variant}
            />
          )}
          <Breadcrumb>
            <BreadcrumbItem>
              <Link to="/"> Remediations </Link>
            </BreadcrumbItem>
            <BreadcrumbItem isActive> {remediation.name} </BreadcrumbItem>
          </Breadcrumb>
          <Level className="ins-c-level">
            <LevelItem>
              <PageHeaderTitle title={remediation.name} />
            </LevelItem>
            <LevelItem>
              <Split hasGutter>
                <SplitItem>
                  <ExecutePlaybookButton
                    isDisabled={
                      !context.permissions.execute || !executable || isFedramp
                    }
                    disabledStateText={getDisabledStateText()}
                    remediationId={remediation.id}
                    remediationName={remediation.name}
                    setActiveAlert={setActiveToastAlert}
                  ></ExecutePlaybookButton>
                </SplitItem>
                <SplitItem>
                  <Button
                    isDisabled={!remediation.issues.length}
                    variant="secondary"
                    onClick={() => {
                      downloadPlaybook(remediation.id);
                      setActiveToastAlert({
                        key: generateUniqueId(),
                        title: 'Preparing playbook for download.',
                        description:
                          'Once complete, your download will start automatically.',
                        variant: 'info',
                      });
                    }}
                  >
                    Download playbook
                  </Button>
                </SplitItem>
                <SplitItem>
                  <RemediationDetailsDropdown
                    remediation={remediation}
                    setActiveAlert={setActiveToastAlert}
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
              <Tabs activeKey={activeTabKey} onSelect={handleTabClick}>
                <Tab eventKey={0} title="Actions">
                  <RemediationDetailsTable
                    remediation={remediation}
                    status={selectedRemediationStatus}
                    setActiveAlert={setActiveToastAlert}
                  />
                </Tab>
                <Tab eventKey={1} title="Systems">
                  <SystemsTable
                    remediation={remediation}
                    setActiveAlert={setActiveToastAlert}
                  />
                </Tab>
                <Tab eventKey={2} title="Activity">
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
  match: PropTypes.shape({
    params: PropTypes.shape({
      id: PropTypes.string.isRequired,
    }),
  }).isRequired,
  location: PropTypes.object,
  selectedRemediation: PropTypes.object,
  selectedRemediationStatus: PropTypes.object,
  history: PropTypes.object.isRequired,
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
};

export default withRouter(
  connect(
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
      loadRemediationStatus: (id) =>
        dispatch(actions.loadRemediationStatus(id)),
      // eslint-disable-next-line camelcase
      switchAutoReboot: (id, auto_reboot) =>
        dispatch(actions.patchRemediation(id, { auto_reboot })),
      deleteRemediation: (id) => dispatch(actions.deleteRemediation(id)),
      addNotification: (content) => dispatch(addNotification(content)),
      getPlaybookRuns: (id) => dispatch(actions.getPlaybookRuns(id)),
      checkExecutable: (id) => dispatch(actions.checkExecutable(id)),
    })
  )(RemediationDetails)
);
