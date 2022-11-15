import React from 'react';
import IssuesColumn from './IssuesColumn';
import RebootColumn from './RebootColumn';

export const defaultProps = {
  isStatic: true,
};

const Issues = {
  key: 'issues',
  title: 'Issues',
  // eslint-disable-next-line react/display-name
  renderFunc: (issues, id, { display_name }) => (
    <IssuesColumn issues={issues} id={id} display_name={display_name} />
  ),
  props: { width: 15 },
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
  },
};

export default ['display_name', 'tags', Issues, RebootRequired];
