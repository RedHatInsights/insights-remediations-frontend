import { ACTION_TYPES } from './constants';
import { remediations, resolutions, getRemediationStatus } from './api';

export const loadRemediations = (sortBy = 'updated_at', sortDir = 'desc', filter, limit, offset) => ({
    type: ACTION_TYPES.LOAD_REMEDIATIONS,
    payload: remediations.getRemediations(`${sortDir === 'desc' ? '-' : ''}${sortBy}`, filter, limit, offset)
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

export const deleteRemediationIssueSystem = (id, issue, system) => ({
    type: ACTION_TYPES.DELETE_REMEDIATION_ISSUE_SYSTEM,
    payload: remediations.deleteRemediationIssueSystem(id, issue, system).then(() => ({ id, issue, system }))
});

export const patchRemediationIssue = (id, issue, resolution) => ({
    type: ACTION_TYPES.PATCH_REMEDIATION_ISSUE,
    payload: remediations.updateRemediationIssue(id, issue, { resolution })
});

export const getResolutions = (ruleId) => ({
    type: ACTION_TYPES.GET_RESOLUTIONS,
    payload: resolutions.getResolutionsForIssue(ruleId)
});

export const getConnectionStatus = (id) => {
    return {
        type: ACTION_TYPES.GET_CONNECTION_STATUS,
        payload: remediations.getRemediationConnectionStatus(id)
    };
};

export const runRemediation = (id, etag) => {
    return {
        type: ACTION_TYPES.RUN_REMEDIATION,
        payload: remediations.runRemediation(id, { headers: { 'If-Match': etag }})
    };
};

export const setEtag = (etag) => ({
    type: ACTION_TYPES.SET_ETAG,
    payload: { etag }
});

export const getPlaybookRuns = (remediationId) => ({
    type: ACTION_TYPES.GET_PLAYBOOK_RUNS,
    payload: remediations.listPlaybookRuns("9197ba55-0abc-4028-9bbe-269e530f8bd5")
});

export const getPlaybookRun = (remediationId, runId) => ({
    type: ACTION_TYPES.GET_PLAYBOOK_RUN,
    payload: remediations.getPlaybookRunDetails("9197ba55-0abc-4028-9bbe-269e530f8bd5", "a8799a02-8be9-11e8-9eb6-529269fb1459")
});

export const getPlaybookRunSystems = (remediationId, runId, executorId) => ({
    type: ACTION_TYPES.GET_PLAYBOOK_RUN_SYSTEMS,
    payload: remediations.getPlaybookRunSystems("9197ba55-0abc-4028-9bbe-269e530f8bd5", "a8799a02-8be9-11e8-9eb6-529269fb1459", "9197ba55-0abc-4028-9bbe-269e530f8bd5")
});

export const getPlaybookRunSystemDetails = (remediationId, runId, systemId) => ({
    type: ACTION_TYPES.GET_PLAYBOOK_RUN_SYSTEM_DETAIL,
    payload: remediations.getPlaybookRunSystemDetails("9197ba55-0abc-4028-9bbe-269e530f8bd5", "a8799a02-8be9-11e8-9eb6-529269fb1459", "a8799a02-8be9-11e8-9eb6-529269fb1459")
});

export const expandInventoryTable = (id, isOpen) => ({
    type: ACTION_TYPES.EXPAND_INVENTORY_TABLE,
    payload: {
        id,
        isOpen
    }
});