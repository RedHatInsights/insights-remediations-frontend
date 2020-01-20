import React from 'react';
import propTypes from 'prop-types';

import { Alert } from '@patternfly/react-core';

const RemediationStatusToast = ({ status, name, ...props }) => {
    return (
        <Alert
            variant={ (status === 'passed' ? 'success' : 'danger') }
            title={`Remediation plan ${name} ${status === 'passed' ? 'successfully completed' : 'failed' }`}
            {...props}
        />
    );
};

export default RemediationStatusToast;

RemediationStatusToast.propTypes = {
    status: propTypes.oneOf(['passed', 'failed']),
    name: propTypes.string.isRequired
};

RemediationStatusToast.defaultProps = {
    status: 'passed'
}
