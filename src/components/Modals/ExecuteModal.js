import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Button,
  Modal,
  ModalVariant,
  TextContent,
  Text,
  TextVariants,
  ExpandableSection,
  List,
  ListItem,
} from '@patternfly/react-core';
import { downloadPlaybook } from '../../api';
import { Skeleton } from '@redhat-cloud-services/frontend-components/Skeleton';
import { ExternalLinkAltIcon } from '@patternfly/react-icons';
import EmptyExecutePlaybookState from '../EmptyExecutePlaybookState';
import { dispatchNotification } from '../../Utilities/dispatcher';
import useRemediationsQuery from '../../api/useRemediationsQuery';
import { useAxiosWithPlatformInterceptors } from '@redhat-cloud-services/frontend-components-utilities/interceptors';
import { executeRemediation } from '../../routes/api';
import RemediationsTable from '../RemediationsTable/RemediationsTable';
import TableStateProvider from '../../Frameworks/AsyncTableTools/AsyncTableTools/components/TableStateProvider';
import columns from './Columns';
import { pluralize } from '../../Utilities/utils';

export const ExecuteModal = ({
  isOpen,
  onClose,
  remediation,
  issueCount,
  refetchRemediationPlaybookRuns,
  remediationStatus,
}) => {
  const axios = useAxiosWithPlatformInterceptors();
  const [connected, setConnected] = useState([]);
  const [disconnected, setDisconnected] = useState([]);

  useEffect(() => {
    if (!remediationStatus?.connectedData) return;
    const [con, dis] = remediationStatus.connectedData.reduce(
      ([pass, fail], e) =>
        e && e.connection_status === 'connected'
          ? [[...pass, e], fail]
          : [pass, [...fail, e]],
      [[], []]
    );
    setConnected(con);
    setDisconnected(dis);
  }, [remediationStatus]);

  const connectedCount = connected.reduce((acc, e) => acc + e.system_count, 0);
  const systemCount = remediationStatus?.connectedData.reduce(
    (acc, e) => acc + e.system_count,
    0
  );

  const { fetch: executeRun } = useRemediationsQuery(
    executeRemediation(axios),
    {
      skip: true,
    }
  );

  const handleExecute = () => {
    const exclude = disconnected.map((e) => e.executor_id).filter(Boolean);
    executeRun({ id: remediation.id, exclude })
      .then(() => {
        refetchRemediationPlaybookRuns();
        dispatchNotification({
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
        dispatchNotification({
          title: 'Failed to execute playbook',
          description: err.message || 'Unknown error',
          variant: 'danger',
          dismissable: true,
          autoDismiss: true,
        });
      });
  };

  return (
    <Modal
      data-testid="execute-modal"
      variant={ModalVariant.small}
      title="Execute playbook"
      isOpen={isOpen}
      onClose={onClose}
      isFooterLeftAligned
      actions={
        systemCount !== 0
          ? [
              <Button
                key="confirm"
                variant="primary"
                ouiaId="execute-playbook"
                isDisabled={connected.length === 0}
                onClick={handleExecute}
              >
                {remediationStatus?.areDetailsLoading
                  ? 'Execute playbook'
                  : `Execute playbook on ${pluralize(
                      connectedCount,
                      'system'
                    )}`}
              </Button>,
              <Button
                key="download"
                variant="secondary"
                ouiaId="download-playbook"
                onClick={() => {
                  downloadPlaybook(remediation?.id);
                  dispatchNotification({
                    title: 'Preparing playbook for download',
                    description:
                      'Once complete, your download will start automatically.',
                    variant: 'info',
                    dismissable: true,
                    autoDismiss: true,
                  });
                }}
              >
                Download playbook
              </Button>,
            ]
          : [
              <Button key="close-modal" onClick={onClose} variant="primary">
                Close
              </Button>,
            ]
      }
    >
      <div>
        <TextContent>
          {remediationStatus?.areDetailsLoading ? (
            <Skeleton size="lg" />
          ) : (
            <Text component={TextVariants.p}>
              Playbook contains <b>{pluralize(issueCount, 'action')}</b>
              &nbsp;affecting
              <b>&nbsp;{pluralize(systemCount, 'system')}.</b>
            </Text>
          )}

          <Text>
            <ExpandableSection toggleText="About remote execution with Cloud connector">
              Playbooks can be executed on systems which:
              <List>
                <ListItem>
                  Are connected to Insights via a Satellite instance which has
                  Receptor/Cloud Connector enabled, or <br />
                  <Button
                    className="pf-u-p-0"
                    variant="link"
                    isInline
                    component="a"
                    href="https://access.redhat.com/documentation/en-us/red_hat_insights/1-latest/html/red_hat_insights_remediations_guide/index"
                    target="_blank"
                    rel="noreferrer"
                  >
                    How to configure Receptor/Cloud Connector on Red Hat
                    Satellite&nbsp;
                    <ExternalLinkAltIcon />
                  </Button>
                </ListItem>
                <ListItem>
                  Are directly connected to Insights via Red Hat connector, and
                  Cloud Connector is enabled <br />
                  <Button
                    className="pf-u-p-0"
                    variant="link"
                    isInline
                    component="a"
                    href="https://access.redhat.com/documentation/en-us/red_hat_insights/1-latest/html/red_hat_insights_remediations_guide/index"
                    target="_blank"
                    rel="noreferrer"
                  >
                    How to enable Cloud Connector with Red Hat connector&nbsp;
                    <ExternalLinkAltIcon />
                  </Button>
                </ListItem>
              </List>
            </ExpandableSection>
          </Text>

          <Text component={TextVariants.p}>
            Executed Ansible Playbooks run on eligible systems with Cloud
            Connector. The playbook will be pushed immediately after selecting
            “Execute playbook”. If the playbook has “Auto reboot” on, systems
            requiring reboot to complete an action will reboot.
          </Text>

          <Button
            className="pf-u-p-0"
            variant="link"
            isInline
            component="a"
            href="https://access.redhat.com/articles/rhc"
            target="_blank"
            rel="noreferrer"
          >
            Learn more about Cloud Connector&nbsp;
            <ExternalLinkAltIcon />
          </Button>

          {systemCount > 0 && (
            <Text component={TextVariants.h4} className="pf-u-mt-md">
              Connection status of systems
            </Text>
          )}
        </TextContent>
        {systemCount === 0 ? (
          <EmptyExecutePlaybookState />
        ) : (
          <TableStateProvider tableId="execute-modal-table">
            <RemediationsTable
              aria-label="ExecutionModalTable"
              ouiaId="ExecutionModalTable"
              options={{ pagination: false }}
              variant="compact"
              loading={remediationStatus?.areDetailsLoading}
              items={remediationStatus?.connectedData || []}
              columns={[...columns]}
            />
          </TableStateProvider>
        )}
      </div>
    </Modal>
  );
};

ExecuteModal.propTypes = {
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
  showRefresh: PropTypes.bool,
  remediation: PropTypes.object,
  issueCount: PropTypes.number,
  etag: PropTypes.string,
  refetchRemediationPlaybookRuns: PropTypes.func,
  remediationStatus: PropTypes.object,
};
