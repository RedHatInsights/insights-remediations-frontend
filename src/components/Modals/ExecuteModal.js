/* eslint-disable camelcase */
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Button,
  Modal,
  ModalVariant,
  TextContent,
  Text,
  TextVariants,
  Alert,
  Tooltip,
  ExpandableSection,
  List,
  ListItem,
} from '@patternfly/react-core';
import { downloadPlaybook } from '../../api';
import { styledConnectionStatus } from '../statusHelper';
import {
  TableHeader,
  Table,
  TableBody,
  TableVariant,
} from '@patternfly/react-table';
import { Skeleton } from '@redhat-cloud-services/frontend-components/Skeleton';
import { ExternalLinkAltIcon } from '@patternfly/react-icons';
import './ExecuteModal.scss';
import EmptyExecutePlaybookState from '../EmptyExecutePlaybookState';
import { dispatchNotification } from '../../Utilities/dispatcher';

export const ExecuteModal = ({
  isOpen,
  onClose,
  showRefresh,
  isLoading,
  data,
  remediationId,
  remediationName,
  issueCount,
  runRemediation,
  etag,
  setEtag,
}) => {
  const [isUserEntitled, setIsUserEntitled] = useState(false);
  const [connected, setConnected] = useState([]);
  const [disconnected, setDisconnected] = useState([]);
  const isDebug = () => localStorage.getItem('remediations:debug') === 'true';

  useEffect(() => {
    window.insights.chrome.auth
      .getUser()
      .then((user) =>
        setIsUserEntitled(user.entitlements.smart_management.is_entitled)
      );
  }, []);

  useEffect(() => {
    const [con, dis] = data.reduce(
      ([pass, fail], e) =>
        e && e.connection_status === 'connected'
          ? [[...pass, { ...e }], fail]
          : [pass, [...fail, e]],
      [[], []]
    );
    setConnected(con);
    setDisconnected(dis);
  }, [data]);

  const generateRowsStatus = (con) => {
    return styledConnectionStatus(con.connection_status);
  };

  const rows = [...connected, ...disconnected].map((con) => ({
    cells: [
      {
        title: con.executor_name ? (
          <Tooltip content={`${con.executor_name}`}>
            <span>
              {con.executor_name.length > 25
                ? `${con.executor_name.slice(0, 22)}...`
                : con.executor_name}
            </span>
          </Tooltip>
        ) : (
          'Direct connection'
        ),
      },
      con.system_count,
      isUserEntitled && {
        title: generateRowsStatus(con),
      },
    ],
  }));
  const connectedCount = connected.reduce((acc, e) => e.system_count + acc, 0);
  const systemCount = data.reduce((acc, e) => e.system_count + acc, 0);

  const pluralize = (number, str) =>
    number > 1 ? `${number} ${str}s` : `${number} ${str}`;

  return (
    <Modal
      className="remediations rem-c-execute-modal"
      variant={isDebug() ? ModalVariant.large : ModalVariant.small}
      title={'Execute playbook'}
      isOpen={isOpen}
      onClose={onClose}
      isFooterLeftAligned
      actions={
        systemCount !== 0
          ? [
              <Button
                key="confirm"
                variant="primary"
                ouiaId="etag"
                isDisabled={connected.length === 0}
                onClick={() => {
                  runRemediation(
                    remediationId,
                    etag,
                    disconnected.map((e) => e.executor_id).filter((e) => e)
                  );
                  dispatchNotification({
                    title: `Executing playbook ${remediationName}`,
                    description: (
                      <span>
                        View results in the <b>Activity tab</b>
                      </span>
                    ),
                    variant: 'success',
                    dismissable: true,
                    autoDismiss: true,
                  });
                }}
              >
                {isLoading
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
                  downloadPlaybook(remediationId);
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
              isDebug() ? (
                <Button
                  key="reset-etag"
                  onClick={() => setEtag('test')}
                  ouiaId="reset-etag"
                >
                  Reset etag
                </Button>
              ) : null,
            ]
          : [
              <Button
                key="close-modal"
                onClick={() => onClose()}
                variant="primary"
              >
                Close
              </Button>,
            ]
      }
    >
      <div className="rem-c-execute-modal__body">
        {showRefresh ? (
          <Alert
            variant="warning"
            isInline
            title="The connection status of systems associated with this Playbook has changed. Please review again."
          />
        ) : null}
        <TextContent>
          {isLoading ? (
            <Skeleton size="lg" />
          ) : (
            <Text component={TextVariants.p}>
              Playbook contains <b>{`${pluralize(issueCount, 'action')}`}</b>
              &nbsp;affecting
              <b> {`${pluralize(systemCount, 'system')}.`} </b>
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
                    key="download"
                    variant="link"
                    isInline
                    component="a"
                    // eslint-disable-next-line max-len
                    href="https://access.redhat.com/documentation/en-us/red_hat_insights/2023/html/using_cloud_connector_to_remediate_issues_across_your_red_hat_satellite_infrastructure/index"
                    rel="noreferrer"
                    target="_blank"
                  >
                    How to configure Receptor/Cloud Connector on Red Hat
                    Satellite &nbsp;
                    <ExternalLinkAltIcon />
                  </Button>
                </ListItem>
                <ListItem>
                  Are directly connected to Insights via Red Hat connector, and
                  Cloud Connector is enabled <br />
                  <Button
                    className="pf-u-p-0"
                    key="configure"
                    variant="link"
                    isInline
                    component="a"
                    // eslint-disable-next-line max-len
                    href="https://access.redhat.com/documentation/en-us/red_hat_insights/2023/html/red_hat_connector_configuration_guide/index"
                    rel="noreferrer"
                    target="_blank"
                  >
                    How to enable Cloud Connector with Red Hat connect &nbsp;
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
            key="configure"
            variant="link"
            isInline
            component="a"
            // eslint-disable-next-line max-len
            href="https://access.redhat.com/articles/rhc"
            rel="noreferrer"
            target="_blank"
          >
            Learn more about Cloud Connector &nbsp;
            <ExternalLinkAltIcon />
          </Button>
          {rows.length !== 0 && (
            <Text component={TextVariants.h4}>
              Connection status of systems
            </Text>
          )}
        </TextContent>
        {isLoading && <Skeleton size="lg" />}
        {!isLoading && systemCount !== 0 && (
          <Table
            variant={TableVariant.compact}
            aria-label="Systems"
            cells={[
              {
                title: 'Connection type',
                value: 'type',
              },
              {
                title: 'Systems',
                value: 'count',
              },
              isUserEntitled && {
                title: 'Connection status',
                value: 'status',
              },
            ]}
            rows={rows}
          >
            <TableHeader />
            <TableBody />
          </Table>
        )}
        {!isLoading && systemCount === 0 && <EmptyExecutePlaybookState />}
      </div>
    </Modal>
  );
};

ExecuteModal.propTypes = {
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
  showRefresh: PropTypes.bool,
  isLoading: PropTypes.bool,
  data: PropTypes.array,
  remediationId: PropTypes.string,
  remediationName: PropTypes.string,
  issueCount: PropTypes.number,
  runRemediation: PropTypes.func,
  etag: PropTypes.string,
  setEtag: PropTypes.func,
};
