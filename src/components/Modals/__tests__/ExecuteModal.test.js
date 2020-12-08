/* eslint-disable camelcase */
import React from 'react';
import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import { ExecuteModal } from '../ExecuteModal';
import { Modal, Alert } from '@patternfly/react-core';

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

describe('Execute modal', () => {
  it('renders ExecuteModal component when given data', () => {
    const closeFn = jest.fn();

    const container = shallow(
      <ExecuteModal
        isOpen={true}
        onClose={closeFn}
        showRefresh={false}
        remediationId={'id'}
        data={data}
        etag={'etag'}
        isLoading={false}
        issueCount={1}
        remediationStatus={'initial'}
        runRemediation={() => null}
        setEtag={() => null}
      />
    );

    expect(container.find(Modal)).toHaveLength(1);
    expect(toJson(container)).toMatchSnapshot();
  });

  it('renders ExecuteModal with refresh message when showRefresh is true', () => {
    const closeFn = jest.fn();

    const container = shallow(
      <ExecuteModal
        isOpen={true}
        onClose={closeFn}
        showRefresh={true}
        remediationId={'id'}
        data={data}
        etag={'etag'}
        isLoading={false}
        issueCount={1}
        remediationStatus={'initial'}
        runRemediation={() => null}
        setEtag={() => null}
      />
    );

    expect(container.find(Modal)).toHaveLength(1);
    expect(container.find(Alert)).toHaveLength(1);
    expect(toJson(container)).toMatchSnapshot();
  });
});
