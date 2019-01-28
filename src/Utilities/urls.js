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
