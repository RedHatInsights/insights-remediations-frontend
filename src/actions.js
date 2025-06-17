import { ACTION_TYPES } from './constants';
import {
  remediationsApi,
  deleteSystemsFromRemediation,
  sourcesApi,
} from './api';

// TODO: Remove after RemediationDetails are deleted

// RemediationDetails blocked
export const loadRemediation = (id) => ({
  type: ACTION_TYPES.LOAD_REMEDIATION,
  payload: remediationsApi.getRemediation(id),
});

// RemediationDetails blocked
export const patchRemediation = (id, data) => ({
  type: ACTION_TYPES.PATCH_REMEDIATION,
  payload: remediationsApi.updateRemediation(id, data).then(() => data),
});

// RemediationDetails blocked
export const deleteRemediation = (id) => ({
  type: ACTION_TYPES.DELETE_REMEDIATION,
  payload: remediationsApi.deleteRemediation(id),
});

// RemediationDetails blocked
export const deleteRemediationIssueSystem = (id, issue, system) => ({
  type: ACTION_TYPES.DELETE_REMEDIATION_ISSUE_SYSTEM,
  payload: remediationsApi
    .deleteRemediationIssueSystem(id, issue, system)
    .then(() => ({ id, issue, system })),
});

// RemediationDetails blocked
export const getConnectionStatus = (id) => {
  return {
    type: ACTION_TYPES.GET_CONNECTION_STATUS,
    payload: remediationsApi.getRemediationConnectionStatus(id),
  };
};

// RemediationDetails blocked
export const runRemediation = (id, etag, exclude) => {
  return {
    type: ACTION_TYPES.RUN_REMEDIATION,
    payload: remediationsApi.runRemediation(id, {
      headers: { 'If-Match': etag },
      data: { exclude },
    }),
  };
};

// RemediationDetails blocked
export const setEtag = (etag) => ({
  type: ACTION_TYPES.SET_ETAG,
  payload: { etag },
});

// RemediationDetails blocked
export const getPlaybookRuns = (remediationId) => ({
  type: ACTION_TYPES.GET_PLAYBOOK_RUNS,
  payload: remediationsApi.listPlaybookRuns(remediationId),
});

// CancelButton blocked
export const cancelPlaybookRuns = (remediationId, runId) => ({
  type: ACTION_TYPES.CANCEL_PLAYBOOK_RUNS,
  payload: remediationsApi.cancelPlaybookRuns(remediationId, runId),
});

// RemediationDetails blocked
export const getEndpoint = (id, options = {}) => ({
  type: ACTION_TYPES.GET_ENDPOINT,
  payload: sourcesApi.showEndpoint(id, options),
});

// RemediationDetails blocked
export const selectEntity = (id, selected) => ({
  type: ACTION_TYPES.SELECT_ENTITY,
  payload: {
    id,
    selected,
  },
});

// RemediationDetails blocked
export const deleteSystems = (systems, remediation) => ({
  type: ACTION_TYPES.DELTE_SYSTEMS,
  payload: deleteSystemsFromRemediation(systems, remediation),
});

// RemediationDetails blocked
export const checkExecutable = (id) => ({
  type: ACTION_TYPES.CHECK_EXECUTABLE,
  payload: remediationsApi.checkExecutable(id),
});
