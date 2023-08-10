import React from 'react';
import { act } from 'react-dom/test-utils';
import RemediationButton from '../RemediationsButton';
import { mount } from 'enzyme';
import { CAN_REMEDIATE } from '../../Utilities/utils';
import { remediationWizardTestData } from './testData';
import useChrome from '@redhat-cloud-services/frontend-components/useChrome';

jest.mock('../../api/inventory', () => {
  const api = jest.requireActual('../../api/inventory');
  return {
    __esModule: true,
    ...api,
    getHostsById: () => Promise.resolve({}),
  };
});

jest.mock('@redhat-cloud-services/frontend-components/useChrome', () => ({
  __esModule: true,
  default: jest.fn(),
}));

describe('RemediationButton', () => {
  let initialProps;
  let tmpInsights;

  beforeEach(() => {
    initialProps = {
      dataProvider: jest.fn(() => ({
        issues: remediationWizardTestData.issues,
        systems: ['something'],
      })),
    };
    tmpInsights = global.insights;
  });

  afterEach(() => {
    global.insights = tmpInsights;
  });

  it('should open wizard with permissions', async () => {
    let wrapper;
    fetch.mockResponse(JSON.stringify({}));
    useChrome.mockImplementation(() => ({
      getUserPermissions: () =>
        new Promise((resolve) => resolve([{ permission: CAN_REMEDIATE }])),
    }));

    await act(async () => {
      wrapper = mount(<RemediationButton {...initialProps} />);
    });
    wrapper.update();

    await act(async () => {
      wrapper.find('button').simulate('click');
    });

    expect(initialProps.dataProvider).toHaveBeenCalledTimes(1);
  });

  it('should not open wizard without permissions', async () => {
    fetch.mockResponse(JSON.stringify({}));
    useChrome.mockImplementation(() => ({
      getUserPermissions: () => new Promise((resolve) => resolve([])),
    }));
    let wrapper;

    await act(async () => {
      wrapper = mount(<RemediationButton {...initialProps} />);
    });
    wrapper.update();

    await act(async () => {
      wrapper.find('button').simulate('click');
    });

    expect(initialProps.dataProvider).toHaveBeenCalledTimes(0);
  });
});
