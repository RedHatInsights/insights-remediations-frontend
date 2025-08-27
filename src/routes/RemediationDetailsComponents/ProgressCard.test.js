/* eslint-disable react/prop-types */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ProgressCard from './ProgressCard';

// Mock external dependencies
jest.mock('@redhat-cloud-services/frontend-components/useChrome', () => {
  return jest.fn(() => ({
    quickStarts: {
      activateQuickstart: jest.fn(),
    },
  }));
});

// Mock useFeatureFlag
jest.mock('../../Utilities/Hooks/useFeatureFlag', () => ({
  useFeatureFlag: jest.fn(),
}));

// Mock PatternFly components
jest.mock('@patternfly/react-core', () => ({
  Button: function MockButton({
    children,
    variant,
    onClick,
    className,
    icon,
    ...props
  }) {
    return (
      <button
        data-testid={`button-${variant || 'default'}`}
        onClick={onClick}
        className={className}
        {...props}
      >
        {icon}
        {children}
      </button>
    );
  },
  Card: function MockCard({ children, isFullHeight, ...props }) {
    return (
      <div data-testid="card" data-full-height={isFullHeight} {...props}>
        {children}
      </div>
    );
  },
  CardBody: function MockCardBody({ children, ...props }) {
    return (
      <div data-testid="card-body" {...props}>
        {children}
      </div>
    );
  },
  CardFooter: function MockCardFooter({ children, className, ...props }) {
    return (
      <div data-testid="card-footer" className={className} {...props}>
        {children}
      </div>
    );
  },
  CardTitle: function MockCardTitle({ children, ...props }) {
    return (
      <div data-testid="card-title" {...props}>
        {children}
      </div>
    );
  },
  ProgressStep: function MockProgressStep({
    children,
    variant,
    description,
    id,
    titleId,
    'aria-label': ariaLabel,
    ...props
  }) {
    return (
      <div
        data-testid="progress-step"
        data-variant={variant}
        data-id={id}
        data-title-id={titleId}
        aria-label={ariaLabel}
        {...props}
      >
        <div data-testid="step-title">{children}</div>
        <div data-testid="step-description">{description}</div>
      </div>
    );
  },
  ProgressStepper: function MockProgressStepper({
    children,
    isVertical,
    'aria-label': ariaLabel,
    ...props
  }) {
    return (
      <div
        data-testid="progress-stepper"
        data-vertical={isVertical}
        aria-label={ariaLabel}
        {...props}
      >
        {children}
      </div>
    );
  },
  Spinner: function MockSpinner({ ...props }) {
    return <div data-testid="spinner" {...props} />;
  },
  Title: function MockTitle({ children, headingLevel, size, ...props }) {
    return (
      <div
        data-testid="title"
        data-heading-level={headingLevel}
        data-size={size}
        {...props}
      >
        {children}
      </div>
    );
  },
}));

jest.mock('@patternfly/react-icons', () => ({
  OpenDrawerRightIcon: function MockOpenDrawerRightIcon({
    className,
    ...props
  }) {
    return (
      <span data-testid="open-drawer-icon" className={className} {...props} />
    );
  },
}));

const { useFeatureFlag } = require('../../Utilities/Hooks/useFeatureFlag');

