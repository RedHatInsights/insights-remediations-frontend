import axiosInstance from '@redhat-cloud-services/frontend-components-utilities/interceptors';
import { remediationsApi } from '../api';
import { API_BASE } from '../constants';

/**
 * Delete systems from a remediation.
 * IMPORTANT: This wrapper exists to work around a bug in the API client.
 * The API client's deleteRemediationSystems has the wrong URL path:
 * - API client uses: /remediations/{id}/systems/{system}/issues (WRONG)
 * - We need: /remediations/{id}/systems (bulk delete endpoint)
 *
 *  @param   {Array}   systems     - Array of system objects with id property
 *  @param   {object}  remediation - Remediation object with id property
 *  @returns {Promise}             Axios delete promise
 */
export const deleteRemediationSystems = (systems, remediation) => {
  const systemIds = systems.map((system) => system.id);

  return axiosInstance.delete(
    `${API_BASE}/remediations/${remediation.id}/systems`,
    {
      data: { system_ids: systemIds },
    },
  );
};

/**
 * Used by ExecutionHistoryContent for fetching playbook run systems.
 *
 *  @param   {object}  rawParams                 - Parameters object (pass-through from useRemediations / table state)
 *  @param   {string}  rawParams.remId           - Remediation ID
 *  @param   {string}  rawParams.playbook_run_id - Playbook run ID
 *  @param   {number}  [rawParams.limit]         - Page size
 *  @param   {number}  [rawParams.offset]        - Page offset
 *  @param   {string}  [rawParams.sort]          - e.g. system_name or -system_name
 *  @param   {object}  [rawParams.filter]        - { ansible_host } from table filters
 *  @param   {object}  [rawParams.options]       - Axios options (filter[…] query params)
 *  @returns {Promise}                           API response promise
 */
export const getRemediationPlaybookSystemsList = (rawParams) => {
  const params = Array.isArray(rawParams) ? rawParams[0] : rawParams;
  const { remId, playbook_run_id, limit, offset, sort, filter, options } =
    params || {};

  let ansibleHost = filter?.ansible_host;
  if (ansibleHost === undefined || ansibleHost === null || ansibleHost === '') {
    const fromQuery = options?.params?.['filter[ansible_host]'];
    if (fromQuery !== undefined && fromQuery !== null && fromQuery !== '') {
      ansibleHost = fromQuery;
    }
  }

  const clientParams = {
    id: remId,
    playbookRunId: playbook_run_id,
    ...(limit !== undefined && limit !== null && { limit }),
    ...(offset !== undefined && offset !== null && { offset }),
    ...(sort !== undefined && sort !== null && sort !== '' && { sort }),
    ...(ansibleHost !== undefined &&
      ansibleHost !== null &&
      ansibleHost !== '' && { ansibleHost }),
  };

  return remediationsApi.getPlaybookRunSystems(clientParams);
};

/**
 * Used by ExecutionHistoryContent for fetching playbook logs.
 *
 *  @param   {object}  params                 - Parameters object
 *  @param   {string}  params.remId           - Remediation ID
 *  @param   {string}  params.playbook_run_id - Playbook run ID
 *  @param   {string}  params.system_id       - System ID
 *  @returns {Promise}                        API response promise
 */
export const getPlaybookLogs = (params) =>
  remediationsApi.getPlaybookRunSystemDetails(
    params.remId,
    params.playbook_run_id,
    params.system_id,
  );

/**
 * Update a remediation. Wrapper to handle the two-parameter API signature.
 * Used by RenameModal, DetailsCard, and other components that need to update remediation properties.
 *
 * The API client's updateRemediation expects (id, data) as two separate parameters,
 * but useRemediationsQuery passes a single params object. This wrapper converts
 * { id, name, auto_reboot, ... } into (id, { name, auto_reboot, ... }).
 *
 *  @param   {object}  params               - Parameters object
 *  @param   {string}  params.id            - Remediation ID
 *  @param   {string}  [params.name]        - New name for the remediation
 *  @param   {boolean} [params.auto_reboot] - Auto reboot setting
 *  @returns {Promise}                      API response promise
 */
export const updateRemediationWrapper = (params) => {
  const { id, ...data } = params;
  return remediationsApi.updateRemediation(id, data);
};

/**
 * POST request to /playbook endpoint to generate playbook preview.
 * Used by RemediationWizard preview functionality.
 *
 *  @param   {object}  payload             - Payload object
 *  @param   {Array}   payload.issues      - Array of issues with id, systems, and optional resolution
 *  @param   {boolean} payload.auto_reboot - Auto reboot setting
 *  @param   {object}  [options]           - Axios options (e.g., responseType: 'blob')
 *  @returns {Promise}                     API response promise
 */
export const postPlaybookPreview = (payload, options = {}) => {
  return axiosInstance.post(`${API_BASE}/playbook`, payload, options);
};
