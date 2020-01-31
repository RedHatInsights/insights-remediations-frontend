import React from 'react';
import propTypes from 'prop-types';

import { Alert, AlertActionLink } from '@patternfly/react-core';

const ExecuteBanner = ({ onCancel, ...props }) => {
    return (
        <Alert
            variant="default"
            isInline
            title="Playbook in progress"
            action={ <AlertActionLink onClick={ onCancel }>Cancel</AlertActionLink> }
            { ...props }
        />
    );
};

export default ExecuteBanner;

ExecuteBanner.propTypes = {
    onCancel: propTypes.func
};

/* eslint-disable no-console */
ExecuteBanner.defaultProps = {
    onCancel: () => console.log('Cancel Playbook')
};
/* eslint-enable no-console */
