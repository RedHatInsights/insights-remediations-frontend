import React from 'react';
import IssuesColumn from './IssuesColumn';
import RebootColumn from './RebootColumn';
import ConnectionStatusColumn from './ConnectionStatusCol';
import InsightsLink from '@redhat-cloud-services/frontend-components/InsightsLink';

export default [
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
    key: 'issues',
    title: 'Actions',

    renderFunc: (issues, _, { display_name }) => (
      <IssuesColumn issues={issues} display_name={display_name} />
    ),
    props: {
      width: 15,
      isStatic: true,
    },
  },
  {
    key: 'rebootRequired',
    title: 'Reboot required',

    renderFunc: (rebootRequired) => (
      <RebootColumn rebootRequired={rebootRequired} />
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
