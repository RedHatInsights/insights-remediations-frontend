import { deleteRemediationIssue, refreshRemediation, patchRemediationIssue } from '../actions';
import { connect } from 'react-redux';

import ResolutionEditButton from '../components/ResolutionEditButton';
import RemediationDetailsTable from '../components/RemediationDetailsTable';

export const ConnectResolutionEditButton = connect(
    f => f,
    dispatch => ({
        onResolutionSelected: async (remediation, issue, resolution) => {
            await dispatch(patchRemediationIssue(remediation, issue, resolution));
            dispatch(refreshRemediation(remediation));
        }
    })
)(ResolutionEditButton);

export const ConnectedRemediationDetailsTable = connect(
    f => f,
    (dispatch, { remediation }) => ({
        onDeleteActions: async (issues) => {
            issues.map(issue => dispatch(deleteRemediationIssue(remediation.id, issue)));
        }
    })
)(RemediationDetailsTable);
