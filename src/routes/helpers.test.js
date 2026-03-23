/* eslint-disable react/prop-types */
/* eslint-disable react/display-name */
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import {
  getStatusMeta,
  StatusLabel,
  getStatusText,
  getStatusColor,
  renderConnectionStatus,
} from './helpers';

// Mock PatternFly components
jest.mock('@patternfly/react-core', () => ({
  Icon: (props) => <div data-testid="icon">{props.children}</div>,
  Label: (props) => (
    <span
      data-testid="label"
      data-color={props.color}
      data-status={props.status}
      data-compact={props.isCompact}
    >
      {props.icon}
      {props.children}
    </span>
  ),
  Text: (props) => <span data-testid="text">{props.children}</span>,
  TextContent: (props) => (
    <div data-testid="text-content">{props.children}</div>
  ),
  TextVariants: {
    p: (props) => <p>{props.children}</p>,
  },
}));

jest.mock('@patternfly/react-icons', () => ({
  CheckCircleIcon: () => <div data-testid="check-circle-icon">CheckCircle</div>,
  InProgressIcon: () => <div data-testid="in-progress-icon">InProgress</div>,
  ExclamationCircleIcon: () => (
    <div data-testid="exclamation-circle-icon">ExclamationCircle</div>
  ),
  BanIcon: () => <div data-testid="ban-icon">Ban</div>,
}));

jest.mock('@redhat-cloud-services/frontend-components/InsightsLink', () => {
  return (props) => (
    <a data-testid="insights-link" href={props.to}>
      {props.children}
    </a>
  );
});

