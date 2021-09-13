/* eslint-disable camelcase */

import React, { useEffect, useContext } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { Main } from '@redhat-cloud-services/frontend-components/Main';
import {
  PageHeader,
  PageHeaderTitle,
} from '@redhat-cloud-services/frontend-components/PageHeader';
import { DateFormat } from '@redhat-cloud-services/frontend-components/DateFormat';

import {
  Card,
  CardHeader,
  CardBody,
  Stack,
  StackItem,
  Breadcrumb,
  BreadcrumbItem,
  Split,
  SplitItem,
  Title,
} from '@patternfly/react-core';
import { Table, TableHeader, TableBody } from '@patternfly/react-table';
import { InProgressIcon } from '@patternfly/react-icons';

import DescriptionList from './Layouts/DescriptionList';
import { CancelButton } from '../containers/CancelButton';
import { getPlaybookRun, getPlaybookRuns, loadRemediation } from '../actions';
import './Status.scss';
import { StatusSummary, normalizeStatus } from './statusHelper';
import ActivityDetailsSkeleton from '../skeletons/ActivityDetailsSkeleton';
import { PermissionContext } from '../App';

import './ActivityDetails.scss';

const ActivityDetail = ({
  match: {
    params: { id, run_id },
  },
  remediation,
  playbookRun,
  getPlaybookRun,
  getPlaybookRuns,
  loadRemediation,
}) => {
  useEffect(() => {
    loadRemediation(id);
    getPlaybookRuns(id);
    getPlaybookRun(id, run_id);
  }, []);

  const permission = useContext(PermissionContext);
  const isDebug = () => localStorage.getItem('remediations:debug') === 'true';

  return remediation && playbookRun && playbookRun.data ? (
    <React.Fragment>
      <PageHeader>
        <Breadcrumb>
          <BreadcrumbItem>
            <Link to={`/`}> Remediations </Link>
          </BreadcrumbItem>
          <BreadcrumbItem>
            <Link to={`/${remediation.id}`}> {remediation.name} </Link>
          </BreadcrumbItem>
          <BreadcrumbItem isActive>
            <DateFormat type="exact" date={playbookRun.data.created_at} />
          </BreadcrumbItem>
        </Breadcrumb>
        <Stack hasGutter>
          <StackItem>
            <PageHeaderTitle
              title={
                normalizeStatus(playbookRun.data.status) === 'running' ? (
                  <React.Fragment>
                    <InProgressIcon
                      className="rem-c-running"
                      aria-label="connection status"
                    />
                    <DateFormat
                      type="exact"
                      date={playbookRun.data.created_at}
                    />
                    {isDebug() && (
                      <CancelButton
                        remediationName={remediation.name}
                        remediationId={remediation.id}
                        playbookId={playbookRun.data.id}
                      />
                    )}
                  </React.Fragment>
                ) : (
                  <DateFormat type="exact" date={playbookRun.data.created_at} />
                )
              }
            />
          </StackItem>
          <StackItem>
            <Split hasGutter>
              <SplitItem>
                <DescriptionList
                  className="rem-c-playbookSummary__settings"
                  title="Run on"
                >
                  <DateFormat type="exact" date={playbookRun.data.created_at} />
                </DescriptionList>
              </SplitItem>
              <SplitItem>
                <DescriptionList
                  className="rem-c-playbookSummary__settings"
                  title="Run by"
                >
                  {`${playbookRun.data.created_by.first_name} ${playbookRun.data.created_by.last_name}`}
                </DescriptionList>
              </SplitItem>
              <SplitItem>
                <DescriptionList
                  className="rem-c-playbookSummary__settings"
                  title="Run status"
                >
                  <StatusSummary
                    executorStatus={playbookRun.data.status}
                    counts={playbookRun.data.executors.reduce(
                      (acc, ex) => ({
                        pending: acc.pending + ex.counts.pending,
                        running: acc.running + ex.counts.running,
                        success: acc.success + ex.counts.success,
                        failure: acc.failure + ex.counts.failure,
                        canceled: acc.canceled + ex.counts.canceled,
                        acked: acc.acked + ex.counts.acked,
                      }),
                      {
                        pending: 0,
                        running: 0,
                        success: 0,
                        failure: 0,
                        canceled: 0,
                      }
                    )}
                    permission={permission}
                  />
                </DescriptionList>
              </SplitItem>
            </Split>
          </StackItem>
        </Stack>
      </PageHeader>
      <Main>
        <Stack hasGutter>
          <Card>
            <CardHeader className="rem-m-card__header-bold">
              <Title headingLevel="h4" size="xl">
                Results by connection
              </Title>
            </CardHeader>
            <CardBody>
              <Table
                aria-label="Collapsible table"
                rows={playbookRun.data.executors.map((e) => ({
                  cells: [
                    {
                      title: (
                        <Link
                          to={`/${remediation.id}/${playbookRun.data.id}/${e.executor_id}`}
                        >
                          {e.executor_name}
                        </Link>
                      ),
                    },
                    e.system_count,
                    {
                      title: (
                        <StatusSummary
                          executorStatus={normalizeStatus(e.status)}
                          counts={e.counts}
                          permission={permission}
                        />
                      ),
                    },
                  ],
                }))}
                cells={[
                  { title: 'Connection' },
                  { title: 'Systems' },
                  { title: 'Playbook run status' },
                ]}
              >
                <TableHeader />
                <TableBody />
              </Table>
            </CardBody>
          </Card>
        </Stack>
      </Main>
    </React.Fragment>
  ) : (
    <ActivityDetailsSkeleton />
  );
};

ActivityDetail.propTypes = {
  remediation: PropTypes.object,
  issue: PropTypes.object,
  playbookRun: PropTypes.object,
  getPlaybookRun: PropTypes.func,
  getPlaybookRuns: PropTypes.func,
  loadRemediation: PropTypes.func,
  match: PropTypes.object,
};

ActivityDetail.defaultProps = {};

const connected = connect(
  ({ playbookRun, selectedRemediation }) => ({
    playbookRun,
    remediation: selectedRemediation.remediation,
  }),
  (dispatch) => ({
    getPlaybookRun: (id, runId) => dispatch(getPlaybookRun(id, runId)),
    getPlaybookRuns: (remediationId) =>
      dispatch(getPlaybookRuns(remediationId)),
    loadRemediation: (id) => dispatch(loadRemediation(id)),
  })
)(ActivityDetail);
export default connected;

// export default ActivityDetail;
