import React from 'react';

import { CheckCircleIcon, TimesCircleIcon, InProgressIcon } from '@patternfly/react-icons';
import {
    Flex, FlexItem, FlexModifiers, Tooltip
} from '@patternfly/react-core';

import { CancelButton } from '../containers/CancelButton';

import { capitalize } from '../Utilities/utils';

export const normalizeStatus = (status) => ({
    running: 'running',
    pending: 'running',
    acked: 'running',
    failure: 'failure',
    canceled: 'failure',
    success: 'success'
})[status];

export const renderStatusIcon = (status) => ({
    running: <InProgressIcon
        className="ins-c-remediations-running"
        aria-label="connection status" />,
    success: <CheckCircleIcon
        className="ins-c-remediations-success"
        aria-label="connection status" />,
    failure: <TimesCircleIcon
        className="ins-c-remediations-failure"
        aria-label="connection status" />
})[status];

export const renderStatus = (status, text) => ({
    running: <Flex className='ins-c-remediations-running' breakpointMods={ [{ modifier: FlexModifiers['space-items-sm'] }] }>
        <FlexItem><b>{ text || 'Running' }</b></FlexItem>
        <FlexItem><InProgressIcon aria-label="connection status: running"/></FlexItem>
    </Flex>,
    success: <Flex className="ins-c-remediations-success" breakpointMods={ [{ modifier: FlexModifiers['space-items-sm'] }] }>
        <FlexItem><b>{ text || 'Success' }</b></FlexItem>
        <FlexItem><CheckCircleIcon aria-label="connection status: success"/></FlexItem>
    </Flex>,
    failure: <Flex className="ins-c-remediations-failure" breakpointMods={ [{ modifier: FlexModifiers['space-items-sm'] }] }>
        <FlexItem><b>{ text || 'Failed' }</b></FlexItem>
        <FlexItem><TimesCircleIcon aria-label="connection status: failed"/></FlexItem>
    </Flex>
})[status];

const statusTextClass = 'ins-c-remediations-status-text';
export const statusText = (executorStatus) => ({
    running: <b className={ `${statusTextClass} ins-c-remediations-running` }> Running </b>,
    pending: <b className={ `${statusTextClass} ins-c-remediations-running` }> Pending </b>,
    acked: <b className={ `${statusTextClass} ins-c-remediations-running` }> Acked </b>,
    success: <b className={ `${statusTextClass} ins-c-remediations-success` }> Suceeded </b>,
    failure: <b className={ `${statusTextClass} ins-c-remediations-failure` }> Failed </b>,
    canceled: <b className={ `${statusTextClass} ins-c-remediations-failure` }> Canceled </b>
})[executorStatus];

export const StatusSummary = ({ executorStatus, permission, hasCancel, counts, remediationName, remediationId, playbookId }) => {

    const runningCount = counts.acked && !counts.acked.isNaN() ? counts.running + counts.pending + counts.acked : counts.running + counts.pending;
    const failCount = counts.failure + counts.canceled;
    const passCount = counts.success;
    const isDebug = () => localStorage.getItem('remediations:debug') === 'true';

    const statusBar = (
        <Flex className="ins-c-remediations-status-bar">
            { executorStatus &&
                <FlexItem>
                    { statusText(executorStatus) }
                </FlexItem>
            }
            <FlexItem>
                { renderStatus('success', `${passCount}`) }
            </FlexItem>
            <FlexItem>
                { renderStatus('failure', `${failCount}`) }
            </FlexItem>
            <FlexItem>
                { renderStatus('running', `${runningCount}`) }
            </FlexItem>
            { isDebug() && hasCancel && permission.permissions.execute && executorStatus && normalizeStatus(executorStatus) === 'running' &&
                <FlexItem>
                    <CancelButton
                        remediationName={ remediationName }
                        remediationId={ remediationId }
                        playbookId={ playbookId }/>
                </FlexItem>
            }
        </Flex>
    );

    const pluralize = (number, str) => number === 1 ? `${number} ${str}` : `${number} ${str}s`;
    const tooltipText = ` Run: ${capitalize(executorStatus)} |
    Success: ${pluralize(counts.success, 'system')} |
    Failed: ${pluralize(counts.failure, 'system')} |
    Canceled: ${pluralize(counts.canceled, 'system')} |
    Pending: ${pluralize(counts.pending, 'system')} |
    Running: ${pluralize(counts.running, 'system')}
    ${counts.acked && !counts.acked.isNaN() ? `| Acked: ${pluralize(counts.acked, 'system')}` : ''}`;

    if (executorStatus) {
        return <Tooltip
            position='right'
            className='ins-c-status-tooltip'
            enableFlip
            content={ <span>{ tooltipText } </span> }>
            { statusBar }
        </Tooltip>;
    }

    return statusBar;
};
