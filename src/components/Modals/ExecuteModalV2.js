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

export const ExecuteModalV2 = ({
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
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionTimestamp, setExecutionTimestamp] = useState(null);
  const [executionUsername, setExecutionUsername] = useState(null);

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

  // Get username from chrome when component mounts or chrome becomes available
  useEffect(() => {
    // Check if there's a running execution with a username first
    const hasRunningExecutionWithUsername = () => {
      if (isOpen && remediationPlaybookRuns?.data) {
        const runs = remediationPlaybookRuns.data;
        const runningRun = runs.find((run) => run.status === 'running');
        return !!runningRun?.created_by?.username;
      }
      return false;
    };

    // Don't fetch chrome username if there's already a running execution with username
    if (hasRunningExecutionWithUsername()) {
      return;
    }

    if (chrome && chrome.auth && typeof chrome.auth.getUser === 'function') {
      chrome.auth
        .getUser()
        .then((user) => {
          // Double-check there's still no running execution before setting
          if (hasRunningExecutionWithUsername()) {
            return;
          }

          if (user) {
            const username = user.identity?.user?.username || 'Unknown user';
            setExecutionUsername(username);
          } else {
            setExecutionUsername('Unknown user');
          }
        })
        .catch(() => {
          // Only set fallback if no running execution with username
          if (!hasRunningExecutionWithUsername()) {
            setExecutionUsername('Unknown user');
          }
        });
    } else {
      // Only set fallback if no running execution with username
      if (!hasRunningExecutionWithUsername()) {
        setExecutionUsername('Unknown user');
      }
    }
  }, [chrome, isOpen, remediationPlaybookRuns]);

  // Check for running execution when modal opens
  useEffect(() => {
    if (isOpen && remediationPlaybookRuns?.data) {
      const runs = remediationPlaybookRuns.data;
      const runningRun = runs.find((run) => run.status === 'running');
      if (runningRun) {
        setIsExecuting(true);
        setExecutionTimestamp(runningRun.created_at || runningRun.updated_at);
        // Get username from the run if available
        if (runningRun.created_by?.username) {
          setExecutionUsername(runningRun.created_by.username);
        }
      } else {
        // Only reset if there's no running execution
        setIsExecuting(false);
        setExecutionTimestamp(null);
      }
    } else if (!isOpen) {
      setIsExecuting(false);
      setExecutionTimestamp(null);
    }
  }, [isOpen, remediationPlaybookRuns]);

  const handleExecute = () => {
    const exclude = disconnected.map((e) => e.executor_id).filter(Boolean);
    const timestamp = new Date().toISOString();
    setExecutionTimestamp(timestamp);
    setIsExecuting(true);

    executeRun({
      id: remediation.id,
      playbookRunsInput: { exclude },
    })
      .then(() => {
        refetchRemediationPlaybookRuns();
        addNotification({
          title: `Executing playbook ${remediation.name}`,
          description: (
            <span>
              View results in the <b>Execution History tab</b>
            </span>
          ),
          variant: 'success',
          dismissable: true,
          autoDismiss: true,
        });
      })
      .catch((err) => {
        setIsExecuting(false);
        setExecutionTimestamp(null);
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

  const renderExecutionInProgress = () => (
    <>
      <Content>
        <Content
          component="p"
          className="pf-v6-u-mb-md pf-v6-u-text-color-subtle"
        >
          {executionTimestamp && (
            <>
              {formatUtc(executionTimestamp)}, initiated by {executionUsername}
            </>
          )}
        </Content>
        <Content component="p" className="pf-v6-u-mb-md">
          Changes are in progress and cannot be rolled back. Go to the Execution
          History tab of this plan to view more information about the execution,
          or review the execution log file for each system in the plan.
        </Content>
        <div className="pf-v6-u-text-align-center pf-v6-u-my-lg">
          <Spinner size="xl" />
        </div>
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
      data-testid="execute-modal-v2"
      variant={ModalVariant.medium}
      title={
        isExecuting
          ? `Execution is in progress for plan ${remediation?.name || ''}`
          : 'Plan execution cannot be stopped or rolled back'
      }
      titleIconVariant={isExecuting ? 'info' : 'warning'}
      isOpen={isOpen}
      onClose={onClose}
      isFooterLeftAligned
      actions={
        isExecuting
          ? [
              <Button
                key="view-details"
                variant="primary"
                ouiaId="view-execution-details-v2"
                onClick={handleViewDetails}
              >
                View details
              </Button>,
              <Button
                key="close"
                variant="link"
                ouiaId="close-execution-modal-v2"
                onClick={onClose}
              >
                Close
              </Button>,
            ]
          : [
              <Button
                key="execute"
                variant="primary"
                ouiaId="execute-playbook-v2"
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
                ouiaId="cancel-execute-v2"
                onClick={onClose}
              >
                Cancel
              </Button>,
            ]
      }
    >
      {isExecuting ? renderExecutionInProgress() : renderMainContent()}
    </Modal>
  );
};

ExecuteModalV2.propTypes = {
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
