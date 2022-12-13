import React from 'react';
import IssuesColumn from './IssuesColumn';
import RebootColumn from './RebootColumn';

const Issues = {
  key: 'issues',
  title: 'Issues',
  // eslint-disable-next-line react/display-name
  renderFunc: (issues, id, { display_name }) => (
    <IssuesColumn issues={issues} id={id} display_name={display_name} />
  ),
  props: {
    width: 15,
    isStatic: true,
  },
};

const RebootRequired = {
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
};

export const inventoryColumns = ['display_name', 'tags', 'system_profile'];
export default [Issues, RebootRequired];
