/* eslint-disable react/prop-types */
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import {
  SystemNameCell,
  RedHatLightSpeedCell,
  ExecutionStatusCell,
} from './Cells';

// Mock external dependencies
jest.mock('@redhat-cloud-services/frontend-components/InsightsLink', () => {
  const MockInsightsLink = ({ app, to, children }) => (
    <a href={`/${app}${to}`} data-testid="insights-link">
      {children}
    </a>
  );
  MockInsightsLink.displayName = 'MockInsightsLink';
  return MockInsightsLink;
});

jest.mock('@patternfly/react-core', () => ({
  Flex: ({ children, spaceItems }) => (
    <div data-testid="flex" data-space-items={JSON.stringify(spaceItems)}>
      {children}
    </div>
  ),
  Icon: ({ status, children }) => (
    <span data-testid="icon" data-status={status}>
      {children}
    </span>
  ),
  Text: ({ children }) => <span data-testid="text">{children}</span>,
}));

jest.mock('@patternfly/react-icons', () => ({
  CheckCircleIcon: () => <span data-testid="check-circle-icon">✓</span>,
  ExclamationCircleIcon: () => (
    <span data-testid="exclamation-circle-icon">!</span>
  ),
  InProgressIcon: ({ color }) => (
    <span data-testid="in-progress-icon" data-color={color}>
      ⚡
    </span>
  ),
}));

