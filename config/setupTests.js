import React from 'react';
import { enableFetchMocks } from 'jest-fetch-mock';

enableFetchMocks();

jest.mock('@redhat-cloud-services/frontend-components/useChrome', () => ({
  useChrome: () => null,
}));

global.React = React;
global.insights = {};

window.HTMLElement.prototype.scrollTo = jest.fn();

jest.mock(
  '@redhat-cloud-services/frontend-components/Inventory/InventoryTable',
  () => (props) => <div {...props} /> // eslint-disable-line
);
