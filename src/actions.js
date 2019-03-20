import { ACTION_TYPES } from './constants';
import { remediations, resolutions, getRemediationStatus } from './api';

export const loadRemediations = (sortBy = 'updated_at', sortDir = 'desc') => ({
    type: ACTION_TYPES.LOAD_REMEDIATIONS,
    payload: remediations.getRemediations(`${sortDir === 'desc' ? '-' : ''}${sortBy}`)
});

export const loadRemediation = (id) => ({
    type: ACTION_TYPES.LOAD_REMEDIATION,
    payload: remediations.getRemediation(id)
});

export const loadRemediationStatus = (id) => ({
    type: ACTION_TYPES.LOAD_REMEDIATION_STATUS,
    payload: getRemediationStatus(id) // TODO
});

export const refreshRemediation = (id) => ({
    type: ACTION_TYPES.REFRESH_REMEDIATION,
    payload: remediations.getRemediation(id)
});

export const createRemediation = (data) => ({
    type: ACTION_TYPES.CREATE_REMEDIATIONS,
    payload: remediations.createRemediation(data)
});

export const patchRemediation = (id, data) => ({
    type: ACTION_TYPES.PATCH_REMEDIATION,
    payload: remediations.updateRemediation(id, data).then(() => data)
});

export const deleteRemediation = (id) => ({
    type: ACTION_TYPES.DELETE_REMEDIATION,
    payload: remediations.deleteRemediation(id)
});

export const deleteRemediationIssue = (id, issueId) => ({
    type: ACTION_TYPES.DELETE_REMEDIATION_ISSUE,
    payload: remediations.deleteRemediationIssue(id, issueId).then(() => ({ id, issueId }))
});

export const patchRemediationIssue = (id, issue, resolution) => ({
    type: ACTION_TYPES.PATCH_REMEDIATION_ISSUE,
    payload: remediations.updateRemediationIssue(id, issue, { resolution })
});

export const getResolutions = (ruleId) => ({
    type: ACTION_TYPES.GET_RESOLUTIONS,
    payload: resolutions.getResolutionsForIssue(ruleId)
});
