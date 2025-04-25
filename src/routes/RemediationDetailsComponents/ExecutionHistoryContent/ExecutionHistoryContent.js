import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import PropTypes from 'prop-types';

import {
  Button,
  Checkbox,
  Modal,
  Sidebar,
  SidebarContent,
  SidebarPanel,
  Spinner,
  Tab,
  TabContent,
  Tabs,
  TabTitleText,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
} from '@patternfly/react-core';
import { LogViewer, LogViewerSearch } from '@patternfly/react-log-viewer';

import RemediationsTable from '../../../components/RemediationsTable/RemediationsTable';
import TableStateProvider from '../../../Frameworks/AsyncTableTools/AsyncTableTools/components/TableStateProvider';
import { emptyRows } from '../../../Frameworks/AsyncTableTools/AsyncTableTools/hooks/useTableView/views/helpers';

import columns from './Columns';
import DetailsBanner from '../DetailsBanners';
import { systemFilter } from './Filter';

const formatUtc = (iso) => {
  const d = new Date(iso);
  const dd = String(d.getUTCDate()).padStart(2, '0');
  const MMM = d.toLocaleString('en-US', { month: 'short', timeZone: 'UTC' });
  const YYYY = d.getUTCFullYear();
  const HH = String(d.getUTCHours()).padStart(2, '0');
  const mm = String(d.getUTCMinutes()).padStart(2, '0');
  return `${dd} ${MMM} ${YYYY} ${HH}:${mm}`;
};

//TODO: filter, test running log,
const ExecutionHistoryTab = ({
  remediationPlaybookRuns,
  getRemediationPlaybookSystems,
  getRemediationPlaybookLogs,
  refetchLogs,
}) => {
  const { id: remId } = useParams();

  const [activeKey, setActiveKey] = useState(0);

  const [runs, setRuns] = useState([]);
  const [loadingRuns, setLoadingRuns] = useState(false);

  const [isLog, setIsLog] = useState(false);
  const [logLoading, setLogLoading] = useState(false);
  const [logLines, setLogLines] = useState([]);
  const [wrapText, setWrapText] = useState(false);
  const [meta, setMeta] = useState(null);

  useEffect(() => {
    const raw = remediationPlaybookRuns?.data ?? [];
    if (!raw.length) {
      setRuns([]);
      return;
    }

    setLoadingRuns(true);
    Promise.all(
      raw.map((run) =>
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
  }, [remediationPlaybookRuns, getRemediationPlaybookSystems, remId]);

  const openLogModal = (run, system) => {
    setMeta({
      runId: run.id,
      status: run.status,
      systemId: system.system_id,
      systemName: system.system_name,
    });
    setLogLines([]);
    setIsLog(true);

    setLogLoading(true);
    getRemediationPlaybookLogs({
      remId,
      playbook_run_id: run.id,
      system_id: system.system_id,
    })
      .then(({ console }) => setLogLines(console))
      .catch(() =>
        setLogLines([`Failed to load logs for ${system.system_name}`])
      )
      .finally(() => setLogLoading(false));
  };

  useEffect(() => {
    if (!isLog || !meta || meta.status !== 'running') return;

    const id = setInterval(async () => {
      try {
        const { data } = await refetchLogs();
        const lines = Array.isArray(data.console) ? data.console : data;
        const status = data.status ?? meta.status;
        setLogLines(lines);
        if (status !== 'running') clearInterval(id);
      } catch {
        /* ignore */
      }
    }, 5_000);

    return () => clearInterval(id);
  }, [isLog, meta, refetchLogs]);

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
                title={<TabTitleText>{formatUtc(run.updated_at)}</TabTitleText>}
                tabContentId={`run-content-${idx}`}
              />
            ))}
          </Tabs>
        </SidebarPanel>

        <SidebarContent>
          {runs.map((run, idx) => {
            const isHidden = activeKey !== idx;
            const viewLogColumn = {
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
            };

            return (
              <TabContent
                key={run.id}
                eventKey={idx}
                id={`run-content-${idx}`}
                activeKey={activeKey}
                hidden={isHidden}
              >
                <DetailsBanner
                  status={run?.status}
                  remediationPlanName={run?.system_name}
                  canceledAt={run?.updated_at}
                />
                <div>
                  {loadingRuns ? (
                    <Spinner size="xl" />
                  ) : (
                    <RemediationsTable
                      aria-label="ExecutionHistoryTable"
                      ouiaId="ExecutionHistoryTable"
                      variant="compact"
                      items={run.systems}
                      total={run.systems.length}
                      columns={[...columns, viewLogColumn]}
                      filters={{ filterConfig: [...systemFilter] }}
                      options={{
                        itemIdsOnPage: run.systems.map((s) => s.system_id),
                        total: run.systems.length,
                        emptyRows: emptyRows(columns.length + 1),
                      }}
                    />
                  )}
                </div>
              </TabContent>
            );
          })}
        </SidebarContent>
      </Sidebar>

      <Modal
        isOpen={isLog}
        variant="large"
        title="Playbook run log"
        onClose={() => setIsLog(false)}
      >
        {logLoading ? (
          <Spinner size="xl" />
        ) : (
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
        )}
      </Modal>
    </>
  );
};

ExecutionHistoryTab.propTypes = {
  remediationPlaybookRuns: PropTypes.shape({ data: PropTypes.array.isRequired })
    .isRequired,
  getRemediationPlaybookSystems: PropTypes.func.isRequired,
  getRemediationPlaybookLogs: PropTypes.func.isRequired,
  refetchLogs: PropTypes.func.isRequired,
};

const ExecutionHistoryTabProvider = (props) => (
  <TableStateProvider>
    <ExecutionHistoryTab {...props} />
  </TableStateProvider>
);

export default ExecutionHistoryTabProvider;
