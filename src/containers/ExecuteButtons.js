import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

import { getConnectionStatus } from '../actions';

import ExecuteButton from '../components/ExecuteButton';

export const ExecutePlaybookButton = withRouter(connect(
    ({ connectionStatus: { data, status }}) => ({
        data,
        isLoading: status !== 'fulfilled'
    }),
    (dispatch) => ({
        getConnectionStatus: (id) => {
            dispatch(getConnectionStatus(id));
        }
    })
)(ExecuteButton));
