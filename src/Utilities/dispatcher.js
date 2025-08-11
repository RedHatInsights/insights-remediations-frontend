import { getStore } from '../store';

export function dispatchAction(actionCreator) {
  const store = getStore();
  return store.dispatch(actionCreator);
}

// Note: This function is deprecated. Use useAddNotification hook instead.
// Keeping for backward compatibility during migration.
export const dispatchNotification = () => {
  // This will need to be updated to use the notification context/provider
  console.warn(
    'dispatchNotification is deprecated. Use useAddNotification hook instead.',
  );
};
