import React from 'react';

import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  ExternalLinkAltIcon,
  TimesCircleIcon,
  InProgressIcon,
  SyncIcon,
} from '@patternfly/react-icons';
import {
  Button,
  Flex,
  FlexItem,
  TextContent,
  Text,
  TextVariants,
  Tooltip,
} from '@patternfly/react-core';

import { CancelButton } from '../containers/CancelButton';

import { capitalize } from '../Utilities/utils';

const connectorUrl = () =>
  insights.chrome.isBeta()
    ? 'https://cloud.redhat.com/beta/settings/connector'
    : 'https://cloud.redhat.com/settings/connector';

export const normalizeStatus = (status) =>
  ({
    running: 'running',
    pending: 'running',
    acked: 'running',
    failure: 'failure',
    canceled: 'canceled',
    success: 'success',
  }[status]);

export const renderStatusIcon = (status) =>
  ({
    running: (
      <InProgressIcon
        className="ins-c-remediations-running"
        aria-label="connection status"
      />
    ),
    success: (
      <CheckCircleIcon
        className="ins-c-remediations-success"
        aria-label="connection status"
      />
    ),
    failure: (
      <TimesCircleIcon
        className="ins-c-remediations-failure"
        aria-label="connection status"
      />
    ),
    canceled: (
      <TimesCircleIcon
        className="ins-c-remediations-canceled"
        aria-label="connection status"
      />
    ),
  }[status]);

export const renderStatus = (status, text) =>
  ({
    running: (
      <Flex
        className="ins-c-remediations-running"
        spacer={{ default: 'space-items-sm' }}
      >
        <FlexItem>
          <b>{text || 'Running'}</b>
        </FlexItem>
        <FlexItem>
          <InProgressIcon aria-label="connection status: running" />
        </FlexItem>
      </Flex>
    ),
    success: (
      <Flex
        className="ins-c-remediations-success"
        spacer={{ default: 'space-items-sm' }}
      >
        <FlexItem>
          <b>{text || 'Success'}</b>
        </FlexItem>
        <FlexItem>
          <CheckCircleIcon aria-label="connection status: success" />
        </FlexItem>
      </Flex>
    ),
    failure: (
      <Flex
        className="ins-c-remediations-failure"
        spacer={{ default: 'space-items-sm' }}
      >
        <FlexItem>
          <b>{text || 'Failed'}</b>
        </FlexItem>
        <FlexItem>
          <TimesCircleIcon aria-label="connection status: failed" />
        </FlexItem>
      </Flex>
    ),
    canceled: (
      <Flex
        className="ins-c-remediations-canceled"
        spacer={{ default: 'space-items-sm' }}
      >
        <FlexItem>
          <b>{text || 'Canceled'}</b>
        </FlexItem>
        <FlexItem>
          <TimesCircleIcon aria-label="connection status: canceled" />
        </FlexItem>
      </Flex>
    ),
  }[status]);

const statusTextClass = 'ins-c-remediations-status-text';
export const statusText = (executorStatus) =>
  ({
    running: (
      <b className={`${statusTextClass} ins-c-remediations-running`}>Running</b>
    ),
    pending: (
      <b className={`${statusTextClass} ins-c-remediations-running`}>Pending</b>
    ),
    acked: (
      <b className={`${statusTextClass} ins-c-remediations-running`}> Acked </b>
    ),
    success: (
      <b className={`${statusTextClass} ins-c-remediations-success`}>
        Succeeded
      </b>
    ),
    failure: (
      <b className={`${statusTextClass} ins-c-remediations-failure`}>Failed</b>
    ),
    canceled: (
      <b className={`${statusTextClass} ins-c-remediations-canceled`}>
        Canceled
      </b>
    ),
  }[executorStatus]);

export const pluralize = (number, str) =>
  number === 1 ? `${number} ${str}` : `${number} ${str}s`;

