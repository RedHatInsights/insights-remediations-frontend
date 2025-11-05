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
