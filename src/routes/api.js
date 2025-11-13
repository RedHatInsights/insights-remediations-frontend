import axiosInstance from '@redhat-cloud-services/frontend-components-utilities/interceptors';
import { remediationsApi } from '../api';

export const API_BASE = '/api/remediations/v1';

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
 *  @param   {object}  params                 - Parameters object
 *  @param   {string}  params.remId           - Remediation ID
 *  @param   {string}  params.playbook_run_id - Playbook run ID
 *  @returns {Promise}                        API response promise
 */
export const getRemediationPlaybookSystemsList = ({
  remId,
  playbook_run_id,
}) => {
  return remediationsApi.getPlaybookRunSystems(remId, playbook_run_id);
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
