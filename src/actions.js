import { ACTION_TYPES } from './constants';
import * as api from './api';

export const loadRemediations = (sortBy, sortDir) => ({
    type: ACTION_TYPES.LOAD_REMEDIATIONS,
    payload: api.getRemediations(sortBy, sortDir)
});

export const loadRemediation = (id) => ({
    type: ACTION_TYPES.LOAD_REMEDIATION,
    payload: api.getRemediation(id)
});

export const refreshRemediation = (id) => ({
    type: ACTION_TYPES.REFRESH_REMEDIATION,
    payload: api.getRemediation(id)
});

export const createRemediation = (data) => {
    return {
        type: ACTION_TYPES.CREATE_REMEDIATIONS,
        payload: api.createRemediation(data)
    };
};

export const patchRemediation = (id, data) => {
    return {
        type: ACTION_TYPES.PATCH_REMEDIATION,
        payload: api.patchRemediation(id, data)
    };
};

export const deleteRemediation = (id) => ({
    type: ACTION_TYPES.DELETE_REMEDIATION,
    payload: api.deleteRemediation(id)
});

export const deleteRemediationIssue = (id, issueId) => ({
    type: ACTION_TYPES.DELETE_REMEDIATION_ISSUE,
    payload: api.deleteRemediationIssue(id, issueId).then(() => ({ id, issueId }))
});

export const patchRemediationIssue = (id, issue, resolution) => ({
    type: ACTION_TYPES.PATCH_REMEDIATION_ISSUE,
    payload: api.patchRemediationIssue(id, issue, resolution)
});
