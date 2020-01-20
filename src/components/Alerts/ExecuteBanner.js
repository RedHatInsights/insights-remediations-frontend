import React from 'react';
import propTypes from 'prop-types';

import { Alert, AlertActionLink } from '@patternfly/react-core';

const ExecuteBanner = ({ onCancel, ...props }) => {
    return (
        <Alert
            variant="default"
            isInline
            title="Automatic remediation in progress"
            action={<AlertActionLink onClick={ onCancel }>Cancel</AlertActionLink>}
            {...props}
        />
    );
};

export default ExecuteBanner;

ExecuteBanner.propTypes = {
    onCancel: propTypes.func
};

ExecuteBanner.defaultProps = {
    onCancel: () => console.log('Cancel Remediation')
}
