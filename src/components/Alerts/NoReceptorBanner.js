import React from 'react';

import { Alert, Stack, StackItem } from '@patternfly/react-core';

const NoReceptorBanner = ({ ...props }) => {
    return (
        <Alert
            variant="info"
            isInline
            title="Do more with Find it Fix it capabilities"
            { ...props }>
            <Stack hasGutter>
                <StackItem>Configure your systems with Cloud Connector to fix systems across all your Satellite instances.</StackItem>
                <StackItem>
                    { /* eslint-disable-next-line max-len */ }
                    <a href="https://access.redhat.com/documentation/en-us/red_hat_insights/2020-04/html/remediating_issues_across_your_red_hat_satellite_infrastructure_using_red_hat_insights/configuring-your-satellite-infrastructure-to-communicate-with-insights">Learn how to configure</a>
                </StackItem>
            </Stack>
        </Alert>
    );
};

export default NoReceptorBanner;
