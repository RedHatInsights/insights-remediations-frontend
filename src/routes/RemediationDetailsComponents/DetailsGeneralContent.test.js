/* eslint-disable react/prop-types */
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import DetailsGeneralContent from './DetailsGeneralContent';

jest.mock('./OverviewCard', () => {
  return function MockOverviewCard(props) {
    return (
      <div data-testid="overview-card">
        <div data-testid="overview-card-props">
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

jest.mock('./ActivityCard', () => {
  return function MockActivityCard(props) {
    return (
      <div data-testid="activity-card">
        <div data-testid="activity-card-props">
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
    actionClose,
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
        {actionClose}
        {children}
      </div>
    );
  },
  AlertActionCloseButton: function MockAlertActionCloseButton({
    title,
    onClose,
    ...props
  }) {
    return (
      <button data-testid="alert-close" onClick={onClose} {...props}>
        {title}
      </button>
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
  Flex: function MockFlex({ children, direction, spaceItems, ...props }) {
    return (
      <div
        data-testid="flex"
        data-direction={JSON.stringify(direction)}
        data-space-items={JSON.stringify(spaceItems)}
        {...props}
      >
        {children}
      </div>
    );
  },
  FlexItem: function MockFlexItem({ children, ...props }) {
    return (
      <div data-testid="flex-item" {...props}>
        {children}
      </div>
    );
  },
}));

describe('DetailsGeneralContent', () => {
  const createDetails = (overrides = {}) => ({
    id: 'rem-1',
    name: 'Test Remediation',
    issue_count: 0,
    system_count: 5,
    issue_count_details: {},
    auto_reboot: true,
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z',
    ...overrides,
  });

  const defaultProps = {
    details: createDetails(),
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
    lastRemediationPlaybookRun: { id: 'run-1', status: 'success' },
    refetchAllRemediations: jest.fn(),
    isPlaybookRunsLoading: false,
    retentionPolicyRefreshNonce: 0,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic rendering', () => {
    it('should render without crashing', () => {
      render(<DetailsGeneralContent {...defaultProps} />);

      expect(screen.getByTestId('grid')).toBeInTheDocument();
      expect(screen.getByTestId('overview-card')).toBeInTheDocument();
      expect(screen.getByTestId('progress-card')).toBeInTheDocument();
      expect(screen.getByTestId('activity-card')).toBeInTheDocument();
    });

    it('should render with correct structure', () => {
      render(<DetailsGeneralContent {...defaultProps} />);

      // Component should render without crashing and contain expected elements
      expect(screen.getByTestId('grid')).toBeInTheDocument();
      expect(screen.getByTestId('overview-card')).toBeInTheDocument();
      expect(screen.getByTestId('progress-card')).toBeInTheDocument();
      expect(screen.getByTestId('activity-card')).toBeInTheDocument();
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

      // First grid item (Details + Activity column)
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

    it('should calculate readyOrNot as false when execution limits are exceeded', () => {
      const props = {
        ...defaultProps,
        details: createDetails({ system_count: 101 }),
      };

      render(<DetailsGeneralContent {...props} />);

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

    it('should render AAP alert when execution limits are exceeded', () => {
      const props = {
        ...defaultProps,
        actionPoints: 1001,
      };

      render(<DetailsGeneralContent {...props} />);

      expect(screen.getByTestId('alert')).toBeInTheDocument();
      expect(screen.getByTestId('alert-title')).toHaveTextContent(
        'Remediate at scale with Red Hat Ansible Automation Platform (AAP)',
      );
    });

    it('should dismiss the AAP alert when the close button is clicked', async () => {
      const user = userEvent.setup();
      const props = {
        ...defaultProps,
        actionPoints: 1001,
      };

      render(<DetailsGeneralContent {...props} />);

      await user.click(screen.getByTestId('alert-close'));

      expect(screen.queryByTestId('alert')).not.toBeInTheDocument();
    });
  });

  describe('Props passing to child components', () => {
    it('should pass correct props to OverviewCard', () => {
      render(<DetailsGeneralContent {...defaultProps} />);

      const overviewCardProps = JSON.parse(
        screen.getByTestId('overview-card-props').textContent,
      );

      expect(overviewCardProps.details).toEqual(defaultProps.details);
      expect(overviewCardProps.allRemediations).toEqual(
        defaultProps.allRemediations,
      );
      expect(overviewCardProps).not.toHaveProperty('remediationStatus');
      expect(overviewCardProps).not.toHaveProperty(
        'lastRemediationPlaybookRun',
      );
      expect(overviewCardProps).not.toHaveProperty('isPlaybookRunsLoading');

      // Check that OverviewCard component is rendered (functions are passed but not visible in JSON)
      expect(screen.getByTestId('overview-card')).toBeInTheDocument();
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
      expect(progressCardProps.actionPoints).toBe(0);

      // Function props won't appear in JSON, but component should render
      expect(screen.getByTestId('progress-card')).toBeInTheDocument();
    });

    it('should pass correct props to ActivityCard', () => {
      render(<DetailsGeneralContent {...defaultProps} />);

      const activityCardProps = JSON.parse(
        screen.getByTestId('activity-card-props').textContent,
      );

      expect(activityCardProps.details).toEqual(defaultProps.details);
      expect(activityCardProps.lastRemediationPlaybookRun).toEqual(
        defaultProps.lastRemediationPlaybookRun,
      );
      expect(activityCardProps.isPlaybookRunsLoading).toBe(
        defaultProps.isPlaybookRunsLoading,
      );
      expect(activityCardProps.retentionPolicyRefreshNonce).toBe(
        defaultProps.retentionPolicyRefreshNonce,
      );
    });

    it('should handle missing optional props', () => {
      const minimalProps = {
        details: createDetails(),
        refetch: jest.fn(),
        remediationStatus: {
          connectionError: null,
          connectedSystems: 5,
        },
      };

      render(<DetailsGeneralContent {...minimalProps} />);

      expect(screen.getByTestId('overview-card')).toBeInTheDocument();
      expect(screen.getByTestId('progress-card')).toBeInTheDocument();
      expect(screen.getByTestId('activity-card')).toBeInTheDocument();

      const overviewCardProps = JSON.parse(
        screen.getByTestId('overview-card-props').textContent,
      );
      expect(overviewCardProps.allRemediations).toBeUndefined();
      expect(overviewCardProps).not.toHaveProperty('remediationStatus');
      expect(overviewCardProps).not.toHaveProperty(
        'lastRemediationPlaybookRun',
      );
      expect(overviewCardProps).not.toHaveProperty('isPlaybookRunsLoading');

      const activityCardProps = JSON.parse(
        screen.getByTestId('activity-card-props').textContent,
      );
      expect(activityCardProps.lastRemediationPlaybookRun).toBeUndefined();
      expect(activityCardProps.isPlaybookRunsLoading).toBeUndefined();
      expect(activityCardProps.retentionPolicyRefreshNonce).toBeUndefined();
    });

    it('should render child components properly', () => {
      render(<DetailsGeneralContent {...defaultProps} />);

      // Function props won't appear in JSON.stringify, but the components should render correctly
      expect(screen.getByTestId('overview-card')).toBeInTheDocument();
      expect(screen.getByTestId('progress-card')).toBeInTheDocument();
      expect(screen.getByTestId('activity-card')).toBeInTheDocument();

      // This confirms the props are being passed (even if we can't see functions in JSON)
      const overviewCardProps = JSON.parse(
        screen.getByTestId('overview-card-props').textContent,
      );
      expect(overviewCardProps.details).toEqual(defaultProps.details);
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
        details: createDetails({ system_count: 101 }),
      };

      render(<DetailsGeneralContent {...props} />);

      const progressCardProps = JSON.parse(
        screen.getByTestId('progress-card-props').textContent,
      );
      expect(progressCardProps.readyOrNot).toBe(false);
    });

    it('should handle null remediationStatus', () => {
      const consoleErrorSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      const props = {
        ...defaultProps,
        remediationStatus: null,
      };

      render(<DetailsGeneralContent {...props} />);

      // Should NOT show alert because null?.connectionError and null?.connectedSystems do not block execution
      expect(screen.queryByTestId('alert')).not.toBeInTheDocument();

      consoleErrorSpy.mockRestore();
    });

    it('should handle different connectionError values', () => {
      const testCases = [
        {
          connectionError: { errors: [{ status: 500 }] },
          expectedReadyOrNot: false,
        },
        {
          connectionError: { errors: [{ status: 404 }] },
          expectedReadyOrNot: false,
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
          expectedReadyOrNot: false,
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
      expect(gridItems[0]).toContainElement(
        screen.getByTestId('overview-card'),
      );
      expect(gridItems[0]).toContainElement(
        screen.getByTestId('activity-card'),
      );
      expect(gridItems[1]).toContainElement(
        screen.getByTestId('progress-card'),
      );
    });

    it('should render components in correct order', () => {
      render(<DetailsGeneralContent {...defaultProps} />);

      const gridItems = screen.getAllByTestId('grid-item');

      // First grid item should contain OverviewCard and ActivityCard
      expect(gridItems[0]).toContainElement(
        screen.getByTestId('overview-card'),
      );
      expect(gridItems[0]).toContainElement(
        screen.getByTestId('activity-card'),
      );

      // Second grid item should contain ProgressCard
      expect(gridItems[1]).toContainElement(
        screen.getByTestId('progress-card'),
      );
    });
  });
});
