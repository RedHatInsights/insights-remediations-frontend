import urijs from 'urijs';
import { getIssuePrefix } from './model';

// Conditionally apply beta
export function isBeta () {

    const pathName = window.location.pathname.split('/');
    pathName.shift();

    if (pathName[0] === 'beta') {
        return ('beta/');
    }

    return ('');
}

// Get the current group since we can be mounted at two urls, then add beta conditionally
export function getGroup () {
    const pathName = window.location.pathname.split('/');
    pathName.shift();

    if (pathName[0] === 'beta') {
        return (`${pathName[0]}/${pathName[1]}`);
    }

    return (pathName[0]);
}

export function buildInventoryUrl (systemId, tab) {

    return urijs(document.baseURI)
    .segment(getGroup())
    .segment('inventory')
    .segment(systemId)
    .segment(tab)
    .toString();
}

export function getInventoryTabForIssue ({ id }) {
    switch (getIssuePrefix(id)) {
        case 'advisor':
            return 'insights';
        case 'vulnerabilities':
            return 'vulnerabilities';
        case 'compliance':
            return 'compliance';
        default:
            return 'general_information';
    }
}

export function buildIssueUrl (id) {
    const parts = id.split(':');

    switch (getIssuePrefix(id)) {
        case 'advisor':
            return urijs(document.baseURI).segment(`${isBeta()}insights`).segment('actions').segment('by_id').segment(parts[1]).toString();
        case 'vulnerabilities':
            return urijs(document.baseURI).segment(`${isBeta()}rhel`).segment('vulnerability').segment('cves').segment(parts[1]).toString();
        default:
            return null;
    }
}

export function appUrl (app) {
    return urijs(document.baseURI).segment('platform').segment(app).toString();
}
