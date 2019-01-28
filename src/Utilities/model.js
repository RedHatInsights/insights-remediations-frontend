export function getIssuePrefix (id) {
    return id.split(':')[0];
}

export function getIssueApplication ({ id }) {
    switch (getIssuePrefix(id)) {
        case 'advisor': return 'Advisor';
        case 'compliance': return 'Compliance';
        case 'vulnerabilities': return 'Vulnerability';
        default: return 'Unknown';
    }
}

/* eslint-disable camelcase */
export function getSystemName ({ display_name, hostname, id }) {
    if (display_name && display_name !== 'null') {
        return display_name;
    }

    if (hostname && hostname !== 'null') {
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
