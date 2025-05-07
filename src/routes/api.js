import { API_BASE } from '../config';

export const getRemediations = (axios) => (params) => {
  return axios.get(`${API_BASE}/remediations/${params.remId}`, { params });
};
export const getRemediationPlaybook = (axios) => (params) => {
  return axios.get(`${API_BASE}/remediations/${params.remId}/playbook_runs`, {
    params,
  });
};

export const checkExecutableStatus = (axios) => (params) => {
  return axios.get(`${API_BASE}/remediations/${params.remId}/executable`, {
    params,
  });
};

export const getRemediationPlaybookSystemsList = (axios) => (params) => {
  return axios.get(
    `${API_BASE}/remediations/${params.remId}/playbook_runs/${params.playbook_run_id}/systems`,
    {
      params,
    }
  );
};

export const getPlaybookLogs = (axios) => (params) => {
  return axios.get(
    `${API_BASE}/remediations/${params.remId}/playbook_runs/${params.playbook_run_id}/systems/${params.system_id}`,
    {
      params,
    }
  );
};

export const getRemediationsList = (axios) => () => {
  return axios.get(`${API_BASE}/remediations/?fields[data]=name`);
};

export const updateRemediationPlans = (axios) => (params) => {
  const { id, ...updateData } = params;
  return axios.patch(`${API_BASE}/remediations/${id}`, updateData);
};
