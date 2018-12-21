import { API_BASE } from './config';

import urijs from 'urijs';

function checkResponse (r) {
    if (!r.ok) {
        throw new Error(`Unexpected response code ${r.status}`);
    }

    return r;
}

function json (r) {
    checkResponse(r);
    return r.json();
}

export function getRemediations () {
    const uri = urijs(API_BASE).segment('remediations').toString();

    return fetch(uri).then(json);
}

export function getRemediation (id) {
    const uri = urijs(API_BASE).segment('remediations').segment(id).toString();

    return fetch(uri).then(json);
}

export function downloadPlaybook (id) {
    const uri = urijs(API_BASE).segment('remediations').segment(id).segment('playbook').toString();
    window.open(uri);
}

export function createRemediation (data) {
    const uri = urijs(API_BASE).segment('remediations').toString();

    return fetch(uri, {
        headers: {
            'Content-Type': 'application/json; charset=utf-8'
        },
        method: 'POST',
        body: JSON.stringify(data)
    }).then(json);
}

export function patchRemediation (id, data) {
    const uri = urijs(API_BASE).segment('remediations').segment(id).toString();

    return fetch(uri, {
        headers: {
            'Content-Type': 'application/json; charset=utf-8'
        },
        method: 'PATCH',
        body: JSON.stringify(data)
    })
    .then(checkResponse)
    .then(() => data);
}
