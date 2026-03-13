import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import App from './App';
import useChrome from '@redhat-cloud-services/frontend-components/useChrome';

jest.mock('@redhat-cloud-services/frontend-components/useChrome', () => ({
  __esModule: true,
  default: jest.fn(),
}));
jest.mock('./Utilities/Hooks/useFeatureFlag', () => ({
  useFeatureFlag: jest.fn(() => false),
}));
jest.mock('./Routes', () => {
  return function MockRoutes() {
    return <div data-testid="routes">Routes Component</div>;
  };
});

jest.mock(
  '@redhat-cloud-services/frontend-components-notifications/NotificationsProvider',
  () => {
    const PropTypes = require('prop-types');
    const MockNotificationsProvider = ({ children }) => <div>{children}</div>;
    MockNotificationsProvider.propTypes = {
      children: PropTypes.node,
    };
    return MockNotificationsProvider;
  },
);

jest.mock('@redhat-cloud-services/frontend-components/NotAuthorized', () => ({
  NotAuthorized: () => <div data-testid="not-authorized">Not Authorized</div>,
}));

jest.mock('@redhat-cloud-services/frontend-components/RBACProvider', () => {
  const PropTypes = require('prop-types');
  const RBACProvider = ({ children }) => <div>{children}</div>;
  RBACProvider.propTypes = {
    children: PropTypes.node,
  };
  return { RBACProvider };
});

jest.mock('@project-kessel/react-kessel-access-check', () => {
  const PropTypes = require('prop-types');
  const Provider = ({ children }) => <div>{children}</div>;
  Provider.propTypes = { children: PropTypes.node };

  return {
    AccessCheck: {
      Provider,
    },
    fetchDefaultWorkspace: jest.fn(),
    useSelfAccessCheck: jest.fn(),
  };
});

const mockStore = createStore(() => ({}));

const { useFeatureFlag } = require('./Utilities/Hooks/useFeatureFlag');
const {
  fetchDefaultWorkspace,
  useSelfAccessCheck,
} = require('@project-kessel/react-kessel-access-check');

