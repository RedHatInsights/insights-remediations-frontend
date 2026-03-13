/* eslint-disable react/prop-types */
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import DetailsGeneralContent from './DetailsGeneralContent';

jest.mock('./DetailsCard', () => {
  return function MockDetailsCard(props) {
    return (
      <div data-testid="details-card">
        <div data-testid="details-card-props">
          {JSON.stringify(props, null, 2)}
        </div>
      </div>
    );
  };
});

jest.mock('./ProgressCard', () => {
  return function MockProgressCard(props) {
    return (
      <div data-testid="progress-card">
        <div data-testid="progress-card-props">
          {JSON.stringify(props, null, 2)}
        </div>
      </div>
    );
  };
});

// Mock PatternFly components
jest.mock('@patternfly/react-core', () => ({
  Alert: function MockAlert({
    isInline,
    variant,
    title,
    className,
    children,
    ...props
  }) {
    return (
      <div
        data-testid="alert"
        data-inline={isInline}
        data-variant={variant}
        className={className}
        {...props}
      >
        <div data-testid="alert-title">{title}</div>
        {children}
      </div>
    );
  },
  Grid: function MockGrid({ hasGutter, children, ...props }) {
    return (
      <div data-testid="grid" data-has-gutter={hasGutter} {...props}>
        {children}
      </div>
    );
  },
  GridItem: function MockGridItem({ span, md, children, ...props }) {
    return (
      <div data-testid="grid-item" data-span={span} data-md={md} {...props}>
        {children}
      </div>
    );
  },
}));

