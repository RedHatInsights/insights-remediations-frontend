export function getIssuePrefix (id) {
    return id.split(':')[0];
}

export function getIssueApplication ({ id }) {
    switch (getIssuePrefix(id)) {
        case 'advisor': return 'Insights';
        case 'compliance': return 'Compliance';
        case 'vulnerabilities': return 'Vulnerability';
        default: return 'Unknown';
    }
}

/* eslint-disable camelcase */
export function getSystemName ({ display_name, hostname, id }) {
    if (display_name) {
        return display_name;
    }

    if (hostname) {
        return hostname;
    }

    return id;
}

export function formatUser (user) {
    return `${user.first_name} ${user.last_name}`;
}

export function includesIgnoreCase(text, included) {
    return text.toLowerCase().includes(included.toLowerCase());
}