describe('ExecutionHistoryContent Cells', () => {
  describe('SystemNameCell', () => {
    it('should render system name as InsightsLink', () => {
      render(<SystemNameCell system_name="Test System" system_id="test-123" />);

      const link = screen.getByTestId('insights-link');
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', '/inventory/test-123');

      const text = screen.getByTestId('text');
      expect(text).toHaveTextContent('Test System');
    });

    it('should handle different system names', () => {
      render(
        <SystemNameCell
          system_name="Production Server 1"
          system_id="prod-001"
        />,
      );

      expect(screen.getByTestId('insights-link')).toHaveAttribute(
        'href',
        '/inventory/prod-001',
      );
      expect(screen.getByTestId('text')).toHaveTextContent(
        'Production Server 1',
      );
    });

    it('should handle special characters in system name', () => {
      render(
        <SystemNameCell system_name="Test-Server_123" system_id="special-id" />,
      );

      expect(screen.getByTestId('text')).toHaveTextContent('Test-Server_123');
    });

    it('should handle empty system name', () => {
      render(<SystemNameCell system_name="" system_id="empty-name" />);

      expect(screen.getByTestId('text')).toHaveTextContent('');
      expect(screen.getByTestId('insights-link')).toHaveAttribute(
        'href',
        '/inventory/empty-name',
      );
    });

    it('should handle long system names', () => {
      const longName =
        'Very-Long-System-Name-With-Many-Characters-That-Might-Wrap';
      render(<SystemNameCell system_name={longName} system_id="long-id" />);

      expect(screen.getByTestId('text')).toHaveTextContent(longName);
    });

    it('should properly structure the component hierarchy', () => {
      render(<SystemNameCell system_name="Test" system_id="test" />);

      const link = screen.getByTestId('insights-link');
      const text = screen.getByTestId('text');

      expect(link).toContainElement(text);
    });
  });

  describe('RedHatLightSpeedCell', () => {
    it('should handle direct executor type', () => {
      render(<RedHatLightSpeedCell executor_type="direct" />);

      expect(screen.getByTestId('text')).toHaveTextContent('Direct connected');
    });

    it('should handle satellite executor type', () => {
      render(<RedHatLightSpeedCell executor_type="satellite" />);

      expect(screen.getByTestId('text')).toHaveTextContent(
        'Satellite connected',
      );
    });

    it('should handle null executor type', () => {
      render(<RedHatLightSpeedCell executor_type={null} />);

      expect(screen.getByTestId('text')).toHaveTextContent('');
    });

    it('should handle undefined executor type', () => {
      render(<RedHatLightSpeedCell executor_type={undefined} />);

      expect(screen.getByTestId('text')).toHaveTextContent('');
    });

    it('should handle empty string executor type', () => {
      render(<RedHatLightSpeedCell executor_type="" />);

      expect(screen.getByTestId('text')).toHaveTextContent('');
    });
  });

  describe('ExecutionStatusCell', () => {
    describe('Success status', () => {
      it('should render success status with check icon', () => {
        render(<ExecutionStatusCell status="success" />);

        const flex = screen.getByTestId('flex');
        expect(flex).toBeInTheDocument();
        expect(flex).toHaveAttribute(
          'data-space-items',
          JSON.stringify({ default: 'spaceItemsXs' }),
        );

        const icon = screen.getByTestId('icon');
        expect(icon).toHaveAttribute('data-status', 'success');

        const checkIcon = screen.getByTestId('check-circle-icon');
        expect(checkIcon).toBeInTheDocument();

        const text = screen.getByTestId('text');
        expect(text).toHaveTextContent('Succeeded');
      });
    });

    describe('Running status', () => {
      it('should render running status with in-progress icon', () => {
        render(<ExecutionStatusCell status="running" />);

        const icon = screen.getByTestId('icon');
        expect(icon).not.toHaveAttribute('data-status');

        const inProgressIcon = screen.getByTestId('in-progress-icon');
        expect(inProgressIcon).toBeInTheDocument();
        // In PatternFly v6, the InProgressIcon no longer has the data-color attribute

        const text = screen.getByTestId('text');
        expect(text).toHaveTextContent('In progress');
      });
    });

    describe('Failure status', () => {
      it('should render failure status with exclamation icon', () => {
        render(<ExecutionStatusCell status="failure" />);

        const icon = screen.getByTestId('icon');
        expect(icon).toHaveAttribute('data-status', 'danger');

        const exclamationIcon = screen.getByTestId('exclamation-circle-icon');
        expect(exclamationIcon).toBeInTheDocument();

        const text = screen.getByTestId('text');
        expect(text).toHaveTextContent('Failed');
      });
    });

    describe('Unknown status', () => {
      it('should render without icon for unknown status', () => {
        render(<ExecutionStatusCell status="unknown" />);

        const flex = screen.getByTestId('flex');
        expect(flex).toBeInTheDocument();

        // Should not have any icons
        expect(screen.queryByTestId('icon')).not.toBeInTheDocument();
        expect(
          screen.queryByTestId('check-circle-icon'),
        ).not.toBeInTheDocument();
        expect(
          screen.queryByTestId('in-progress-icon'),
        ).not.toBeInTheDocument();
        expect(
          screen.queryByTestId('exclamation-circle-icon'),
        ).not.toBeInTheDocument();

        // Should have text showing undefined
        const text = screen.getByTestId('text');
        expect(text).toBeInTheDocument();
        expect(text).toHaveTextContent('');
      });

      it('should render without icon for empty status', () => {
        render(<ExecutionStatusCell status="" />);

        expect(screen.queryByTestId('icon')).not.toBeInTheDocument();
        expect(screen.getByTestId('text')).toHaveTextContent('');
      });

      it('should render without icon for null status', () => {
        render(<ExecutionStatusCell status={null} />);

        expect(screen.queryByTestId('icon')).not.toBeInTheDocument();
        expect(screen.getByTestId('text')).toHaveTextContent('');
      });
    });

    describe('Component structure', () => {
      it('should render correct Flex structure for success', () => {
        render(<ExecutionStatusCell status="success" />);

        const flex = screen.getByTestId('flex');
        const icon = screen.getByTestId('icon');
        const text = screen.getByTestId('text');

        expect(flex).toContainElement(icon);
        expect(flex).toContainElement(text);
      });

      it('should render correct Flex structure for failure', () => {
        render(<ExecutionStatusCell status="failure" />);

        const flex = screen.getByTestId('flex');
        const icon = screen.getByTestId('icon');
        const text = screen.getByTestId('text');

        expect(flex).toContainElement(icon);
        expect(flex).toContainElement(text);
      });

      it('should render correct Flex structure for running', () => {
        render(<ExecutionStatusCell status="running" />);

        const flex = screen.getByTestId('flex');
        const icon = screen.getByTestId('icon');
        const text = screen.getByTestId('text');

        expect(flex).toContainElement(icon);
        expect(flex).toContainElement(text);
      });

      it('should render correct Flex structure for unknown status', () => {
        render(<ExecutionStatusCell status="unknown" />);

        const flex = screen.getByTestId('flex');
        const text = screen.getByTestId('text');

        expect(flex).toContainElement(text);
        expect(screen.queryByTestId('icon')).not.toBeInTheDocument();
      });
    });

    describe('Case sensitivity', () => {
      it('should handle exact case matching for success', () => {
        render(<ExecutionStatusCell status="success" />);
        expect(screen.getByTestId('text')).toHaveTextContent('Succeeded');
      });

      it('should not match uppercase SUCCESS', () => {
        render(<ExecutionStatusCell status="SUCCESS" />);
        expect(screen.queryByTestId('icon')).not.toBeInTheDocument();
      });

      it('should not match mixed case Success', () => {
        render(<ExecutionStatusCell status="Success" />);
        expect(screen.queryByTestId('icon')).not.toBeInTheDocument();
      });
    });

    describe('Edge cases', () => {
      it('should handle various unrecognized statuses', () => {
        const unknownStatuses = ['pending', 'cancelled', 'timeout', 'error'];

        unknownStatuses.forEach((status) => {
          const { unmount } = render(<ExecutionStatusCell status={status} />);
          expect(screen.queryByTestId('icon')).not.toBeInTheDocument();
          expect(screen.getByTestId('text')).toHaveTextContent('');
          unmount();
        });
      });

      it('should handle status with whitespace', () => {
        render(<ExecutionStatusCell status=" success " />);
        expect(screen.queryByTestId('icon')).not.toBeInTheDocument();
      });

      it('should handle numeric status', () => {
        render(<ExecutionStatusCell status="1" />);
        expect(screen.queryByTestId('icon')).not.toBeInTheDocument();
      });
    });
  });
});
