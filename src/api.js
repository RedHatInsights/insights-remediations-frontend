import { API_BASE } from './config';

import urijs from 'urijs';

const headers = {
    // TODO: this is only needed temporarily until the app is properly onboarded
    'x-rh-insights-use-path-prefix': '1'
};

function json (r) {
    if (r.ok) {
        return r.json();
    }

    throw new Error(`Unexpected response code ${r.status}`);
}

export function getRemediations () {
    const uri = urijs(API_BASE).segment('remediations').toString();

    return fetch(uri, {
        headers
    }).then(json);
}

export function createRemediation (data) {
    const uri = urijs(API_BASE).segment('remediations').toString();

    return fetch(uri, {
        headers: {
            'Content-Type': 'application/json; charset=utf-8',
            ...headers
        },
        method: 'POST',
        body: JSON.stringify(data)
    }).then(json);
}
