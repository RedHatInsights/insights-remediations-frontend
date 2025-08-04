/* eslint-disable react/prop-types */
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ConnectionStatusColumn from './ConnectionStatusCol';

// Mock PatternFly components
jest.mock('@patternfly/react-icons', () => ({
  ConnectedIcon: function MockConnectedIcon({ className }) {
    return <span data-testid="connected-icon" className={className} />;
  },
  DisconnectedIcon: function MockDisconnectedIcon({ className }) {
    return <span data-testid="disconnected-icon" className={className} />;
  },
  UnknownIcon: function MockUnknownIcon({ className }) {
    return <span data-testid="unknown-icon" className={className} />;
  },
}));

jest.mock('@patternfly/react-core', () => ({
  Flex: function MockFlex({ children, direction, spaceItems, ...props }) {
    return (
      <div data-testid="flex" {...props}>
        {children}
      </div>
    );
  },
  Tooltip: function MockTooltip({ children, content, position }) {
    return (
      <div data-testid="tooltip" data-position={position}>
        <div data-testid="tooltip-content">{content}</div>
        {children}
      </div>
    );
  },
}));

describe('ConnectionStatusColumn', () => {
  it('should render connected status correctly', () => {
    render(
      <ConnectionStatusColumn
        connection_status="connected"
        executor_type="rhc"
      />,
    );

    expect(screen.getByTestId('connected-icon')).toBeInTheDocument();
    expect(screen.getByTestId('connected-icon')).toHaveClass('pf-u-mr-xs');
    expect(screen.getByText('Connected')).toBeInTheDocument();
  });

  it('should render connected status for uppercase string', () => {
    render(
      <ConnectionStatusColumn
        connection_status="CONNECTED"
        executor_type="RHC"
      />,
    );

    expect(screen.getByTestId('connected-icon')).toBeInTheDocument();
    expect(screen.getByText('Connected')).toBeInTheDocument();
  });

  it('should render not configured status for none executor type', () => {
    render(
      <ConnectionStatusColumn
        connection_status="no_rhc"
        executor_type="none"
      />,
    );

    expect(screen.getByTestId('disconnected-icon')).toBeInTheDocument();
    expect(screen.getByText('Not configured')).toBeInTheDocument();
    expect(screen.getByTestId('tooltip')).toBeInTheDocument();
    expect(screen.getByTestId('tooltip-content')).toHaveTextContent(
      'There are no connections configured for this system.',
    );
  });

  it('should render not configured for uppercase NONE executor type', () => {
    render(
      <ConnectionStatusColumn
        connection_status="no_rhc"
        executor_type="NONE"
      />,
    );

    expect(screen.getByTestId('disconnected-icon')).toBeInTheDocument();
    expect(screen.getByText('Not configured')).toBeInTheDocument();
  });

  it('should render RHC disconnected status correctly', () => {
    render(
      <ConnectionStatusColumn
        connection_status="disconnected"
        executor_type="rhc"
      />,
    );

    expect(screen.getByTestId('disconnected-icon')).toBeInTheDocument();
    expect(screen.getByText('Disconnected')).toBeInTheDocument();
    expect(screen.getByTestId('tooltip')).toBeInTheDocument();
    expect(screen.getByTestId('tooltip-content')).toHaveTextContent(
      'The Remote Host Configuration (RHC) client is not configured for one or more systems in this plan.',
    );
  });

  it('should render RHC disconnected for uppercase types', () => {
    render(
      <ConnectionStatusColumn
        connection_status="DISCONNECTED"
        executor_type="RHC"
      />,
    );

    expect(screen.getByTestId('disconnected-icon')).toBeInTheDocument();
    expect(screen.getByText('Disconnected')).toBeInTheDocument();
  });

  it('should render RHC-Satellite disconnected status correctly', () => {
    render(
      <ConnectionStatusColumn
        connection_status="disconnected"
        executor_type="rhc-satellite"
      />,
    );

    expect(screen.getByTestId('disconnected-icon')).toBeInTheDocument();
    expect(screen.getByText('Disconnected')).toBeInTheDocument();
    expect(screen.getByTestId('tooltip')).toBeInTheDocument();
    expect(screen.getByTestId('tooltip-content')).toHaveTextContent(
      'The Red Hat Satellite instance that this system is registered to is disconnected from Red Hat Insights.',
    );
  });

  it('should render RHC-Satellite disconnected for uppercase types', () => {
    render(
      <ConnectionStatusColumn
        connection_status="DISCONNECTED"
        executor_type="RHC-SATELLITE"
      />,
    );

    expect(screen.getByTestId('disconnected-icon')).toBeInTheDocument();
    expect(screen.getByText('Disconnected')).toBeInTheDocument();
  });

  it('should render unknown status for unrecognized connection status', () => {
    render(
      <ConnectionStatusColumn
        connection_status="unknown"
        executor_type="rhc"
      />,
    );

    expect(screen.getByTestId('unknown-icon')).toBeInTheDocument();
    expect(screen.getByText('Unknown')).toBeInTheDocument();
    expect(screen.getByTestId('tooltip')).toBeInTheDocument();
    expect(screen.getByTestId('tooltip-content')).toHaveTextContent(
      'Connection Status Unknown',
    );
  });

  it('should render unknown status for null connection status', () => {
    render(
      <ConnectionStatusColumn connection_status={null} executor_type="rhc" />,
    );

    expect(screen.getByTestId('unknown-icon')).toBeInTheDocument();
    expect(screen.getByText('Unknown')).toBeInTheDocument();
  });

  it('should render unknown status for undefined connection status', () => {
    render(
      <ConnectionStatusColumn
        connection_status={undefined}
        executor_type="rhc"
      />,
    );

    expect(screen.getByTestId('unknown-icon')).toBeInTheDocument();
    expect(screen.getByText('Unknown')).toBeInTheDocument();
  });

  it('should handle non-string connection_status', () => {
    render(
      <ConnectionStatusColumn connection_status={123} executor_type="rhc" />,
    );

    expect(screen.getByTestId('unknown-icon')).toBeInTheDocument();
    expect(screen.getByText('Unknown')).toBeInTheDocument();
  });

  it('should handle non-string executor_type', () => {
    render(
      <ConnectionStatusColumn
        connection_status="connected"
        executor_type={456}
      />,
    );

    expect(screen.getByTestId('connected-icon')).toBeInTheDocument();
    expect(screen.getByText('Connected')).toBeInTheDocument();
  });

  it('should handle disconnected status with unknown executor type', () => {
    render(
      <ConnectionStatusColumn
        connection_status="disconnected"
        executor_type="unknown-executor"
      />,
    );

    // Should fall through to unknown status since it's not rhc or rhc-satellite
    expect(screen.getByTestId('unknown-icon')).toBeInTheDocument();
    expect(screen.getByText('Unknown')).toBeInTheDocument();
  });

  it('should handle disconnected status with null executor type', () => {
    render(
      <ConnectionStatusColumn
        connection_status="disconnected"
        executor_type={null}
      />,
    );

    expect(screen.getByTestId('unknown-icon')).toBeInTheDocument();
    expect(screen.getByText('Unknown')).toBeInTheDocument();
  });

  it('should handle empty string values', () => {
    render(<ConnectionStatusColumn connection_status="" executor_type="" />);

    expect(screen.getByTestId('unknown-icon')).toBeInTheDocument();
    expect(screen.getByText('Unknown')).toBeInTheDocument();
  });

  it('should handle missing props', () => {
    render(<ConnectionStatusColumn />);

    expect(screen.getByTestId('unknown-icon')).toBeInTheDocument();
    expect(screen.getByText('Unknown')).toBeInTheDocument();
  });

  it('should render tooltip with correct position for not configured status', () => {
    render(
      <ConnectionStatusColumn
        connection_status="no_rhc"
        executor_type="none"
      />,
    );

    const tooltip = screen.getByTestId('tooltip');
    expect(tooltip).toHaveAttribute('data-position', 'left');
  });

  it('should render tooltip with correct position for RHC disconnected status', () => {
    render(
      <ConnectionStatusColumn
        connection_status="disconnected"
        executor_type="rhc"
      />,
    );

    const tooltip = screen.getByTestId('tooltip');
    expect(tooltip).toHaveAttribute('data-position', 'left');
  });

  it('should render tooltip with correct position for RHC-Satellite disconnected status', () => {
    render(
      <ConnectionStatusColumn
        connection_status="disconnected"
        executor_type="rhc-satellite"
      />,
    );

    const tooltip = screen.getByTestId('tooltip');
    expect(tooltip).toHaveAttribute('data-position', 'left');
  });

  it('should render tooltip without position for unknown status', () => {
    render(
      <ConnectionStatusColumn
        connection_status="unknown"
        executor_type="rhc"
      />,
    );

    const tooltip = screen.getByTestId('tooltip');
    expect(tooltip).not.toHaveAttribute('data-position');
  });

  it('should apply correct CSS classes to icons', () => {
    const { rerender } = render(
      <ConnectionStatusColumn
        connection_status="connected"
        executor_type="rhc"
      />,
    );

    expect(screen.getByTestId('connected-icon')).toHaveClass('pf-u-mr-xs');

    rerender(
      <ConnectionStatusColumn
        connection_status="disconnected"
        executor_type="rhc"
      />,
    );
    expect(screen.getByTestId('disconnected-icon')).toHaveClass('pf-u-mr-xs');

    rerender(
      <ConnectionStatusColumn
        connection_status="unknown"
        executor_type="rhc"
      />,
    );
    expect(screen.getByTestId('unknown-icon')).toHaveClass('pf-u-mr-xs');
  });

  it('should handle case variations in executor types', () => {
    const testCases = [
      { executor_type: 'rhc' },
      { executor_type: 'RHC' },
      { executor_type: 'Rhc' },
      { executor_type: 'rhc-satellite' },
      { executor_type: 'RHC-SATELLITE' },
      { executor_type: 'Rhc-Satellite' },
    ];

    testCases.forEach(({ executor_type }) => {
      const { unmount } = render(
        <ConnectionStatusColumn
          connection_status="disconnected"
          executor_type={executor_type}
        />,
      );

      expect(screen.getByTestId('disconnected-icon')).toBeInTheDocument();
      expect(screen.getAllByText('Disconnected')).toHaveLength(1);

      // Clean up for next iteration
      unmount();
    });
  });

  it('should handle mixed case connection status', () => {
    const testCases = [
      'Connected',
      'CONNECTED',
      'Disconnected',
      'DISCONNECTED',
    ];

    testCases.forEach((connection_status) => {
      const { unmount } = render(
        <ConnectionStatusColumn
          connection_status={connection_status}
          executor_type="rhc"
        />,
      );

      if (connection_status.toLowerCase() === 'connected') {
        expect(screen.getByTestId('connected-icon')).toBeInTheDocument();
        expect(screen.getByText('Connected')).toBeInTheDocument();
      } else {
        expect(screen.getByTestId('disconnected-icon')).toBeInTheDocument();
        expect(screen.getByText('Disconnected')).toBeInTheDocument();
      }

      unmount();
    });
  });

  it('should style paragraphs with maxWidth fit-content', () => {
    render(
      <ConnectionStatusColumn
        connection_status="disconnected"
        executor_type="none"
      />,
    );

    const paragraph = screen.getByText('Not configured');
    expect(paragraph).toHaveStyle({ maxWidth: 'fit-content' });
  });
});
