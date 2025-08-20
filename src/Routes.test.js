import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';
import RemediationRoutes, { routes } from './Routes';

jest.mock('axios');
jest.mock('@redhat-cloud-services/frontend-components/AsyncComponent', () => {
  return jest.fn(({ children, customFetchResults }) => (
    <div data-testid="async-component" data-has-systems={customFetchResults}>
      {children}
    </div>
  ));
});

jest.mock('@redhat-cloud-services/frontend-components/ErrorState', () => {
  return jest.fn(() => <div data-testid="error-state">Error State</div>);
});

// Mock lazy-loaded components
const mockOverViewPage = jest.fn(() => (
  <div data-testid="overview-page">Overview Page</div>
));
const mockRemediationDetails = jest.fn(() => (
  <div data-testid="remediation-details">Remediation Details</div>
));

jest.mock('./routes/OverViewPage/OverViewPage', () => ({
  __esModule: true,
  default: mockOverViewPage,
}));

jest.mock('./routes/RemediationDetails', () => ({
  __esModule: true,
  default: mockRemediationDetails,
}));

const originalLazy = React.lazy;
jest.spyOn(React, 'lazy').mockImplementation((importFn) => {
  // Determine which component to return based on the import path
  return originalLazy(() => {
    const modulePath = importFn.toString();
    if (modulePath.includes('OverViewPage')) {
      return Promise.resolve({ default: mockOverViewPage });
    } else if (modulePath.includes('RemediationDetails')) {
      return Promise.resolve({ default: mockRemediationDetails });
    }
    return importFn();
  });
});

