import urijs from 'urijs';
import { getIssuePrefix } from './model';

// Get the current group since we can be mounted at two urls
export function getGroup () {
    const pathName = window.location.pathname.split('/');

    if (pathName[1] === 'beta') {
        return pathName[2];
    }

    return pathName[1];
}

export function buildInventoryUrl (systemId, tab) {
    return appUrl('inventory')
    .segment(systemId)
    .segment(tab)
    .toString();
}

export function getInventoryTabForIssue ({ id }) {
    switch (getIssuePrefix(id)) {
        case 'advisor':
            return 'rules';
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

    switch (parts[0]) {
        case 'advisor':
            return appUrl(parts[0]).segment('actions').segment('by_id').segment(parts[1]).toString();
        case 'vulnerabilities':
            return appUrl(parts[0]).segment('cves').segment(parts[1]).toString();
        default:
            throw new Error(`Unsupported issue id: ${id}`);
    }
}

export function appUrl (app) {
    switch (app) {
        case 'advisor':
            return urijs(document.baseURI).segment('insights');
        case 'vulnerabilities':
            return urijs(document.baseURI).segment('rhel').segment('vulnerability');
        case 'compliance':
            return urijs(document.baseURI).segment('rhel').segment('compliance');
        case 'inventory':
            return urijs(document.baseURI).segment(getGroup()).segment('inventory');
        default:
            throw new Error(`Unknown app: ${app}`);
    }
}
