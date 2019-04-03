import { deleteRemediation } from '../actions';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

import ToolbarActionsDropdown from '../components/ToolbarActionsDropdown';

export const ToolbarActions = withRouter(connect(
    (state, { remediations }) => ({
        dialogMessage: `You will not be able to recover ${ remediations.length > 1 ? 'these remediations' : 'this remediation'}`
    }),
    (dispatch, { remediations, afterDelete }) => ({
        onDelete: async () => {
            await Promise.all(remediations.map(r => dispatch(deleteRemediation(r))));
            afterDelete();
        }
    })
)(ToolbarActionsDropdown));
