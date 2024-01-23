import React, { Fragment, useState } from 'react';
import PropTypes from 'prop-types';
import { Button, Modal, ModalVariant } from '@patternfly/react-core';
import { cellWidth, sortable } from '@patternfly/react-table';
import {
  Table,
  TableBody,
  TableHeader,
} from '@patternfly/react-table/deprecated';
import RebootColumn from './RebootColumn';
import { CheckIcon, TimesIcon } from '@patternfly/react-icons';
import { buildIssueUrl } from '../../Utilities/urls';
import sortBy from 'lodash/sortBy';

const issueType = {
  advisor: 'Advisor recommendation',
  vulnerabilities: 'Vulnerability',
  'patch-advisory': 'Patch advisory',
};

const sortByIndex = (issue) => [
  issue.description,
  issue.resolution.needs_reboot,
  issueType?.[issue.id.split(':')[0]],
  issue.resolved,
];

const IssuesColumn = ({ issues, display_name }) => {
  const [sortByConfig, setSortByConfig] = useState({
    index: 0,
    direction: 'asc',
  });
  const [isOpen, setIsOpen] = useState();
  const sortedIssues = sortBy(
    issues,
    (sortIssue) => sortByIndex(sortIssue)[sortByConfig.index]
  );
  return (
    <Fragment>
      <Button variant="link" isInline onClick={() => setIsOpen(true)}>
        {issues.length}
      </Button>
      <Modal
        variant={ModalVariant.medium}
        title={`Actions for system ${display_name}`}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      >
        <Table
          variant="compact"
          aria-label={`Issues table for ${display_name}`}
          rows={(sortByConfig.direction === 'asc'
            ? sortedIssues
            : sortedIssues.reverse()
          ).map((issue) => [
            {
              title: (
                <Fragment>
                  <div>
                    <a href={buildIssueUrl(issue.id)}>{issue.description}</a>
                  </div>
                  <div>{issue.resolution.description}</div>
                </Fragment>
              ),
            },
            {
              title: (
                <Fragment>
                  <RebootColumn
                    rebootRequired={issue.resolution.needs_reboot}
                  />
                </Fragment>
              ),
            },
            issueType?.[issue.id.split(':')[0]] || 'Unknown',
            {
              title: (
                <Fragment>
                  {issue.resolved ? <CheckIcon /> : <TimesIcon />}{' '}
                  {issue.resolved ? 'Remediated' : 'Not remediated'}
                </Fragment>
              ),
            },
          ])}
          cells={[
            {
              title: 'Action',
              transforms: [sortable],
            },
            {
              title: 'Reboot required',
              transforms: [sortable, cellWidth(20)],
            },
            {
              title: 'Type',
              transforms: [sortable, cellWidth(15)],
            },
            {
              title: 'Status',
              transforms: [sortable, cellWidth(20)],
            },
          ]}
          sortBy={sortByConfig}
          onSort={(_e, index, direction) =>
            setSortByConfig({ index, direction })
          }
        >
          <TableHeader />
          <TableBody />
        </Table>
      </Modal>
    </Fragment>
  );
};

IssuesColumn.propTypes = {
  issues: PropTypes.arrayOf(PropTypes.shape()),
  display_name: PropTypes.string,
};

export default IssuesColumn;
