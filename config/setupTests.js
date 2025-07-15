import React from 'react';
import { TextEncoder } from 'util';
import { enableFetchMocks } from 'jest-fetch-mock';

enableFetchMocks();

const mockActivateQuickstart = jest.fn();

// Make the mock function available globally for tests
global.mockActivateQuickstart = mockActivateQuickstart;

jest.mock('@redhat-cloud-services/frontend-components/useChrome', () => ({
  __esModule: true,
  default: () => ({
    getApp: () => 'remediations',
    getBundle: () => 'insights',
    quickStarts: { activateQuickstart: mockActivateQuickstart },
  }),
  useChrome: () => ({
    isBeta: jest.fn(),
    chrome: jest.fn(),
    updateDocumentTitle: jest.fn(),
    quickStarts: { activateQuickstart: mockActivateQuickstart },
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
