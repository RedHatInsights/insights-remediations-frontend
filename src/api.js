import { API_BASE } from './config';

import urijs from 'urijs';

export function getRemediations () {
    const uri = urijs(API_BASE).segment('remediations').toString();

    return fetch(uri).then(r => {
        if (r.ok) {
            return r.json();
        }

        throw new Error(`Unexpected response code ${r.status}`);
    });
}