export const StatusSummary = ({
  executorStatus,
  permission,
  hasCancel,
  counts,
  remediationName,
  remediationId,
  playbookId,
}) => {
  const runningCount =
    counts.acked && !counts.acked.isNaN()
      ? counts.running + counts.pending + counts.acked
      : counts.running + counts.pending;
  const failCount = counts.failure + counts.canceled;
  const passCount = counts.success;
  const isDebug = () => localStorage.getItem('remediations:debug') === 'true';

  const statusBar = (
    <Flex className="ins-c-remediations-status-bar">
      {executorStatus && <FlexItem>{statusText(executorStatus)}</FlexItem>}
      <FlexItem>{renderStatus('success', `${passCount}`)}</FlexItem>
      <FlexItem>{renderStatus('failure', `${failCount}`)}</FlexItem>
      <FlexItem>{renderStatus('running', `${runningCount}`)}</FlexItem>
      {isDebug() &&
        hasCancel &&
        permission.permissions.execute &&
        executorStatus &&
        normalizeStatus(executorStatus) === 'running' && (
          <FlexItem>
            <CancelButton
              remediationName={remediationName}
              remediationId={remediationId}
              playbookId={playbookId}
            />
          </FlexItem>
        )}
    </Flex>
  );

  if (executorStatus) {
    return (
      <Tooltip
        position="right"
        className="ins-c-status-tooltip"
        enableFlip
        content={
          <div>
            Run: {capitalize(executorStatus)} <br />
            Success: {pluralize(counts.success, 'system')} <br />
            Failed: {pluralize(counts.failure, 'system')} <br />
            Canceled: {pluralize(counts.canceled, 'system')} <br />
            {counts.acked && !counts.acked.isNaN()
              ? `Pending, Running, Acked: ${pluralize(
                  counts.pending + counts.running + counts.acked,
                  'system'
                )}`
              : `Pending, Running: ${pluralize(
                  counts.pending + counts.running,
                  'system'
                )}`}
          </div>
        }
      >
        {statusBar}
      </Tooltip>
    );
  }

  return statusBar;
};

