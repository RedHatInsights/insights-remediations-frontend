import React, { useMemo } from 'react';
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
import useRemediations from '../../Utilities/Hooks/api/useRemediations';
import { pluralize } from '../../Utilities/utils';

export const ExecuteModalV2 = ({
  isOpen,
  onClose,
  refetchRemediationPlaybookRuns,
  remediationStatus,
  remediation,
  detailsLoading,
}) => {
  const addNotification = useAddNotification();

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

  const handleExecute = () => {
    const exclude = disconnected.map((e) => e.executor_id).filter(Boolean);
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
        onClose();
      })
      .catch((err) => {
        addNotification({
          title: 'Failed to execute playbook',
          description: err.message || 'Unknown error',
          variant: 'danger',
          dismissable: true,
          autoDismiss: true,
        });
      });
  };

  const autoRebootEnabled = remediation?.auto_reboot ?? false;

  return (
    <Modal
      data-testid="execute-modal-v2"
      variant={ModalVariant.medium}
      title="Plan execution cannot be stopped or rolled back"
      titleIconVariant="warning"
      isOpen={isOpen}
      onClose={onClose}
      isFooterLeftAligned
      actions={[
        <Button
          key="execute"
          variant="primary"
          ouiaId="execute-playbook-v2"
          isDisabled={connected.length === 0}
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
      ]}
    >
      {detailsLoading ? (
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
};
