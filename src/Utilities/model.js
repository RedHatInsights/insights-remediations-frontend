import React from 'react';
import moment from 'moment';
import { Tooltip } from '@patternfly/react-core';

export function getIssuePrefix (id) {
    return id.split(':')[0];
}

export function getIssueApplication ({ id }) {
    switch (getIssuePrefix(id)) {
        case 'advisor': return 'Insights';
        case 'ssg': return 'Compliance';
        case 'vulnerabilities': return 'Vulnerability';
        case 'patch-advisory': return 'Patch';
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

const DATE_FORMAT = 'DD MMM YYYY, hh:mm UTC';

export function formatDate (date) {
    return (
        <Tooltip content={ moment.utc(date).format(DATE_FORMAT) } >
            <span>
                { moment.utc(date).fromNow() }
            </span>
        </Tooltip>
    );
}
