import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

import { getConnectionStatus, runRemediation, toggleExecutePlaybookBanner } from '../actions';

import ExecuteButton from '../components/ExecuteButton';

export const ExecutePlaybookButton = withRouter(connect(
    ({ connectionStatus: { data, status, etag }, selectedRemediation, runRemediation }) => ({
        data,
        isLoading: status !== 'fulfilled',
        issueCount: selectedRemediation.remediation.issues.length,
        etag,
        remediationStatus: runRemediation.status
    }),
    (dispatch) => ({
        getConnectionStatus: (id) => {
            dispatch(getConnectionStatus(id));
        },
        toggleExecutePlaybookBanner: () => {
            dispatch(toggleExecutePlaybookBanner());
        },
        runRemediation: (id, etag) => {
            dispatch(runRemediation(id, etag));
        }
    })
)(ExecuteButton));