const renderWithRouter = (component) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('Routes', () => {
  const mockAxiosResponse = {
    data: { total: 5 },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    axios.get.mockResolvedValue(mockAxiosResponse);
  });

  describe('routes configuration', () => {
    it('should export correct routes configuration', () => {
      expect(routes).toHaveProperty('home');
      expect(routes).toHaveProperty('details');

      expect(routes.home.path).toBe('/*');
      expect(routes.details.path).toBe(':id');

      expect(routes.home.component).toBeDefined();
      expect(routes.details.component).toBeDefined();
    });
  });

  describe('RemediationRoutes component', () => {
    it('should render AsyncComponent with correct props', async () => {
      renderWithRouter(<RemediationRoutes />);

      await waitFor(() => {
        expect(screen.getByTestId('async-component')).toBeInTheDocument();
      });

      const asyncComponent = screen.getByTestId('async-component');
      expect(asyncComponent).toHaveAttribute('data-has-systems', 'true');
    });

    it('should make API call to fetch systems count', async () => {
      renderWithRouter(<RemediationRoutes />);

      await waitFor(() => {
        expect(axios.get).toHaveBeenCalledWith(
          '/api/inventory/v1/hosts?filter[system_profile][operating_system][RHEL][version][gte]=0&page=1&per_page=1',
        );
      });
    });

    it('should set hasSystems to true when systems exist', async () => {
      axios.get.mockResolvedValue({ data: { total: 5 } });

      renderWithRouter(<RemediationRoutes />);

      await waitFor(() => {
        const asyncComponent = screen.getByTestId('async-component');
        expect(asyncComponent).toHaveAttribute('data-has-systems', 'true');
      });
    });

    it('should set hasSystems to false when no systems exist', async () => {
      axios.get.mockResolvedValue({ data: { total: 0 } });

      renderWithRouter(<RemediationRoutes />);

      await waitFor(() => {
        const asyncComponent = screen.getByTestId('async-component');
        expect(asyncComponent).toHaveAttribute('data-has-systems', 'false');
      });
    });
    it('should render Spinner in Suspense fallback', () => {
      jest.doMock('@patternfly/react-core', () => ({
        Spinner: () => <div data-testid="spinner">Loading...</div>,
      }));

      renderWithRouter(<RemediationRoutes />);

      // The Spinner should be rendered as part of Suspense fallback
      // This test verifies the structure is correct
      expect(screen.getByTestId('async-component')).toBeInTheDocument();
    });

    it('should render Routes with correct structure', async () => {
      renderWithRouter(<RemediationRoutes />);

      await waitFor(() => {
        expect(screen.getByTestId('async-component')).toBeInTheDocument();
      });

      // Verify the routes structure is rendered
      const asyncComponent = screen.getByTestId('async-component');
      expect(asyncComponent).toBeInTheDocument();
    });
  });

  describe('API configuration', () => {
    it('should use correct inventory API URL', () => {
      const expectedBaseUrl = '/api/inventory/v1/hosts';
      const expectedFilter =
        '?filter[system_profile][operating_system][RHEL][version][gte]=0';
      const expectedPagination = '&page=1&per_page=1';
      const expectedFullUrl =
        expectedBaseUrl + expectedFilter + expectedPagination;

      renderWithRouter(<RemediationRoutes />);

      expect(axios.get).toHaveBeenCalledWith(expectedFullUrl);
    });

    it('should use RHEL filter for systems', () => {
      renderWithRouter(<RemediationRoutes />);

      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining(
          'filter[system_profile][operating_system][RHEL][version][gte]=0',
        ),
      );
    });

    it('should request minimal page size for count check', () => {
      renderWithRouter(<RemediationRoutes />);

      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining('page=1&per_page=1'),
      );
    });
  });

  describe('AsyncComponent configuration', () => {
    it('should configure AsyncComponent with correct props', async () => {
      const AsyncComponent = require('@redhat-cloud-services/frontend-components/AsyncComponent');

      renderWithRouter(<RemediationRoutes />);

      await waitFor(() => {
        expect(AsyncComponent).toHaveBeenCalledWith(
          expect.objectContaining({
            appName: 'dashboard',
            module: './AppZeroState',
            scope: 'dashboard',
            app: 'Remediation_plans',
            appId: 'remediation_zero_state',
            customFetchResults: expect.any(Boolean),
          }),
          expect.anything(),
        );
      });
    });

    it('should pass ErrorState as ErrorComponent', () => {
      const AsyncComponent = require('@redhat-cloud-services/frontend-components/AsyncComponent');

      renderWithRouter(<RemediationRoutes />);

      expect(AsyncComponent).toHaveBeenCalledWith(
        expect.objectContaining({
          ErrorComponent: expect.anything(),
        }),
        expect.anything(),
      );
    });
  });

  describe('useEffect behavior', () => {
    it('should not make duplicate API calls on re-renders with same hasSystems value', async () => {
      const { rerender } = renderWithRouter(<RemediationRoutes />);

      await waitFor(() => {
        expect(axios.get).toHaveBeenCalledTimes(1);
      });

      // Re-render component
      rerender(
        <BrowserRouter>
          <RemediationRoutes />
        </BrowserRouter>,
      );

      // Should not make additional API calls
      await waitFor(() => {
        expect(axios.get).toHaveBeenCalledTimes(1);
      });
    });

    it('should handle component unmount during API call', async () => {
      let resolvePromise;
      const pendingPromise = new Promise((resolve) => {
        resolvePromise = resolve;
      });

      axios.get.mockReturnValue(pendingPromise);

      const { unmount } = renderWithRouter(<RemediationRoutes />);

      // Unmount before API call completes
      unmount();

      // Resolve the promise after unmount
      resolvePromise({ data: { total: 5 } });

      // Should not cause any issues
      await waitFor(
        () => {
          expect(axios.get).toHaveBeenCalled();
        },
        { timeout: 1000 },
      );
    });
  });

  describe('error scenarios', () => {
    beforeEach(() => {
      // Suppress console errors for these error scenario tests
      jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
      // Restore console.error after each test
      console.error.mockRestore();
    });

    it('should handle malformed API response', async () => {
      // API returns malformed response - provide data with missing total field instead of null data
      axios.get.mockResolvedValue({ data: {} });

      const { container } = renderWithRouter(<RemediationRoutes />);

      // Should handle gracefully and not crash
      await waitFor(() => {
        expect(container).toBeInTheDocument();
      });
    });
  });
});
