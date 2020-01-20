import React, { useState, useEffect } from 'react';
import propTypes from 'prop-types';

import { Alert } from '@patternfly/react-core';
import './RemediationStatusToast.scss';

function RemediationStatusToast ({ status, name, ...props }) {

    const [ isVisible, setisVisible ] = useState(true);

    useEffect(() => {
        setTimeout(() => setisVisible(false), 8000);
    });

    return (
        <React.Fragment>
            { isVisible &&
                <Alert
                    className='ins-c-remediation-toast__status'
                    variant={ (status === 'passed' ? 'success' : 'danger') }
                    title={ `Remediation plan ${ name } ${ status === 'passed' ? 'successfully completed' : 'failed' }` }
                    { ...props }
                />
            }
        </React.Fragment>
    );
}

export default RemediationStatusToast;

RemediationStatusToast.propTypes = {
    status: propTypes.oneOf([ 'passed', 'failed' ]),
    name: propTypes.string.isRequired
};

RemediationStatusToast.defaultProps = {
    status: 'passed'
};
