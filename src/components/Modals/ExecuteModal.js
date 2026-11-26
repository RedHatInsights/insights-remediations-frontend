import React, { useMemo, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Button,
  Content,
  List,
  ListItem,
  Spinner,
} from '@patternfly/react-core';
import { Modal, ModalVariant } from '@patternfly/react-core/deprecated';
import { useAddNotification } from '@redhat-cloud-services/frontend-components-notifications/hooks';
import useChrome from '@redhat-cloud-services/frontend-components/useChrome';
import useRemediations from '../../Utilities/Hooks/api/useRemediations';
import { pluralize } from '../../Utilities/utils';
import { formatUtc } from '../../routes/RemediationDetailsComponents/ExecutionHistoryContent/helpers';

const ACTIVE_RUN_STATUSES = ['pending', 'running'];

export const ExecuteModal = ({
  isOpen,
  onClose,
  refetchRemediationPlaybookRuns,
  remediationStatus,
  remediation,
  detailsLoading,
  onNavigateToExecutionHistory,
  remediationPlaybookRuns,
  isPlaybookRunsLoading,
}) => {
  const addNotification = useAddNotification();
  const chrome = useChrome();
  const [trackedRun, setTrackedRun] = useState(null);
  const [currentUsername, setCurrentUsername] = useState(null);

  const runFromHistory = remediationPlaybookRuns?.data?.find((run) =>
    trackedRun
      ? run.id === trackedRun.id
      : ACTIVE_RUN_STATUSES.includes(run.status),
  );
  const execution = runFromHistory ?? trackedRun;
  const isExecutionFinished =
    !!execution && !ACTIVE_RUN_STATUSES.includes(execution.status);
  const shouldRefreshExecution =
    isOpen && !!execution?.id && !isExecutionFinished;
  const executionTimestamp = execution?.created_at || execution?.updated_at;
  const runUsername = execution?.created_by?.username;

  const { connected, disconnected } = useMemo(() => {
    const connectedData = remediationStatus?.connectedData;

    if (!connectedData?.length) {
      return { connected: [], disconnected: [] };
    }

    const [con, dis] = connectedData.reduce(
      ([pass, fail], e) =>
        e.connection_status === 'connected'
          ? [[...pass, e], fail]
          : [pass, [...fail, e]],
      [[], []],
    );

    return { connected: con, disconnected: dis };
  }, [remediationStatus?.connectedData]);

  const connectedCount = useMemo(
    () => connected.reduce((acc, e) => acc + e.system_count, 0),
    [connected],
  );

  const { fetch: executeRun } = useRemediations('runRemediation', {
    skip: true,
  });

  useEffect(() => {
    const auth = chrome?.auth;
    if (!isOpen || runUsername || typeof auth?.getUser !== 'function') return;

    auth
      .getUser()
      .then((user) => setCurrentUsername(user?.identity?.user?.username))
      .catch(() => setCurrentUsername(null));
  }, [chrome, isOpen, runUsername]);

  useEffect(() => {
    if (!isOpen) {
      setTrackedRun(null);
    } else if (runFromHistory) {
      setTrackedRun(runFromHistory);
    }
  }, [isOpen, runFromHistory]);

  useEffect(() => {
    if (!shouldRefreshExecution || !refetchRemediationPlaybookRuns) return;
    const interval = setInterval(refetchRemediationPlaybookRuns, 5_000);
    return () => clearInterval(interval);
  }, [shouldRefreshExecution, refetchRemediationPlaybookRuns]);

  const handleExecute = () => {
    const exclude = disconnected.map((e) => e.executor_id).filter(Boolean);
    const newRun = { status: 'running', created_at: new Date().toISOString() };
    setTrackedRun(newRun);

    executeRun({
      id: remediation.id,
      playbookRunsInput: { exclude },
    })
      .then(({ id }) => {
        setTrackedRun({ ...newRun, id });
        chrome.analytics?.track('remediations - Plan Executed', {
          module: 'remediations',
          remediation_id: remediation.id,
          action_count: remediation?.issue_count,
          system_count: connectedCount,
          auto_reboot: remediation?.auto_reboot ?? false,
        });
        refetchRemediationPlaybookRuns();
        addNotification({
          title: `Executing playbook ${remediation.name}`,
          description: (
            <span>
              View results in the <b>Execution history tab</b>
            </span>
          ),
          variant: 'success',
          dismissable: true,
          autoDismiss: true,
        });
      })
      .catch((err) => {
        setTrackedRun(null);
        addNotification({
          title: 'Failed to execute playbook',
          description: err.message || 'Unknown error',
          variant: 'danger',
          dismissable: true,
          autoDismiss: true,
        });
      });
  };

  const handleViewDetails = () => {
    onClose();
    if (onNavigateToExecutionHistory) {
      onNavigateToExecutionHistory(null, 'executionHistory');
    }
  };

  const autoRebootEnabled = remediation?.auto_reboot ?? false;
  const executionStatusText = isExecutionFinished
    ? 'has finished'
    : 'is in progress';

  const renderExecutionStatus = () => (
    <>
      <Content>
        <Content
          component="p"
          className="pf-v6-u-mb-md pf-v6-u-text-color-subtle"
        >
          {executionTimestamp && (
            <>
              {formatUtc(executionTimestamp)}, initiated by{' '}
              {runUsername || currentUsername || 'Unknown user'}
            </>
          )}
        </Content>
        <Content component="p" className="pf-v6-u-mb-md">
          {!isExecutionFinished &&
            'Changes are in progress and cannot be rolled back. '}
          Go to the Execution History tab of this plan to view more information
          about the execution, or review the execution log file for each system
          in the plan.
        </Content>
      </Content>
    </>
  );

  const renderMainContent = () => {
    const isLoading =
      detailsLoading ||
      remediationStatus?.areDetailsLoading ||
      isPlaybookRunsLoading;

    return (
      <>
        {isLoading ? (
          <Spinner size="lg" />
        ) : (
          <Content>
            <Content component="p">
              Once you execute this plan, changes will be pushed immediately and
              cannot be rolled back.
            </Content>

            <List className="pf-v6-u-mt-md">
              <ListItem>
                Executing this plan will remediate{' '}
                {pluralize(connectedCount, 'system')}.
              </ListItem>
              <ListItem>
                {autoRebootEnabled ? (
                  <>
                    Auto-reboot is enabled for this plan. All of the included
                    systems that require a reboot will reboot automatically.
                  </>
                ) : (
                  <>
                    Auto-reboot is disabled for this plan. None of the included
                    systems will reboot automatically.
                  </>
                )}
              </ListItem>
            </List>
          </Content>
        )}
      </>
    );
  };

  return (
    <Modal
      data-testid="execute-modal"
      variant={ModalVariant.medium}
      title={
        execution
          ? `Execution ${executionStatusText} for plan ${remediation?.name || ''}`
          : 'Plan execution cannot be stopped or rolled back'
      }
      titleIconVariant={execution ? 'info' : 'warning'}
      isOpen={isOpen}
      onClose={onClose}
      isFooterLeftAligned
      actions={
        execution
          ? [
              <Button
                key="view-details"
                variant="primary"
                ouiaId="view-execution-details"
                onClick={handleViewDetails}
              >
                View details
              </Button>,
              <Button
                key="close"
                variant="link"
                ouiaId="close-execution-modal"
                onClick={onClose}
              >
                Close
              </Button>,
            ]
          : [
              <Button
                key="execute"
                variant="primary"
                ouiaId="execute-playbook"
                isDisabled={
                  connected.length === 0 ||
                  detailsLoading ||
                  remediationStatus?.areDetailsLoading ||
                  isPlaybookRunsLoading
                }
                onClick={handleExecute}
              >
                Execute
              </Button>,
              <Button
                key="cancel"
                variant="link"
                ouiaId="cancel-execute"
                onClick={onClose}
              >
                Cancel
              </Button>,
            ]
      }
    >
      {execution ? renderExecutionStatus() : renderMainContent()}
    </Modal>
  );
};

ExecuteModal.propTypes = {
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
  remediation: PropTypes.object,
  refetchRemediationPlaybookRuns: PropTypes.func,
  remediationStatus: PropTypes.object,
  detailsLoading: PropTypes.bool,
  onNavigateToExecutionHistory: PropTypes.func,
  remediationPlaybookRuns: PropTypes.shape({
    data: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string,
        status: PropTypes.string,
        created_at: PropTypes.string,
        updated_at: PropTypes.string,
        created_by: PropTypes.shape({
          username: PropTypes.string,
        }),
      }),
    ),
  }),
  isPlaybookRunsLoading: PropTypes.bool,
};
