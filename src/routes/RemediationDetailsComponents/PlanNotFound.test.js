/* eslint-disable react/prop-types */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import PlanNotFound from './PlanNotFound';

jest.mock('@patternfly/react-core', () => ({
  Button: function MockButton({ children, variant, onClick, ...props }) {
    return (
      <button
        data-testid="button"
        data-variant={variant}
        onClick={onClick}
        {...props}
      >
        {children}
      </button>
    );
  },
  EmptyState: function MockEmptyState({
    headingLevel,
    icon: Icon,
    titleText,
    variant,
    children,
    ...props
  }) {
    return (
      <div
        data-testid="empty-state"
        data-heading-level={headingLevel}
        data-title-text={titleText}
        data-variant={variant}
        {...props}
      >
        {Icon && <Icon data-testid="empty-state-icon" />}
        <div data-testid="empty-state-title">{titleText}</div>
        {children}
      </div>
    );
  },
  EmptyStateBody: function MockEmptyStateBody({ children, ...props }) {
    return (
      <div data-testid="empty-state-body" {...props}>
        {children}
      </div>
    );
  },
  EmptyStateFooter: function MockEmptyStateFooter({ children, ...props }) {
    return (
      <div data-testid="empty-state-footer" {...props}>
        {children}
      </div>
    );
  },
  EmptyStateVariant: {
    full: 'full',
    small: 'small',
    large: 'large',
  },
}));

jest.mock('@patternfly/react-icons', () => ({
  CubesIcon: function MockCubesIcon(props) {
    return <div data-testid="cubes-icon" {...props} />;
  },
}));

const mockNavigate = jest.fn();
jest.mock(
  '@redhat-cloud-services/frontend-components-utilities/useInsightsNavigate/useInsightsNavigate',
  () => {
    return jest.fn(() => mockNavigate);
  },
);

describe('PlanNotFound', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic rendering', () => {
    it('should render empty state with correct structure', () => {
      const planId = 'test-plan-123';
      render(<PlanNotFound planId={planId} />);

      expect(screen.getByTestId('empty-state')).toBeInTheDocument();
      expect(screen.getByTestId('empty-state-body')).toBeInTheDocument();
      expect(screen.getByTestId('empty-state-footer')).toBeInTheDocument();
    });

    it('should display correct title text', () => {
      const planId = 'test-plan-123';
      render(<PlanNotFound planId={planId} />);

      expect(screen.getByTestId('empty-state-title')).toHaveTextContent(
        'Remediation Plan not found',
      );
    });

    it('should display the plan ID in the body text', () => {
      const planId = 'test-plan-123';
      render(<PlanNotFound planId={planId} />);

      expect(screen.getByTestId('empty-state-body')).toHaveTextContent(
        `Remediation Plan with ID ${planId} does not exist`,
      );
    });

    it('should render CubesIcon', () => {
      const planId = 'test-plan-123';
      render(<PlanNotFound planId={planId} />);

      expect(screen.getByTestId('empty-state-icon')).toBeInTheDocument();
    });

    it('should render back button with correct text', () => {
      const planId = 'test-plan-123';
      render(<PlanNotFound planId={planId} />);

      const button = screen.getByTestId('button');
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent('Back to all remediation plans');
      expect(button).toHaveAttribute('data-variant', 'primary');
    });

    it('should set correct empty state attributes', () => {
      const planId = 'test-plan-123';
      render(<PlanNotFound planId={planId} />);

      const emptyState = screen.getByTestId('empty-state');
      expect(emptyState).toHaveAttribute('data-heading-level', 'h5');
      expect(emptyState).toHaveAttribute('data-variant', 'full');
    });
  });

  describe('Navigation functionality', () => {
    it('should call navigate with correct path when back button is clicked', () => {
      const planId = 'test-plan-123';
      render(<PlanNotFound planId={planId} />);

      const button = screen.getByTestId('button');
      fireEvent.click(button);

      expect(mockNavigate).toHaveBeenCalledWith('/insights/remediations');
      expect(mockNavigate).toHaveBeenCalledTimes(1);
    });
  });

  describe('Props handling', () => {
    it('should handle normal plan ID', () => {
      const planId = 'remediation-plan-456';
      render(<PlanNotFound planId={planId} />);

      expect(screen.getByTestId('empty-state-body')).toHaveTextContent(
        `Remediation Plan with ID ${planId} does not exist`,
      );
    });

    it('should handle empty plan ID', () => {
      const planId = '';
      render(<PlanNotFound planId={planId} />);

      expect(screen.getByTestId('empty-state-body')).toHaveTextContent(
        'Remediation Plan with ID does not exist',
      );
    });

    it('should handle very long plan ID', () => {
      const planId = 'a'.repeat(1000);
      render(<PlanNotFound planId={planId} />);

      expect(screen.getByTestId('empty-state-body')).toHaveTextContent(
        `Remediation Plan with ID ${planId} does not exist`,
      );
    });

    it('should handle unicode characters in plan ID', () => {
      const planId = '测试-🚀-Тест-עברית-العربية';
      render(<PlanNotFound planId={planId} />);

      expect(screen.getByTestId('empty-state-body')).toHaveTextContent(
        `Remediation Plan with ID ${planId} does not exist`,
      );
    });
  });

  describe('Edge cases and error handling', () => {
    it('should handle null planId gracefully', () => {
      render(<PlanNotFound planId={null} />);

      expect(screen.getByTestId('empty-state-body')).toHaveTextContent(
        'Remediation Plan with ID does not exist',
      );
    });

    it('should handle undefined planId gracefully', () => {
      render(<PlanNotFound planId={undefined} />);

      expect(screen.getByTestId('empty-state-body')).toHaveTextContent(
        'Remediation Plan with ID does not exist',
      );
    });

    it('should handle plan ID with only whitespace', () => {
      const planId = '   ';
      render(<PlanNotFound planId={planId} />);

      expect(screen.getByTestId('empty-state-body')).toHaveTextContent(
        'Remediation Plan with ID does not exist',
      );
    });

    it('should handle navigation function calls', () => {
      const planId = 'test-plan-123';
      render(<PlanNotFound planId={planId} />);

      const button = screen.getByTestId('button');
      fireEvent.click(button);

      expect(mockNavigate).toHaveBeenCalledWith('/insights/remediations');
    });
  });
});