describe('ProgressCard', () => {
  const mockOnNavigateToTab = jest.fn();

  beforeEach(() => {
    // Default to feature flag disabled
    useFeatureFlag.mockReturnValue(false);
    jest.clearAllMocks();
  });

  const defaultProps = {
    remediationStatus: {
      areDetailsLoading: false,
      detailsError: null,
      connectedSystems: 5,
      totalSystems: 10,
    },
    permissions: {
      execute: true,
    },
    readyOrNot: true,
    onNavigateToTab: mockOnNavigateToTab,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Loading state', () => {
    it('should render spinner when permissions are undefined', () => {
      render(<ProgressCard {...defaultProps} permissions={undefined} />);

      expect(screen.getByTestId('spinner')).toBeInTheDocument();
      expect(screen.queryByTestId('card')).not.toBeInTheDocument();
    });

    it('should render spinner when areDetailsLoading is true', () => {
      render(
        <ProgressCard
          {...defaultProps}
          remediationStatus={{
            ...defaultProps.remediationStatus,
            areDetailsLoading: true,
          }}
        />,
      );

      expect(screen.getByTestId('spinner')).toBeInTheDocument();
      expect(screen.queryByTestId('card')).not.toBeInTheDocument();
    });

    it('should render spinner when both conditions are true', () => {
      render(
        <ProgressCard
          {...defaultProps}
          permissions={undefined}
          remediationStatus={{
            ...defaultProps.remediationStatus,
            areDetailsLoading: true,
          }}
        />,
      );

      expect(screen.getByTestId('spinner')).toBeInTheDocument();
      expect(screen.queryByTestId('card')).not.toBeInTheDocument();
    });
  });

  describe('Card rendering', () => {
    it('should render card when not loading', () => {
      render(<ProgressCard {...defaultProps} />);

      expect(screen.getByTestId('card')).toBeInTheDocument();
      expect(screen.getByTestId('card')).toHaveAttribute(
        'data-full-height',
        'true',
      );
      expect(screen.queryByTestId('spinner')).not.toBeInTheDocument();
    });

    it('should render card title correctly', () => {
      render(<ProgressCard {...defaultProps} />);

      expect(screen.getByTestId('card-title')).toBeInTheDocument();
      expect(screen.getByTestId('title')).toBeInTheDocument();
      expect(screen.getByTestId('title')).toHaveAttribute(
        'data-heading-level',
        'h4',
      );
      expect(screen.getByTestId('title')).toHaveAttribute('data-size', 'xl');
      expect(screen.getByText('Execution readiness')).toBeInTheDocument();
    });

    it('should render card body with description', () => {
      render(<ProgressCard {...defaultProps} />);

      expect(screen.getByTestId('card-body')).toBeInTheDocument();
      expect(
        screen.getByText(/To pass the execution readiness check/),
      ).toBeInTheDocument();
      expect(screen.getByText(/Execute/)).toBeInTheDocument();
    });

    it('should render progress stepper with correct props', () => {
      render(<ProgressCard {...defaultProps} />);

      const stepper = screen.getByTestId('progress-stepper');
      expect(stepper).toBeInTheDocument();
      expect(stepper).toHaveAttribute('data-vertical', 'true');
      expect(stepper).toHaveAttribute(
        'aria-label',
        'Remediation Readiness card',
      );
    });

    it('should render card footer with help text', () => {
      render(<ProgressCard {...defaultProps} />);

      expect(screen.getByTestId('card-footer')).toBeInTheDocument();
      expect(
        screen.getByText(
          /Need help to pass the remediations execution readiness check?/,
        ),
      ).toBeInTheDocument();
    });
  });

  describe('Progress steps', () => {
    it('should render all four progress steps', () => {
      render(<ProgressCard {...defaultProps} />);

      const steps = screen.getAllByTestId('progress-step');
      expect(steps).toHaveLength(4);
    });

    describe('User access permissions step', () => {
      it('should show success variant when user has execute permission', () => {
        render(
          <ProgressCard {...defaultProps} permissions={{ execute: true }} />,
        );

        const steps = screen.getAllByTestId('progress-step');
        const permissionsStep = steps[0];
        expect(permissionsStep).toHaveAttribute('data-variant', 'success');
        expect(screen.getByText('User access permissions')).toBeInTheDocument();
        expect(screen.getByText('Authorized')).toBeInTheDocument();
      });

      it('should show danger variant when user lacks execute permission', () => {
        render(
          <ProgressCard {...defaultProps} permissions={{ execute: false }} />,
        );

        const steps = screen.getAllByTestId('progress-step');
        const permissionsStep = steps[0];
        expect(permissionsStep).toHaveAttribute('data-variant', 'danger');
        expect(screen.getByText('User access permissions')).toBeInTheDocument();
        expect(
          screen.getByText(/You do not have the required/),
        ).toBeInTheDocument();
        expect(
          screen.getByText('Remediations administrator'),
        ).toBeInTheDocument();
      });

      it('should show danger variant when permissions is null', () => {
        render(<ProgressCard {...defaultProps} permissions={null} />);

        const steps = screen.getAllByTestId('progress-step');
        const permissionsStep = steps[0];
        expect(permissionsStep).toHaveAttribute('data-variant', 'danger');
      });

      it('should have correct accessibility attributes', () => {
        render(<ProgressCard {...defaultProps} />);

        const steps = screen.getAllByTestId('progress-step');
        const permissionsStep = steps[0];
        expect(permissionsStep).toHaveAttribute('data-id', 'permissionsStep');
        expect(permissionsStep).toHaveAttribute(
          'data-title-id',
          'PermissionsStep',
        );
        expect(permissionsStep).toHaveAttribute(
          'aria-label',
          'PermissionsStep1',
        );
      });
    });

    describe('RHC Manager step', () => {
      it('should show success variant when no 403 error', () => {
        render(
          <ProgressCard
            {...defaultProps}
            remediationStatus={{
              ...defaultProps.remediationStatus,
              detailsError: null,
            }}
          />,
        );

        const steps = screen.getAllByTestId('progress-step');
        const rhcStep = steps[1];
        expect(rhcStep).toHaveAttribute('data-variant', 'success');
        expect(
          screen.getByText('Remote Host Configuration Manager (RHC)'),
        ).toBeInTheDocument();
        expect(screen.getByText('Enabled')).toBeInTheDocument();
      });

      it('should show success variant when error is not 403', () => {
        render(
          <ProgressCard
            {...defaultProps}
            remediationStatus={{
              ...defaultProps.remediationStatus,
              detailsError: 500,
            }}
          />,
        );

        const steps = screen.getAllByTestId('progress-step');
        const rhcStep = steps[1];
        expect(rhcStep).toHaveAttribute('data-variant', 'success');
        expect(screen.getByText('Enabled')).toBeInTheDocument();
      });

      it('should show danger variant when error is 403', () => {
        render(
          <ProgressCard
            {...defaultProps}
            remediationStatus={{
              ...defaultProps.remediationStatus,
              detailsError: 403,
            }}
          />,
        );

        const steps = screen.getAllByTestId('progress-step');
        const rhcStep = steps[1];
        expect(rhcStep).toHaveAttribute('data-variant', 'danger');
        expect(
          screen.getByText(/RHC Manager is not enabled/),
        ).toBeInTheDocument();
        expect(
          screen.getByText('Remote Host Configuration (RHC)'),
        ).toBeInTheDocument();
      });

      it('should render external link when RHC is not enabled', () => {
        render(
          <ProgressCard
            {...defaultProps}
            remediationStatus={{
              ...defaultProps.remediationStatus,
              detailsError: 403,
            }}
          />,
        );

        const link = screen.getByRole('link', {
          name: /Remote Host Configuration/,
        });
        expect(link).toHaveAttribute(
          'href',
          'https://console.redhat.com/insights/connector',
        );
        expect(link).toHaveAttribute('target', '_blank');
        expect(link).toHaveAttribute('rel', 'noopener noreferrer');
      });

      it('should have correct accessibility attributes', () => {
        render(<ProgressCard {...defaultProps} />);

        const steps = screen.getAllByTestId('progress-step');
        const rhcStep = steps[1];
        expect(rhcStep).toHaveAttribute('data-id', 'RHCStep');
        expect(rhcStep).toHaveAttribute('data-title-id', 'RHCStep-title');
        expect(rhcStep).toHaveAttribute('aria-label', 'RHCStep2');
      });
    });

    describe('Connected systems step', () => {
      it('should show success variant when connected systems > 0', () => {
        render(
          <ProgressCard
            {...defaultProps}
            remediationStatus={{
              ...defaultProps.remediationStatus,
              connectedSystems: 5,
            }}
          />,
        );

        const steps = screen.getAllByTestId('progress-step');
        const systemsStep = steps[2];
        expect(systemsStep).toHaveAttribute('data-variant', 'success');
        expect(screen.getByText('Connected systems')).toBeInTheDocument();
        expect(
          screen.getByText('5 (of 10) connected systems'),
        ).toBeInTheDocument();
      });

      it('should show danger variant when connected systems is 0', () => {
        render(
          <ProgressCard
            {...defaultProps}
            remediationStatus={{
              ...defaultProps.remediationStatus,
              connectedSystems: 0,
            }}
          />,
        );

        const steps = screen.getAllByTestId('progress-step');
        const systemsStep = steps[2];
        expect(systemsStep).toHaveAttribute('data-variant', 'danger');
        expect(
          screen.getByText('0 (of 10) connected systems'),
        ).toBeInTheDocument();
      });

      it('should render View systems button', () => {
        render(<ProgressCard {...defaultProps} />);

        const button = screen.getByRole('button', { name: 'View systems' });
        expect(button).toBeInTheDocument();
        expect(button).toHaveAttribute('data-testid', 'button-link');
      });

      it('should call onNavigateToTab when View systems button is clicked', () => {
        render(<ProgressCard {...defaultProps} />);

        const button = screen.getByText('View systems');
        fireEvent.click(button);

        expect(mockOnNavigateToTab).toHaveBeenCalledWith(null, 'systems');
      });

      it('should handle missing connectedSystems and totalSystems', () => {
        render(<ProgressCard {...defaultProps} remediationStatus={{}} />);

        expect(
          screen.getByText('undefined (of undefined) connected systems'),
        ).toBeInTheDocument();
      });

      it('should have correct accessibility attributes', () => {
        render(<ProgressCard {...defaultProps} />);

        const steps = screen.getAllByTestId('progress-step');
        const systemsStep = steps[2];
        expect(systemsStep).toHaveAttribute('data-id', 'connectedSystemsStep');
        expect(systemsStep).toHaveAttribute(
          'data-title-id',
          'connectedSystemsStep-title',
        );
        expect(systemsStep).toHaveAttribute(
          'aria-label',
          'connectedSystemsStep',
        );
      });
    });

    describe('Ready for execution step', () => {
      it('should show success variant when readyOrNot is true', () => {
        render(<ProgressCard {...defaultProps} readyOrNot={true} />);

        const steps = screen.getAllByTestId('progress-step');
        const readyStep = steps[3];
        expect(readyStep).toHaveAttribute('data-variant', 'success');
        expect(screen.getByText('Ready for execution')).toBeInTheDocument();
      });

      it('should show danger variant when readyOrNot is false', () => {
        render(<ProgressCard {...defaultProps} readyOrNot={false} />);

        const steps = screen.getAllByTestId('progress-step');
        const readyStep = steps[3];
        expect(readyStep).toHaveAttribute('data-variant', 'danger');
        expect(screen.getByText('Not ready for execution')).toBeInTheDocument();
      });

      it('should show danger variant when readyOrNot is undefined', () => {
        render(<ProgressCard {...defaultProps} readyOrNot={undefined} />);

        const steps = screen.getAllByTestId('progress-step');
        const readyStep = steps[3];
        expect(readyStep).toHaveAttribute('data-variant', 'danger');
        expect(screen.getByText('Not ready for execution')).toBeInTheDocument();
      });

      it('should have correct accessibility attributes', () => {
        render(<ProgressCard {...defaultProps} />);

        const steps = screen.getAllByTestId('progress-step');
        const readyStep = steps[3];
        expect(readyStep).toHaveAttribute('data-id', 'readyStep');
        expect(readyStep).toHaveAttribute('data-title-id', 'readyStep-title');
        expect(readyStep).toHaveAttribute('aria-label', 'Ready step');
      });
    });
  });

  describe('Quick start integration', () => {
    it('should render Learn more button', () => {
      render(<ProgressCard {...defaultProps} />);

      const button = screen.getByRole('button', { name: /Learn more/ });
      expect(button).toBeInTheDocument();
      expect(button).toHaveAttribute('data-testid', 'button-link');
      expect(screen.getByTestId('open-drawer-icon')).toBeInTheDocument();
    });

    it('should call quickStarts.activateQuickstart when Learn more is clicked', () => {
      const mockActivateQuickstart = jest.fn();
      require('@redhat-cloud-services/frontend-components/useChrome').mockReturnValue(
        {
          quickStarts: {
            activateQuickstart: mockActivateQuickstart,
          },
        },
      );

      render(<ProgressCard {...defaultProps} />);

      const button = screen.getByText('Learn more');
      fireEvent.click(button);

      expect(mockActivateQuickstart).toHaveBeenCalledWith(
        'insights-remediate-plan-create',
      );
    });

    it('should handle missing quickStarts gracefully', () => {
      require('@redhat-cloud-services/frontend-components/useChrome').mockReturnValue(
        {
          quickStarts: null,
        },
      );

      render(<ProgressCard {...defaultProps} />);

      const button = screen.getByText('Learn more');
      fireEvent.click(button);

      // Should not throw error
      expect(button).toBeInTheDocument();
    });

    it('should handle missing useChrome return gracefully', () => {
      require('@redhat-cloud-services/frontend-components/useChrome').mockReturnValue(
        {},
      );

      render(<ProgressCard {...defaultProps} />);

      const button = screen.getByText('Learn more');
      fireEvent.click(button);

      // Should not throw error
      expect(button).toBeInTheDocument();
    });
  });

  describe('Edge cases and error handling', () => {
    it('should handle empty remediationStatus object', () => {
      render(<ProgressCard {...defaultProps} remediationStatus={{}} />);

      expect(screen.getByTestId('card')).toBeInTheDocument();
      expect(
        screen.getByText('undefined (of undefined) connected systems'),
      ).toBeInTheDocument();
    });

    it('should handle permissions as empty object', () => {
      render(<ProgressCard {...defaultProps} permissions={{}} />);

      const steps = screen.getAllByTestId('progress-step');
      const permissionsStep = steps[0];
      expect(permissionsStep).toHaveAttribute('data-variant', 'danger');
      expect(
        screen.getByText(/You do not have the required/),
      ).toBeInTheDocument();
    });

    it('should handle complex detailsError values', () => {
      render(
        <ProgressCard
          {...defaultProps}
          remediationStatus={{
            ...defaultProps.remediationStatus,
            detailsError: '403',
          }}
        />,
      );

      const steps = screen.getAllByTestId('progress-step');
      const rhcStep = steps[1];
      expect(rhcStep).toHaveAttribute('data-variant', 'success'); // '403' !== 403
    });
  });

  describe('Component styling and classes', () => {
    it('should apply correct CSS classes to card footer', () => {
      render(<ProgressCard {...defaultProps} />);

      const footer = screen.getByTestId('card-footer');
      expect(footer).toHaveClass('pf-v6-u-font-size-sm');
    });

    it('should apply correct CSS classes to Learn more button', () => {
      render(<ProgressCard {...defaultProps} />);

      const button = screen.getByRole('button', { name: /Learn more/ });
      expect(button).toHaveClass('pf-v6-u-font-size-sm');
    });
  });
});
