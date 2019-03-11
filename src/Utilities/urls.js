import urijs from 'urijs';
import { getIssuePrefix } from './model';

export function buildInventoryUrl (systemId, tab) {
    return urijs(document.baseURI)
    .segment('platform')
    .segment('inventory')
    .segment(systemId)
    .segment(tab)
    .toString();
}

export function getInventoryTabForIssue ({ id }) {
    switch (getIssuePrefix(id)) {
        case 'advisor':
            return 'configuration_assessment';
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
            return urijs(document.baseURI).segment('platform').segment('advisor').segment('actions').segment('by_id').segment(parts[1]).toString();
        case 'vulnerabilities':
            return urijs(document.baseURI).segment('platform').segment('vulnerability').segment('cves').segment(parts[1]).toString();
        default:
            return null;
    }
}

export function appUrl (app) {
    return urijs(document.baseURI).segment('platform').segment(app).toString();
}
