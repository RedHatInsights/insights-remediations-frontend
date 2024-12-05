import React from 'react';
import PropTypes from 'prop-types';
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
  Icon,
} from '@patternfly/react-core';

import { CancelButton } from '../containers/CancelButton';

import { capitalize } from '../Utilities/utils';
import InsightsLink from '@redhat-cloud-services/frontend-components/InsightsLink';

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
      <Icon>
        <InProgressIcon aria-label="connection status" />
      </Icon>
    ),
    success: (
      <Icon status="success">
        <CheckCircleIcon aria-label="connection status" />
      </Icon>
    ),
    failure: (
      <Icon status="danger">
        <TimesCircleIcon aria-label="connection status" />
      </Icon>
    ),
    canceled: (
      <Icon>
        <TimesCircleIcon aria-label="connection status" />
      </Icon>
    ),
  }[status]);

export const renderStatus = (status, text) =>
  ({
    running: (
      <Flex spacer={{ default: 'space-items-sm' }}>
        <FlexItem>
          <b>{text || 'Running'}</b>
        </FlexItem>
        <FlexItem>
          <Icon>
            <InProgressIcon aria-label="connection status: running" />
          </Icon>
        </FlexItem>
      </Flex>
    ),
    success: (
      <Flex spacer={{ default: 'space-items-sm' }}>
        <FlexItem>
          <b>{text || 'Success'}</b>
        </FlexItem>
        <FlexItem>
          <Icon status="success">
            <CheckCircleIcon aria-label="connection status: success" />
          </Icon>
        </FlexItem>
      </Flex>
    ),
    failure: (
      <Flex spacer={{ default: 'space-items-sm' }}>
        <FlexItem>
          <b>{text || 'Failed'}</b>
        </FlexItem>
        <FlexItem>
          <Icon status="danger">
            <TimesCircleIcon aria-label="connection status: failed" />
          </Icon>
        </FlexItem>
      </Flex>
    ),
    canceled: (
      <Flex className="rem-c-canceled" spacer={{ default: 'space-items-sm' }}>
        <FlexItem>
          <b>{text || 'Canceled'}</b>
        </FlexItem>
        <FlexItem>
          <Icon>
            <TimesCircleIcon aria-label="connection status: canceled" />
          </Icon>
        </FlexItem>
      </Flex>
    ),
  }[status]);

const statusTextClass = 'rem-c-status-text';
export const statusText = (executorStatus) =>
  ({
    running: <b className={`${statusTextClass} rem-c-running`}>Running</b>,
    pending: <b className={`${statusTextClass} rem-c-running`}>Pending</b>,
    acked: <b className={`${statusTextClass} rem-c-running`}> Acked </b>,
    success: <b className={`${statusTextClass} rem-c-success`}>Succeeded</b>,
    failure: <b className={`${statusTextClass} rem-c-failure`}>Failed</b>,
    canceled: <b className={`${statusTextClass} rem-c-canceled`}>Canceled</b>,
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
    <Flex className="rem-c-status-bar">
      {executorStatus && <FlexItem>{statusText(executorStatus)}</FlexItem>}
      <FlexItem className="rem-c-success">
        {renderStatus('success', `${passCount}`)}
      </FlexItem>
      <FlexItem className="rem-c-failure">
        {renderStatus('failure', `${failCount}`)}
      </FlexItem>
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

StatusSummary.propTypes = {
  executorStatus: PropTypes.string,
  permission: PropTypes.object,
  hasCancel: PropTypes.bool,
  counts: PropTypes.object,
  remediationName: PropTypes.string,
  remediationId: PropTypes.string,
  playbookId: PropTypes.string,
};

export const styledConnectionStatus = (status) =>
  ({
    connected: (
      <TextContent>
        <Text component={TextVariants.p}>
          <CheckCircleIcon
            className="rem-c-reboot-check-circle rem-c-connection-status"
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
            RHC not responding
          </Text>
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
            href="https://access.redhat.com/documentation/en-us/red_hat_insights/1-latest/html/red_hat_insights_remediations_guide/index"
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
        </Text>
      </TextContent>
    ),
    // eslint-disable-next-line camelcase
    no_receptor: (
      <TextContent>
        <Text component={TextVariants.p}>
          <ExclamationCircleIcon
            className="rem-c-failure rem-c-connection-status"
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
            href="https://access.redhat.com/documentation/en-us/red_hat_insights/1-latest/html/red_hat_insights_remediations_guide/index"
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
            <InsightsLink
              app="connector"
              to="/"
              className="pf-v5-u-font-size-md pf-v5-u-display-inline-block"
            >
              RHC (Red Hat connector)
            </InsightsLink>
          </Text>
          <Button
            className="pf-u-p-0"
            key="download"
            variant="link"
            component="a"
            // eslint-disable-next-line max-len
            href="https://access.redhat.com/documentation/en-us/red_hat_insights/1-latest/html/red_hat_insights_remediations_guide/index"
          >
            Learn how to configure &nbsp;
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
            <InsightsLink
              app="connector"
              to="/"
              className="pf-v5-u-font-size-md pf-v5-u-display-inline-block"
            >
              RHC (Red Hat connector)
            </InsightsLink>
          </Text>
          <Button
            className="pf-u-p-0"
            key="download"
            variant="link"
            component="a"
            // eslint-disable-next-line max-len
            href="https://access.redhat.com/documentation/en-us/red_hat_insights/1-latest/html/red_hat_insights_remediations_guide/index"
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
            className="rem-c-connection-status"
            aria-label="connection status"
          />
          Checking
        </Text>
      </TextContent>
    ),
  }[status]);
