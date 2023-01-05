import React from 'react';
import { renderStatus, normalizeStatus } from '../statusHelper';
import { inventoryUrlBuilder } from '../../Utilities/urls';

const urlBuilder = inventoryUrlBuilder({ id: 'default' });

export default [
  {
    key: 'display_name',
    title: 'Name',
    // eslint-disable-next-line
    renderFunc: (name, id, { fqdn }) => <div><a href={urlBuilder(id)}>{fqdn || name || id}</a></div>
  },
  {
    key: 'tags',
  },
  {
    key: 'status',
    title: 'Status',
    // eslint-disable-next-line
    renderFunc: (status) => (
      <div className="rem-c-status-bar">
        {renderStatus(normalizeStatus(status))}
      </div>
    ),
  },
];
