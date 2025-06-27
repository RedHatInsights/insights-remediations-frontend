export function getIssuePrefix(id) {
  return id.split(':')[0];
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
