import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import IssuesColumn from './IssuesColumn';

// Mock SystemIssuesModal
/* eslint-disable react/prop-types */
jest.mock('./SystemIssuesModal/SystemIssuesModal', () => {
  return function MockSystemIssuesModal({
    isOpen,
    onClose,
    systemName,
    remediationId,
    systemId,
  }) {
    if (!isOpen) return null;
    return (
      <div data-testid="system-issues-modal">
        <div data-testid="modal-system-name">{systemName}</div>
        <div data-testid="modal-remediation-id">{remediationId}</div>
        <div data-testid="modal-system-id">{systemId}</div>
        <button data-testid="modal-close" onClick={onClose}>
          Close
        </button>
      </div>
    );
  };
});

describe('IssuesColumn', () => {
  describe('when issues is a number', () => {
    it('should render button with correct text for multiple issues', () => {
      const props = {
        issues: 3,
        display_name: 'Test System',
        systemId: 'system-123',
        remediationId: 'rem-456',
      };

      render(<IssuesColumn {...props} />);

      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent('3 actions');
    });

    it('should render button with singular text for single issue', () => {
      const props = {
        issues: 1,
        display_name: 'Test System',
        systemId: 'system-123',
        remediationId: 'rem-456',
      };

      render(<IssuesColumn {...props} />);

      const button = screen.getByRole('button');
      expect(button).toHaveTextContent('1 action');
    });

    it('should open modal when button is clicked', () => {
      const props = {
        issues: 5,
        display_name: 'Test System',
        systemId: 'system-123',
        remediationId: 'rem-456',
      };

      render(<IssuesColumn {...props} />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      const modal = screen.getByTestId('system-issues-modal');
      expect(modal).toBeInTheDocument();
      expect(screen.getByTestId('modal-system-name')).toHaveTextContent(
        'Test System',
      );
      expect(screen.getByTestId('modal-remediation-id')).toHaveTextContent(
        'rem-456',
      );
      expect(screen.getByTestId('modal-system-id')).toHaveTextContent(
        'system-123',
      );
    });

    it('should close modal when close button is clicked', () => {
      const props = {
        issues: 2,
        display_name: 'Test System',
        systemId: 'system-123',
        remediationId: 'rem-456',
      };

      render(<IssuesColumn {...props} />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(screen.getByTestId('system-issues-modal')).toBeInTheDocument();

      const closeButton = screen.getByTestId('modal-close');
      fireEvent.click(closeButton);

      expect(
        screen.queryByTestId('system-issues-modal'),
      ).not.toBeInTheDocument();
    });

    it('should handle zero issues', () => {
      const props = {
        issues: 0,
        display_name: 'Test System',
        systemId: 'system-123',
        remediationId: 'rem-456',
      };

      render(<IssuesColumn {...props} />);

      const button = screen.getByRole('button');
      expect(button).toHaveTextContent('0 actions');
    });
  });

  describe('when issues is an array', () => {
    it('should render span with correct text for multiple issues', () => {
      const props = {
        issues: [{ id: '1' }, { id: '2' }, { id: '3' }],
      };

      render(<IssuesColumn {...props} />);

      expect(screen.getByText('3 actions')).toBeInTheDocument();
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('should render span with singular text for single issue', () => {
      const props = {
        issues: [{ id: '1' }],
      };

      render(<IssuesColumn {...props} />);

      expect(screen.getByText('1 action')).toBeInTheDocument();
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('should render span for empty array', () => {
      const props = {
        issues: [],
      };

      render(<IssuesColumn {...props} />);

      expect(screen.getByText('0 action')).toBeInTheDocument(); // 0 is singular
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });
  });

  describe('edge cases', () => {
    it('should handle undefined display_name', () => {
      const props = {
        issues: 2,
        systemId: 'system-123',
        remediationId: 'rem-456',
      };

      render(<IssuesColumn {...props} />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      const modal = screen.getByTestId('system-issues-modal');
      expect(modal).toBeInTheDocument();
    });

    it('should maintain modal state correctly through multiple open/close cycles', () => {
      const props = {
        issues: 2,
        display_name: 'Test System',
        systemId: 'system-123',
        remediationId: 'rem-456',
      };

      render(<IssuesColumn {...props} />);

      const button = screen.getByRole('button');

      // Open modal
      fireEvent.click(button);
      expect(screen.getByTestId('system-issues-modal')).toBeInTheDocument();

      // Close modal
      fireEvent.click(screen.getByTestId('modal-close'));
      expect(
        screen.queryByTestId('system-issues-modal'),
      ).not.toBeInTheDocument();

      // Open modal again
      fireEvent.click(button);
      expect(screen.getByTestId('system-issues-modal')).toBeInTheDocument();
    });
  });
});
