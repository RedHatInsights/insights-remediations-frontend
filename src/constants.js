import keyBy from 'lodash/keyBy';
import flatMap from 'lodash/flatMap';

const asyncActions = flatMap([
    'LOAD_REMEDIATIONS',
    'CREATE_REMEDIATIONS',
    'LOAD_REMEDIATION',
    'LOAD_REMEDIATION_STATUS',
    'REFRESH_REMEDIATION',
    'PATCH_REMEDIATION',
    'DELETE_REMEDIATION',
    'DELETE_REMEDIATION_ISSUE',
    'DELETE_REMEDIATION_ISSUE_SYSTEM',
    'PATCH_REMEDIATION_ISSUE',
    'GET_RESOLUTIONS',
    'GET_CONNECTION_STATUS',
    'EXECUTE_PLAYBOOK_BANNER',
    'RUN_REMEDIATION'
], a => [ a, `${a}_PENDING`, `${a}_FULFILLED`, `${a}_REJECTED` ]);

const actions = [ 'SET_ETAG' ];
export const ACTION_TYPES = keyBy([ ...asyncActions, ...actions ], k => k);

export const SEARCH_DEBOUNCE_DELAY = 500;
