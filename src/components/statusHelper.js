import React from 'react';

import { CheckCircleIcon, TimesCircleIcon, InProgressIcon } from '@patternfly/react-icons';
import {
    Split, SplitItem,
    Text, TextVariants
} from '@patternfly/react-core';
export const renderStatus = (status, text) => ({
    running: <Text component={ TextVariants.p } >
        <InProgressIcon
            className="ins-c-remediations-running"
            aria-label="connection status" />
        { text || 'Running' }
    </Text >,
    success: <Text component={ TextVariants.p }>
        <CheckCircleIcon
            className="ins-c-remediations-success"
            aria-label="connection status" />
        { text || 'Success' }
    </Text>,
    failure: <Text component={ TextVariants.p }>
        <TimesCircleIcon
            className="ins-c-remediations-failure"
            aria-label="connection status" />
        { text || 'Failed' }
    </Text>
})[status];

export const statusText = (executorStatus) => ({
    running: <Text component={ TextVariants.p } >
        Running
    </Text >,
    success: <Text className="ins-c-remediations-success" component={ TextVariants.p }>
        Suceeded
    </Text>,
    failure: <Text className="ins-c-remediations-failure" component={ TextVariants.p }>
        Failed
    </Text>
})[executorStatus];

export const statusSummary = (executorStatus, systemsStatus) => {
    return <Split style={ { display: 'flex' } } className="ins-c-remediations-status-bar">
        <SplitItem>
            { statusText('success') }
        </SplitItem>
        <SplitItem>
            { renderStatus('success', systemsStatus.success) }
        </SplitItem>
        <SplitItem>
            { renderStatus('failure', systemsStatus.failure) }
        </SplitItem>
        <SplitItem>
            { renderStatus('running', systemsStatus.running) }
        </SplitItem>
    </Split>;
};

export const normalizeStatus = (status) => ({
    running: 'running',
    pending: 'running',
    failure: 'failure',
    canceled: 'failure',
    success: 'success',
    acked: 'success'
})[status];