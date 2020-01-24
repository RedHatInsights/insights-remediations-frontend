import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

import { getConnectionStatus, toggleExecutePlaybookBanner } from '../actions';

import ExecuteButton from '../components/ExecuteButton';

export const ExecutePlaybookButton = withRouter(connect(
    ({ connectionStatus: { data, status }, selectedRemediation }) => ({
        data,
        isLoading: status !== 'fulfilled',
        issueCount: selectedRemediation.remediation.issues.length
    }),
    (dispatch) => ({
        getConnectionStatus: (id) => {
            dispatch(getConnectionStatus(id));
        },
        toggleExecutePlaybookBanner: () => {
            dispatch(toggleExecutePlaybookBanner());
        }
    })
)(ExecuteButton));
