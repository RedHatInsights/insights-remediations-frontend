import React from 'react';
import { act } from 'react-dom/test-utils';
import RemediationButton from '../RemediationsButton';
import { mount } from 'enzyme';
import { CAN_REMEDIATE } from '../../Utilities/utils';
import { remediationWizardTestData } from './testData';

jest.mock('../../api/inventory', () => {
  const api = jest.requireActual('../../api/inventory');
  return {
    __esModule: true,
    ...api,
    getHostsById: () => Promise.resolve({}),
  };
});

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
    global.insights = {
      ...insights,
      chrome: {
        ...insights.chrome,
        getApp: () => 'remediations',
        auth: {
          getUser: () => ({}),
        },
        getUserPermissions: () =>
          Promise.resolve([{ permission: CAN_REMEDIATE }]),
      },
    };
  });

  afterEach(() => {
    global.insights = tmpInsights;
  });

  it('should open wizard with permissions', async () => {
    let wrapper;
    fetch.mockResponse(JSON.stringify({}));

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
    insights.chrome.getUserPermissions = () => Promise.resolve([]);
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
