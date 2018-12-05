import { ACTION_TYPES } from './constants';
import * as api from './api';

export const loadRemediations = () => ({
    type: ACTION_TYPES.LOAD_REMEDIATIONS,
    payload: api.getRemediations()
});

export const loadRemediation = (id) => ({
    type: ACTION_TYPES.LOAD_REMEDIATION,
    payload: api.getRemediation(id)
});

export const createRemediation = (data) => {
    return {
        type: ACTION_TYPES.CREATE_REMEDIATIONS,
        payload: api.createRemediation(data)
    };
};
