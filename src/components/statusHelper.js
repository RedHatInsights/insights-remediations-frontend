import React from 'react';

import { CheckCircleIcon, TimesCircleIcon, InProgressIcon } from '@patternfly/react-icons';
import {
    Flex, FlexItem, FlexModifiers,
    Button, Tooltip
} from '@patternfly/react-core';

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

export const statusText = (executorStatus) => ({
    running: <b className="ins-c-remediations-running"> Running </b>,
    success: <b className="ins-c-remediations-success"> Suceeded </b>,
    failure: <b className="ins-c-remediations-failure"> Failed </b>
})[executorStatus];

export const statusTextPlain = (executorStatus) => ({
    running: 'Running',
    success: 'Suceeded',
    failure: 'Failed'
})[executorStatus];
/*
    executorStatus: bool,
    systemsStatus: {
        "pending": num,
        "running": num,
        "success": num,
        "failure": num,
        "canceled": num
    }
*/
export const StatusSummary = ({executorStatus, permission, needsTooltip, onCancel, counts}) => {
    // TODO: Cancel onClick()

    const runningCount = counts.running + counts.pending;
    const failCount = counts.failure + counts.canceled;
    const passCount = counts.success;

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
            { onCancel && permission.permissions.execute && executorStatus && normalizeStatus(executorStatus) === 'running' &&
                <FlexItem>
                    <Button variant='link' onClick={onCancel}> Cancel process </Button>
                </FlexItem>
            }
        </Flex>
    );

    if (needsTooltip && executorStatus) {
        return <Tooltip
            position='right'
            className='ins-c-status-tooltip'
            enableFlip
            content={
                <span>{ `Run: ${executorStatus.charAt(0).toUpperCase() + executorStatus.slice(1)} |
                        Pass: ${passCount} |
                        Fail: ${failCount} |
                        Pending: ${runningCount}` }
                </span>
            }>
            { statusBar }
        </Tooltip>;
    }

    return statusBar;
};

export const normalizeStatus = (status) => ({
    running: 'running',
    pending: 'running',
    acked: 'running',
    failure: 'failure',
    canceled: 'failure',
    success: 'success'
})[status];
