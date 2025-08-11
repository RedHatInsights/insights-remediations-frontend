/* eslint-disable react/prop-types */
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import LogCards from './LogCards';

// Mock PatternFly components
jest.mock('@patternfly/react-core', () => ({
  Card: function MockCard({ isFullHeight, children, ...props }) {
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
  CardTitle: function MockCardTitle({ children, ...props }) {
    return (
      <div data-testid="card-title" {...props}>
        {children}
      </div>
    );
  },
  Flex: function MockFlex({
    spaceItems,
    alignItems,
    flexWrap,
    className,
    children,
    ...props
  }) {
    return (
      <div
        data-testid="flex"
        data-space-items={JSON.stringify(spaceItems)}
        data-align-items={JSON.stringify(alignItems)}
        data-flex-wrap={JSON.stringify(flexWrap)}
        className={className}
        {...props}
      >
        {children}
      </div>
    );
  },
  FlexItem: function MockFlexItem({ style, children, ...props }) {
    return (
      <div data-testid="flex-item" style={style} {...props}>
        {children}
      </div>
    );
  },
  Tooltip: function MockTooltip({ content, children, ...props }) {
    return (
      <div data-testid="tooltip" data-content={content} {...props}>
        {children}
      </div>
    );
  },
}));

// Mock PatternFly icons
jest.mock('@patternfly/react-icons', () => ({
  CheckCircleIcon: function MockCheckCircleIcon({ color, ...props }) {
    return (
      <span data-testid="check-circle-icon" data-color={color} {...props} />
    );
  },
  InProgressIcon: function MockInProgressIcon({ color, ...props }) {
    return (
      <span data-testid="in-progress-icon" data-color={color} {...props} />
    );
  },
  ExclamationCircleIcon: function MockExclamationCircleIcon({
    color,
    ...props
  }) {
    return (
      <span
        data-testid="exclamation-circle-icon"
        data-color={color}
        {...props}
      />
    );
  },
  BanIcon: function MockBanIcon({ color, ...props }) {
    return <span data-testid="ban-icon" data-color={color} {...props} />;
  },
  QuestionCircleIcon: function MockQuestionCircleIcon(props) {
    return <span data-testid="question-circle-icon" {...props} />;
  },
  OutlinedQuestionCircleIcon: function MockOutlinedQuestionCircleIcon(props) {
    return <span data-testid="outlined-question-circle-icon" {...props} />;
  },
}));

describe('LogCards', () => {
  const defaultProps = {
    systemName: 'test-system.example.com',
    status: 'success',
    connectionType: 'rhc',
    executedBy: 'test-user@example.com',
  };

  describe('Basic rendering', () => {
    it('should render without crashing', () => {
      render(<LogCards {...defaultProps} />);

      expect(screen.getAllByTestId('flex')).toHaveLength(3); // Main flex + 2 nested flex
      expect(screen.getAllByTestId('card')).toHaveLength(4);
    });

    it('should render all four cards', () => {
      render(<LogCards {...defaultProps} />);

      const cards = screen.getAllByTestId('card');
      expect(cards).toHaveLength(4);

      // Check that all cards are full height
      cards.forEach((card) => {
        expect(card).toHaveAttribute('data-full-height', 'true');
      });
    });

    it('should render correct card titles', () => {
      render(<LogCards {...defaultProps} />);

      expect(screen.getByText('System')).toBeInTheDocument();
      expect(screen.getByText('System execution status')).toBeInTheDocument();
      expect(screen.getByText(/Insights connection type/)).toBeInTheDocument();
      expect(screen.getByText('Executed by user')).toBeInTheDocument();
    });
  });

  describe('System card', () => {
    it('should display system name', () => {
      render(<LogCards {...defaultProps} />);

      expect(screen.getByText('test-system.example.com')).toBeInTheDocument();
    });

    it('should display dash when system name is null', () => {
      render(<LogCards {...defaultProps} systemName={null} />);

      const cardBodies = screen.getAllByTestId('card-body');
      expect(cardBodies[0]).toHaveTextContent('-');
    });

    it('should display dash when system name is undefined', () => {
      render(<LogCards {...defaultProps} systemName={undefined} />);

      const cardBodies = screen.getAllByTestId('card-body');
      expect(cardBodies[0]).toHaveTextContent('-');
    });

    it('should display empty string system name', () => {
      render(<LogCards {...defaultProps} systemName="" />);

      const cardBodies = screen.getAllByTestId('card-body');
      expect(cardBodies[0]).toHaveTextContent('');
    });
  });

  describe('Status card', () => {
    describe('Status icons', () => {
      it('should display success icon for success status', () => {
        render(<LogCards {...defaultProps} status="success" />);

        expect(screen.getByTestId('check-circle-icon')).toBeInTheDocument();
        expect(screen.getByTestId('check-circle-icon')).toHaveAttribute(
          'data-color',
          'var(--pf-t--global--icon--color--status--success--default)',
        );
        expect(screen.getByText('Success')).toBeInTheDocument();
      });

      it('should display in-progress icon for running status', () => {
        render(<LogCards {...defaultProps} status="running" />);

        expect(screen.getByTestId('in-progress-icon')).toBeInTheDocument();
        expect(screen.getByTestId('in-progress-icon')).toHaveAttribute(
          'data-color',
          'var(--pf-v6-global--info-color--100)',
        );
        expect(screen.getByText('Running')).toBeInTheDocument();
      });

      it('should display exclamation icon for failure status', () => {
        render(<LogCards {...defaultProps} status="failure" />);

        expect(
          screen.getByTestId('exclamation-circle-icon'),
        ).toBeInTheDocument();
        expect(screen.getByTestId('exclamation-circle-icon')).toHaveAttribute(
          'data-color',
          'var(--pf-v6-global--danger-color--100)',
        );
        expect(screen.getByText('Failure')).toBeInTheDocument();
      });

      it('should display ban icon for canceled status', () => {
        render(<LogCards {...defaultProps} status="canceled" />);

        expect(screen.getByTestId('ban-icon')).toBeInTheDocument();
        expect(screen.getByTestId('ban-icon')).toHaveAttribute(
          'data-color',
          'var(--pf-v6-global--danger-color--100)',
        );
        expect(screen.getByText('Canceled')).toBeInTheDocument();
      });

      it('should display question icon for unknown status', () => {
        render(<LogCards {...defaultProps} status="unknown" />);

        expect(screen.getByTestId('question-circle-icon')).toBeInTheDocument();
        expect(screen.getByText('Unknown')).toBeInTheDocument();
      });

      it('should display question icon for null status', () => {
        render(<LogCards {...defaultProps} status={null} />);

        expect(screen.getByTestId('question-circle-icon')).toBeInTheDocument();
        expect(screen.getByText('-')).toBeInTheDocument();
      });

      it('should display question icon for undefined status', () => {
        render(<LogCards {...defaultProps} status={undefined} />);

        expect(screen.getByTestId('question-circle-icon')).toBeInTheDocument();
        expect(screen.getByText('-')).toBeInTheDocument();
      });

      it('should display question icon for empty string status', () => {
        render(<LogCards {...defaultProps} status="" />);

        expect(screen.getByTestId('question-circle-icon')).toBeInTheDocument();
        expect(screen.getByText('-')).toBeInTheDocument();
      });
    });

    describe('Status text formatting', () => {
      it('should capitalize first letter of status', () => {
        const testCases = [
          { status: 'success', expected: 'Success' },
          { status: 'running', expected: 'Running' },
          { status: 'failure', expected: 'Failure' },
          { status: 'canceled', expected: 'Canceled' },
          { status: 'pending', expected: 'Pending' },
        ];

        testCases.forEach(({ status, expected }) => {
          const { unmount } = render(
            <LogCards {...defaultProps} status={status} />,
          );
          expect(screen.getByText(expected)).toBeInTheDocument();
          unmount();
        });
      });

      it('should handle single character status', () => {
        render(<LogCards {...defaultProps} status="a" />);
        expect(screen.getByText('A')).toBeInTheDocument();
      });

      it('should handle mixed case status', () => {
        render(<LogCards {...defaultProps} status="sUcCeSs" />);
        expect(screen.getByText('SUcCeSs')).toBeInTheDocument();
      });
    });
  });

  describe('Connection type card', () => {
    it('should display connection type', () => {
      render(<LogCards {...defaultProps} connectionType="satellite" />);

      const cardBodies = screen.getAllByTestId('card-body');
      expect(cardBodies[2]).toHaveTextContent('satellite');
    });

    it('should display dash when connection type is null', () => {
      render(<LogCards {...defaultProps} connectionType={null} />);

      const cardBodies = screen.getAllByTestId('card-body');
      expect(cardBodies[2]).toHaveTextContent('-');
    });

    it('should display dash when connection type is undefined', () => {
      render(<LogCards {...defaultProps} connectionType={undefined} />);

      const cardBodies = screen.getAllByTestId('card-body');
      expect(cardBodies[2]).toHaveTextContent('-');
    });

    it('should display tooltip for connection type', () => {
      render(<LogCards {...defaultProps} />);

      const tooltip = screen.getByTestId('tooltip');
      expect(tooltip).toHaveAttribute(
        'data-content',
        'Red Hat Enterprise Linux systems are connected to Insights directly via RHC, or through Satellite via Cloud Connector.',
      );
      expect(
        screen.getByTestId('outlined-question-circle-icon'),
      ).toBeInTheDocument();
    });
  });

  describe('Executed by card', () => {
    it('should display executed by user', () => {
      render(<LogCards {...defaultProps} executedBy="admin@company.com" />);

      const cardBodies = screen.getAllByTestId('card-body');
      expect(cardBodies[3]).toHaveTextContent('admin@company.com');
    });

    it('should display dash when executed by is null', () => {
      render(<LogCards {...defaultProps} executedBy={null} />);

      const cardBodies = screen.getAllByTestId('card-body');
      expect(cardBodies[3]).toHaveTextContent('-');
    });

    it('should display dash when executed by is undefined', () => {
      render(<LogCards {...defaultProps} executedBy={undefined} />);

      const cardBodies = screen.getAllByTestId('card-body');
      expect(cardBodies[3]).toHaveTextContent('-');
    });

    it('should display empty string executed by', () => {
      render(<LogCards {...defaultProps} executedBy="" />);

      const cardBodies = screen.getAllByTestId('card-body');
      expect(cardBodies[3]).toHaveTextContent('');
    });
  });

  describe('Component structure', () => {
    it('should render main flex container with correct props', () => {
      render(<LogCards {...defaultProps} />);

      const mainFlex = screen.getAllByTestId('flex')[0];
      expect(mainFlex).toHaveAttribute(
        'data-space-items',
        '{"default":"spaceItemsLg"}',
      );
      expect(mainFlex).toHaveAttribute(
        'data-align-items',
        '{"default":"stretch"}',
      );
      expect(mainFlex).toHaveAttribute(
        'data-flex-wrap',
        '{"default":"nowrap"}',
      );
      expect(mainFlex).toHaveClass('pf-v6-u-mb-lg');
    });

    it('should render four flex items', () => {
      render(<LogCards {...defaultProps} />);

      const flexItems = screen.getAllByTestId('flex-item');
      expect(flexItems).toHaveLength(4);

      // Check that all flex items have the correct style
      flexItems.forEach((item) => {
        expect(item).toHaveStyle('flex: 1 1 0');
      });
    });

    it('should render status card with nested flex for icon and text', () => {
      render(<LogCards {...defaultProps} />);

      const flexContainers = screen.getAllByTestId('flex');
      expect(flexContainers).toHaveLength(3); // Main flex + status flex + connection type flex

      // Status card flex should have correct props
      const statusFlex = flexContainers[1];
      expect(statusFlex).toHaveAttribute(
        'data-space-items',
        '{"default":"spaceItemsXs"}',
      );
      expect(statusFlex).toHaveAttribute(
        'data-align-items',
        '{"default":"alignItemsCenter"}',
      );
    });

    it('should render connection type card with nested flex for title and tooltip', () => {
      render(<LogCards {...defaultProps} />);

      const flexContainers = screen.getAllByTestId('flex');
      const connectionTypeFlex = flexContainers[2];
      expect(connectionTypeFlex).toHaveAttribute(
        'data-space-items',
        '{"default":"spaceItemsXs"}',
      );
      expect(connectionTypeFlex).toHaveAttribute(
        'data-align-items',
        '{"default":"alignItemsCenter"}',
      );
    });
  });

  describe('PropTypes', () => {
    it('should have correct propTypes defined', () => {
      expect(LogCards.propTypes).toBeDefined();
      expect(LogCards.propTypes.systemName).toBeDefined();
      expect(LogCards.propTypes.status).toBeDefined();
      expect(LogCards.propTypes.connectionType).toBeDefined();
      expect(LogCards.propTypes.executedBy).toBeDefined();
    });
  });

  describe('Edge cases', () => {
    it('should render with all props as null', () => {
      render(
        <LogCards
          systemName={null}
          status={null}
          connectionType={null}
          executedBy={null}
        />,
      );

      const cardBodies = screen.getAllByTestId('card-body');
      expect(cardBodies[0]).toHaveTextContent('-'); // System
      expect(cardBodies[2]).toHaveTextContent('-'); // Connection type
      expect(cardBodies[3]).toHaveTextContent('-'); // Executed by

      // Status card should show question icon and dash
      expect(screen.getByTestId('question-circle-icon')).toBeInTheDocument();
      expect(screen.getAllByText('-')).toHaveLength(4); // System, status, connection, executed by
    });

    it('should render with no props', () => {
      render(<LogCards />);

      expect(screen.getAllByTestId('flex')).toHaveLength(3); // Main flex + 2 nested flex
      expect(screen.getAllByTestId('card')).toHaveLength(4);

      const cardBodies = screen.getAllByTestId('card-body');
      expect(cardBodies[0]).toHaveTextContent('-'); // System
      expect(cardBodies[2]).toHaveTextContent('-'); // Connection type
      expect(cardBodies[3]).toHaveTextContent('-'); // Executed by
    });

    it('should handle very long values', () => {
      const longValue = 'a'.repeat(100);
      render(
        <LogCards
          systemName={longValue}
          status="success"
          connectionType={longValue}
          executedBy={longValue}
        />,
      );

      expect(screen.getAllByText(longValue)).toHaveLength(3); // Appears in 3 cards
      expect(screen.getByText('Success')).toBeInTheDocument();
    });

    it('should handle special characters in values', () => {
      const specialChars = 'test-system_123@domain.com!@#$%^&*()';
      render(
        <LogCards
          systemName={specialChars}
          status="success"
          connectionType={specialChars}
          executedBy={specialChars}
        />,
      );

      expect(screen.getAllByText(specialChars)).toHaveLength(3); // Appears in 3 cards
    });
  });

  describe('Integration scenarios', () => {
    it('should render realistic production data', () => {
      render(
        <LogCards
          systemName="prod-web-server-01.company.com"
          status="success"
          connectionType="rhc"
          executedBy="sysadmin@company.com"
        />,
      );

      expect(
        screen.getByText('prod-web-server-01.company.com'),
      ).toBeInTheDocument();
      expect(screen.getByText('Success')).toBeInTheDocument();
      expect(screen.getByTestId('check-circle-icon')).toBeInTheDocument();
      expect(screen.getByText('rhc')).toBeInTheDocument();
      expect(screen.getByText('sysadmin@company.com')).toBeInTheDocument();
    });

    it('should render mixed valid and null values', () => {
      render(
        <LogCards
          systemName="test-system"
          status={null}
          connectionType="satellite"
          executedBy={null}
        />,
      );

      expect(screen.getByText('test-system')).toBeInTheDocument();
      expect(screen.getByTestId('question-circle-icon')).toBeInTheDocument();
      expect(screen.getByText('satellite')).toBeInTheDocument();

      const cardBodies = screen.getAllByTestId('card-body');
      expect(cardBodies[3]).toHaveTextContent('-'); // Executed by should show dash
    });
  });
});
