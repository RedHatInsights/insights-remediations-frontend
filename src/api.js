import { API_BASE } from './config';

import urijs from 'urijs';
import { doGet, doPost, doPatch, doDelete } from './Utilities/http';

function url (...args) {
    const url = urijs(API_BASE).segment('remediations');
    args.forEach(segment => url.segment(segment));
    return url;
}

export const getRemediations = () => doGet(url());
export const getRemediation = id => doGet(url(id));
export const createRemediation = data => doPost(url(), data);
export const patchRemediation = (id, data) => doPatch(url(id), data).then(() => data);
export const patchRemediationIssue = (id, issue, resolution) => doPatch(url(id, 'issues', issue), { resolution });
export const deleteRemediation = id => doDelete(url(id));
export const deleteRemediationIssue = (remediation, issue) => doDelete(url(remediation, 'issues', issue));
export const getResolutions = issue => doGet(urijs(API_BASE).segment('resolutions').segment(issue));

export function downloadPlaybook (id) {
    const uri = url(id, 'playbook').toString();
    window.open(uri);
}

// this is here for demo purposes only
export function getHosts () {
    return doGet('/r/insights/platform/inventory/api/v1/hosts');
}
