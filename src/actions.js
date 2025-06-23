import { ACTION_TYPES } from './constants';
import {
  remediationsApi,
  deleteSystemsFromRemediation,
  sourcesApi,
} from './api';

export const loadRemediation = (id) => ({
  type: ACTION_TYPES.LOAD_REMEDIATION,
  payload: remediationsApi.getRemediation(id),
});

export const patchRemediation = (id, data) => ({
  type: ACTION_TYPES.PATCH_REMEDIATION,
  payload: remediationsApi.updateRemediation(id, data).then(() => data),
});

export const deleteRemediation = (id) => ({
  type: ACTION_TYPES.DELETE_REMEDIATION,
  payload: remediationsApi.deleteRemediation(id),
});

export const deleteRemediationIssueSystem = (id, issue, system) => ({
  type: ACTION_TYPES.DELETE_REMEDIATION_ISSUE_SYSTEM,
  payload: remediationsApi
    .deleteRemediationIssueSystem(id, issue, system)
    .then(() => ({ id, issue, system })),
});

export const getConnectionStatus = (id) => {
  return {
    type: ACTION_TYPES.GET_CONNECTION_STATUS,
    payload: remediationsApi.getRemediationConnectionStatus(id),
  };
};

export const runRemediation = (id, etag, exclude) => {
  return {
    type: ACTION_TYPES.RUN_REMEDIATION,
    payload: remediationsApi.runRemediation(id, {
      headers: { 'If-Match': etag },
      data: { exclude },
    }),
  };
};

export const setEtag = (etag) => ({
  type: ACTION_TYPES.SET_ETAG,
  payload: { etag },
});

export const getPlaybookRuns = (remediationId) => ({
  type: ACTION_TYPES.GET_PLAYBOOK_RUNS,
  payload: remediationsApi.listPlaybookRuns(remediationId),
});

export const cancelPlaybookRuns = (remediationId, runId) => ({
  type: ACTION_TYPES.CANCEL_PLAYBOOK_RUNS,
  payload: remediationsApi.cancelPlaybookRuns(remediationId, runId),
});

export const getEndpoint = (id, options = {}) => ({
  type: ACTION_TYPES.GET_ENDPOINT,
  payload: sourcesApi.showEndpoint(id, options),
});

export const selectEntity = (id, selected) => ({
  type: ACTION_TYPES.SELECT_ENTITY,
  payload: {
    id,
    selected,
  },
});

export const deleteSystems = (systems, remediation) => ({
  type: ACTION_TYPES.DELTE_SYSTEMS,
  payload: deleteSystemsFromRemediation(systems, remediation),
});

export const checkExecutable = (id) => ({
  type: ACTION_TYPES.CHECK_EXECUTABLE,
  payload: remediationsApi.checkExecutable(id),
});
