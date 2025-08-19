/* eslint-disable react/prop-types, testing-library/render-result-naming-convention */
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { execStatus, getTimeAgo, renderComponent } from './helpers';

// Mock PatternFly components
jest.mock('@patternfly/react-core', () => ({
  Flex: function MockFlex({ spaceItems, children, ...props }) {
    return (
      <div
        data-testid="flex"
        data-space-items={JSON.stringify(spaceItems)}
        {...props}
      >
        {children}
      </div>
    );
  },
  Icon: function MockIcon({ status, children, ...props }) {
    return (
      <span data-testid="icon" data-status={status} {...props}>
        {children}
      </span>
    );
  },
  TextContent: function MockTextContent({ children, ...props }) {
    return (
      <div data-testid="text-content" {...props}>
        {children}
      </div>
    );
  },
}));

// Mock PatternFly icons
jest.mock('@patternfly/react-icons', () => ({
  CheckCircleIcon: function MockCheckCircleIcon(props) {
    return <span data-testid="check-circle-icon" {...props} />;
  },
  ExclamationCircleIcon: function MockExclamationCircleIcon(props) {
    return <span data-testid="exclamation-circle-icon" {...props} />;
  },
  InProgressIcon: function MockInProgressIcon({ color, ...props }) {
    return (
      <span data-testid="in-progress-icon" data-color={color} {...props} />
    );
  },
}));