describe('DetailsGeneralContent', () => {
  const defaultProps = {
    details: {
      id: 'rem-1',
      name: 'Test Remediation',
      issue_count: 0,
      system_count: 5,
      issue_count_details: {},
      auto_reboot: true,
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-01-01T00:00:00Z',
    },
    onRename: jest.fn(),
    refetch: jest.fn(),
    remediationStatus: {
      connectionError: null,
      connectedSystems: 5,
    },
    updateRemPlan: jest.fn(),
    onNavigateToTab: jest.fn(),
    allRemediations: [
      { id: 'rem-1', name: 'Remediation 1' },
      { id: 'rem-2', name: 'Remediation 2' },
    ],
    permissions: {
      execute: true,
    },
    remediationPlaybookRuns: [{ id: 'run-1', status: 'success' }],
    refetchAllRemediations: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic rendering', () => {
    it('should render without crashing', () => {
      render(<DetailsGeneralContent {...defaultProps} />);

      expect(screen.getByTestId('grid')).toBeInTheDocument();
      expect(screen.getByTestId('details-card')).toBeInTheDocument();
      expect(screen.getByTestId('progress-card')).toBeInTheDocument();
    });

    it('should render with correct structure', () => {
      render(<DetailsGeneralContent {...defaultProps} />);

      // Component should render without crashing and contain expected elements
      expect(screen.getByTestId('grid')).toBeInTheDocument();
      expect(screen.getByTestId('details-card')).toBeInTheDocument();
      expect(screen.getByTestId('progress-card')).toBeInTheDocument();
    });

    it('should render grid with correct props', () => {
      render(<DetailsGeneralContent {...defaultProps} />);

      const grid = screen.getByTestId('grid');
      expect(grid).toHaveAttribute('data-has-gutter', 'true');
    });

    it('should render grid items with correct spans', () => {
      render(<DetailsGeneralContent {...defaultProps} />);

      const gridItems = screen.getAllByTestId('grid-item');
      expect(gridItems).toHaveLength(2);

      // First grid item (DetailsCard)
      expect(gridItems[0]).toHaveAttribute('data-span', '12');
      expect(gridItems[0]).toHaveAttribute('data-md', '6');

      // Second grid item (ProgressCard)
      expect(gridItems[1]).toHaveAttribute('data-span', '12');
      expect(gridItems[1]).toHaveAttribute('data-md', '6');
    });
  });

  describe('readyOrNot calculation', () => {
    it('should calculate readyOrNot as true when all conditions are met', () => {
      const props = {
        ...defaultProps,
        permissions: { execute: true },
        remediationStatus: {
          connectionError: null,
          connectedSystems: 5,
        },
      };

      render(<DetailsGeneralContent {...props} />);

      // Should not show alert when ready
      expect(screen.queryByTestId('alert')).not.toBeInTheDocument();

      // Check that ProgressCard receives correct readyOrNot value
      const progressCardProps = JSON.parse(
        screen.getByTestId('progress-card-props').textContent,
      );
      expect(progressCardProps.readyOrNot).toBe(true);
    });

    it('should calculate canExecute correctly when permissions.execute is false', () => {
      const props = {
        ...defaultProps,
        permissions: { execute: false },
        remediationStatus: {
          connectionError: null,
          connectedSystems: 5,
        },
      };

      render(<DetailsGeneralContent {...props} />);

      // Check that ProgressCard receives correct canExecute value
      const progressCardProps = JSON.parse(
        screen.getByTestId('progress-card-props').textContent,
      );
      expect(progressCardProps.readyOrNot).toBe(false); // Should be false when execute permission is false
    });

    it('should calculate readyOrNot as false when connectionError status is 403', () => {
      const props = {
        ...defaultProps,
        permissions: { execute: true },
        remediationStatus: {
          connectionError: { errors: [{ status: 403 }] },
          connectedSystems: 5,
        },
      };

      render(<DetailsGeneralContent {...props} />);

      // Check that ProgressCard receives correct readyOrNot value
      const progressCardProps = JSON.parse(
        screen.getByTestId('progress-card-props').textContent,
      );
      expect(progressCardProps.readyOrNot).toBe(false);
    });

    it('should calculate readyOrNot as false when connectionError status is 503', () => {
      const props = {
        ...defaultProps,
        permissions: { execute: true },
        remediationStatus: {
          connectionError: {
            errors: [
              {
                id: '2bb8b920fe07464ea020c1454e7b29f4',
                status: 503,
                code: 'DEPENDENCY_UNAVAILABLE',
                title:
                  'Internal service dependency is temporarily unavailable.  If the issue persists please contact Red Hat support: https://access.redhat.com/support/cases/',
                details: {
                  name: 'configManager',
                  impl: 'impl',
                },
              },
            ],
          },
          connectedSystems: 5,
        },
      };

      render(<DetailsGeneralContent {...props} />);

      const progressCardProps = JSON.parse(
        screen.getByTestId('progress-card-props').textContent,
      );
      expect(progressCardProps.readyOrNot).toBe(false);
    });

    it('should calculate readyOrNot as false when connectionError code is DEPENDENCY_UNAVAILABLE', () => {
      const props = {
        ...defaultProps,
        permissions: { execute: true },
        remediationStatus: {
          connectionError: {
            errors: [{ code: 'DEPENDENCY_UNAVAILABLE' }],
          },
          connectedSystems: 5,
        },
      };

      render(<DetailsGeneralContent {...props} />);

      const progressCardProps = JSON.parse(
        screen.getByTestId('progress-card-props').textContent,
      );
      expect(progressCardProps.readyOrNot).toBe(false);
    });

    it('should calculate readyOrNot as false when connectedSystems is 0', () => {
      const props = {
        ...defaultProps,
        permissions: { execute: true },
        remediationStatus: {
          connectionError: null,
          connectedSystems: 0,
        },
      };

      render(<DetailsGeneralContent {...props} />);

      // Check that ProgressCard receives correct readyOrNot value
      const progressCardProps = JSON.parse(
        screen.getByTestId('progress-card-props').textContent,
      );
      expect(progressCardProps.readyOrNot).toBe(false);
    });

    it('should handle missing permissions object', () => {
      const props = {
        ...defaultProps,
        permissions: undefined,
        remediationStatus: {
          connectionError: null,
          connectedSystems: 5,
        },
      };

      render(<DetailsGeneralContent {...props} />);

      // Should NOT show alert because isStillLoading is true when !permissions is true
      expect(screen.queryByTestId('alert')).not.toBeInTheDocument();

      const progressCardProps = JSON.parse(
        screen.getByTestId('progress-card-props').textContent,
      );
      expect(progressCardProps.readyOrNot).toBeUndefined(); // canExecute is undefined when permissions?.execute is undefined
    });

    it('should handle missing remediationStatus properties', () => {
      const props = {
        ...defaultProps,
        permissions: { execute: true },
        remediationStatus: {}, // Missing connectionError and connectedSystems
      };

      render(<DetailsGeneralContent {...props} />);

      // Should NOT show alert because connectionError?.errors?.[0]?.status !== 403 and undefined !== 0 are both true
      expect(screen.queryByTestId('alert')).not.toBeInTheDocument();

      const progressCardProps = JSON.parse(
        screen.getByTestId('progress-card-props').textContent,
      );
      expect(progressCardProps.readyOrNot).toBe(true);
    });
  });

  describe('Alert rendering', () => {
    it('should not render readiness alert - readiness is handled by ProgressCard', () => {
      const props = {
        ...defaultProps,
        remediationStatus: {
          connectionError: { errors: [{ status: 403 }] },
          connectedSystems: 5,
        },
      };

      render(<DetailsGeneralContent {...props} />);

      expect(screen.queryByTestId('alert')).not.toBeInTheDocument();
    });

    it('should not render alert when ready', () => {
      render(<DetailsGeneralContent {...defaultProps} />);

      expect(screen.queryByTestId('alert')).not.toBeInTheDocument();
    });
  });

  describe('Props passing to child components', () => {
    it('should pass correct props to DetailsCard', () => {
      render(<DetailsGeneralContent {...defaultProps} />);

      const detailsCardProps = JSON.parse(
        screen.getByTestId('details-card-props').textContent,
      );

      // Functions won't appear in JSON, so we can only check non-function props
      expect(detailsCardProps.remediationStatus).toEqual(
        defaultProps.remediationStatus,
      );
      expect(detailsCardProps.allRemediations).toEqual(
        defaultProps.allRemediations,
      );
      expect(detailsCardProps.remediationPlaybookRuns).toEqual(
        defaultProps.remediationPlaybookRuns,
      );

      // Check that DetailsCard component is rendered (functions are passed but not visible in JSON)
      expect(screen.getByTestId('details-card')).toBeInTheDocument();
    });

    it('should pass correct props to ProgressCard', () => {
      render(<DetailsGeneralContent {...defaultProps} />);

      const progressCardProps = JSON.parse(
        screen.getByTestId('progress-card-props').textContent,
      );

      expect(progressCardProps.remediationStatus).toEqual(
        defaultProps.remediationStatus,
      );
      expect(progressCardProps.permissions).toEqual(defaultProps.permissions);
      expect(progressCardProps.readyOrNot).toBe(true);

      // Function props won't appear in JSON, but component should render
      expect(screen.getByTestId('progress-card')).toBeInTheDocument();
    });

    it('should handle missing optional props', () => {
      const minimalProps = {
        details: jest.fn(),
        onRename: jest.fn(),
        refetch: jest.fn(),
        remediationStatus: {
          connectionError: null,
          connectedSystems: 5,
        },
      };

      render(<DetailsGeneralContent {...minimalProps} />);

      expect(screen.getByTestId('details-card')).toBeInTheDocument();
      expect(screen.getByTestId('progress-card')).toBeInTheDocument();

      const detailsCardProps = JSON.parse(
        screen.getByTestId('details-card-props').textContent,
      );
      expect(detailsCardProps.updateRemPlan).toBeUndefined();
      expect(detailsCardProps.onNavigateToTab).toBeUndefined();
      expect(detailsCardProps.allRemediations).toBeUndefined();
      expect(detailsCardProps.remediationPlaybookRuns).toBeUndefined();
      expect(detailsCardProps.refetchAllRemediations).toBeUndefined();
    });

    it('should render child components properly', () => {
      render(<DetailsGeneralContent {...defaultProps} />);

      // Function props won't appear in JSON.stringify, but the components should render correctly
      expect(screen.getByTestId('details-card')).toBeInTheDocument();
      expect(screen.getByTestId('progress-card')).toBeInTheDocument();

      // This confirms the props are being passed (even if we can't see functions in JSON)
      const detailsCardProps = JSON.parse(
        screen.getByTestId('details-card-props').textContent,
      );
      expect(detailsCardProps.remediationStatus).toEqual(
        defaultProps.remediationStatus,
      );
    });
  });

  describe('Edge cases and combinations', () => {
    it('should handle all conditions false for readyOrNot', () => {
      const props = {
        ...defaultProps,
        permissions: { execute: false },
        remediationStatus: {
          connectionError: { errors: [{ status: 403 }] },
          connectedSystems: 0,
        },
      };

      render(<DetailsGeneralContent {...props} />);

      const progressCardProps = JSON.parse(
        screen.getByTestId('progress-card-props').textContent,
      );
      expect(progressCardProps.readyOrNot).toBe(false);
    });

    it('should handle null remediationStatus', () => {
      const props = {
        ...defaultProps,
        remediationStatus: null,
      };

      render(<DetailsGeneralContent {...props} />);

      // Should NOT show alert because null?.connectionError?.errors?.[0]?.status !== 403 and null?.connectedSystems !== 0 are both true
      expect(screen.queryByTestId('alert')).not.toBeInTheDocument();
    });

    it('should handle different connectionError values', () => {
      const testCases = [
        {
          connectionError: { errors: [{ status: 500 }] },
          expectedReadyOrNot: true,
        },
        {
          connectionError: { errors: [{ status: 404 }] },
          expectedReadyOrNot: true,
        },
        {
          connectionError: { errors: [{ status: 403 }] },
          expectedReadyOrNot: false,
        },
        {
          connectionError: { errors: [{ status: 503 }] },
          expectedReadyOrNot: false,
        },
        {
          connectionError: {
            errors: [{ code: 'DEPENDENCY_UNAVAILABLE' }],
          },
          expectedReadyOrNot: false,
        },
        {
          connectionError: { errors: [{ status: 0 }] },
          expectedReadyOrNot: true,
        },
        { connectionError: null, expectedReadyOrNot: true },
        { connectionError: undefined, expectedReadyOrNot: true },
      ];

      testCases.forEach(({ connectionError, expectedReadyOrNot }) => {
        const props = {
          ...defaultProps,
          remediationStatus: {
            connectionError,
            connectedSystems: 5,
          },
        };

        const { unmount } = render(<DetailsGeneralContent {...props} />);

        const progressCardProps = JSON.parse(
          screen.getByTestId('progress-card-props').textContent,
        );
        expect(progressCardProps.readyOrNot).toBe(expectedReadyOrNot);

        unmount();
      });
    });

    it('should handle different connectedSystems values', () => {
      const testCases = [
        { connectedSystems: 1, expectedReadyOrNot: true },
        { connectedSystems: 5, expectedReadyOrNot: true },
        { connectedSystems: 0, expectedReadyOrNot: false },
        { connectedSystems: null, expectedReadyOrNot: true }, // null !== 0 is true
        { connectedSystems: undefined, expectedReadyOrNot: true }, // undefined !== 0 is true
      ];

      testCases.forEach(({ connectedSystems, expectedReadyOrNot }) => {
        const props = {
          ...defaultProps,
          remediationStatus: {
            connectionError: null,
            connectedSystems,
          },
        };

        const { unmount } = render(<DetailsGeneralContent {...props} />);

        const progressCardProps = JSON.parse(
          screen.getByTestId('progress-card-props').textContent,
        );
        expect(progressCardProps.readyOrNot).toBe(expectedReadyOrNot);

        unmount();
      });
    });
  });

  describe('Component structure', () => {
    it('should maintain proper component hierarchy', () => {
      render(<DetailsGeneralContent {...defaultProps} />);

      const grid = screen.getByTestId('grid');
      const gridItems = screen.getAllByTestId('grid-item');

      // Check hierarchy
      expect(gridItems).toHaveLength(2);
      expect(grid).toContainElement(gridItems[0]);
      expect(grid).toContainElement(gridItems[1]);
      expect(gridItems[0]).toContainElement(screen.getByTestId('details-card'));
      expect(gridItems[1]).toContainElement(
        screen.getByTestId('progress-card'),
      );
    });

    it('should render components in correct order', () => {
      render(<DetailsGeneralContent {...defaultProps} />);

      const gridItems = screen.getAllByTestId('grid-item');

      // First grid item should contain DetailsCard
      expect(gridItems[0]).toContainElement(screen.getByTestId('details-card'));

      // Second grid item should contain ProgressCard
      expect(gridItems[1]).toContainElement(
        screen.getByTestId('progress-card'),
      );
    });
  });
});
