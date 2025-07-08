import { remediationsApi } from '../api';

export const getRemediationDetails = ({ remId }) =>
  remediationsApi.getRemediation(remId);

export const getRemediations = (params) =>
  remediationsApi.getRemediations(params);

export const getRemediationPlaybook = ({ remId }) =>
  remediationsApi.listPlaybookRuns(remId);

export const checkExecutableStatus = ({ remId }) =>
  remediationsApi.checkExecutable(remId);

export const getRemediationPlaybookSystemsList = ({
  remId,
  playbook_run_id,
}) => {
  return remediationsApi.getPlaybookRunSystems(remId, playbook_run_id);
};

export const getPlaybookLogs = (params) =>
  remediationsApi.getPlaybookRunSystemDetails(
    params.remId,
    params.playbook_run_id,
    params.system_id,
  );

export const getRemediationsList = () =>
  remediationsApi.getRemediations({ fieldsData: ['name'] });

export const updateRemediationPlans = (params) => {
  const { id, ...updateData } = params;
  return remediationsApi.updateRemediation(id, updateData);
};

export const deleteRemediation = ({ id }) =>
  remediationsApi.deleteRemediation(id);

export const deleteRemediationList = ({ remediation_ids }) =>
  remediationsApi.deleteRemediations({
    remediation_ids,
  });

export const executeRemediation = ({ id, etag, exclude }) => {
  remediationsApi.runRemediation(
    id,
    { exclude },
    {
      headers: { 'If-Match': etag },
    },
  );
};

export const API_BASE = '/api/remediations/v1';
