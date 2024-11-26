import React, { useEffect, useState, useRef, useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Link from '@redhat-cloud-services/frontend-components/InsightsLink';
import { useParams } from 'react-router-dom';
import { InventoryTable } from '@redhat-cloud-services/frontend-components/Inventory';
import { Main } from '@redhat-cloud-services/frontend-components/Main';
import {
  PageHeader,
  PageHeaderTitle,
} from '@redhat-cloud-services/frontend-components/PageHeader';
import { DateFormat } from '@redhat-cloud-services/frontend-components/DateFormat';
import { Skeleton } from '@redhat-cloud-services/frontend-components/Skeleton';
import {
  Button,
  Card,
  CardHeader,
  CardBody,
  Stack,
  StackItem,
  Breadcrumb,
  BreadcrumbItem,
  Split,
  SplitItem,
} from '@patternfly/react-core';
import { InProgressIcon } from '@patternfly/react-icons';
import reducers from '../../store/reducers';
import DescriptionList from '../Layouts/DescriptionList';
import {
  getPlaybookRun,
  getPlaybookRunSystemDetails,
  expandInventoryTable,
  loadRemediation,
  clearPlaybookRunSystemDetails,
} from '../../actions';
import { downloadPlaybook } from '../../api';
import { normalizeStatus, StatusSummary } from '../statusHelper';
import ExecutorDetailsSkeleton from '../../skeletons/ExecutorDetailsSkeleton';
import RunFailed from '../Alerts/RunFailed';
import './ExecutorDetails.scss';
import { PermissionContext } from '../../App';
import { register } from '../../store';
import { mergedColumns } from '../SystemsTable/helpers';
import columns from './Columns';
import { useGetEntities } from './helpers';
import isEmpty from 'lodash/isEmpty';

let refreshInterval;

const ExecutorDetails = () => {
  const { executor_id, run_id, id } = useParams();
  const [executor, setExecutor] = useState({});
  const [openId, setOpenId] = useState();
  const [firstExpand, setFirstExpand] = useState(false);
  const inventory = useRef(null);
  const dispatch = useDispatch();

  const remediation = useSelector(({ selectedRemediation }) => {
    return selectedRemediation.remediation;
  });
  const playbookRun = useSelector(({ playbookRun }) => {
    return playbookRun;
  });
  const playbookRunSystemDetails = useSelector(
    ({ playbookRunSystemDetails }) => playbookRunSystemDetails
  );

  useEffect(() => {
    dispatch(clearPlaybookRunSystemDetails());
    if (!remediation) {
      dispatch(loadRemediation(id));
    }

    if (isEmpty(playbookRun)) {
      dispatch(getPlaybookRun(id, run_id));
    }

    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, []);

  useEffect(() => {
    if (playbookRun && playbookRun.data) {
      setExecutor(
        playbookRun.data.executors.find(
          (executor) => executor.executor_id === executor_id
        ) || {}
      );
    }
  }, [playbookRun]);

  useEffect(() => {
    if (!firstExpand) {
      dispatch(getPlaybookRun(id, run_id));
    }

    if (
      normalizeStatus(playbookRunSystemDetails.status) !== 'running' &&
      refreshInterval
    ) {
      clearInterval(refreshInterval);
    }

    setFirstExpand(false);
  }, [playbookRunSystemDetails.status]);

  const getEntities = useGetEntities({ id, run_id, executor_id, openId });
  const renderInventorycard = (status) => {
    return (
      <Main>
        <Stack hasGutter>
          <Card className="rem-c-card__playbook-log">
            <CardBody>
              <InventoryTable
                initialLoading
                ref={inventory}
                columns={(defaultColumns) =>
                  mergedColumns(defaultColumns, columns)
                }
                onLoad={({ INVENTORY_ACTION_TYPES, mergeWithEntities }) =>
                  register({
                    ...mergeWithEntities(
                      reducers.playbookActivityIntentory({
                        INVENTORY_ACTION_TYPES,
                      })()
                    ),
                  })
                }
                getEntities={getEntities}
                hasCheckbox={false}
                expandable
                showTags
                onExpandClick={
                  status === 'running'
                    ? (_e, _i, isOpen, { id }) => {
                        setFirstExpand(true);
                        if (isOpen) {
                          setOpenId(id);
                          if (refreshInterval) {
                            clearInterval(refreshInterval);
                          }

                          dispatch(
                            getPlaybookRunSystemDetails(
                              remediation.id,
                              run_id,
                              id
                            )
                          );
                          refreshInterval = setInterval(
                            () =>
                              dispatch(
                                getPlaybookRunSystemDetails(
                                  remediation.id,
                                  run_id,
                                  id
                                )
                              ),
                            5000
                          );
                        } else {
                          setOpenId(undefined);
                          clearInterval(refreshInterval);
                        }
                        dispatch(expandInventoryTable(id, isOpen));
                      }
                    : (_e, _i, isOpen, { id }) => {
                        setFirstExpand(true);
                        if (isOpen) {
                          setOpenId(id);
                          dispatch(
                            getPlaybookRunSystemDetails(
                              remediation.id,
                              run_id,
                              id
                            )
                          );
                        } else {
                          setOpenId(undefined);
                        }

                        clearInterval(refreshInterval);
                        dispatch(expandInventoryTable(id, isOpen));
                      }
                }
                actionsConfig={{
                  actions: [
                    <Button
                      key="download-playbook"
                      variant="secondary"
                      onClick={() => downloadPlaybook([remediation.id])}
                    >
                      Download playbook
                    </Button>,
                  ],
                }}
                hideFilters={{ all: true, name: false }}
              />
            </CardBody>
          </Card>
        </Stack>
      </Main>
    );
  };

  const renderMain = (status) =>
    ({
      running: renderInventorycard(status),
      success: renderInventorycard(status),
      failure: renderInventorycard(status),
      canceled: renderInventorycard(status),
      epicFailure: (
        <Main>
          <Stack hasGutter>
            <Card>
              <CardHeader className="rem-m-card__header-bold">
                <Button
                  variant="secondary"
                  onClick={() => downloadPlaybook(remediation.id)}
                >
                  Download playbook
                </Button>
              </CardHeader>

              <CardBody>
                <RunFailed name={executor.executor_name} />
              </CardBody>
            </Card>
          </Stack>
        </Main>
      ),
    }[normalizeStatus(status)]);

  const permission = useContext(PermissionContext);

  return remediation && executor && playbookRun && playbookRun.data ? (
    <React.Fragment>
      <PageHeader>
        <Breadcrumb>
          <BreadcrumbItem>
            <Link to={`/`}> Remediations </Link>
          </BreadcrumbItem>
          <BreadcrumbItem>
            <Link to={`/${remediation.id}`}> {remediation.name} </Link>
          </BreadcrumbItem>
          <BreadcrumbItem>
            <Link to={`/${remediation.id}/${run_id}`}>
              <DateFormat type="exact" date={playbookRun.data.created_at} />
            </Link>
          </BreadcrumbItem>
          <BreadcrumbItem isActive> {executor.executor_name} </BreadcrumbItem>
        </Breadcrumb>
        <Stack hasGutter>
          <StackItem>
            <PageHeaderTitle
              title={
                normalizeStatus(executor.status) === 'Running' ? (
                  <React.Fragment>
                    <InProgressIcon
                      className="rem-c-running"
                      aria-label="connection status"
                    />
                    {executor.executor_name}
                  </React.Fragment>
                ) : (
                  executor.executor_name
                )
              }
            />
          </StackItem>
          <StackItem>
            <Split hasGutter>
              <SplitItem>
                <DescriptionList
                  className="rem-c-playbookSummary__settings"
                  title="Run status"
                >
                  {executor.status ? (
                    <StatusSummary
                      executorStatus={executor.status}
                      counts={executor.counts}
                      permission={permission}
                    />
                  ) : (
                    <Skeleton size="lg" />
                  )}
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
                  title="Run on"
                >
                  <DateFormat type="exact" date={playbookRun.data.created_at} />
                </DescriptionList>
              </SplitItem>
            </Split>
          </StackItem>
        </Stack>
      </PageHeader>
      {renderMain(normalizeStatus(executor.status))}
    </React.Fragment>
  ) : (
    <ExecutorDetailsSkeleton />
  );
};

export default ExecutorDetails;
