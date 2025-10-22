import React from 'react';
import IssuesColumn from './IssuesColumn';
import ConnectionStatusColumn from './ConnectionStatusCol';
import InsightsLink from '@redhat-cloud-services/frontend-components/InsightsLink';

const createColumns = (remediationId) => [
  {
    key: 'display_name',
    title: 'Name',
    renderFunc: (_value, _colIdx, entity) => {
      return (
        <InsightsLink app="inventory" to={`/${entity.id}`}>
          {entity.display_name}
        </InsightsLink>
      );
    },
  },
  {
    key: 'tags',
    props: {
      screenReaderText: 'Tags',
    },
  },
  {
    key: 'system_profile',
    props: {
      screenReaderText: 'System profile',
    },
  },
  {
    key: 'issue_count',
    title: 'Actions',

    renderFunc: (issue_count, _, entity) => (
      <IssuesColumn
        issues={issue_count}
        display_name={entity.display_name}
        systemId={entity.id}
        remediationId={remediationId}
      />
    ),
    props: {
      width: 15,
      isStatic: true,
    },
  },
  {
    key: 'connection_status',
    title: 'Connection status',

    renderFunc: (connection_status, _, { executor_type }) => (
      <ConnectionStatusColumn
        connection_status={connection_status}
        executor_type={executor_type}
      />
    ),
    props: {
      width: 15,
      isStatic: true,
    },
  },
];

export default createColumns;
