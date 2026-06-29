import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import LogCards from './LogCards';

describe('LogCards', () => {
  const defaultProps = {
    systemName: 'test-system.example.com',
    status: 'success',
    connectionType: 'rhc',
    executedBy: 'test-user@example.com',
  };

  it('renders all card labels and provided values', () => {
    render(<LogCards {...defaultProps} />);

    expect(screen.getByText('System')).toBeInTheDocument();
    expect(screen.getByText('test-system.example.com')).toBeInTheDocument();

    expect(screen.getByText('System execution status')).toBeInTheDocument();
    expect(screen.getByText('Success')).toBeInTheDocument();
    expect(screen.getByTestId('check-circle-icon')).toBeInTheDocument();

    expect(
      screen.getByText(/Red Hat Lightspeed connection type/),
    ).toBeInTheDocument();
    expect(screen.getByText('Rhc connected')).toBeInTheDocument();

    expect(screen.getByText('Executed by user')).toBeInTheDocument();
    expect(screen.getByText('test-user@example.com')).toBeInTheDocument();
  });

  it('renders dashes when no props are provided', () => {
    render(<LogCards />);

    expect(screen.getAllByText('-')).toHaveLength(4);
  });

  it('renders dashes when all props are null', () => {
    render(
      <LogCards
        systemName={null}
        status={null}
        connectionType={null}
        executedBy={null}
      />,
    );

    expect(screen.getAllByText('-')).toHaveLength(4);
  });

  describe('status display', () => {
    it.each([
      ['success', 'Success', 'check-circle-icon'],
      ['running', 'Running', 'in-progress-icon'],
      ['failure', 'Failure', 'exclamation-circle-icon'],
      ['canceled', 'Canceled', 'ban-icon'],
    ])('shows %s status with label and icon', (status, label, iconTestId) => {
      render(<LogCards {...defaultProps} status={status} />);

      expect(screen.getByText(label)).toBeInTheDocument();
      expect(screen.getByTestId(iconTestId)).toBeInTheDocument();
    });

    it('shows a fallback label for unknown status values', () => {
      render(<LogCards {...defaultProps} status="unknown" />);

      expect(screen.getByText('Unknown')).toBeInTheDocument();
    });

    it('capitalizes the first letter of the status label', () => {
      render(<LogCards {...defaultProps} status="pending" />);

      expect(screen.getByText('Pending')).toBeInTheDocument();
    });
  });

  describe('connection type display', () => {
    it('formats the connection type for display', () => {
      render(<LogCards {...defaultProps} connectionType="satellite" />);

      expect(screen.getByText('Satellite connected')).toBeInTheDocument();
    });

    it('shows a dash when connection type is missing', () => {
      render(<LogCards {...defaultProps} connectionType={null} />);

      expect(screen.queryByText('Rhc connected')).not.toBeInTheDocument();
      expect(screen.getAllByText('-').length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('executed by display', () => {
    it('shows the executing user', () => {
      render(<LogCards {...defaultProps} executedBy="admin@company.com" />);

      expect(screen.getByText('admin@company.com')).toBeInTheDocument();
    });

    it('shows a dash when executed by is missing', () => {
      render(<LogCards {...defaultProps} executedBy={null} />);

      expect(
        screen.queryByText('test-user@example.com'),
      ).not.toBeInTheDocument();
      expect(screen.getAllByText('-').length).toBeGreaterThanOrEqual(1);
    });
  });

  it('renders realistic production data', () => {
    render(
      <LogCards
        systemName="prod-web-server-01.company.com"
        status="success"
        connectionType="direct"
        executedBy="sysadmin@company.com"
      />,
    );

    expect(
      screen.getByText('prod-web-server-01.company.com'),
    ).toBeInTheDocument();
    expect(screen.getByText('Success')).toBeInTheDocument();
    expect(screen.getByText('Direct connected')).toBeInTheDocument();
    expect(screen.getByText('sysadmin@company.com')).toBeInTheDocument();
  });

  it('renders long and special-character values without crashing', () => {
    const longValue = 'a'.repeat(100);
    const specialChars = 'test-system_123@domain.com!@#$%^&*()';

    render(
      <LogCards
        systemName={longValue}
        status="success"
        connectionType="direct"
        executedBy={specialChars}
      />,
    );

    expect(screen.getByText(longValue)).toBeInTheDocument();
    expect(screen.getByText(specialChars)).toBeInTheDocument();
    expect(screen.getByText('Direct connected')).toBeInTheDocument();
    expect(screen.getByText('Success')).toBeInTheDocument();
  });
});
