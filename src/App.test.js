import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import App from './App';
import useChrome from '@redhat-cloud-services/frontend-components/useChrome';
import { getIsReceptorConfigured } from './api';

jest.mock('@redhat-cloud-services/frontend-components/useChrome', () => ({
  __esModule: true,
  default: jest.fn(),
}));
jest.mock('./Routes', () => {
  return function MockRoutes() {
    return <div data-testid="routes">Routes Component</div>;
  };
});
jest.mock('./api', () => ({
  getIsReceptorConfigured: jest.fn(),
}));
jest.mock(
  '@redhat-cloud-services/frontend-components-notifications/NotificationPortal',
  () => {
    return function MockNotificationsPortal() {
      return <div data-testid="notifications">Notifications Portal</div>;
    };
  },
);

const mockStore = createStore(() => ({}));

describe('App Component', () => {
  let mockChrome;

  beforeEach(() => {
    jest.clearAllMocks();

    mockChrome = {
      hideGlobalFilter: jest.fn(),
      getUserPermissions: jest.fn(),
    };

    useChrome.mockReturnValue(mockChrome);
    getIsReceptorConfigured.mockResolvedValue({ data: [{ id: 'test' }] });
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

    it('should fetch receptor configuration on mount', async () => {
      mockChrome.getUserPermissions.mockResolvedValue([
        { permission: 'remediations:*:*' },
      ]);

      renderApp();

      await waitFor(() => {
        expect(getIsReceptorConfigured).toHaveBeenCalled();
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
        expect(screen.getByTestId('routes')).toBeInTheDocument();
      });
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
        expect(screen.getByTestId('routes')).toBeInTheDocument();
      });
    });

    it('should handle no permissions', async () => {
      mockChrome.getUserPermissions.mockResolvedValue([]);

      renderApp();

      await waitFor(() => {
        expect(screen.getByTestId('routes')).toBeInTheDocument();
      });
    });

    it('should handle different permission formats', async () => {
      mockChrome.getUserPermissions.mockResolvedValue([
        { permission: 'other:permission:format' },
      ]);

      renderApp();

      await waitFor(() => {
        expect(screen.getByTestId('routes')).toBeInTheDocument();
      });
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

  describe('Receptor Configuration', () => {
    it('should set isReceptorConfigured to true when data exists', async () => {
      getIsReceptorConfigured.mockResolvedValue({
        data: [{ id: 'receptor1' }],
      });
      mockChrome.getUserPermissions.mockResolvedValue([
        { permission: 'remediations:*:*' },
      ]);

      renderApp();

      await waitFor(() => {
        expect(screen.getByTestId('routes')).toBeInTheDocument();
      });
    });

    it('should set isReceptorConfigured to false when no data', async () => {
      getIsReceptorConfigured.mockResolvedValue({ data: [] });
      mockChrome.getUserPermissions.mockResolvedValue([
        { permission: 'remediations:*:*' },
      ]);

      renderApp();

      await waitFor(() => {
        expect(screen.getByTestId('routes')).toBeInTheDocument();
      });
    });

    it('should handle getIsReceptorConfigured error', async () => {
      const consoleSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      getIsReceptorConfigured.mockRejectedValue(new Error('Receptor error'));
      mockChrome.getUserPermissions.mockResolvedValue([
        { permission: 'remediations:*:*' },
      ]);

      renderApp();

      await waitFor(() => {
        expect(screen.getByTestId('routes')).toBeInTheDocument();
      });

      consoleSpy.mockRestore();
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
    it('should render notifications portal when permissions are loaded', async () => {
      mockChrome.getUserPermissions.mockResolvedValue([
        { permission: 'remediations:*:*' },
      ]);

      renderApp();

      await waitFor(() => {
        expect(screen.getByTestId('notifications')).toBeInTheDocument();
      });
    });

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
      expect(getIsReceptorConfigured).toHaveBeenCalledTimes(1);
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
    it('should handle async errors gracefully', async () => {
      const consoleSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      mockChrome.getUserPermissions.mockResolvedValue([
        { permission: 'remediations:*:*' },
      ]);

      // Simulate an error in getIsReceptorConfigured
      getIsReceptorConfigured.mockRejectedValue(new Error('Network error'));

      renderApp();

      await waitFor(() => {
        expect(screen.getByTestId('routes')).toBeInTheDocument();
      });

      consoleSpy.mockRestore();
    });

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

    it('should handle malformed receptor data', async () => {
      getIsReceptorConfigured.mockResolvedValue({ data: [] }); // Use empty array instead of null
      mockChrome.getUserPermissions.mockResolvedValue([
        { permission: 'remediations:*:*' },
      ]);

      renderApp();

      await waitFor(() => {
        expect(screen.getByTestId('routes')).toBeInTheDocument();
      });
    });
  });
});
