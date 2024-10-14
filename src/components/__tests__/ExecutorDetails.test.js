import React from 'react';
import ExecutorDetails from '../ExecutorDetails/ExecutorDetails';
import configureStore from 'redux-mock-store';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter as Router } from 'react-router-dom';
import {
  playbookRunsMock,
  playbookRunSystemDetailsMock,
  remediationsMock,
} from '../__fixtures__/remediations.fixtures';
import { Provider } from 'react-redux';
import { clearPlaybookRunSystemDetails } from '../../actions';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({
    executor_id: 'be95812a-b98a-4dc3-bc2f-f93970f71bcf',
    run_id: 'be95812a-b98a-4dc3-bc2f-f93970f71bcf',
    id: '5678',
  }),
}));

jest.mock('../../actions', () => ({
  clearPlaybookRunSystemDetails: jest.fn(),
  getPlaybookRun: jest.fn(),
}));

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: () => jest.fn(),
}));

describe('Execute button', () => {
  let mockStore;
  let initialState;

  beforeEach(() => {
    mockStore = configureStore();
    initialState = {
      selectedRemediation: {
        remediation: remediationsMock,
      },
      playbookRun: playbookRunsMock,
      playbookRunSystemDetails: playbookRunSystemDetailsMock,
    };
  });

  test('playbookRunSystemDetails is cleared in redux on initial load', async () => {
    const store = mockStore(initialState);
    render(
      <Router>
        <Provider store={store}>
          <ExecutorDetails />
        </Provider>
      </Router>
    );

    expect(clearPlaybookRunSystemDetails).toHaveBeenCalled();
  });
});
