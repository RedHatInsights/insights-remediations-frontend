import { API_BASE } from './config';

import urijs from 'urijs';

function json (r) {
    if (r.ok) {
        return r.json();
    }

    throw new Error(`Unexpected response code ${r.status}`);
}

export function getRemediations () {
    const uri = urijs(API_BASE).segment('remediations').toString();

    return fetch(uri).then(json);
}

export function getRemediation (id) {
    const uri = urijs(API_BASE).segment('remediations').segment(id).toString();

    return fetch(uri).then(json);
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
