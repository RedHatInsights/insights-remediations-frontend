import { init, getStore, register } from './index';

// Mock the external dependencies
jest.mock(
  '@redhat-cloud-services/frontend-components-utilities/Registry',
  () => ({
    getRegistry: jest.fn(),
  }),
);

jest.mock('@redhat-cloud-services/frontend-components-notifications', () => ({
  notificationsReducer: jest.fn(),
  notificationsMiddleware: jest.fn(() => 'notificationsMiddleware'),
}));

jest.mock('redux-promise-middleware', () => 'promiseMiddleware');

jest.mock('./reducers', () => 'mockReducers');

import { getRegistry } from '@redhat-cloud-services/frontend-components-utilities/Registry';
describe('Store Index', () => {
  let mockRegistry;

  beforeEach(() => {
    jest.clearAllMocks();

    mockRegistry = {
      register: jest.fn(),
      getStore: jest.fn(() => 'mockStore'),
    };

    getRegistry.mockReturnValue(mockRegistry);
  });

  describe('init', () => {
    it('should initialize registry with default middleware', () => {
      const result = init();

      expect(getRegistry).toHaveBeenCalledWith({}, ['promiseMiddleware']);

      // notificationsMiddleware is no longer used - notifications handled via NotificationsProvider context

      expect(mockRegistry.register).toHaveBeenCalledWith('mockReducers');
      // notifications reducer is no longer registered - notifications handled via NotificationsProvider context

      expect(result).toBe(mockRegistry);
    });

    it('should initialize registry with additional middleware', () => {
      const customMiddleware1 = 'middleware1';
      const customMiddleware2 = 'middleware2';

      const result = init(customMiddleware1, customMiddleware2);

      expect(getRegistry).toHaveBeenCalledWith({}, [
        'promiseMiddleware',
        customMiddleware1,
        customMiddleware2,
      ]);

      expect(result).toBe(mockRegistry);
    });

    it('should filter out undefined middleware', () => {
      const customMiddleware1 = 'middleware1';
      const undefinedMiddleware = undefined;
      const customMiddleware2 = 'middleware2';

      init(customMiddleware1, undefinedMiddleware, customMiddleware2);

      expect(getRegistry).toHaveBeenCalledWith({}, [
        'promiseMiddleware',
        customMiddleware1,
        customMiddleware2,
      ]);
    });

    it('should handle empty middleware array', () => {
      init();

      expect(getRegistry).toHaveBeenCalledWith({}, ['promiseMiddleware']);
    });

    it('should handle all undefined middleware', () => {
      init(undefined, undefined);

      expect(getRegistry).toHaveBeenCalledWith({}, ['promiseMiddleware']);
    });
  });

  describe('getStore', () => {
    it('should return store from registry', () => {
      // Initialize registry first
      init();

      const result = getStore();

      expect(mockRegistry.getStore).toHaveBeenCalled();
      expect(result).toBe('mockStore');
    });

    it('should work after multiple initializations', () => {
      init();
      init('newMiddleware');

      const result = getStore();

      expect(result).toBe('mockStore');
    });
  });

  describe('register', () => {
    it('should call registry.register with arguments', () => {
      // Initialize registry first
      init();

      const args1 = { test: 'reducer1' };
      const args2 = { test: 'reducer2' };

      register(args1, args2);

      expect(mockRegistry.register).toHaveBeenCalledWith(args1, args2);
    });

    it('should return result from registry.register', () => {
      // Initialize registry first
      init();

      const mockReturnValue = 'registrationResult';
      mockRegistry.register.mockReturnValue(mockReturnValue);

      const result = register({ test: 'reducer' });

      expect(result).toBe(mockReturnValue);
    });

    it('should handle no arguments', () => {
      // Initialize registry first
      init();

      register();

      expect(mockRegistry.register).toHaveBeenCalledWith();
    });

    it('should handle multiple register calls', () => {
      // Initialize registry first
      init();

      register({ reducer1: 'test1' });
      register({ reducer2: 'test2' });

      expect(mockRegistry.register).toHaveBeenCalledTimes(3); // 1 from init + 2 from register calls
    });
  });
});
