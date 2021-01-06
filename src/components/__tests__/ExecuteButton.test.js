/* eslint-disable camelcase */
import React from 'react';
import { mount } from 'enzyme';
import ExecuteButton from '../ExecuteButton';
import toJson from 'enzyme-to-json';
import * as api from '../../api';

// eslint-disable-next-line no-import-assign
api.downloadPlaybook = jest.fn();
global.insights = {
  chrome: {
    auth: {
      getUser: () =>
        new Promise(() => ({
          entitlements: { smart_management: { isEntitled: true } },
        })),
    },
  },
};

const data = [
  {
    executor_id: '722ec903-f4b5-4b1f-9c2f-23fc7b0ba390',
    executor_type: 'satellite',
    executor_name: 'Satellite 1 (connected)',
    system_count: 1,
    connection_status: 'connected',
  },
  {
    executor_id: null,
    executor_type: null,
    executor_name: null,
    system_count: 4,
    connection_status: 'no_executor',
  },
];

describe('Execute button', () => {
  test('fullfiled request', () => {
    const tree = mount(
      <ExecuteButton
        data={data}
        isLoading
        status={'fullfiled'}
        issueCount={1}
        remediationId="id"
        isDisabled={false}
        getEndpoint={() => null}
        sources={{ data: {} }}
        getConnectionStatus={() => null}
      />
    );
    expect(toJson(tree)).toMatchSnapshot();
  });

  test('pending request', () => {
    const tree = mount(
      <ExecuteButton
        data={[]}
        isLoading
        status={'pending'}
        issueCount={1}
        remediationId="id"
        isDisabled={false}
        sources={{ data: {} }}
        getConnectionStatus={() => null}
      />
    );
    expect(toJson(tree)).toMatchSnapshot();
  });
});
