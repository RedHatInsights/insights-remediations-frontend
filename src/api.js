import { API_BASE } from './config';

import urijs from 'urijs';

export function getRemediations () {
    const uri = urijs(API_BASE).segment('remediations').toString();

    return fetch(uri, {
        headers: {
            // TODO: this is only needed temporarily until the app is properly onboarded
            'x-rh-insights-use-path-prefix': '1'
        }
    }).then(r => {
        if (r.ok) {
            return r.json();
        }

        throw new Error(`Unexpected response code ${r.status}`);
    });
}
