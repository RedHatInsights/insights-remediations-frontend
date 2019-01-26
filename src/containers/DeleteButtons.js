import { deleteRemediation } from '../actions';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

import { loadRemediations, deleteRemediationIssue } from '../actions';

import DeleteButton from '../components/DeleteButton';

export const DeleteRemediationButton = withRouter(connect(
    () => ({
        dialogMessage: 'You will not be able to recover this remediation'
    }),
    (dispatch, { history, remediation }) => ({
        onDelete: async () => {
            await dispatch(deleteRemediation(remediation.id));
            history.push('/');
        }
    })
)(DeleteButton));

export const DeleteRemediationsButton = withRouter(connect(
    (state, { remediations }) => ({
        dialogMessage: `You will not be able to recover ${ remediations.length > 1 ? 'these remediations' : 'this remediation'}`
    }),
    (dispatch, { remediations }) => ({
        onDelete: async () => {
            await Promise.all(remediations.map(r => dispatch(deleteRemediation(r.id))));
            dispatch(loadRemediations());
        }
    })
)(DeleteButton));

export const DeleteActionsButton = withRouter(connect(
    (state, { issues }) => ({
        label: `Remove Action${ issues.length > 1 ? 's' : '' }`
    }),
    (dispatch, { remediation, issues }) => ({
        onDelete: async () => {
            issues.map(issue => dispatch(deleteRemediationIssue(remediation.id, issue.id)));
        }
    })
)(DeleteButton));
