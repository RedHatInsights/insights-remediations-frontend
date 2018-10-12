import { API_BASE } from './config';

export function getRemediations () {
    return fetch(API_BASE).then(r => {
        if (r.ok) {
            return r.json();
        }

        throw new Error(`Unexpected response code ${r.status}`);
    });
}
