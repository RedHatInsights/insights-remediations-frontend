import { refreshRemediation, patchRemediationIssue, getResolutions } from '../actions';
import { connect } from 'react-redux';

import ResolutionEditButton from '../components/ResolutionEditButton';

export const ConnectResolutionEditButton = connect(
    f => f,
    dispatch => ({
        onResolutionSelected: async (remediation, issue, resolution) => {
            await dispatch(patchRemediationIssue(remediation, issue, resolution));
            dispatch(refreshRemediation(remediation));
        },
        getResolutions: ruleId => dispatch(getResolutions(ruleId))
    })
)(ResolutionEditButton);
