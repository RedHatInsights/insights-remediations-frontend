import React from 'react';
import IssuesColumn from './IssuesColumn';
import RebootColumn from './RebootColumn';
import ConnectionStatusColumn from './ConnectionStatusCol';

export default [
  {
    key: 'display_name',
  },
  {
    key: 'tags',
  },
  {
    key: 'system_profile',
  },
  {
    key: 'issues',
    title: 'Actions',
    // eslint-disable-next-line react/display-name
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
    // eslint-disable-next-line react/display-name
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
    // eslint-disable-next-line react/display-name
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