describe('App Component', () => {
  let mockChrome;

  beforeEach(() => {
    jest.clearAllMocks();
    useFeatureFlag.mockReturnValue(false);

    mockChrome = {
      hideGlobalFilter: jest.fn(),
      getUserPermissions: jest.fn().mockResolvedValue([]),
    };

    useChrome.mockReturnValue(mockChrome);
    fetchDefaultWorkspace.mockResolvedValue({ id: 'default-ws-id' });
  });

  const renderApp = () => {
    return render(
      <Provider store={mockStore}>
        <App />
      </Provider>,
    );
  };

  describe('Initialization', () => {
    it('should render loading spinner initially', () => {
      mockChrome.getUserPermissions.mockImplementation(
        () => new Promise(() => {}),
      ); // Never resolves

      renderApp();

      expect(screen.getByRole('progressbar')).toBeInTheDocument();
      expect(screen.queryByTestId('routes')).not.toBeInTheDocument();
    });

    it('should hide global filter on mount', async () => {
      mockChrome.getUserPermissions.mockResolvedValue([
        { permission: 'remediations:*:*' },
      ]);

      renderApp();

      await waitFor(() => {
        expect(mockChrome.hideGlobalFilter).toHaveBeenCalled();
      });
    });
  });

  describe('Permission Handling', () => {
    it('should handle wildcard permissions correctly', async () => {
      mockChrome.getUserPermissions.mockResolvedValue([
        { permission: 'remediations:*:*' },
      ]);

      renderApp();

      await waitFor(() => {
        expect(screen.getByTestId('routes')).toBeInTheDocument();
      });

      expect(screen.getByTestId('routes')).toBeInTheDocument();
    });

    it('should handle remediation wildcard permissions correctly', async () => {
      mockChrome.getUserPermissions.mockResolvedValue([
        { permission: 'remediations:remediation:*' },
      ]);

      renderApp();

      await waitFor(() => {
        expect(screen.getByTestId('routes')).toBeInTheDocument();
      });
    });

    it('should handle specific read permissions', async () => {
      mockChrome.getUserPermissions.mockResolvedValue([
        { permission: 'remediations:remediation:read' },
      ]);

      renderApp();

      await waitFor(() => {
        expect(screen.getByTestId('routes')).toBeInTheDocument();
      });
    });

    it('should handle specific write permissions', async () => {
      mockChrome.getUserPermissions.mockResolvedValue([
        { permission: 'remediations:remediation:write' },
      ]);

      renderApp();

      await waitFor(() => {
        expect(screen.getByTestId('routes')).toBeInTheDocument();
      });
    });

    it('should handle specific execute permissions', async () => {
      mockChrome.getUserPermissions.mockResolvedValue([
        { permission: 'remediations:remediation:execute' },
      ]);

      renderApp();

      await waitFor(() => {
        expect(screen.getByTestId('not-authorized')).toBeInTheDocument();
      });

      expect(screen.queryByTestId('routes')).not.toBeInTheDocument();
    });

    it('should handle multiple specific permissions', async () => {
      mockChrome.getUserPermissions.mockResolvedValue([
        { permission: 'remediations:remediation:read' },
        { permission: 'remediations:remediation:write' },
        { permission: 'remediations:remediation:execute' },
      ]);

      renderApp();

      await waitFor(() => {
        expect(screen.getByTestId('routes')).toBeInTheDocument();
      });
    });

    it('should handle alternative wildcard read permissions', async () => {
      mockChrome.getUserPermissions.mockResolvedValue([
        { permission: 'remediations:*:read' },
      ]);

      renderApp();

      await waitFor(() => {
        expect(screen.getByTestId('routes')).toBeInTheDocument();
      });
    });

    it('should handle alternative wildcard write permissions', async () => {
      mockChrome.getUserPermissions.mockResolvedValue([
        { permission: 'remediations:*:write' },
      ]);

      renderApp();

      await waitFor(() => {
        expect(screen.getByTestId('routes')).toBeInTheDocument();
      });
    });

    it('should handle alternative wildcard execute permissions', async () => {
      mockChrome.getUserPermissions.mockResolvedValue([
        { permission: 'remediations:*:execute' },
      ]);

      renderApp();

      await waitFor(() => {
        expect(screen.getByTestId('not-authorized')).toBeInTheDocument();
      });

      expect(screen.queryByTestId('routes')).not.toBeInTheDocument();
    });

    it('should handle no permissions', async () => {
      mockChrome.getUserPermissions.mockResolvedValue([]);

      renderApp();

      await waitFor(() => {
        expect(screen.getByTestId('not-authorized')).toBeInTheDocument();
      });

      expect(screen.queryByTestId('routes')).not.toBeInTheDocument();
    });

    it('should handle different permission formats', async () => {
      mockChrome.getUserPermissions.mockResolvedValue([
        { permission: 'other:permission:format' },
      ]);

      renderApp();

      await waitFor(() => {
        expect(screen.getByTestId('not-authorized')).toBeInTheDocument();
      });

      expect(screen.queryByTestId('routes')).not.toBeInTheDocument();
    });

    it('should handle getUserPermissions error', async () => {
      mockChrome.getUserPermissions.mockRejectedValue(
        new Error('Permission error'),
      );

      // Hide console errors for this test
      const consoleSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      renderApp();

      // Should still show spinner since permissions aren't loaded
      expect(screen.getByRole('progressbar')).toBeInTheDocument();

      consoleSpy.mockRestore();
    });
  });

  describe('Authorization Handling', () => {
    it('should show NotAuthorized when user has only execute permissions', async () => {
      mockChrome.getUserPermissions.mockResolvedValue([
        { permission: 'remediations:remediation:execute' },
      ]);

      renderApp();

      await waitFor(() => {
        expect(screen.getByTestId('not-authorized')).toBeInTheDocument();
      });

      expect(screen.getByText('Not Authorized')).toBeInTheDocument();
      expect(screen.queryByTestId('routes')).not.toBeInTheDocument();
    });

    it('should show NotAuthorized when user has no permissions', async () => {
      mockChrome.getUserPermissions.mockResolvedValue([]);

      renderApp();

      await waitFor(() => {
        expect(screen.getByTestId('not-authorized')).toBeInTheDocument();
      });

      expect(screen.getByText('Not Authorized')).toBeInTheDocument();
      expect(screen.queryByTestId('routes')).not.toBeInTheDocument();
    });

    it('should show Routes when user has read permission', async () => {
      mockChrome.getUserPermissions.mockResolvedValue([
        { permission: 'remediations:*:read' },
      ]);

      renderApp();

      await waitFor(() => {
        expect(screen.getByTestId('routes')).toBeInTheDocument();
      });

      expect(screen.queryByTestId('not-authorized')).not.toBeInTheDocument();
    });

    it('should show Routes when user has write permission', async () => {
      mockChrome.getUserPermissions.mockResolvedValue([
        { permission: 'remediations:*:write' },
      ]);

      renderApp();

      await waitFor(() => {
        expect(screen.getByTestId('routes')).toBeInTheDocument();
      });

      expect(screen.queryByTestId('not-authorized')).not.toBeInTheDocument();
    });

    it('should show Routes when user has both read and write permissions', async () => {
      mockChrome.getUserPermissions.mockResolvedValue([
        { permission: 'remediations:remediation:read' },
        { permission: 'remediations:remediation:write' },
      ]);

      renderApp();

      await waitFor(() => {
        expect(screen.getByTestId('routes')).toBeInTheDocument();
      });

      expect(screen.queryByTestId('not-authorized')).not.toBeInTheDocument();
    });
  });

  describe('Chrome Integration', () => {
    it('should handle missing chrome object', async () => {
      useChrome.mockReturnValue(null);

      renderApp();

      // Should still show spinner since no chrome means no permission loading
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('should handle chrome without hideGlobalFilter method', async () => {
      const chromeWithoutHideGlobalFilter = {
        getUserPermissions: jest
          .fn()
          .mockResolvedValue([{ permission: 'remediations:*:*' }]),
      };
      useChrome.mockReturnValue(chromeWithoutHideGlobalFilter);

      renderApp();

      await waitFor(() => {
        expect(screen.getByTestId('routes')).toBeInTheDocument();
      });
    });

    it('should handle chrome without getUserPermissions method', async () => {
      const consoleSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      const chromeWithoutGetUserPermissions = {
        hideGlobalFilter: jest.fn(),
      };
      useChrome.mockReturnValue(chromeWithoutGetUserPermissions);

      renderApp();

      // Should still show spinner since permissions can't be loaded
      expect(screen.getByRole('progressbar')).toBeInTheDocument();

      consoleSpy.mockRestore();
    });
  });

  describe('Rendering', () => {
    it('should render routes when permissions are loaded', async () => {
      mockChrome.getUserPermissions.mockResolvedValue([
        { permission: 'remediations:*:*' },
      ]);

      renderApp();

      await waitFor(() => {
        expect(screen.getByTestId('routes')).toBeInTheDocument();
      });
    });

    it('should provide permission context to children', async () => {
      mockChrome.getUserPermissions.mockResolvedValue([
        { permission: 'remediations:remediation:read' },
      ]);

      renderApp();

      await waitFor(() => {
        expect(screen.getByTestId('routes')).toBeInTheDocument();
      });

      // Context should be provided with the correct structure
    });
  });

  describe('Component Lifecycle', () => {
    it('should only run useEffect once on mount', async () => {
      mockChrome.getUserPermissions.mockResolvedValue([
        { permission: 'remediations:*:*' },
      ]);

      const { rerender } = renderApp();

      await waitFor(() => {
        expect(screen.getByTestId('routes')).toBeInTheDocument();
      });

      // Re-render the component
      rerender(
        <Provider store={mockStore}>
          <App />
        </Provider>,
      );

      // Mocks should only be called once from initial mount
      expect(mockChrome.hideGlobalFilter).toHaveBeenCalledTimes(1);
    });

    it('should handle rapid re-renders gracefully', async () => {
      mockChrome.getUserPermissions.mockResolvedValue([
        { permission: 'remediations:*:*' },
      ]);

      const { rerender } = renderApp();

      // Multiple quick re-renders
      for (let i = 0; i < 5; i++) {
        rerender(
          <Provider store={mockStore}>
            <App />
          </Provider>,
        );
      }

      await waitFor(() => {
        expect(screen.getByTestId('routes')).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle malformed permission data', async () => {
      mockChrome.getUserPermissions.mockResolvedValue([
        { permission: null },
        { permission: undefined },
        { permission: '' },
        { permission: 'remediations:*:*' },
      ]);

      renderApp();

      await waitFor(() => {
        expect(screen.getByTestId('routes')).toBeInTheDocument();
      });
    });
  });

  describe('when kessel-for-remediations is enabled', () => {
    beforeEach(() => {
      useFeatureFlag.mockReturnValue(true);
      mockChrome.appObjectId = jest.fn(() => 'test-workspace-id');
      useSelfAccessCheck.mockReturnValue({
        data: [
          {
            relation: 'remediations_view_remediation',
            allowed: true,
          },
          {
            relation: 'remediations_edit_remediation',
            allowed: true,
          },
          {
            relation: 'remediations_execute_remediation',
            allowed: true,
          },
        ],
        loading: false,
        error: undefined,
      });
    });

    it('should use AccessCheck.Provider and show routes when Kessel allows access', async () => {
      renderApp();

      await waitFor(() => {
        expect(screen.getByTestId('routes')).toBeInTheDocument();
      });
      expect(screen.queryByTestId('not-authorized')).not.toBeInTheDocument();
    });

    it('should show NotAuthorized when Kessel returns no read/write', async () => {
      useSelfAccessCheck.mockReturnValue({
        data: [
          { relation: 'remediations_view_remediation', allowed: false },
          { relation: 'remediations_edit_remediation', allowed: false },
          { relation: 'remediations_execute_remediation', allowed: true },
        ],
        loading: false,
        error: undefined,
      });

      renderApp();

      await waitFor(() => {
        expect(screen.getByTestId('not-authorized')).toBeInTheDocument();
      });
      expect(screen.queryByTestId('routes')).not.toBeInTheDocument();
    });

    it('should show spinner while Kessel is loading', () => {
      useSelfAccessCheck.mockReturnValue({
        data: undefined,
        loading: true,
        error: undefined,
      });

      renderApp();

      expect(screen.getByRole('progressbar')).toBeInTheDocument();
      expect(screen.queryByTestId('routes')).not.toBeInTheDocument();
    });
  });
});
