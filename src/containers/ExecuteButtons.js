import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

import { getConnectionStatus, executePlaybookBanner } from '../actions';

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
        executePlaybookBanner: (id) => {
            dispatch(executePlaybookBanner(id));
        }
    })
)(ExecuteButton));
