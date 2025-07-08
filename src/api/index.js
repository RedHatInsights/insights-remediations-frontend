const SOURCES_BASE = '/api/sources/v2.0';

import { doGet } from '../Utilities/http';

import { API_BASE } from '../routes/api';

import { APIFactory } from '@redhat-cloud-services/javascript-clients-shared';
import axiosInstance from '@redhat-cloud-services/frontend-components-utilities/interceptors';
import * as remediationsEndpoints from '@redhat-cloud-services/remediations-client';
import * as sourcesEndpoints from '@redhat-cloud-services/sources-client';

import { downloadPlaybooksParamCreator } from '@redhat-cloud-services/remediations-client/DownloadPlaybooks';

export const remediationsApi = APIFactory(API_BASE, remediationsEndpoints, {
  axios: axiosInstance,
});

export const sourcesApi = APIFactory(SOURCES_BASE, sourcesEndpoints, {
  axios: axiosInstance,
});

export const getRemediationStatus = (id) => doGet(url(id, 'status'));

export function getHosts() {
  return doGet('/api/inventory/v1/hosts');
}

export function downloadPlaybook(selectedIds) {
  return new Promise((resolve) => {
    const tab = downloadPlaybooksParamCreator({
      selectedRemediations: selectedIds,
      options: { baseURL: API_BASE },
    }).then((res) => {
      const { search, pathname } = res.urlObj;
      const url = `${API_BASE}${pathname}${search}`;
      window.location.assign(url);
      return true;
    });

    const handle = setInterval(async () => {
      if (tab) {
        clearInterval(handle);
        resolve();
      }
    }, 500);
  });
}

export function getIsReceptorConfigured() {
  return doGet(
    `${window.location.origin}/api/sources/v2.0/endpoints?filter[receptor_node][not_nil]`,
  );
}

export function deleteSystemsFromRemediation(systems, remediation) {
  return Promise.all(
    systems.flatMap((system) =>
      system.issues.map((issue) =>
        remediationsApi.deleteRemediationIssueSystem(
          remediation.id,
          issue.id,
          system.id,
        ),
      ),
    ),
  );
}

export const createRemediation = async (data) =>
  remediationsApi.createRemediation(data);

export const patchRemediation = (id, data) =>
  remediationsApi.updateRemediation(id, data);

export const getRemediations = () =>
  remediationsApi.getRemediations({ limit: 200 });

export const getRemediation = (id) => remediationsApi.getRemediation(id);

export const getResolutionsBatch = (issues) => {
  return remediationsApi.getResolutionsForIssues({ issues: issues });
};
