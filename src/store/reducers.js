
import { ACTION_TYPES } from '../constants';
import { applyReducerHash } from '@redhat-cloud-services/frontend-components-utilities/files/ReducerRegistry';
import flatMap from 'lodash/flatMap';
import uniq from 'lodash/uniq';

function issuesToSystemsIds (issues) {
    return uniq(flatMap(issues, issue => issue.systems.map(system => system.id)));
}

function computeRebootStats (remediation) {
    const systems = issuesToSystemsIds(remediation.issues);
    const rebootRequired = issuesToSystemsIds(remediation.issues.filter(issue => issue.resolution.needs_reboot));

    return {
        ...remediation,
        stats: {
            systemsWithReboot: rebootRequired.length,
            systemsWithoutReboot: systems.length - rebootRequired.length
        }
    };
}

const reducers = {
    remediations: applyReducerHash({
        [ACTION_TYPES.LOAD_REMEDIATIONS_PENDING]: () => ({
            status: 'pending'
        }),
        [ACTION_TYPES.LOAD_REMEDIATIONS_FULFILLED]: (state, action) => ({
            status: 'fulfilled',
            value: action.payload
        }),
        [ACTION_TYPES.LOAD_REMEDIATIONS_REJECTED]: () => ({
            status: 'rejected'
        })
    }, {
        status: 'initial'
    }),

    selectedRemediation: applyReducerHash({
        [ACTION_TYPES.LOAD_REMEDIATION_PENDING]: () => ({
            status: 'pending'
        }),
        [ACTION_TYPES.LOAD_REMEDIATION_FULFILLED]: (state, action) => ({
            status: 'fulfilled',
            remediation: computeRebootStats(action.payload)
        }),
        [ACTION_TYPES.REFRESH_REMEDIATION_FULFILLED]: (state, action) => {
            if (action.payload.id === state.remediation.id) {
                return {
                    status: 'fulfilled',
                    remediation: computeRebootStats(action.payload)
                };
            }

            return state;
        },
        [ACTION_TYPES.LOAD_REMEDIATION_REJECTED]: () => ({
            status: 'rejected'
        }),
        [ACTION_TYPES.PATCH_REMEDIATION_FULFILLED]: ({ status, remediation }, action) => {
            return {
                status,
                remediation: {
                    ...remediation,
                    ...action.payload
                }
            };
        },
        [ACTION_TYPES.DELETE_REMEDIATION_ISSUE_FULFILLED]: (state, action) => {
            const issues = state.remediation.issues.filter(issue => issue.id !== action.payload.issueId);
            if (action.payload.id === state.remediation.id) {
                return {
                    status: 'fulfilled',
                    remediation: computeRebootStats({
                        ...state.remediation,
                        issues,
                        needs_reboot: issues.some(issue => issue.resolution.needs_reboot) // eslint-disable-line camelcase
                    })
                };
            }

            return state;
        },
        [ACTION_TYPES.DELETE_REMEDIATION_ISSUE_SYSTEM_FULFILLED]: (state, action) => {
            if (action.payload.id !== state.remediation.id) {
                return state;
            }

            const issues = state.remediation.issues.filter(issue => {
                if (issue.id !== action.payload.issue) {
                    return true;
                }

                // if the action only had 1 systems, which is now gone, remove the action also
                issue.systems = issue.systems.filter(system => system.id !== action.payload.system);
                return issue.systems.length > 0;
            });

            return {
                status: 'fulfilled',
                remediation: computeRebootStats({
                    ...state.remediation,
                    issues,
                    needs_reboot: issues.some(issue => issue.resolution.needs_reboot) // eslint-disable-line camelcase
                })
            };
        }
    }, {
        status: 'initial'
    }),

    selectedRemediationStatus: applyReducerHash({
        [ACTION_TYPES.LOAD_REMEDIATION_STATUS_PENDING]: () => ({
            status: 'pending'
        }),
        [ACTION_TYPES.LOAD_REMEDIATION_STATUS_FULFILLED]: (state, action) => ({
            status: 'fulfilled',
            data: action.payload
        }),
        [ACTION_TYPES.LOAD_REMEDIATION_STATUS_REJECTED]: () => ({
            status: 'rejected'
        })
    }, {
        status: 'initial'
    }),

    connectionStatus: applyReducerHash({
        [ACTION_TYPES.GET_CONNECTION_STATUS_PENDING]: () => ({
            status: 'pending'
        }),
        [ACTION_TYPES.GET_CONNECTION_STATUS_FULFILLED]: (state, action) => ({
            status: 'fulfilled',
            data: action.payload.data,
            etag: action.payload.etag
        }),
        [ACTION_TYPES.GET_CONNECTION_STATUS_REJECTED]: () => ({
            status: 'rejected',
            data: []
        })
    }, {
        status: 'initial'
    }),

    executePlaybookBanner: applyReducerHash({
        [ACTION_TYPES.EXECUTE_PLAYBOOK_BANNER]: (state) => ({
            isVisible: !state.isVisible
        })
    }, {
        isVisible: false
    }),

    inventoryEntitiesReducer: (props) => () => applyReducerHash({
        [props.INVENTORY_ACTION_TYPES.LOAD_ENTITIES_FULFILLED]: (state) => {
            return {
                ...state,
                columns: [
                    { key: 'display_name', title: 'System name', composed: [ 'display_name' ]},
                    { key: 'satelite_id', title: 'Connection type', composed: [ 'satelite_id' ]}
                ]
            };
        }
    }, {
        status: 'initial'
    })

};

export default reducers;
