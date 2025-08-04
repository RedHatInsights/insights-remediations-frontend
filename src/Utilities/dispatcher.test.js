import { dispatchAction, dispatchNotification } from './dispatcher';
import { getStore } from '../store';
import { addNotification } from '@redhat-cloud-services/frontend-components-notifications/redux';

// Mock the store
jest.mock('../store', () => ({
  getStore: jest.fn(),
}));

// Mock the notifications
jest.mock(
  '@redhat-cloud-services/frontend-components-notifications/redux',
  () => ({
    addNotification: jest.fn(),
  }),
);

describe('dispatcher', () => {
  const mockDispatch = jest.fn();
  const mockStore = { dispatch: mockDispatch };

  beforeEach(() => {
    jest.clearAllMocks();
    getStore.mockReturnValue(mockStore);
  });

  describe('dispatchAction', () => {
    it('should get store and dispatch action creator', () => {
      const mockActionCreator = { type: 'TEST_ACTION', payload: 'test' };

      const result = dispatchAction(mockActionCreator);

      expect(getStore).toHaveBeenCalled();
      expect(mockDispatch).toHaveBeenCalledWith(mockActionCreator);
      expect(result).toBe(mockDispatch.return);
    });

    it('should return the result of dispatch', () => {
      const mockActionCreator = { type: 'ANOTHER_ACTION' };
      const expectedResult = 'dispatch result';
      mockDispatch.mockReturnValue(expectedResult);

      const result = dispatchAction(mockActionCreator);

      expect(result).toBe(expectedResult);
    });
  });

  describe('dispatchNotification', () => {
    it('should create notification action and dispatch it', () => {
      const mockNotification = {
        variant: 'success',
        title: 'Test notification',
        description: 'Test description',
      };
      const mockNotificationAction = {
        type: 'ADD_NOTIFICATION',
        payload: mockNotification,
      };

      addNotification.mockReturnValue(mockNotificationAction);

      dispatchNotification(mockNotification);

      expect(addNotification).toHaveBeenCalledWith(mockNotification);
      expect(getStore).toHaveBeenCalled();
      expect(mockDispatch).toHaveBeenCalledWith(mockNotificationAction);
    });

    it('should handle different notification types', () => {
      const errorNotification = {
        variant: 'danger',
        title: 'Error occurred',
      };
      const mockErrorAction = {
        type: 'ADD_NOTIFICATION',
        payload: errorNotification,
      };

      addNotification.mockReturnValue(mockErrorAction);

      dispatchNotification(errorNotification);

      expect(addNotification).toHaveBeenCalledWith(errorNotification);
      expect(mockDispatch).toHaveBeenCalledWith(mockErrorAction);
    });
  });
});
