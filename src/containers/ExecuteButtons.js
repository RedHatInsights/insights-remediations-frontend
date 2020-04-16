import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

import { getConnectionStatus, runRemediation, setEtag, getPlaybookRuns } from '../actions';

import ExecuteButton from '../components/ExecuteButton';

export const ExecutePlaybookButton = withRouter(connect(
    ({ connectionStatus: { data, status, etag }, selectedRemediation, runRemediation }) => ({
        data,
        isLoading: status !== 'fulfilled',
        issueCount: selectedRemediation.remediation.issues.length,
        needsReboot: selectedRemediation.remediation.needs_reboot,
        autoReboot: selectedRemediation.remediation.auto_reboot,
        etag,
        remediationStatus: runRemediation.status
    }),
    (dispatch) => ({
        getConnectionStatus: (id) => {
            dispatch(getConnectionStatus(id));
        },
        runRemediation: (id, etag) => {
            dispatch(runRemediation(id, etag)).then(() => dispatch(getPlaybookRuns(id)));
        },
        setEtag: (etag) => {
            dispatch(setEtag(etag));
        }

    })
)(ExecuteButton));
