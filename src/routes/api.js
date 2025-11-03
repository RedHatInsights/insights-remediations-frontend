import { remediationsApi } from '../api';

export const API_BASE = '/api/remediations/v1';

export const getRemediations = (params) =>
  remediationsApi.getRemediations(params);

export const getRemediationDetails = (params) =>
  remediationsApi.getRemediation(params.id, params.format);

export const getRemediationIssues = (params) => {
  const { id, limit, offset, sort, filter, ...rest } = params;
  // API only supports sorting by 'id' or '-id'
  // If sort is by another field, omit it (client-side sorting will handle it)
  const validSort = sort === 'id' || sort === '-id' ? sort : undefined;

  return remediationsApi.getRemediationIssues({
    id,
    limit,
    offset,
    sort: validSort,
    filter,
  });
};

export const getRemediationIssueSystems = (params) =>
  remediationsApi.getRemediationIssueSystems(params.id, params.issue_id);

export const getRemediationSystems = ({ id }) =>
  remediationsApi.getRemediationSystems(id);

export const getRemediationSystemIssues = ({ id, system }) =>
  remediationsApi.getRemediationSystemIssues(id, system);

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

export const executeRemediation = ({ id, etag, exclude }) =>
  remediationsApi.runRemediation(
    id,
    { exclude },
    {
      headers: { 'If-Match': etag },
    },
  );

export const deleteIssues = ({ id, issue_ids }) =>
  remediationsApi.deleteRemediationIssues(id, { issue_ids });
