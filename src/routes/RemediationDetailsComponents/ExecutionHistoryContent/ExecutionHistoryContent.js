import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import PropTypes from 'prop-types';
import {
  Button,
  Checkbox,
  Modal,
  ModalBoxFooter,
  Sidebar,
  SidebarContent,
  SidebarPanel,
  Spinner,
  Tab,
  Tabs,
  TabTitleText,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
} from '@patternfly/react-core';
import { LogViewer, LogViewerSearch } from '@patternfly/react-log-viewer';

import LogCards from './LogCards';
import RunTabContent from './RunTabContent';
import { formatUtc } from './helpers';
import { getPlaybookLogs, getRemediationPlaybookSystemsList } from '../../api';

import useRemediationsQuery from '../../../api/useRemediationsQuery';
import { StatusIcon } from '../../helpers';
import NoExecutions from './NoExections';

const ExecutionHistoryTab = ({
  remediationPlaybookRuns,
  isPlaybookRunsLoading,
  refetchRemediationPlaybookRuns,
}) => {
  const runs = remediationPlaybookRuns?.data ?? [];
  const [runsState, setRunsState] = useState(runs);
  const [activeKey, setActiveKey] = useState(0);
  const [wrapText, setWrapText] = useState(true);
  const [isLogOpen, setIsLogOpen] = useState(false);
  const [meta, setMeta] = useState(null);
  const [manualRefreshClicked, setManualRefreshClicked] = useState(false);

  const { id: remId } = useParams();

  //Whenever runs is altered, copy that array to local state -> Execute button wont require a refresh down the line
  useEffect(() => setRunsState(runs), [runs]);

  const updateSystemStatus = useCallback((runId, systemId, newStatus) => {
    setRunsState((prev) =>
      prev.map((run) =>
        run.id === runId && Array.isArray(run.systems)
          ? {
              ...run,
              systems: run.systems.map((s) =>
                s.system_id === systemId ? { ...s, status: newStatus } : s,
              ),
            }
          : run,
      ),
    );
  }, []);

  const { fetch: fetchSystems } = useRemediationsQuery(
    getRemediationPlaybookSystemsList,
    { skip: true },
  );

  const logParams =
    isLogOpen && meta
      ? {
          remId,
          playbook_run_id: meta.runId,
          system_id: meta.systemId,
        }
      : undefined;

  const {
    result: logData,
    loading: logsLoading,
    refetch: refetchLogs,
  } = useRemediationsQuery(getPlaybookLogs, {
    params: logParams,
    skip: !logParams,
  });

  /* keep previous status so we detect changes */
  const prevStatusRef = useRef();
  const [logLines, setLogLines] = useState([]);

  useEffect(() => {
    if (!isLogOpen || !meta) return;

    /* Has status changed since our last reference? */
    const planStatus = logData?.status;
    if (planStatus && planStatus !== prevStatusRef.current) {
      prevStatusRef.current = planStatus;

      /* update only the system row we’re watching */
      updateSystemStatus(meta.runId, meta.systemId, planStatus);
      setMeta((p) => ({ ...p, status: planStatus }));

      /* once that system leaves “running”, fetch a fresh run list so the
               run-level status  timestamps come from the backend, not our patch */
      if (planStatus !== 'running') {
        refetchRemediationPlaybookRuns?.();
      }
    }

    const base = (logData?.console ?? '').split('\n').filter(Boolean);
    if (planStatus === 'running') base.push('Running…');
    if (!base.length) base.push('No logs');
    setLogLines(base);
  }, [
    isLogOpen,
    meta,
    logData,
    updateSystemStatus,
    refetchRemediationPlaybookRuns,
  ]);

  useEffect(() => {
    if (!isLogOpen || !meta || logData?.status !== 'running') return;
    const id = setInterval(refetchLogs, 5_000);
    return () => clearInterval(id);
  }, [isLogOpen, meta, logData, refetchLogs]);

  const openLogModal = (run, system) => {
    setMeta({
      runId: run.id,
      systemId: system.system_id,
      systemName: system.system_name,
      status: system.status,
      executor_name: system.executor_name,
    });
    setIsLogOpen(true);
  };

  if (isPlaybookRunsLoading && runs.length === 0) {
    return <Spinner />;
  }
  if (runsState.length === 0) return <NoExecutions />;

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
            {runsState?.map((run, idx) => (
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
          {runsState?.map((run, idx) => (
            <RunTabContent
              key={run.id}
              run={run}
              idx={idx}
              isActive={activeKey === idx}
              remId={remId}
              fetchSystems={fetchSystems}
              openLogModal={openLogModal}
              refetchRemediationPlaybookRuns={refetchRemediationPlaybookRuns}
              setManualRefreshClicked={setManualRefreshClicked}
              manualRefreshClicked={manualRefreshClicked}
            />
          ))}
        </SidebarContent>
      </Sidebar>

      <Modal
        isOpen={isLogOpen}
        variant="large"
        title="Playbook run log"
        onClose={() => setIsLogOpen(false)}
      >
        {logsLoading && meta?.status !== 'running' ? (
          <Spinner />
        ) : (
          <>
            <LogCards
              systemName={meta?.systemName}
              status={meta?.status}
              connectionType={meta?.executor_name}
              executedBy={
                runsState?.find((r) => r.id === meta?.runId)?.created_by
                  ?.username ?? '-'
              }
            />
            <LogViewer
              data={logLines}
              style={{ ['--pf-v5-c-log-viewer__index--Width']: '10ch' }}
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
                        isChecked={!wrapText}
                        onChange={() => setWrapText(!wrapText)}
                      />
                    </ToolbarItem>
                  </ToolbarContent>
                </Toolbar>
              }
            />
            <ModalBoxFooter>
              <Button
                className="pf-u-mt-md"
                key="cancelModal"
                variant="primary"
                onClick={() => setIsLogOpen(false)}
              >
                Close
              </Button>
            </ModalBoxFooter>
          </>
        )}
      </Modal>
    </>
  );
};

ExecutionHistoryTab.propTypes = {
  remediationPlaybookRuns: PropTypes.shape({
    data: PropTypes.array.isRequired,
  }).isRequired,
  isPlaybookRunsLoading: PropTypes.bool,
  refetchRemediationPlaybookRuns: PropTypes.func.isRequired,
};

export default ExecutionHistoryTab;
