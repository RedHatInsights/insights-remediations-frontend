import React, { useEffect, useMemo, useState } from 'react';
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

  const { id: remId } = useParams();
  const axios = useAxiosWithPlatformInterceptors();

  const { fetch: fetchSystems } = useRemediationsQuery(
    getRemediationPlaybookSystemsList(axios),
    { skip: true }
  );

  const [activeKey, setActiveKey] = useState(0);

  const [isLogOpen, setIsLogOpen] = useState(false);
  const [meta, setMeta] = useState(null);

  const [wrapText, setWrapText] = useState(true);
  const params = meta && {
    remId,
    playbook_run_id: meta?.runId,
    system_id: meta?.systemId,
  };
  const {
    result: logData,
    error: logsError,
    loading: logsLoading,
    refetch: refetchLogs,
  } = useRemediationsQuery(getPlaybookLogs(axios), {
    params,
    skip: !params || !isLogOpen,
  });

  const { logLines, runsState } = useMemo(() => {
    console.log('Aaaa', logData, logsError);
    const runsState = runs;
    runs.map((run) => {
      const runData = logData?.data.find(({ id }) => id === run.runId);
      const nextRun = {
        ...run,
        ...(runData ? { status: runData.status } : {}),
      };

      if (Array.isArray(run.systems)) {
        nextRun.systems = run.systems.map((s) =>
          s.system_id === meta?.systemId ? { ...s, status: runData.status } : s
        );
      }
      return nextRun;
    });

    const logLines = logData?.console.split('\n');
    return {
      logLines,
      runsState,
    };
  }, [logData, logsError, logsLoading, runs, meta]);

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

  useEffect(() => {
    let interval;
    if (logData?.status === 'running') {
      interval = setInterval(refetchLogs, 5_000);
    }
    //       runs.map((run) => {
    //         const runData = logData?.data.find(({ id }) => id === run.runId);
    //         const nextRun = {
    //           ...run,
    //           ...(runData ? { status: runData.status } : {}),
    //         };
    //
    //         if (Array.isArray(run.systems)) {
    //           nextRun.systems = run.systems.map((s) =>
    //             s.system_id === meta?.systemId
    //               ? { ...s, status: runData.status }
    //               : s
    //           );
    //         }
    //         return nextRun;
    //       });
    return () => {
      interval && clearInterval(interval);
    };
  }, [refetchLogs, isLogOpen, logData]);

  if (isPlaybookRunsLoading) {
    return <Spinner />;
  }

  if (runsState.length === 0) {
    return <NoExecutions />;
  }
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
        {logsLoading ? (
          /* Spinner only shown for finished runs that are still loading */
          logData?.status !== 'running' && <Spinner />
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
