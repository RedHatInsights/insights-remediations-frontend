import { deleteRemediation } from '../actions';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

import DeleteButton from '../components/DeleteButton';

export const ConnectedDeleteButton = withRouter(connect(
    f => f,
    (dispatch, { history }) => ({
        onDelete: async remediation => {
            await dispatch(deleteRemediation(remediation.id));
            history.push('/');
        }
    })
)(DeleteButton));
