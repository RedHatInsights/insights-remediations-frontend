import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import PropTypes from 'prop-types';
import {
  Button,
  Checkbox,
  Flex,
  Modal,
  Sidebar,
  SidebarContent,
  SidebarPanel,
  Spinner,
  Tab,
  TabContent,
  Tabs,
  TabTitleText,
  Text,
  TextVariants,
  Title,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
} from '@patternfly/react-core';
import { LogViewer, LogViewerSearch } from '@patternfly/react-log-viewer';

import TableStateProvider from '../../../Frameworks/AsyncTableTools/AsyncTableTools/components/TableStateProvider';
import DetailsBanner from '../DetailsBanners';
import StatusLabel from './StatusLabel';
import StatusIcon from './StatusIcon';
import LogCards from './LogCards';
import RunSystemsTable from './RunSystemsTable';
import { formatUtc } from './helpers';
import useLogs from './hooks/useLogs';

const ExecutionHistoryTab = ({
  remediationPlaybookRuns,
  getRemediationPlaybookSystems,
  getRemediationPlaybookLogs,
}) => {
  const { id: remId } = useParams();

  const [activeKey, setActiveKey] = useState(0);

  const [runs, setRuns] = useState([]);
  const [loadingRuns, setLoadingRuns] = useState(false);

  const [isLogOpen, setIsLogOpen] = useState(false);
  const [meta, setMeta] = useState(null);
  const { logLines } = useLogs({
    isOpen: isLogOpen,
    meta,
    getLogs: getRemediationPlaybookLogs,
    remId,
  });
  const [wrapText, setWrapText] = useState(false);

  useEffect(() => {
    const base = remediationPlaybookRuns?.data ?? [];
    if (!base.length) {
      setRuns([]);
      return;
    }

    setLoadingRuns(true);
    Promise.all(
      base.map((run) =>
        getRemediationPlaybookSystems({ remId, playbook_run_id: run.id }).then(
          ({ data }) => {
            const exec = run.executors.find((e) => e.executor_id === run.id);
            return {
              ...run,
              systems: data
                .filter((s) => s.playbook_run_executor_id === run.id)
                .map((s) => ({ ...s, executor_name: exec?.executor_name })),
            };
          }
        )
      )
    )
      .then(setRuns)
      .finally(() => setLoadingRuns(false));
  }, [remediationPlaybookRuns]);

  const openLogModal = (run, system) => {
    setMeta({
      runId: run.id,
      status: run.status,
      systemId: system.system_id,
      systemName: system.system_name,
      executor_name: system.executor_name,
    });
    setIsLogOpen(true);
  };

  return (
    <>
      <Sidebar hasGutter>
        <SidebarPanel variant="sticky">
          <Tabs
            activeKey={activeKey}
            onSelect={(_, k) => setActiveKey(k)}
            isVertical
            isBox
            aria-label="Execution history runs"
          >
            {runs.map((run, idx) => (
              <Tab
                key={run.id}
                eventKey={idx}
                title={
                  <TabTitleText>
                    <StatusIcon status={run.status} size="sm" />{' '}
                    {formatUtc(run.updated_at)}
                  </TabTitleText>
                }
                tabContentId={`run-${idx}`}
              />
            ))}
          </Tabs>
        </SidebarPanel>

        <SidebarContent>
          {runs.map((run, idx) => (
            <TabContent
              key={run.id}
              eventKey={idx}
              id={`run-${idx}`}
              activeKey={activeKey}
              hidden={activeKey !== idx}
            >
              <Flex
                direction={{ default: 'column' }}
                className="pf-v5-u-mb-lg pf-v5-u-mt-lg"
              >
                <Flex>
                  <Title headingLevel="h1">{formatUtc(run.updated_at)}</Title>
                  <StatusLabel status={run.status} />
                </Flex>
                <Text>
                  <TextVariants.small>
                    {`Initiated by: ${
                      run?.created_by?.first_name ?? 'unknown'
                    }`}
                  </TextVariants.small>
                </Text>
              </Flex>

              <DetailsBanner
                status={run.status}
                remediationPlanName={run.system_name}
                canceledAt={run.updated_at}
              />

              <TableStateProvider>
                <RunSystemsTable
                  run={run}
                  loading={loadingRuns}
                  viewLogColumn={{
                    title: '',
                    exportKey: 'viewLog',
                    renderFunc: (_d, _i, system) => (
                      <Button
                        variant="link"
                        style={{ padding: 0 }}
                        onClick={() => openLogModal(run, system)}
                      >
                        View log
                      </Button>
                    ),
                  }}
                />
              </TableStateProvider>
            </TabContent>
          ))}
        </SidebarContent>
      </Sidebar>

      <Modal
        isOpen={isLogOpen}
        variant="large"
        title="Playbook run log"
        onClose={() => setIsLogOpen(false)}
      >
        <>
          <LogCards
            systemName={meta?.systemName}
            status={meta?.status}
            connectionType={meta?.executor_name}
            executedBy={
              runs.find((r) => r.id === meta?.runId)?.created_by?.username ??
              '-'
            }
          />

          <LogViewer
            data={logLines}
            isTextWrapped={wrapText}
            toolbar={
              <Toolbar>
                <ToolbarContent>
                  <ToolbarItem>
                    <LogViewerSearch placeholder="Search logs…" />
                  </ToolbarItem>
                  <ToolbarItem alignSelf="center">
                    <Checkbox
                      label="Wrap text"
                      id="wrap"
                      isChecked={wrapText}
                      onChange={(_, v) => setWrapText(v)}
                    />
                  </ToolbarItem>
                </ToolbarContent>
              </Toolbar>
            }
          />
        </>
      </Modal>
    </>
  );
};

ExecutionHistoryTab.propTypes = {
  remediationPlaybookRuns: PropTypes.shape({ data: PropTypes.array.isRequired })
    .isRequired,
  getRemediationPlaybookSystems: PropTypes.func.isRequired,
  getRemediationPlaybookLogs: PropTypes.func.isRequired,
};

export default ExecutionHistoryTab;
