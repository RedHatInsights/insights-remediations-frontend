import { API_BASE } from './config';

import axios from 'axios';
import { RemediationsApi, ResolutionsApi, RemediationsApiAxiosParamCreator } from '@redhat-cloud-services/remediations-client';

/*
 * TODO: replace these with generated clients
 */
import { doGet } from './Utilities/http';
import urijs from 'urijs';

function url (...args) {
    const url = urijs(API_BASE).segment('remediations');
    args.forEach(segment => url.segment(segment));
    return url;
}

export const getRemediationStatus = id => doGet(url(id, 'status'));
export function getHosts () {
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

async function authInterceptor (config) {
    await window.insights.chrome.auth.getUser();
    return config;
}

function responseDataInterceptor (response) {
    if (response.data) {
        return response.data;
    }

    return response;
}

function interceptor401 (error) {
    if (error.response && error.response.status === 401) {
        window.insights.chrome.auth.logout();
        return false;
    }

    throw error;
}

function errorInterceptor (err) {
    if (err.response && err.response.data && err.response.data.errors && err.response.data.errors.length) {
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

export function downloadPlaybook (id) {
    window.open(API_BASE + new RemediationsApiAxiosParamCreator().getRemediationPlaybook(id).url);
}
