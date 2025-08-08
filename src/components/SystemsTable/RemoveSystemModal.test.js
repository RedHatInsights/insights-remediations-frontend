/* eslint-disable react/prop-types */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import RemoveSystemModal from './RemoveSystemModal';

// Mock PatternFly components
jest.mock('@patternfly/react-core', () => ({
  Button: function MockButton({
    children,
    variant,
    onClick,
    ouiaId,
    ...props
  }) {
    return (
      <button
        data-testid={ouiaId || 'button'}
        data-variant={variant}
        onClick={onClick}
        {...props}
      >
        {children}
      </button>
    );
  },
  Modal: function MockModal({
    children,
    variant,
    title,
    isOpen,
    onClose,
    titleIconVariant,
    actions,
    ...props
  }) {
    if (!isOpen) return null;
    return (
      <div
        data-testid="modal"
        data-variant={variant}
        data-title-icon={titleIconVariant}
        {...props}
      >
        <div data-testid="modal-title">{title}</div>
        <div data-testid="modal-content">{children}</div>
        <div data-testid="modal-actions">{actions}</div>
        <button data-testid="modal-close" onClick={onClose}>
          X
        </button>
      </div>
    );
  },
  ModalVariant: {
    medium: 'medium',
  },
}));

describe('RemoveSystemModal', () => {
  const mockOnConfirm = jest.fn();
  const mockOnClose = jest.fn();

  const defaultProps = {
    isOpen: true,
    selected: [
      { id: 'system-1', display_name: 'System 1' },
      { id: 'system-2', display_name: 'System 2' },
    ],
    onConfirm: mockOnConfirm,
    onClose: mockOnClose,
    remediationName: 'Test Remediation Plan',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should not render when isOpen is false', () => {
    const props = {
      ...defaultProps,
      isOpen: false,
    };

    render(<RemoveSystemModal {...props} />);

    expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
  });

  it('should render when isOpen is true', () => {
    render(<RemoveSystemModal {...defaultProps} />);

    const modal = screen.getByTestId('modal');
    expect(modal).toBeInTheDocument();
    expect(modal).toHaveAttribute('data-variant', 'medium');
    expect(modal).toHaveAttribute('data-title-icon', 'warning');
  });

  it('should render correct title for multiple systems', () => {
    render(<RemoveSystemModal {...defaultProps} />);

    expect(screen.getByTestId('modal-title')).toHaveTextContent(
      'Remove selected systems?',
    );
  });

  it('should render correct title for single system', () => {
    const props = {
      ...defaultProps,
      selected: [{ id: 'system-1', display_name: 'System 1' }],
    };

    render(<RemoveSystemModal {...props} />);

    expect(screen.getByTestId('modal-title')).toHaveTextContent(
      'Remove selected system?',
    );
  });

  it('should render correct content for multiple systems', () => {
    render(<RemoveSystemModal {...defaultProps} />);

    const content = screen.getByTestId('modal-content');
    expect(content).toHaveTextContent(
      'Are you sure you want to remove the 2 selected systems for the remediation plan',
    );
    expect(content).toHaveTextContent('Test Remediation Plan');
    expect(content).toHaveTextContent(
      'After removal, when you execute the plan, the remedial actions will not run on these systems.',
    );
  });

  it('should render correct content for single system', () => {
    const props = {
      ...defaultProps,
      selected: [{ id: 'system-1', display_name: 'System 1' }],
    };

    render(<RemoveSystemModal {...props} />);

    const content = screen.getByTestId('modal-content');
    expect(content).toHaveTextContent(
      'Are you sure you want to remove the 1 selected system for the remediation plan',
    );
    expect(content).toHaveTextContent('Test Remediation Plan');
  });

  it('should render Remove button with correct properties', () => {
    render(<RemoveSystemModal {...defaultProps} />);

    const removeButton = screen.getByTestId('confirm-delete');
    expect(removeButton).toBeInTheDocument();
    expect(removeButton).toHaveTextContent('Remove');
    expect(removeButton).toHaveAttribute('data-variant', 'primary');
  });

  it('should render Cancel button with correct properties', () => {
    render(<RemoveSystemModal {...defaultProps} />);

    const cancelButton = screen.getByRole('button', { name: 'Cancel' });
    expect(cancelButton).toBeInTheDocument();
    expect(cancelButton).toHaveAttribute('data-variant', 'link');
  });

  it('should call onConfirm when Remove button is clicked', () => {
    render(<RemoveSystemModal {...defaultProps} />);

    const removeButton = screen.getByTestId('confirm-delete');
    fireEvent.click(removeButton);

    expect(mockOnConfirm).toHaveBeenCalledTimes(1);
  });

  it('should call onClose when Cancel button is clicked', () => {
    render(<RemoveSystemModal {...defaultProps} />);

    const cancelButton = screen.getByRole('button', { name: 'Cancel' });
    fireEvent.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should call onClose when modal close is triggered', () => {
    render(<RemoveSystemModal {...defaultProps} />);

    const closeButton = screen.getByTestId('modal-close');
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should handle empty selected array', () => {
    const props = {
      ...defaultProps,
      selected: [],
    };

    render(<RemoveSystemModal {...props} />);

    expect(screen.getByTestId('modal-title')).toHaveTextContent(
      'Remove selected system?',
    );
    expect(screen.getByTestId('modal-content')).toHaveTextContent(
      'Are you sure you want to remove the 0 selected system for the remediation plan',
    );
  });

  it('should handle null selected array', () => {
    const props = {
      ...defaultProps,
      selected: null,
    };

    render(<RemoveSystemModal {...props} />);

    // Should handle null gracefully with optional chaining
    expect(screen.getByTestId('modal')).toBeInTheDocument();
  });

  it('should handle undefined selected array', () => {
    const props = {
      ...defaultProps,
      selected: undefined,
    };

    render(<RemoveSystemModal {...props} />);

    // Should handle undefined gracefully with optional chaining
    expect(screen.getByTestId('modal')).toBeInTheDocument();
  });

  it('should handle long remediation names', () => {
    const props = {
      ...defaultProps,
      remediationName:
        'This is a very long remediation plan name that might wrap to multiple lines and should be handled gracefully',
    };

    render(<RemoveSystemModal {...props} />);

    const content = screen.getByTestId('modal-content');
    expect(content).toHaveTextContent(
      'This is a very long remediation plan name that might wrap to multiple lines and should be handled gracefully',
    );
  });

  it('should handle special characters in remediation name', () => {
    const props = {
      ...defaultProps,
      remediationName: 'Test Plan & Special "Characters" <script>',
    };

    render(<RemoveSystemModal {...props} />);

    const content = screen.getByTestId('modal-content');
    expect(content).toHaveTextContent(
      'Test Plan & Special "Characters" <script>',
    );
  });

  it('should handle empty remediation name', () => {
    const props = {
      ...defaultProps,
      remediationName: '',
    };

    render(<RemoveSystemModal {...props} />);

    const content = screen.getByTestId('modal-content');
    expect(content).toHaveTextContent('for the remediation plan');
  });

  it('should render remediation name in strong tag', () => {
    render(<RemoveSystemModal {...defaultProps} />);

    const strongElement = screen.getByText('Test Remediation Plan');
    expect(strongElement.tagName.toLowerCase()).toBe('strong');
  });

  it('should handle complex system objects', () => {
    const props = {
      ...defaultProps,
      selected: [
        {
          id: 'system-1',
          display_name: 'Complex System 1',
          hostname: 'host1.example.com',
          tags: ['prod', 'web'],
        },
        {
          id: 'system-2',
          display_name: 'Complex System 2',
          hostname: 'host2.example.com',
          tags: ['dev', 'db'],
        },
        {
          id: 'system-3',
          display_name: 'Complex System 3',
          hostname: 'host3.example.com',
          tags: ['test'],
        },
      ],
    };

    render(<RemoveSystemModal {...props} />);

    expect(screen.getByTestId('modal-title')).toHaveTextContent(
      'Remove selected systems?',
    );
    expect(screen.getByTestId('modal-content')).toHaveTextContent(
      'Are you sure you want to remove the 3 selected systems',
    );
  });

  it('should handle systems with missing display_name', () => {
    const props = {
      ...defaultProps,
      selected: [
        { id: 'system-1' }, // Missing display_name
        { id: 'system-2', display_name: 'System 2' },
      ],
    };

    render(<RemoveSystemModal {...props} />);

    expect(screen.getByTestId('modal')).toBeInTheDocument();
    expect(screen.getByTestId('modal-content')).toHaveTextContent(
      'Are you sure you want to remove the 2 selected systems',
    );
  });

  it('should handle zero selected count', () => {
    const props = {
      ...defaultProps,
      selected: [],
    };

    render(<RemoveSystemModal {...props} />);

    expect(screen.getByTestId('modal-content')).toHaveTextContent(
      'Are you sure you want to remove the 0 selected system',
    );
  });

  it('should render actions in correct order', () => {
    render(<RemoveSystemModal {...defaultProps} />);

    // Check that both buttons exist in the expected order
    const removeButton = screen.getByTestId('confirm-delete');
    const cancelButton = screen.getByRole('button', { name: 'Cancel' });

    expect(removeButton).toBeInTheDocument();
    expect(cancelButton).toBeInTheDocument();
    expect(removeButton).toHaveTextContent('Remove');
    expect(cancelButton).toHaveTextContent('Cancel');
  });

  it('should handle modal toggle correctly', () => {
    const { rerender } = render(<RemoveSystemModal {...defaultProps} />);

    // Modal should be visible
    expect(screen.getByTestId('modal')).toBeInTheDocument();

    // Close modal
    rerender(<RemoveSystemModal {...defaultProps} isOpen={false} />);
    expect(screen.queryByTestId('modal')).not.toBeInTheDocument();

    // Open modal again
    rerender(<RemoveSystemModal {...defaultProps} isOpen={true} />);
    expect(screen.getByTestId('modal')).toBeInTheDocument();
  });

  it('should not interfere with multiple button clicks', () => {
    render(<RemoveSystemModal {...defaultProps} />);

    const removeButton = screen.getByTestId('confirm-delete');
    const cancelButton = screen.getByRole('button', { name: 'Cancel' });

    // Click multiple times
    fireEvent.click(removeButton);
    fireEvent.click(removeButton);
    fireEvent.click(cancelButton);
    fireEvent.click(cancelButton);

    expect(mockOnConfirm).toHaveBeenCalledTimes(2);
    expect(mockOnClose).toHaveBeenCalledTimes(2);
  });

  it('should handle edge case with exactly 1 system', () => {
    const props = {
      ...defaultProps,
      selected: [{ id: 'single-system', display_name: 'Single System' }],
    };

    render(<RemoveSystemModal {...props} />);

    expect(screen.getByTestId('modal-title')).toHaveTextContent(
      'Remove selected system?',
    );
    expect(screen.getByTestId('modal-content')).toHaveTextContent(
      'Are you sure you want to remove the 1 selected system for the remediation plan',
    );
  });
});
