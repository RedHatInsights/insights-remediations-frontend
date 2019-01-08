import { deleteRemediation, deleteRemediationIssue, refreshRemediation, patchRemediationIssue } from '../actions';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

import DeleteButton from '../components/DeleteButton';
import ResolutionEditButton from '../components/ResolutionEditButton';
import RemediationDetailsTable from '../components/RemediationDetailsTable';

export const ConnectedDeleteButton = withRouter(connect(
    f => f,
    (dispatch, { history }) => ({
        onDelete: async remediation => {
            await dispatch(deleteRemediation(remediation.id));
            history.push('/');
        }
    })
)(DeleteButton));

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
