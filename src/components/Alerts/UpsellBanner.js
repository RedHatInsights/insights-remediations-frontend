import React from 'react';
import propTypes from 'prop-types';

import { Alert, AlertActionCloseButton, Stack, StackItem } from '@patternfly/react-core';

const UpsellBanner = ({ onClose, ...props }) => {
    return (
        <Alert
            variant="info"
            isInline
            title="Do more with Find it Fix it capabilities"
            action={ <AlertActionCloseButton onClose={ onClose }/> }
            { ...props }>
            <Stack gutter='md'>
                <StackItem>Upgrade to Red Hat Smart Management to remediate all your systems, across regions and geographies</StackItem>
                <StackItem>
                    <a href="https://access.redhat.com/products/cloud_management_services_for_rhel/evaluation">Learn more</a>
                </StackItem>
            </Stack>
        </Alert>
    );
};

export default UpsellBanner;

UpsellBanner.propTypes = {
    onClose: propTypes.func
};

/* eslint-disable no-console */
UpsellBanner.defaultProps = {
    onClose: () => undefined
};
