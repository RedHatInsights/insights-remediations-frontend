import { dispatchAction, dispatchNotification } from './dispatcher';
import { getStore } from '../store';
import { addNotification } from '@redhat-cloud-services/frontend-components-notifications';

// Mock the store
jest.mock('../store', () => ({
  getStore: jest.fn(),
}));

// Mock the notifications
jest.mock('@redhat-cloud-services/frontend-components-notifications', () => ({
  addNotification: jest.fn(),
}));

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
    it('should log deprecation warning', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      dispatchNotification();

      expect(consoleSpy).toHaveBeenCalledWith(
        'dispatchNotification is deprecated. Use useAddNotification hook instead.',
      );

      consoleSpy.mockRestore();
    });

    it('should not call addNotification (deprecated)', () => {
      const mockNotification = {
        title: 'Test notification',
        description: 'Test description',
        variant: 'success',
      };

      dispatchNotification(mockNotification);

      // Should not call addNotification since function is deprecated
      expect(addNotification).not.toHaveBeenCalled();
      expect(getStore).not.toHaveBeenCalled();
      expect(mockDispatch).not.toHaveBeenCalled();
    });
  });
});
