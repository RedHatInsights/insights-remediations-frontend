import React from 'react';
import { TextEncoder } from 'util';
import { enableFetchMocks } from 'jest-fetch-mock';

enableFetchMocks();

jest.mock('@redhat-cloud-services/frontend-components/useChrome', () => ({
  __esModule: true,
  default: () => ({
    getApp: () => 'remediations',
    getBundle: () => 'insights',
  }),
  useChrome: () => ({
    isBeta: jest.fn(),
    chrome: jest.fn(),
    updateDocumentTitle: jest.fn(),
  }),
}));

global.React = React;
global.insights = {};
global.TextEncoder = TextEncoder;

window.HTMLElement.prototype.scrollTo = jest.fn();

jest.mock(
  '@redhat-cloud-services/frontend-components/Inventory/InventoryTable',
  () => (props) => <div {...props} /> // eslint-disable-line
);
