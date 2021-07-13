import { deleteRemediation, loadRemediationStatus } from '../actions';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

import { loadRemediations, deleteRemediationIssue } from '../actions';
import { isBeta } from '../config';

import DeleteButton from '../components/DeleteButton';

export const DeleteRemediationsButton = withRouter(
  connect(
    (state, { remediations }) => ({
      dialogMessage: `You will not be able to recover ${
        remediations.length > 1 ? 'these remediations' : 'this remediation'
      }`,
    }),
    (dispatch, { remediations }) => ({
      onDelete: async () => {
        await Promise.all(
          remediations.map((r) => dispatch(deleteRemediation(r)))
        );
        dispatch(loadRemediations());
      },
    })
  )(DeleteButton)
);

export const DeleteActionsButton = withRouter(
  connect(
    (state, { issues }) => ({
      label: `Remove action${issues.length > 1 ? 's' : ''}`,
    }),
    (dispatch, { remediation, issues, afterDelete }) => ({
      onDelete: async () => {
        await Promise.all(
          issues.map((issueId) =>
            dispatch(deleteRemediationIssue(remediation.id, issueId))
          )
        );
        if (isBeta) {
          dispatch(loadRemediationStatus(remediation.id));
        }

        afterDelete();
      },
    })
  )(DeleteButton)
);
