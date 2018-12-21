
import { ACTION_TYPES } from '../constants';
import { applyReducerHash } from '@red-hat-insights/insights-frontend-components/Utilities/ReducerRegistry';
import flatMap from 'lodash/flatMap';
import uniq from 'lodash/uniq';

function issuesToSystemsIds (issues) {
    return uniq(flatMap(issues, issue => issue.systems.map(system => system.id)));
}

function computeRebootStats (remediation) {
    const systems = issuesToSystemsIds(remediation.issues);
    const rebootRequired = issuesToSystemsIds(remediation.issues.filter(issue => issue.resolution.needs_reboot));

    return {
        stats: {
            systemsWithReboot: rebootRequired.length,
            systemsWithoutReboot: systems.length - rebootRequired.length
        },
        ...remediation
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
        [ACTION_TYPES.LOAD_REMEDIATION_REJECTED]: () => ({
            status: 'rejected'
        }),
        [ACTION_TYPES.PATCH_REMEDIATION_FULFILLED]: ({ status, remediation }, action) => {
            if (action.payload.auto_reboot !== undefined) {
                return {
                    status,
                    remediation: {
                        ...remediation,
                        auto_reboot: action.payload.auto_reboot // eslint-disable-line camelcase
                    }
                };
            }

            return { status, remediation };
        }
    }, {
        status: 'initial'
    })
};

export default reducers;
