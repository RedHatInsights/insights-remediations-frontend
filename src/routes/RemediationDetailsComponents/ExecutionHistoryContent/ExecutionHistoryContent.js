import React, { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import PropTypes from 'prop-types';
import {
  Checkbox,
  Modal,
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
import useLogs from './hooks/useLogs';
import RunTabContent from './RunTabContent';
import { formatUtc } from './helpers';

import { getPlaybookLogs, getRemediationPlaybookSystemsList } from '../../api';
import useRemediationsQuery from '../../../api/useRemediationsQuery';
import { useAxiosWithPlatformInterceptors } from '@redhat-cloud-services/frontend-components-utilities/interceptors';
import { StatusIcon } from '../../helpers';

const ExecutionHistoryTab = ({ remediationPlaybookRuns }) => {
  const runs = remediationPlaybookRuns?.data ?? [];
  const [runsState, setRunsState] = useState(runs);

  useEffect(() => {
    setRunsState(remediationPlaybookRuns?.data ?? []);
  }, [remediationPlaybookRuns]);
  const { id: remId } = useParams();
  const axios = useAxiosWithPlatformInterceptors();

  const updateRunStatus = useCallback((runId, systemId, newStatus) => {
    setRunsState((prev) =>
      prev.map((run) => {
        if (run.id !== runId) return run;
        const nextRun = { ...run, status: newStatus };
        if (Array.isArray(run.systems)) {
          nextRun.systems = run.systems.map((s) =>
            s.system_id === systemId ? { ...s, status: newStatus } : s
          );
        }
        return nextRun;
      })
    );
  }, []);

  const { fetch: fetchSystems } = useRemediationsQuery(
    getRemediationPlaybookSystemsList(axios),
    { skip: true }
  );
  const { fetch: fetchLogs, loading: logsLoading } = useRemediationsQuery(
    getPlaybookLogs(axios),
    {
      skip: true,
    }
  );

  const [activeKey, setActiveKey] = useState(0);

  const [isLogOpen, setIsLogOpen] = useState(false);
  const [meta, setMeta] = useState(null);
  const { logLines } = useLogs(
    isLogOpen,
    meta,
    fetchLogs,
    remId,
    updateRunStatus,
    setMeta
  );
  const [wrapText, setWrapText] = useState(false);

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

  if (!runsState.length) return <Spinner />;

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
            {runsState.map((run, idx) => (
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
          {runsState.map((run, idx) => (
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
        {logsLoading ? (
          /* Spinner only shown for finished runs that are still loading */
          meta?.status !== 'running' && <Spinner />
        ) : (
          <>
            <LogCards
              systemName={meta?.systemName}
              status={meta?.status}
              connectionType={meta?.executor_name}
              executedBy={
                runsState.find((r) => r.id === meta?.runId)?.created_by
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
                        isChecked={wrapText}
                        onChange={(_, v) => setWrapText(v)}
                      />
                    </ToolbarItem>
                  </ToolbarContent>
                </Toolbar>
              }
            />
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
};

export default ExecutionHistoryTab;
