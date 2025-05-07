import React from 'react';
import PropTypes from 'prop-types';
import { Flex, FlexItem, Tooltip } from '@patternfly/react-core';
import { CancelButton } from '../containers/CancelButton';
import { capitalize } from '../Utilities/utils';
import { StatusIcon, StatusLabel } from '../routes/helpers';

export const pluralize = (n, word) =>
  n === 1 ? `${n} ${word}` : `${n} ${word}s`;

export const normalizeStatus = (raw) =>
  ({
    running: 'running',
    pending: 'running',
    acked: 'running',
    failure: 'failure',
    canceled: 'canceled',
    success: 'success',
  }[raw]);

export const StatusSummary = ({
  executorStatus,
  permission,
  hasCancel,
  counts,
  remediationName,
  remediationId,
  playbookId,
}) => {
  const running = counts.running + counts.pending + (counts.acked || 0);
  const bar = (
    <Flex className="rem-c-status-bar" spacer={{ default: 'space-items-sm' }}>
      {executorStatus && (
        <FlexItem>
          <StatusLabel status={normalizeStatus(executorStatus)} />
        </FlexItem>
      )}
      <FlexItem>
        <StatusIcon status="success" /> {counts.success}
      </FlexItem>
      <FlexItem>
        <StatusIcon status="failure" /> {counts.failure + counts.canceled}
      </FlexItem>
      <FlexItem>
        <StatusIcon status="running" /> {running}
      </FlexItem>
      {hasCancel &&
        permission?.permissions?.execute &&
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

  /* add a tooltip with counts */
  return executorStatus ? (
    <Tooltip
      position="right"
      content={
        <div>
          Run:&nbsp;{capitalize(executorStatus)} <br />
          Success:&nbsp;{pluralize(counts.success, 'system')} <br />
          Failed:&nbsp;{pluralize(counts.failure, 'system')} <br />
          Canceled:&nbsp;{pluralize(counts.canceled, 'system')} <br />
          Pending / Running:&nbsp;{pluralize(running, 'system')}
        </div>
      }
    >
      {bar}
    </Tooltip>
  ) : (
    bar
  );
};

StatusSummary.propTypes = {
  executorStatus: PropTypes.string,
  permission: PropTypes.object,
  hasCancel: PropTypes.bool,
  counts: PropTypes.object.isRequired,
  remediationName: PropTypes.string,
  remediationId: PropTypes.string,
  playbookId: PropTypes.string,
};
