import { API_BASE, SOURCES_BASE } from './config';

import axios from 'axios';
import {
  RemediationsApi,
  ResolutionsApi,
  RemediationsApiAxiosParamCreator,
} from '@redhat-cloud-services/remediations-client';
import { DefaultApi } from '@redhat-cloud-services/sources-client';

/*
 * TODO: replace these with generated clients
 */
import { doGet } from './Utilities/http';
import urijs from 'urijs';

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
 * end of TODO
 */

class HttpError extends Error {
  constructor(description) {
    super('Error communicating with the server');
    this.description = description;
  }
}

async function authInterceptor(config) {
  await window.insights.chrome.auth.getUser();
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
    window.insights.chrome.auth.logout();
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
        ? window.open(
            API_BASE +
              new RemediationsApiAxiosParamCreator().downloadPlaybooks(
                selectedIds
              ).url
          )
        : window.open(
            API_BASE +
              new RemediationsApiAxiosParamCreator().getRemediationPlaybook(
                selectedIds[0]
              ).url
          );

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
    `${window.location.origin}/api/sources/v2.0/endpoints?filter[receptor_node][not_nil]`
  );
}
