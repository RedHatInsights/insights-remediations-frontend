import { getRegistry } from '@redhat-cloud-services/frontend-components-utilities/files/esm/Registry';
import {
  notifications,
  notificationsMiddleware,
} from '@redhat-cloud-services/frontend-components-notifications';
import promiseMiddleware from 'redux-promise-middleware';
import reducers from './reducers';

let registry;

export function init(...middleware) {
  if (registry) {
    throw new Error('store already initialized');
  }

  registry = getRegistry({}, [
    promiseMiddleware(),
    notificationsMiddleware({
      errorTitleKey: 'message',
      errorDescriptionKey: 'description',
    }),
    ...middleware.filter((item) => typeof item !== 'undefined'),
  ]);

  registry.register(reducers);
  registry.register({ notifications });

  return registry;
}

export function getStore() {
  return registry.getStore();
}

export function register(...args) {
  return registry.register(...args);
}
