import { connect } from 'react-redux';
import {
  getConnectionStatus,
  runRemediation,
  setEtag,
  getPlaybookRuns,
  getEndpoint,
  checkExecutable,
} from '../actions';
import ExecuteButton from '../components/ExecuteButton';

export const ExecutePlaybookButton = connect(
  ({
    connectionStatus: { data, status, etag },
    selectedRemediation,
    runRemediation,
    sources,
    executable,
  }) => ({
    data,
    isLoading: status !== 'fulfilled',
    issueCount: selectedRemediation.remediation?.issues.length || 0,
    etag,
    remediationStatus: runRemediation.status,
    sources,
    executable,
  }),
  (dispatch) => ({
    getConnectionStatus: (id) => {
      dispatch(getConnectionStatus(id));
    },
    runRemediation: (id, etag, exclude) => {
      dispatch(runRemediation(id, etag, exclude)).then(() =>
        dispatch(getPlaybookRuns(id))
      );
    },
    setEtag: (etag) => {
      dispatch(setEtag(etag));
    },
    getEndpoint: (id) => {
      dispatch(getEndpoint(id));
    },
    checkExecutable: (id) => {
      dispatch(checkExecutable(id));
    },
  })
)(ExecuteButton);
