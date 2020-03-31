import React, { useEffect } from 'react';

import PropTypes from 'prop-types';

import './RemediationActivityTable.scss';


const RemediationActivityTable = ({
    remediation,
    runs,
}) => {

    console.log(remediation, runs);


    return <span> test </span>
};

RemediationActivityTable.propTypes = {
    remediation: PropTypes.object,
    runs: PropTypes.array
};

export default RemediationActivityTable;
