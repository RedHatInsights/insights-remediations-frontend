import React from 'react';
import { Name as NameCell } from './Cells.js';

// eslint-disable-next-line react/display-name
export const renderComponent = (Component, props) => (_data, _id, entity) =>
  <Component {...entity} {...props} />;

export const Name = {
  title: 'Policy',
  sortable: 'title',
  props: {
    width: 60,
  },
  exportKey: 'title',
  renderFunc: renderComponent(NameCell),
};

export default [Name];
