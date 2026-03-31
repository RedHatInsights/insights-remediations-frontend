import keyBy from 'lodash/keyBy';
import flatMap from 'lodash/flatMap';

const asyncActions = flatMap(
  [
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
    'RUN_REMEDIATION',
    'EXECUTE_PLAYBOOK_BANNER',
    'RUN_REMEDIATION',
    'GET_PLAYBOOK_RUNS',
    'GET_PLAYBOOK_RUN',
    'GET_PLAYBOOK_RUN_SYSTEMS',
    'GET_PLAYBOOK_RUN_SYSTEM_DETAILS',
    'CANCEL_PLAYBOOK_RUNS',
    'GET_ENDPOINT',
    'CHECK_EXECUTABLE',
  ],
  (a) => [a, `${a}_PENDING`, `${a}_FULFILLED`, `${a}_REJECTED`],
);

const actions = [
  'SET_ETAG',
  'EXPAND_INVENTORY_TABLE',
  'SELECT_ENTITY',
  'CLEAR_PLAYBOOK_RUN_SYSTEM_DETAILS',
];
export const ACTION_TYPES = keyBy([...asyncActions, ...actions], (k) => k);

export const SEARCH_DEBOUNCE_DELAY = 500;

export const FETCH_SELECTED_HOSTS = 'FETCH_SELECTED_HOSTS';
export const FETCH_RESOLUTIONS = 'FETCH_RESOLUTIONS';

/** Remediations service base path (RBAC v1 / legacy client) */
export const API_BASE = '/api/remediations/v1';

export const KESSEL_API_BASE_URL = '/api/kessel/v1beta2';

export const KESSEL_REMEDIATIONS_VIEW = 'remediations_view_remediation';
export const KESSEL_REMEDIATIONS_EDIT = 'remediations_edit_remediation';
export const KESSEL_REMEDIATIONS_EXECUTE = 'remediations_execute_remediation';
