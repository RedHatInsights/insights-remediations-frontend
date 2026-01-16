const APP_CONFIG = {
  advisor: {
    app: 'advisor',
    label: 'Advisor recommendation',
    route: 'recommendations',
  },
  vulnerabilities: {
    app: 'vulnerability',
    label: 'Vulnerability',
    route: 'cves',
  },
  ssg: { app: 'compliance', label: 'Compliance', route: 'reports' },
  'patch-advisory': {
    app: 'patch',
    label: 'Patch advisory',
    route: 'advisories',
  },
  'patch-package': { app: 'patch', label: 'Patch package', route: 'packages' },
};

export function getIssuePrefix(id) {
  return id.split(':')[0];
}

export function getAppInfo(id) {
  const prefix = getIssuePrefix(id);
  return (
    APP_CONFIG[prefix] || {
      app: prefix,
      label: prefix ? prefix[0].toUpperCase() + prefix.slice(1) : 'Unknown',
      route: '',
    }
  );
}

export function getIssueApplication({ id }) {
  switch (getIssuePrefix(id)) {
    case 'advisor':
      return 'Advisor';
    case 'ssg':
      return 'Compliance';
    case 'vulnerabilities':
      return 'Vulnerability';
    case 'patch-advisory':
      return 'Patch';
    case 'patch-package':
      return 'Patch';
    default:
      return 'Unknown';
  }
}

export function getSystemName({ display_name, hostname, id }) {
  if (display_name) {
    return display_name;
  }

  if (hostname) {
    return hostname;
  }

  return id;
}

export function formatUser(user) {
  return `${user.first_name} ${user.last_name}`;
}

export function includesIgnoreCase(text, included) {
  return text?.toLowerCase().includes(included.toLowerCase());
}

export const DATE_FORMAT = 'DD MMM YYYY, hh:mm UTC';
