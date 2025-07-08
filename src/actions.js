import { ACTION_TYPES } from './constants';
import { deleteSystemsFromRemediation, remediationsApi } from './api';

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
