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

import RemediationsTable from '../../../components/RemediationsTable/RemediationsTable';
import TableStateProvider from '../../../Frameworks/AsyncTableTools/AsyncTableTools/components/TableStateProvider';
import { emptyRows } from '../../../Frameworks/AsyncTableTools/AsyncTableTools/hooks/useTableView/views/helpers';
import { useRawTableState } from '../../../Frameworks/AsyncTableTools/AsyncTableTools/hooks/useTableState';

import columns from './Columns';
import DetailsBanner from '../DetailsBanners';
import { systemFilter } from './Filter';
import StatusLabel from './StatusLabel';
import StatusIcon from './StatusIcon';
import LogCards from './LogCards';

const formatUtc = (iso) => {
  const d = new Date(iso);
  const dd = String(d.getUTCDate()).padStart(2, '0');
  const MMM = d.toLocaleString('en-US', { month: 'short', timeZone: 'UTC' });
  const YYYY = d.getUTCFullYear();
  const HH = String(d.getUTCHours()).padStart(2, '0');
  const mm = String(d.getUTCMinutes()).padStart(2, '0');
  return `${dd} ${MMM} ${YYYY} ${HH}:${mm}`;
};

const RunSystemsTable = ({ run, loading, viewLogColumn }) => {
  const tableState = useRawTableState();
  const nameFilter = tableState?.filters?.system?.[0]?.toLowerCase() ?? '';

  const filtered = nameFilter
    ? run.systems.filter((s) =>
        s.system_name.toLowerCase().includes(nameFilter)
      )
    : run.systems;

  return loading ? (
    <Spinner size="xl" />
  ) : (
    <RemediationsTable
      aria-label="ExecutionHistoryTable"
      ouiaId={`ExecutionHistory-${run.id}`}
      variant="compact"
      items={filtered}
      total={filtered.length}
      columns={[...columns, viewLogColumn]}
      filters={{ filterConfig: [...systemFilter] }}
      options={{
        itemIdsOnPage: filtered.map((s) => s.system_id),
        total: filtered.length,
        emptyRows: emptyRows(columns.length + 1),
      }}
    />
  );
};

RunSystemsTable.propTypes = {
  run: PropTypes.object.isRequired,
  loading: PropTypes.bool.isRequired,
  viewLogColumn: PropTypes.object.isRequired,
};

const ExecutionHistoryTab = ({
  remediationPlaybookRuns,
  getRemediationPlaybookSystems,
  getRemediationPlaybookLogs,
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
      executor_name: system.executor_name,
    });
    setLogLines([]);
    setIsLog(true);

    setLogLoading(true);
    getRemediationPlaybookLogs({
      remId,
      playbook_run_id: run.id,
      system_id: system.system_id,
    })
      .then((res) => {
        const lines = res.console
          ? res.console.split('\n')
          : ['(log is empty)'];
        setLogLines(lines);
      })
      .catch(() =>
        setLogLines([`Failed to load logs for ${system.system_name}`])
      )
      .finally(() => setLogLoading(false));
  };

  useEffect(() => {
    if (!isLog || !meta || meta.status !== 'running') return;

    const fetchLogs = async () => {
      const res = await getRemediationPlaybookLogs({
        remId,
        playbook_run_id: meta.runId,
        system_id: meta.systemId,
      });

      const lines = res.console ? res.console.split('\n') : ['(log is empty)'];
      const status = res.status ?? meta.status;

      setLogLines(lines);
      if (status !== 'running') {
        clearInterval(timerId);
      }
    };

    fetchLogs();
    const timerId = setInterval(fetchLogs, 5000);

    return () => clearInterval(timerId);
  }, [isLog, meta, getRemediationPlaybookLogs, remId]);

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
                tabContentId={`run-content-${idx}`}
              />
            ))}
          </Tabs>
        </SidebarPanel>

        <SidebarContent>
          {runs.map((run, idx) => {
            const isHidden = activeKey !== idx;

            const tableFilter = (name) =>
              name
                ? run.systems.filter((s) =>
                    s.system_name.toLowerCase().includes(name.toLowerCase())
                  )
                : run.systems;

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
                    viewLogColumn={viewLogColumn}
                    filterConfig={systemFilter}
                    nameFilter={tableFilter(
                      useRawTableState()?.filters?.system?.[0] ?? ''
                    )}
                  />
                </TableStateProvider>
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

export default ExecutionHistoryTab;
