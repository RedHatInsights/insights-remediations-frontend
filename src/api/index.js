import axios from 'axios';
import {
  RemediationsApi,
  ResolutionsApi,
  RemediationsApiAxiosParamCreator,
} from '@redhat-cloud-services/remediations-client';

import { DefaultApi } from '@redhat-cloud-services/sources-client';

const SOURCES_BASE = '/api/sources/v2.0';

/*
//  * TODO: replace these with generated clients
//  */
import { doGet } from '../Utilities/http';
import urijs from 'urijs';
import { API_BASE } from '../routes/api';

function url(...args) {
  const url = urijs(API_BASE).segment('remediations');
  args.forEach((segment) => url.segment(segment));
  return url;
}

export const getRemediationStatus = (id) => doGet(url(id, 'status'));
export function getHosts() {
  return doGet('/api/inventory/v1/hosts');
}
/*
//  * end of TODO
//  */

class HttpError extends Error {
  constructor(description) {
    super('Error communicating with the server');
    this.description = description;
  }
}

async function authInterceptor(config) {
  return config;
}

function responseDataInterceptor(response) {
  if (response.data) {
    return { ...response.data, etag: response.headers.etag };
  }

  return response;
}

function interceptor401(err) {
  if (!err) {
    return;
  }

  if (err.response && err.response.status === 401) {
    return false;
  }

  throw err;
}

function errorInterceptor(err) {
  if (!err) {
    return;
  }

  if (
    err.response &&
    err.response.data &&
    err.response.data.errors &&
    err.response.data.errors.length
  ) {
    const error = err.response.data.errors[0];

    if (error.details && error.details.name) {
      throw new HttpError(`${error.title} (${error.details.name})`);
    }

    throw new HttpError(error.title);
  }

  throw err;
}

const instance = axios.create();
instance.interceptors.request.use(authInterceptor);
instance.interceptors.response.use(responseDataInterceptor);
instance.interceptors.response.use(null, interceptor401);
instance.interceptors.response.use(null, errorInterceptor);

export const remediations = new RemediationsApi(undefined, API_BASE, instance);
export const resolutions = new ResolutionsApi(undefined, API_BASE, instance);
export const sources = new DefaultApi(undefined, SOURCES_BASE, instance);

export function downloadPlaybook(selectedIds) {
  return new Promise((resolve, reject) => {
    const tab =
      selectedIds.length > 1
        ? new RemediationsApiAxiosParamCreator()
            .downloadPlaybooks(selectedIds)
            .then((value) => window.location.assign(API_BASE + value.url))
        : new RemediationsApiAxiosParamCreator()
            .getRemediationPlaybook(selectedIds[0])
            .then((value) => window.location.assign(API_BASE + value.url));

    if (!tab) {
      return reject();
    }

    const handle = setInterval(() => {
      if (tab.closed) {
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
        remediations.deleteRemediationIssueSystem(
          remediation.id,
          issue.id,
          system.id,
        ),
      ),
    ),
  );
}

function checkResponse(r) {
  if (!r.ok) {
    const error = new Error(`Unexpected response code ${r.status}`);
    error.statusCode = r.status;
    throw error;
  }

  return r;
}

function json(r) {
  checkResponse(r);
  return r.json();
}

const headers = Object.freeze({
  'Content-Type': 'application/json; charset=utf-8',
});

export function createRemediation(data) {
  const uri = new urijs(API_BASE).segment('remediations').toString();
  return fetch(uri, {
    headers,
    method: 'POST',
    credentials: 'include',
    body: JSON.stringify(data),
  }).then(json);
}

export function patchRemediation(id, data) {
  const uri = new urijs(API_BASE)
    .segment('remediations')
    .segment(id)
    .toString();
  return fetch(uri, {
    headers,
    credentials: 'include',
    method: 'PATCH',
    body: JSON.stringify(data),
  }).then(checkResponse);
}

export function getRemediations() {
  const uri = new urijs(API_BASE)
    .segment('remediations')
    .query({ limit: 200 })
    .toString();
  return fetch(uri, { credentials: 'include' }).then(json);
}

export function getRemediation(id) {
  const uri = new urijs(API_BASE)
    .segment('remediations')
    .segment(id)
    .toString();
  return fetch(uri, { credentials: 'include' }).then(json);
}

export function getResolutionsBatch(issues) {
  const uri = new urijs(API_BASE).segment('resolutions').toString();
  return fetch(uri, {
    headers,
    credentials: 'include',
    method: 'POST',
    body: JSON.stringify({ issues }),
  }).then(json);
}
