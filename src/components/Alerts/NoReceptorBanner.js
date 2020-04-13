import React from 'react';

import { Alert, Stack, StackItem } from '@patternfly/react-core';

const NoReceptorBanner = ({ ...props }) => {
    return (
        <Alert
            variant="info"
            isInline
            title="Do more with Find it Fix it capabilities"
            { ...props }>
            <Stack gutter='md'>
                <StackItem>Configure your systems with Cloud Connector to fix systems across all your Satellite instances.</StackItem>
                <StackItem>
                    <a href="#">Learn how to configure</a> { /* TODO */ }
                </StackItem>
            </Stack>
        </Alert>
    );
};

export default NoReceptorBanner;
