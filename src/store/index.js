import { getRegistry } from '@redhat-cloud-services/frontend-components-utilities/Registry';
import { notificationsReducer } from '@redhat-cloud-services/frontend-components-notifications/redux';
import notificationsMiddleware from '@redhat-cloud-services/frontend-components-notifications/notificationsMiddleware';
import promiseMiddleware from 'redux-promise-middleware';
import reducers from './reducers';

let registry;

export function init(...middleware) {
  registry = getRegistry({}, [
    promiseMiddleware,
    notificationsMiddleware({
      errorTitleKey: 'message',
      errorDescriptionKey: 'description',
    }),
    ...middleware.filter((item) => typeof item !== 'undefined'),
  ]);

  registry.register(reducers);
  registry.register({ notifications: notificationsReducer });

  return registry;
}

export function getStore() {
  return registry.getStore();
}

export function register(...args) {
  return registry.register(...args);
}
