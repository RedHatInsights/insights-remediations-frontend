import urijs from 'urijs';
import { getIssuePrefix } from './model';

// Get the current group since we can be mounted at two urls
export function getGroup() {
  const pathName = window.location.pathname.split('/');

  if (pathName[1] === 'beta') {
    return pathName[2];
  }

  return pathName[1];
}

export function buildInventoryUrl(systemId, tab) {
  return appUrl('inventory').segment(systemId).segment(tab).toString();
}

export function getInventoryTabForIssue({ id }) {
  switch (getIssuePrefix(id)) {
    case 'advisor':
      return 'advisor';
    case 'vulnerabilities':
      return 'vulnerabilities';
    case 'ssg':
      return 'compliance';
    case 'patch-advisory':
      return 'patch';
    default:
      return 'general_information';
  }
}

export function inventoryUrlBuilder(issue) {
  const tab = getInventoryTabForIssue(issue);
  const base = appUrl('inventory').toString();

  // intentionally not using urijs here to optimize for large number of systems
  return (systemId) => `${base}/${systemId}?appName=${tab}`;
}

export function buildIssueUrl(id) {
  const parts = id.split(':');

  switch (parts[0]) {
    case 'advisor':
      return appUrl(parts[0])
        .segment('recommendations')
        .segment(parts[1])
        .toString();
    case 'vulnerabilities':
      return appUrl(parts[0]).segment('cves').segment(parts[1]).toString();
    case 'patch-advisory':
      return appUrl(parts[0])
        .segment('advisories')
        .segment(parts[1] + ':' + parts[2])
        .toString();
    default:
      return null;
  }
}

export function appUrl(app) {
  switch (app) {
    case 'advisor':
      return urijs(document.baseURI).segment('insights').segment('advisor');
    case 'vulnerabilities':
      return urijs(document.baseURI)
        .segment('insights')
        .segment('vulnerability');
    case 'compliance':
    case 'ssg':
      return urijs(document.baseURI).segment('insights').segment('compliance');
    case 'inventory':
      return urijs(document.baseURI).segment(getGroup()).segment('inventory');
    case 'patch-advisory':
      return urijs(document.baseURI).segment('insights').segment('patch');
    default:
      throw new Error(`Unknown app: ${app}`);
  }
}
