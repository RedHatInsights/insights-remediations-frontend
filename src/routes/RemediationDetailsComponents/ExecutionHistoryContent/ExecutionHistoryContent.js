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
import { useAxiosWithPlatformInterceptors } from '@redhat-cloud-services/frontend-components-utilities/interceptors';
import { StatusIcon } from '../../helpers';
import NoExecutions from './NoExections';

const ExecutionHistoryTab = ({
  remediationPlaybookRuns,
  isPlaybookRunsLoading,
}) => {
  const runs = remediationPlaybookRuns?.data ?? [];
  const [runsState, setRunsState] = useState(runs);
  const [activeKey, setActiveKey] = useState(0);
  const [wrapText, setWrapText] = useState(true);
  const [isLogOpen, setIsLogOpen] = useState(false);
  const [meta, setMeta] = useState(null);

  const { id: remId } = useParams();
  const axios = useAxiosWithPlatformInterceptors();

  //Whenever runs is altered, copy that array to local state -> Execute button wont require a refresh down the line
  useEffect(() => setRunsState(runs), [runs]);

  const updateRunStatus = useCallback((runId, systemId, newStatus) => {
    setRunsState((prev) =>
      prev.map((run) => {
        if (run.id !== runId) return run;
        //update the run-level status
        const next = { ...run, status: newStatus };
        //if we already fetched systems for this run, patch the ONE system that just finished
        if (Array.isArray(run.systems)) {
          next.systems = run.systems.map((s) =>
            s.system_id === systemId ? { ...s, status: newStatus } : s
          );
        }
        return next;
      })
    );
  }, []);

  const { fetch: fetchSystems } = useRemediationsQuery(
    getRemediationPlaybookSystemsList(axios),
    { skip: true }
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
  } = useRemediationsQuery(getPlaybookLogs(axios), {
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
      updateRunStatus(meta.runId, meta.systemId, planStatus);
      setMeta((p) => ({ ...p, status: planStatus }));
    }

    const base = (logData?.console ?? '').split('\n').filter(Boolean);
    if (planStatus === 'running') base.push('Running…');
    if (!base.length) base.push('No logs');
    setLogLines(base);
  }, [isLogOpen, meta, logData, updateRunStatus]);

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
      status: run.status,
      executor_name: system.executor_name,
    });
    setIsLogOpen(true);
  };

  if (isPlaybookRunsLoading) return <Spinner />;
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
                Cancel
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
};

export default ExecutionHistoryTab;
