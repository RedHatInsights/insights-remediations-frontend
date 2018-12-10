
import { ACTION_TYPES } from '../constants';
import { applyReducerHash } from '@red-hat-insights/insights-frontend-components/Utilities/ReducerRegistry';

const reducers = {
    remediations: applyReducerHash({
        [ACTION_TYPES.LOAD_REMEDIATIONS_FULFILLED]: () => ({
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
        [ACTION_TYPES.LOAD_REMEDIATION_FULFILLED]: () => ({
            status: 'pending'
        }),
        [ACTION_TYPES.LOAD_REMEDIATION_FULFILLED]: (state, action) => ({
            status: 'fulfilled',
            remediation: action.payload
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
