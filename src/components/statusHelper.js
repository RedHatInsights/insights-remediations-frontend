import React from 'react';

import { CheckCircleIcon, TimesCircleIcon, InProgressIcon } from '@patternfly/react-icons';
import {
    Flex, FlexItem, FlexModifiers,
    Button, Tooltip
} from '@patternfly/react-core';

import { PermissionContext } from '../App';

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

export const statusSummary = (executorStatus, systemsStatus, permission, needsTooltip) => {
    // TODO: Cancel onClick()
    const statusBar = (
        <Flex className="ins-c-remediations-status-bar">
            <FlexItem>
                { statusText(executorStatus) }
            </FlexItem>
            <FlexItem>
                { renderStatus('success', systemsStatus.success) }
            </FlexItem>
            <FlexItem>
                { renderStatus('failure', systemsStatus.failure) }
            </FlexItem>
            <FlexItem>
                { renderStatus('running', systemsStatus.running) }
            </FlexItem>
            { permission.permissions.execute && systemsStatus.running &&
                <FlexItem>
                    <Button variant='link'> Cancel process </Button>
                </FlexItem>
            }
        </Flex>
    );
    
    if(needsTooltip) {
        return <Tooltip
            position='right'
            enableFlip
            content={
                <span>{`Run: ${statusTextPlain(executorStatus)} |
                        Pass: ${systemsStatus.success} |
                        Fail: ${systemsStatus.failure} |
                        Pending: ${systemsStatus.running}`}
                </span>
            }>
            { statusBar }
      </Tooltip>
    }

    return statusBar;
};

export const normalizeStatus = (status) => ({
    running: 'running',
    pending: 'running',
    failure: 'failure',
    canceled: 'failure',
    success: 'success',
    acked: 'success'
})[status];
