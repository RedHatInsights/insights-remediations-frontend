import React from 'react';
import { PlaybookCard } from '../PlaybookCard';
import * as api from '../../api';
import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { remediationsMock } from '../__fixtures__/remediations.fixtures';

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

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: () => jest.fn(),
  useSelector: jest.fn(),
}));

jest.mock('@redhat-cloud-services/frontend-components/InsightsLink', () => ({
  __esModule: true,
  default: (props) => {
    return <div {...props}>{props.name}</div>;
  },
}));

describe('PlaybookCard', () => {
  let permission = {
    isReceptorConfigured: true,
    permissions: {
      execute: true,
    },
  };

  test('deselects playbook when archived and showArchived is false', async () => {
    const selector = {
      getSelectedIds() {
        return ['be95812a-b98a-4dc3-bc2f-f93970f71bcf'];
      },
      register: () => undefined,
      reset: () => jest.fn(),
      props: { onSelect: jest.fn(() => {}) },
      tbodyProps: {
        onRowClick: () => jest.fn(),
      },
    };

    render(
      <PlaybookCard
        remediation={remediationsMock[0]}
        remediationIdx={0}
        archived={false}
        selector={selector}
        setExecuteOpen={() => jest.fn()}
        update={() => jest.fn()}
        loadRemediation={() => jest.fn()}
        getConnectionStatus={() => jest.fn()}
        downloadPlaybook={() => jest.fn()}
        permission={permission}
        showArchived={false}
      />
    );

    fireEvent.click(
      screen.getByRole('checkbox', {
        name: /be95812a-b98a-4dc3-bc2f-f93970f71bcf-checkbox/i,
      })
    );

    fireEvent.click(
      screen.getByRole('button', {
        name: /actions/i,
      })
    );

    fireEvent.click(
      screen.getByRole('menuitem', {
        name: /archive playbook/i,
      })
    );

    expect(selector.props.onSelect).toHaveBeenCalledWith(
      expect.anything(),
      false,
      0
    );
  });
});
