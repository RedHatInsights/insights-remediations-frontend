import React, { useEffect } from 'react';

import PropTypes from 'prop-types';

import './RemediationActivityTable.scss';


const RemediationActivityTable = ({
    remediation,
    playbookRuns,
}) => {

    console.log(remediation, playbookRuns);


    return <span> test </span>
};

RemediationActivityTable.propTypes = {
    remediation: PropTypes.object,
    playbookRuns: PropTypes.array
};

export default RemediationActivityTable;