describe('routes/helpers', () => {
  describe('getStatusMeta', () => {
    it('should return success meta for success status', () => {
      const result = getStatusMeta('success');

      expect(result).toEqual({
        text: 'Succeeded',
        color: 'green',
        status: 'success',
        Icon: expect.any(Function),
      });
    });

    it('should return success meta for SUCCESS (uppercase)', () => {
      const result = getStatusMeta('SUCCESS');

      expect(result).toEqual({
        text: 'Succeeded',
        color: 'green',
        status: 'success',
        Icon: expect.any(Function),
      });
    });

    it('should return running meta for running status', () => {
      const result = getStatusMeta('running');

      expect(result).toEqual({
        text: 'In progress',
        color: 'orange',
        status: 'info',
        Icon: expect.any(Function),
      });
    });

    it('should return running meta for RUNNING (uppercase)', () => {
      const result = getStatusMeta('RUNNING');

      expect(result).toEqual({
        text: 'In progress',
        color: 'orange',
        status: 'info',
        Icon: expect.any(Function),
      });
    });

    it('should return failure meta for failure status', () => {
      const result = getStatusMeta('failure');

      expect(result).toEqual({
        text: 'Failed',
        color: 'red',
        status: 'danger',
        Icon: expect.any(Function),
      });
    });

    it('should return failure meta for FAILURE (uppercase)', () => {
      const result = getStatusMeta('FAILURE');

      expect(result).toEqual({
        text: 'Failed',
        color: 'red',
        status: 'danger',
        Icon: expect.any(Function),
      });
    });

    it('should return canceled meta for canceled status', () => {
      const result = getStatusMeta('canceled');

      expect(result).toEqual({
        text: 'Canceled',
        color: 'red',
        Icon: expect.any(Function),
      });
    });

    it('should return canceled meta for CANCELED (uppercase)', () => {
      const result = getStatusMeta('CANCELED');

      expect(result).toEqual({
        text: 'Canceled',
        color: 'red',
        Icon: expect.any(Function),
      });
    });

    it('should return null for unknown status', () => {
      const result = getStatusMeta('unknown');
      expect(result).toBeNull();
    });

    it('should return null for empty string', () => {
      const result = getStatusMeta('');
      expect(result).toBeNull();
    });

    it('should return null for undefined status', () => {
      const result = getStatusMeta(undefined);
      expect(result).toBeNull();
    });

    it('should return null for null status', () => {
      // Now handles null gracefully
      const result = getStatusMeta(null);
      expect(result).toBeNull();
    });

    it('should handle mixed case status', () => {
      const result = getStatusMeta('Success');

      expect(result).toEqual({
        text: 'Succeeded',
        color: 'green',
        status: 'success',
        Icon: expect.any(Function),
      });
    });
  });

  describe('StatusLabel', () => {
    it('should render success status label', () => {
      render(<StatusLabel status="success" />);

      const label = screen.getByTestId('label');
      expect(label).toBeInTheDocument();
      expect(label).toHaveAttribute('data-color', 'green');
      expect(label).toHaveAttribute('data-compact', 'true');
      expect(screen.getByTestId('check-circle-icon')).toBeInTheDocument();
      expect(label).toHaveTextContent('Succeeded');
    });

    it('should render running status label', () => {
      render(<StatusLabel status="running" />);

      const label = screen.getByTestId('label');
      expect(label).toHaveAttribute('data-color', 'orange');
      expect(screen.getByTestId('in-progress-icon')).toBeInTheDocument();
      expect(label).toHaveTextContent('In progress');
    });

    it('should render failure status label', () => {
      render(<StatusLabel status="failure" />);

      const label = screen.getByTestId('label');
      expect(label).toHaveAttribute('data-color', 'red');
      expect(screen.getByTestId('exclamation-circle-icon')).toBeInTheDocument();
      expect(label).toHaveTextContent('Failed');
    });

    it('should render canceled status label', () => {
      render(<StatusLabel status="canceled" />);

      const label = screen.getByTestId('label');
      expect(label).toHaveAttribute('data-color', 'red');
      expect(screen.getByTestId('ban-icon')).toBeInTheDocument();
      expect(label).toHaveTextContent('Canceled');
    });

    it('should render nothing for unknown status', () => {
      const { container } = render(<StatusLabel status="unknown" />);
      expect(container).toBeEmptyDOMElement();
    });

    it('should render nothing for empty status', () => {
      const { container } = render(<StatusLabel status="" />);
      expect(container).toBeEmptyDOMElement();
    });

    it('should render nothing for undefined status', () => {
      const { container } = render(<StatusLabel status={undefined} />);
      expect(container).toBeEmptyDOMElement();
    });

    it('should render nothing for null status', () => {
      // Now handles null gracefully
      const { container } = render(<StatusLabel status={null} />);
      expect(container).toBeEmptyDOMElement();
    });

    it('should handle uppercase status', () => {
      render(<StatusLabel status="SUCCESS" />);

      const label = screen.getByTestId('label');
      expect(label).toHaveAttribute('data-color', 'green');
      expect(label).toHaveTextContent('Succeeded');
    });

    it('should handle mixed case status', () => {
      render(<StatusLabel status="Running" />);

      const label = screen.getByTestId('label');
      expect(label).toHaveAttribute('data-color', 'orange');
      expect(label).toHaveTextContent('In progress');
    });

    it('should use default empty string when no status provided', () => {
      const { container } = render(<StatusLabel />);
      expect(container).toBeEmptyDOMElement();
    });
  });

  // Test other exported functions if they exist
  describe('additional helper functions', () => {
    it('should handle getStatusText if it exists', () => {
      if (typeof getStatusText === 'function') {
        expect(getStatusText('success')).toBe('Succeeded');
        expect(getStatusText('running')).toBe('In progress');
        expect(getStatusText('failure')).toBe('Failed');
        expect(getStatusText('canceled')).toBe('Canceled');
        expect(getStatusText('unknown')).toBeNull();
      }
    });

    it('should handle getStatusColor if it exists', () => {
      if (typeof getStatusColor === 'function') {
        expect(getStatusColor('success')).toBe('green');
        expect(getStatusColor('running')).toBe('gold');
        expect(getStatusColor('failure')).toBe('red');
        expect(getStatusColor('canceled')).toBe('red');
        expect(getStatusColor('unknown')).toBeNull();
      }
    });
  });

  describe('edge cases', () => {
    it('should handle extremely long status strings', () => {
      const longStatus = 'a'.repeat(1000);
      const result = getStatusMeta(longStatus);
      expect(result).toBeNull();
    });

    it('should handle special characters in status', () => {
      const result = getStatusMeta('success!@#$%');
      expect(result).toBeNull();
    });

    it('should handle numeric status', () => {
      const result = getStatusMeta('123');
      expect(result).toBeNull();
    });

    it('should handle status with whitespace', () => {
      const result = getStatusMeta(' success ');
      expect(result).toBeNull(); // Should not match due to whitespace
    });

    it('should handle status with newlines', () => {
      const result = getStatusMeta('success\n');
      expect(result).toBeNull();
    });
  });

  describe('STATUS_META object structure', () => {
    it('should have all required properties for each status', () => {
      const statuses = ['success', 'running', 'failure', 'canceled'];

      statuses.forEach((status) => {
        const meta = getStatusMeta(status);
        expect(meta).toHaveProperty('text');
        expect(meta).toHaveProperty('color');
        expect(meta).toHaveProperty('Icon');
        expect(typeof meta.text).toBe('string');
        expect(typeof meta.color).toBe('string');
        expect(typeof meta.Icon).toBe('function');

        // Only success, failure, and running should have status property
        if (
          status === 'success' ||
          status === 'failure' ||
          status === 'running'
        ) {
          expect(meta).toHaveProperty('status');
          expect(typeof meta.status).toBe('string');
        } else {
          expect(meta).not.toHaveProperty('status');
        }
      });
    });

    it('should have correct icon components', () => {
      const successMeta = getStatusMeta('success');
      const runningMeta = getStatusMeta('running');
      const failureMeta = getStatusMeta('failure');
      const canceledMeta = getStatusMeta('canceled');

      // Test that icons can be rendered
      render(<successMeta.Icon />);
      expect(screen.getByTestId('check-circle-icon')).toBeInTheDocument();

      render(<runningMeta.Icon />);
      expect(screen.getByTestId('in-progress-icon')).toBeInTheDocument();

      render(<failureMeta.Icon />);
      expect(screen.getByTestId('exclamation-circle-icon')).toBeInTheDocument();

      render(<canceledMeta.Icon />);
      expect(screen.getByTestId('ban-icon')).toBeInTheDocument();
    });
  });

  describe('renderConnectionStatus', () => {
    it('should render connected status correctly', () => {
      const view = renderConnectionStatus('connected');
      const { container } = render(view);

      expect(container).toHaveTextContent('Ready');
      expect(screen.getByTestId('icon')).toBeInTheDocument();
    });

    it('should render disconnected status correctly', () => {
      const view = renderConnectionStatus('disconnected');
      const { container } = render(view);

      expect(container).toHaveTextContent(
        'Connection issue ‒ RHC not responding',
      );
      expect(screen.getByTestId('text')).toBeInTheDocument();
    });

    it('should render no_executor status correctly', () => {
      const view = renderConnectionStatus('no_executor');
      const { container } = render(view);

      expect(container).toHaveTextContent(
        'Cannot remediate ‒ direct connection',
      );
      expect(container).toHaveTextContent(
        'Connect your systems to Satellite to automatically remediate.',
      );
      expect(screen.getByTestId('text-content')).toBeInTheDocument();
    });

    it('should render no_source status correctly', () => {
      const view = renderConnectionStatus('no_source');
      const { container } = render(view);

      expect(container).toHaveTextContent(
        'Cannot remediate ‒ Satellite not configured',
      );
      expect(screen.getByTestId('text')).toBeInTheDocument();
    });

    it('should render no_receptor status correctly', () => {
      const view = renderConnectionStatus('no_receptor');
      const { container } = render(view);

      expect(container).toHaveTextContent(
        'Cannot remediate ‒ Cloud Connector not defined',
      );
      expect(container).toHaveTextContent(
        'Configure Cloud Connector to automatically remediate.',
      );
      expect(screen.getByTestId('text-content')).toBeInTheDocument();
    });

    it('should render no_rhc status correctly', () => {
      const view = renderConnectionStatus('no_rhc');
      const { container } = render(view);

      expect(container).toHaveTextContent(
        'Cannot remediate ‒ Cloud Connector not defined',
      );
      expect(container).toHaveTextContent(
        'Remediation from Red Hat Lightspeed requires Cloud Connector',
      );
      expect(container).toHaveTextContent('RHC');
      expect(screen.getByTestId('text-content')).toBeInTheDocument();
      expect(screen.getByTestId('insights-link')).toBeInTheDocument();
    });

    it('should render loading status correctly', () => {
      const view = renderConnectionStatus('loading');
      const { container } = render(view);

      expect(container).toHaveTextContent('Checking …');
      expect(screen.getByTestId('text')).toBeInTheDocument();
    });

    it('should render default status correctly for unknown status', () => {
      const view = renderConnectionStatus('unknown_status');
      const { container } = render(view);

      expect(container).toHaveTextContent('Not available');
      expect(screen.getByTestId('text')).toBeInTheDocument();
    });

    it('should render default status correctly for null', () => {
      const view = renderConnectionStatus(null);
      const { container } = render(view);

      expect(container).toHaveTextContent('Not available');
      expect(screen.getByTestId('text')).toBeInTheDocument();
    });

    it('should render default status correctly for undefined', () => {
      const view = renderConnectionStatus(undefined);
      const { container } = render(view);

      expect(container).toHaveTextContent('Not available');
      expect(screen.getByTestId('text')).toBeInTheDocument();
    });

    it('should render default status correctly for empty string', () => {
      const view = renderConnectionStatus('');
      const { container } = render(view);

      expect(container).toHaveTextContent('Not available');
      expect(screen.getByTestId('text')).toBeInTheDocument();
    });

    it('should handle case sensitivity', () => {
      const view = renderConnectionStatus('CONNECTED');
      const { container } = render(view);

      // Should fall through to default case since it's case sensitive
      expect(container).toHaveTextContent('Not available');
    });

    it('should render all status types consistently', () => {
      const statuses = [
        'connected',
        'disconnected',
        'no_executor',
        'no_source',
        'no_receptor',
        'no_rhc',
        'loading',
      ];

      statuses.forEach((status) => {
        const view = renderConnectionStatus(status);
        expect(React.isValidElement(view)).toBe(true);
      });
    });
  });
});
