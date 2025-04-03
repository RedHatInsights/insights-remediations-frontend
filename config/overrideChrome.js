const chromeMock = {
  updateDocumentTitle: () => undefined,
  isBeta: () => false,
  appAction: () => {},
  appObjectId: () => {},
  on: () => () => {},
  getApp: () => 'inventory', // TODO: use real app name for registration assistant
  getBundle: () => 'insights', // TODO: use real bundle name for registration assistant
  getUserPermissions: () => [{ permission: 'inventory:*:*' }], // TODO: check if the function is needed
  auth: {
    getUser: () =>
      Promise.resolve({
        identity: {
          account_number: '0',
          type: 'User',
          user: {
            is_org_admin: true,
          },
        },
        entitlements: {
          hybrid_cloud: { is_entitled: true },
          insights: { is_entitled: true },
          openshift: { is_entitled: true },
          smart_management: { is_entitled: false },
        },
      }),
  },
  hideGlobalFilter: () => {},
  quickStarts: {
    activateQuickstart: () => {},
  },
};

export default () => chromeMock;

export const useChrome = () => chromeMock;