describe('RemediationDetailsComponents helpers', () => {
  beforeEach(() => {
    // Mock current time to make tests predictable
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2023-12-01T12:00:00Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('execStatus', () => {
    describe('Missing parameters', () => {
      it('should return N/A when both status and date are missing', () => {
        const result = execStatus();
        render(result);

        expect(screen.getByTestId('flex')).toBeInTheDocument();
        expect(screen.getByTestId('text-content')).toHaveTextContent('N/A');
        expect(screen.queryByTestId('icon')).not.toBeInTheDocument();
      });

      it('should return N/A when status is missing', () => {
        const date = new Date('2023-12-01T11:00:00Z');
        const result = execStatus(undefined, date);
        render(result);

        expect(screen.getByTestId('text-content')).toHaveTextContent('N/A');
        expect(screen.queryByTestId('icon')).not.toBeInTheDocument();
      });

      it('should return N/A when date is missing', () => {
        const result = execStatus('success');
        render(result);

        expect(screen.getByTestId('text-content')).toHaveTextContent('N/A');
        expect(screen.queryByTestId('icon')).not.toBeInTheDocument();
      });

      it('should return N/A when status is null', () => {
        const date = new Date('2023-12-01T11:00:00Z');
        const result = execStatus(null, date);
        render(result);

        expect(screen.getByTestId('text-content')).toHaveTextContent('N/A');
        expect(screen.queryByTestId('icon')).not.toBeInTheDocument();
      });

      it('should return N/A when date is null', () => {
        const result = execStatus('success', null);
        render(result);

        expect(screen.getByTestId('text-content')).toHaveTextContent('N/A');
        expect(screen.queryByTestId('icon')).not.toBeInTheDocument();
      });

      it('should return N/A when status is empty string', () => {
        const date = new Date('2023-12-01T11:00:00Z');
        const result = execStatus('', date);
        render(result);

        expect(screen.getByTestId('text-content')).toHaveTextContent('N/A');
        expect(screen.queryByTestId('icon')).not.toBeInTheDocument();
      });
    });

    describe('Success status', () => {
      it('should render success status with check icon', () => {
        const date = new Date('2023-12-01T11:00:00Z');
        const result = execStatus('success', date);
        render(result);

        expect(screen.getByTestId('flex')).toBeInTheDocument();
        expect(screen.getByTestId('icon')).toHaveAttribute(
          'data-status',
          'success',
        );
        expect(screen.getByTestId('check-circle-icon')).toBeInTheDocument();
        expect(screen.getByText('Succeeded 1 hour ago')).toBeInTheDocument();
      });

      it('should render success status with "Just now" for recent date', () => {
        const date = new Date('2023-12-01T11:59:30Z'); // 30 seconds ago
        const result = execStatus('success', date);
        render(result);

        expect(screen.getByText('Succeeded Just now')).toBeInTheDocument();
      });
    });

    describe('Running status', () => {
      it('should render running status with in-progress icon', () => {
        const date = new Date('2023-12-01T11:30:00Z');
        const result = execStatus('running', date);
        render(result);

        expect(screen.getByTestId('flex')).toBeInTheDocument();
        expect(screen.getByTestId('icon')).toBeInTheDocument();
        expect(screen.queryByTestId('icon')).not.toHaveAttribute('data-status');
        expect(screen.getByTestId('in-progress-icon')).toHaveAttribute(
          'data-color',
          'var(--pf-v6-global--icon--Color--light--dark)',
        );
        expect(
          screen.getByText('In progress 30 minutes ago'),
        ).toBeInTheDocument();
      });
    });

    describe('Failure status', () => {
      it('should render failure status with exclamation icon', () => {
        const date = new Date('2023-12-01T10:00:00Z');
        const result = execStatus('failure', date);
        render(result);

        expect(screen.getByTestId('flex')).toBeInTheDocument();
        expect(screen.getByTestId('icon')).toHaveAttribute(
          'data-status',
          'danger',
        );
        expect(
          screen.getByTestId('exclamation-circle-icon'),
        ).toBeInTheDocument();
        expect(screen.getByText('Failed 2 hours ago')).toBeInTheDocument();
      });
    });

    describe('Unknown status', () => {
      it('should render without icon for unknown status', () => {
        const date = new Date('2023-12-01T11:00:00Z');
        const result = execStatus('unknown', date);
        render(result);

        expect(screen.getByTestId('flex')).toBeInTheDocument();
        expect(screen.queryByTestId('icon')).not.toBeInTheDocument();
        expect(screen.getByText('N/A 1 hour ago')).toBeInTheDocument();
      });

      it('should handle empty string status', () => {
        const date = new Date('2023-12-01T11:00:00Z');
        const result = execStatus('', date);
        render(result);

        expect(screen.getByTestId('text-content')).toHaveTextContent('N/A');
      });
    });

    describe('Component structure', () => {
      it('should render correct Flex structure for success', () => {
        const date = new Date('2023-12-01T11:00:00Z');
        const result = execStatus('success', date);
        render(result);

        const flex = screen.getByTestId('flex');
        expect(flex).toHaveAttribute(
          'data-space-items',
          '{"default":"spaceItemsSm"}',
        );
        expect(flex).toContainElement(screen.getByTestId('icon'));
        expect(flex).toContainElement(screen.getByText('Succeeded 1 hour ago'));
      });

      it('should render correct Flex structure for N/A case', () => {
        const result = execStatus();
        render(result);

        const flex = screen.getByTestId('flex');
        expect(flex).toHaveAttribute(
          'data-space-items',
          '{"default":"spaceItemsSm"}',
        );
        expect(flex).toContainElement(screen.getByTestId('text-content'));
        expect(flex).not.toContainElement(
          screen.queryByTestId('icon') || document.createElement('div'),
        );
      });
    });

    describe('Various time periods', () => {
      it('should handle different time periods correctly', () => {
        const testCases = [
          { date: new Date('2023-12-01T11:58:00Z'), expected: '2 minutes ago' },
          { date: new Date('2023-12-01T09:00:00Z'), expected: '3 hours ago' },
          { date: new Date('2023-11-30T12:00:00Z'), expected: '1 day ago' },
          { date: new Date('2023-11-01T12:00:00Z'), expected: '1 month ago' },
        ];

        testCases.forEach(({ date, expected }) => {
          const result = execStatus('success', date);
          render(result);
          expect(screen.getByText(`Succeeded ${expected}`)).toBeInTheDocument();
          screen.getByText(`Succeeded ${expected}`).remove();
        });
      });
    });
  });

  describe('getTimeAgo', () => {
    beforeEach(() => {
      // Set consistent current time
      jest.setSystemTime(new Date('2023-12-01T12:00:00Z'));
    });

    describe('Recent times', () => {
      it('should return "Just now" for times less than 1 minute ago', () => {
        const date = new Date('2023-12-01T11:59:30Z'); // 30 seconds ago
        expect(getTimeAgo(date)).toBe('Just now');
      });

      it('should return "Just now" for current time', () => {
        const date = new Date('2023-12-01T12:00:00Z'); // exact current time
        expect(getTimeAgo(date)).toBe('Just now');
      });

      it('should return "Just now" for times 59 seconds ago', () => {
        const date = new Date('2023-12-01T11:59:01Z'); // 59 seconds ago
        expect(getTimeAgo(date)).toBe('Just now');
      });
    });

    describe('Minutes', () => {
      it('should return "1 minute ago" for exactly 1 minute', () => {
        const date = new Date('2023-12-01T11:59:00Z');
        expect(getTimeAgo(date)).toBe('1 minute ago');
      });

      it('should return "2 minutes ago" for 2 minutes', () => {
        const date = new Date('2023-12-01T11:58:00Z');
        expect(getTimeAgo(date)).toBe('2 minutes ago');
      });

      it('should return "59 minutes ago" for 59 minutes', () => {
        const date = new Date('2023-12-01T11:01:00Z');
        expect(getTimeAgo(date)).toBe('59 minutes ago');
      });
    });

    describe('Hours', () => {
      it('should return "1 hour ago" for exactly 1 hour', () => {
        const date = new Date('2023-12-01T11:00:00Z');
        expect(getTimeAgo(date)).toBe('1 hour ago');
      });

      it('should return "2 hours ago" for 2 hours', () => {
        const date = new Date('2023-12-01T10:00:00Z');
        expect(getTimeAgo(date)).toBe('2 hours ago');
      });

      it('should return "23 hours ago" for 23 hours', () => {
        const date = new Date('2023-11-30T13:00:00Z');
        expect(getTimeAgo(date)).toBe('23 hours ago');
      });
    });

    describe('Days', () => {
      it('should return "1 day ago" for exactly 1 day', () => {
        const date = new Date('2023-11-30T12:00:00Z');
        expect(getTimeAgo(date)).toBe('1 day ago');
      });

      it('should return "2 days ago" for 2 days', () => {
        const date = new Date('2023-11-29T12:00:00Z');
        expect(getTimeAgo(date)).toBe('2 days ago');
      });

      it('should return "29 days ago" for 29 days', () => {
        const date = new Date('2023-11-02T12:00:00Z');
        expect(getTimeAgo(date)).toBe('29 days ago');
      });
    });

    describe('Months', () => {
      it('should return "1 month ago" for exactly 30 days', () => {
        const date = new Date('2023-11-01T12:00:00Z');
        expect(getTimeAgo(date)).toBe('1 month ago');
      });

      it('should return "2 months ago" for 60 days', () => {
        const date = new Date('2023-10-02T12:00:00Z');
        expect(getTimeAgo(date)).toBe('2 months ago');
      });

      it('should return "10 months ago" for 330 days', () => {
        const date = new Date('2023-01-06T12:00:00Z'); // Approximately 329 days (10 months)
        expect(getTimeAgo(date)).toBe('10 months ago');
      });
    });

    describe('Years', () => {
      it('should return "1 year ago" for exactly 365 days', () => {
        const date = new Date('2022-12-01T12:00:00Z');
        expect(getTimeAgo(date)).toBe('1 year ago');
      });

      it('should return "2 years ago" for 730+ days', () => {
        const date = new Date('2021-12-01T12:00:00Z');
        expect(getTimeAgo(date)).toBe('2 years ago');
      });

      it('should return "5 years ago" for very old dates', () => {
        const date = new Date('2018-12-01T12:00:00Z');
        expect(getTimeAgo(date)).toBe('5 years ago');
      });
    });

    describe('Edge cases', () => {
      it('should handle Date objects correctly', () => {
        const date = new Date('2023-12-01T11:30:00Z');
        expect(getTimeAgo(date)).toBe('30 minutes ago');
      });

      it('should handle dates in the future (returns negative but still works)', () => {
        const futureDate = new Date('2023-12-01T13:00:00Z'); // 1 hour in future
        // The function doesn't explicitly handle future dates, but it should still work
        const result = getTimeAgo(futureDate);
        expect(typeof result).toBe('string');
      });

      it('should handle very old dates correctly', () => {
        const veryOldDate = new Date('1990-01-01T12:00:00Z');
        const result = getTimeAgo(veryOldDate);
        expect(result).toMatch(/\d+ years? ago/);
      });
    });

    describe('Boundary conditions', () => {
      it('should handle exactly 60 seconds (1 minute boundary)', () => {
        const date = new Date('2023-12-01T11:59:00Z'); // exactly 60 seconds
        expect(getTimeAgo(date)).toBe('1 minute ago');
      });

      it('should handle exactly 60 minutes (1 hour boundary)', () => {
        const date = new Date('2023-12-01T11:00:00Z'); // exactly 60 minutes
        expect(getTimeAgo(date)).toBe('1 hour ago');
      });

      it('should handle exactly 24 hours (1 day boundary)', () => {
        const date = new Date('2023-11-30T12:00:00Z'); // exactly 24 hours
        expect(getTimeAgo(date)).toBe('1 day ago');
      });

      it('should handle exactly 30 days (1 month boundary)', () => {
        const date = new Date('2023-11-01T12:00:00Z'); // exactly 30 days
        expect(getTimeAgo(date)).toBe('1 month ago');
      });

      it('should handle exactly 365 days (1 year boundary)', () => {
        const date = new Date('2022-12-01T12:00:00Z'); // exactly 365 days
        expect(getTimeAgo(date)).toBe('1 year ago');
      });
    });
  });

  describe('renderComponent', () => {
    // Create a mock component for testing
    const MockComponent = ({ name, value, testProp, ...props }) => (
      <div
        data-testid="mock-component"
        data-name={name}
        data-value={value}
        data-test-prop={testProp}
        {...props}
      >
        {name}: {value}
      </div>
    );

    describe('Basic functionality', () => {
      it('should return a function', () => {
        const componentRenderer = renderComponent(MockComponent, {
          testProp: 'test',
        });
        expect(typeof componentRenderer).toBe('function');
      });

      it('should render component with entity props', () => {
        const componentRenderer = renderComponent(MockComponent, {
          testProp: 'test',
        });
        const entity = { name: 'Test Entity', value: 42 };

        const element = componentRenderer('data', 'id', entity);
        render(element);

        expect(screen.getByTestId('mock-component')).toBeInTheDocument();
        expect(screen.getByTestId('mock-component')).toHaveAttribute(
          'data-name',
          'Test Entity',
        );
        expect(screen.getByTestId('mock-component')).toHaveAttribute(
          'data-value',
          '42',
        );
        expect(screen.getByTestId('mock-component')).toHaveAttribute(
          'data-test-prop',
          'test',
        );
        expect(screen.getByText('Test Entity: 42')).toBeInTheDocument();
      });

      it('should render component with only props when no entity', () => {
        const renderFn = renderComponent(MockComponent, {
          name: 'Prop Name',
          testProp: 'test',
        });

        const result = renderFn('data', 'id', {});
        render(result);

        expect(screen.getByTestId('mock-component')).toHaveAttribute(
          'data-name',
          'Prop Name',
        );
        expect(screen.getByTestId('mock-component')).toHaveAttribute(
          'data-test-prop',
          'test',
        );
      });

      it('should merge entity props with passed props (props take precedence)', () => {
        const renderFn = renderComponent(MockComponent, {
          name: 'Prop Name',
          testProp: 'propValue',
        });
        const entity = { name: 'Entity Name', value: 100 };

        const result = renderFn('data', 'id', entity);
        render(result);

        // Passed props should override entity props
        expect(screen.getByTestId('mock-component')).toHaveAttribute(
          'data-name',
          'Prop Name',
        );
        expect(screen.getByTestId('mock-component')).toHaveAttribute(
          'data-value',
          '100',
        );
        expect(screen.getByTestId('mock-component')).toHaveAttribute(
          'data-test-prop',
          'propValue',
        );
      });
    });

    describe('Edge cases', () => {
      it('should handle undefined entity', () => {
        const renderFn = renderComponent(MockComponent, { testProp: 'test' });

        const result = renderFn('data', 'id', undefined);
        render(result);

        expect(screen.getByTestId('mock-component')).toBeInTheDocument();
        expect(screen.getByTestId('mock-component')).toHaveAttribute(
          'data-test-prop',
          'test',
        );
      });

      it('should handle null entity', () => {
        const renderFn = renderComponent(MockComponent, { testProp: 'test' });

        const result = renderFn('data', 'id', null);
        render(result);

        expect(screen.getByTestId('mock-component')).toBeInTheDocument();
        expect(screen.getByTestId('mock-component')).toHaveAttribute(
          'data-test-prop',
          'test',
        );
      });

      it('should handle empty props object', () => {
        const renderFn = renderComponent(MockComponent, {});
        const entity = { name: 'Test', value: 123 };

        const result = renderFn('data', 'id', entity);
        render(result);

        expect(screen.getByTestId('mock-component')).toHaveAttribute(
          'data-name',
          'Test',
        );
        expect(screen.getByTestId('mock-component')).toHaveAttribute(
          'data-value',
          '123',
        );
      });

      it('should handle component with no props', () => {
        const SimpleComponent = () => (
          <div data-testid="simple-component">Simple</div>
        );
        const renderFn = renderComponent(SimpleComponent);

        const result = renderFn('data', 'id', { ignored: 'prop' });
        render(result);

        expect(screen.getByTestId('simple-component')).toBeInTheDocument();
        expect(screen.getByText('Simple')).toBeInTheDocument();
      });
    });

    describe('Parameters passed to render function', () => {
      it('should ignore data and id parameters (only use entity)', () => {
        const renderFn = renderComponent(MockComponent, { testProp: 'test' });
        const entity = { name: 'Entity Name' };

        // The function should ignore 'data' and 'id' parameters
        const result = renderFn('ignored-data', 'ignored-id', entity);
        render(result);

        expect(screen.getByTestId('mock-component')).toHaveAttribute(
          'data-name',
          'Entity Name',
        );
        expect(screen.getByTestId('mock-component')).toHaveAttribute(
          'data-test-prop',
          'test',
        );
      });

      it('should work with different data and id values', () => {
        const renderFn = renderComponent(MockComponent, { testProp: 'test' });
        const entity = { name: 'Test' };

        // Test with different parameter values
        const result1 = renderFn([], 0, entity);
        const result2 = renderFn('string', 999, entity);
        const result3 = renderFn(null, undefined, entity);

        render(
          <>
            {result1}
            {result2}
            {result3}
          </>,
        );

        // All should render the same since only entity and props matter
        const components = screen.getAllByTestId('mock-component');
        expect(components).toHaveLength(3);
        components.forEach((component) => {
          expect(component).toHaveAttribute('data-name', 'Test');
          expect(component).toHaveAttribute('data-test-prop', 'test');
        });
      });
    });

    describe('Component types', () => {
      it('should work with functional components', () => {
        const FunctionalComponent = ({ message }) => (
          <div data-testid="functional">{message}</div>
        );
        const renderFn = renderComponent(FunctionalComponent, {
          message: 'Hello',
        });

        const result = renderFn('data', 'id', {});
        render(result);

        expect(screen.getByTestId('functional')).toHaveTextContent('Hello');
      });

      it('should work with components that accept children', () => {
        const ContainerComponent = ({ title, children, ...props }) => (
          <div data-testid="container" data-title={title} {...props}>
            {children}
          </div>
        );

        const renderFn = renderComponent(ContainerComponent, {
          title: 'Container',
        });
        const entity = { className: 'entity-class' };

        const result = renderFn('data', 'id', entity);
        render(result);

        expect(screen.getByTestId('container')).toHaveAttribute(
          'data-title',
          'Container',
        );
        expect(screen.getByTestId('container')).toHaveClass('entity-class');
      });
    });
  });
});
