import { API_BASE } from '../config';

export const getRemediationDetails = (axios) => (params) => {
  return axios.get(`${API_BASE}/remediations/${params.remId}`, { params });
};

export const getRemediations = (axios) => (params) => {
  return axios.get(`${API_BASE}/remediations`, { params });
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

export const deleteRemediation = (axios) => (params) => {
  return axios.delete(`${API_BASE}/remediations/${params.id}`);
};

export const deleteRemediationList = (axios) => (params) => {
  return axios({
    method: 'delete',
    url: `${API_BASE}/remediations`,
    data: {
      remediation_ids: params.remediation_ids,
    },
  });
};