export const styledConnectionStatus = (status, err) =>
  ({
    connected: (
      <TextContent>
        <Text component={TextVariants.p}>
          <CheckCircleIcon
            className="ins-c-remediations-reboot-check-circle ins-c-remediations-connection-status"
            aria-label="connection status"
          />
          Ready
        </Text>
      </TextContent>
    ),
    // TODO: delete?
    available: (
      <TextContent>
        <Text component={TextVariants.p}>
          <CheckCircleIcon
            className="ins-c-remediations-reboot-check-circle ins-c-remediations-connection-status"
            aria-label="connection status"
          />
          Ready
        </Text>
      </TextContent>
    ),
    disconnected: (
      <TextContent>
        <Text component={TextVariants.p}>
          Connection issue
          <Text component={TextVariants.small} style={{ margin: '0px' }}>
            Receptor not responding
          </Text>
          {/* <Button
                    style={ { padding: '0px' } }
                    key="troubleshoot"
                    // eslint-disable-next-line no-console
                    variant='link' onClick={ () => console.log('TODO: add link') }>
                    Troubleshoot
                </Button> */}
        </Text>
      </TextContent>
    ),
    // TODO: delete?
    unavailable: (
      <TextContent>
        <Text component={TextVariants.p}>
          <ExclamationCircleIcon
            className="ins-c-remediations-failure ins-c-remediations-connection-status"
            aria-label="connection status"
          />
          Connection issue
          <Text component={TextVariants.small} style={{ margin: '0px' }}>
            {err ? err : 'Cloud Connector not responding'}
          </Text>
          <Button
            className="pf-u-p-0"
            key="troubleshoot"
            // eslint-disable-next-line no-console
            variant="link"
            onClick={() => console.log('TODO: add link')}
          >
            Troubleshoot
          </Button>
        </Text>
      </TextContent>
    ),
    // eslint-disable-next-line camelcase
    no_executor: (
      <TextContent>
        <Text component={TextVariants.p}>
          Cannot remediate - Direct connection.
          <Text component={TextVariants.small} style={{ margin: '0px' }}>
            Connect your systems to Satellite to automatically remediate.
          </Text>
          <Button
            className="pf-u-p-0"
            key="download"
            variant="link"
            component="a"
            // eslint-disable-next-line max-len
            href="https://access.redhat.com/documentation/en-us/red_hat_insights/2020-04/html/remediating_issues_across_your_red_hat_satellite_infrastructure_using_red_hat_insights/configuring-your-satellite-infrastructure-to-communicate-with-insights"
          >
            Learn how to connect &nbsp;
            <ExternalLinkAltIcon />
          </Button>
        </Text>
      </TextContent>
    ),
    // eslint-disable-next-line camelcase
    no_source: (
      <TextContent>
        <Text component={TextVariants.p}>
          Cannot remediate - Satellite not configured
          <Text component={TextVariants.small} style={{ margin: '0px' }}>
            Satellite not registered for Playbook execution
          </Text>
          {/* <Button
                    style={ { padding: '0px' } }
                    key="configure"
                    // eslint-disable-next-line no-console
                    variant='link' onClick={ () => console.log('TODO: add link') }>
                    Learn how to register Satellite
                </Button> */}
        </Text>
      </TextContent>
    ),
    // eslint-disable-next-line camelcase
    no_receptor: (
      <TextContent>
        <Text component={TextVariants.p}>
          <ExclamationCircleIcon
            className="ins-c-remediations-failure ins-c-remediations-connection-status"
            aria-label="connection status"
          />
          Cannot remediate - Cloud connector not defined
          <Text component={TextVariants.small} style={{ margin: '0px' }}>
            Configure Cloud connector to automatically remediate
          </Text>
          <Button
            className="pf-u-p-0"
            key="configure"
            variant="link"
            component="a"
            // eslint-disable-next-line max-len
            href="https://access.redhat.com/documentation/en-us/red_hat_insights/2020-04/html/remediating_issues_across_your_red_hat_satellite_infrastructure_using_red_hat_insights/configuring-your-satellite-infrastructure-to-communicate-with-insights"
          >
            Learn how to configure &nbsp;
            <ExternalLinkAltIcon />
          </Button>
        </Text>
      </TextContent>
    ),
    no_rhc: (
      <TextContent>
        <Text component={TextVariants.p}>
          Cannot remediate - Cloud connector not defined
          <Text component={TextVariants.small} style={{ margin: '0px' }}>
            Remediation from Insights requires Cloud connector. Cloud connector
            can be enabled via Satelite, or through &nbsp;
            <Button
              className="pf-u-p-0"
              key="configure"
              variant="link"
              component="a"
              // eslint-disable-next-line max-len
              href={connectorUrl()}
            >
              RHC (Red Hat connector)
            </Button>
          </Text>
          <Button
            className="pf-u-p-0"
            key="download"
            variant="link"
            component="a"
            // eslint-disable-next-line max-len
            href="#"
          >
            Learn how to configure &nbsp;
            <ExternalLinkAltIcon />
          </Button>
        </Text>
      </TextContent>
    ),
    no_smart_management: (
      <TextContent>
        <Text component={TextVariants.p}>
          Cannot remediate - Not entitled
          <Text component={TextVariants.small} style={{ margin: '0px' }}>
            Remediation from Insights is supported only for systems with Cloud
            connector, a feature of Smart Management
          </Text>
          <Button
            className="pf-u-p-0"
            key="download"
            variant="link"
            component="a"
            // eslint-disable-next-line max-len
            href="#"
          >
            Learn about Smart Management &nbsp;
            <ExternalLinkAltIcon />
          </Button>
        </Text>
      </TextContent>
    ),
    disabled: (
      <TextContent>
        <Text component={TextVariants.p}>
          Cannot remediate - Cloud connector not defined
          <Text component={TextVariants.small} style={{ margin: '0px' }}>
            Remediation from Insights requires Cloud connector. Cloud connector
            can be enabled via Satelite, or through &nbsp;
            <Button
              className="pf-u-p-0"
              key="configure"
              variant="link"
              component="a"
              // eslint-disable-next-line max-len
              href={connectorUrl()}
            >
              RHC (Red Hat connector)
            </Button>
          </Text>
          <Button
            className="pf-u-p-0"
            key="download"
            variant="link"
            component="a"
            // eslint-disable-next-line max-len
            href="#"
          >
            Learn how to configure &nbsp;
            <ExternalLinkAltIcon />
          </Button>
        </Text>
      </TextContent>
    ),
    loading: (
      <TextContent>
        <Text component={TextVariants.small}>
          <SyncIcon
            className="ins-c-remediations-connection-status"
            aria-label="connection status"
          />
          Checking
        </Text>
      </TextContent>
    ),
  }[status]);
