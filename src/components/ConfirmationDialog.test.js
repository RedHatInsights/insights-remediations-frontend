/* eslint-disable react/prop-types */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ConfirmationDialog from './ConfirmationDialog';

// Mock PatternFly components
jest.mock('@patternfly/react-core', () => ({
  Button: function MockButton({
    children,
    variant,
    ouiaId,
    onClick,
    isDisabled,
    ...props
  }) {
    return (
      <button
        data-testid={`button-${ouiaId || variant}`}
        data-variant={variant}
        data-ouia-id={ouiaId}
        onClick={onClick}
        disabled={isDisabled}
        {...props}
      >
        {children}
      </button>
    );
  },
  Modal: function MockModal({
    title,
    className,
    variant,
    isOpen,
    onClose,
    isFooterLeftAligned,
    titleIconVariant,
    actions,
    children,
    ...props
  }) {
    if (!isOpen) return null;

    return (
      <div
        data-testid="modal"
        data-title={title}
        data-class-name={className}
        data-variant={variant}
        data-footer-left-aligned={isFooterLeftAligned}
        data-title-icon-variant={titleIconVariant}
        {...props}
      >
        <div data-testid="modal-title">{title}</div>
        <div data-testid="modal-content">{children}</div>
        <div data-testid="modal-actions">
          {actions?.map((action, index) => (
            <div key={index} data-testid={`action-${index}`}>
              {action}
            </div>
          ))}
        </div>
        <button data-testid="modal-close" onClick={onClose}>
          Close Modal
        </button>
      </div>
    );
  },
  ModalVariant: {
    small: 'small',
    medium: 'medium',
    large: 'large',
  },
}));

describe('ConfirmationDialog', () => {
  let mockOnClose;

  beforeEach(() => {
    mockOnClose = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Default rendering', () => {
    it('should render with default props', () => {
      render(<ConfirmationDialog onClose={mockOnClose} />);

      expect(screen.getByTestId('modal')).toBeInTheDocument();
      expect(screen.getByTestId('modal-title')).toHaveTextContent(
        'Remove system?',
      );
      expect(
        screen.getByText('This action cannot be undone'),
      ).toBeInTheDocument();
      expect(screen.getByTestId('button-confirm')).toHaveTextContent(
        'Remove system',
      );
      expect(screen.getByTestId('button-cancel')).toHaveTextContent('Cancel');
    });

    it('should render modal with correct props', () => {
      render(<ConfirmationDialog onClose={mockOnClose} />);

      const modal = screen.getByTestId('modal');
      expect(modal).toHaveAttribute('data-title', 'Remove system?');
      expect(modal).toHaveAttribute(
        'data-class-name',
        'remediations rem-c-dialog',
      );
      expect(modal).toHaveAttribute('data-variant', 'small');
      expect(modal).toHaveAttribute('data-footer-left-aligned', 'true');
      expect(modal).toHaveAttribute('data-title-icon-variant', 'warning');
    });

    it('should render confirm button with correct props', () => {
      render(<ConfirmationDialog onClose={mockOnClose} />);

      const confirmButton = screen.getByTestId('button-confirm');
      expect(confirmButton).toHaveAttribute('data-variant', 'danger');
      expect(confirmButton).toHaveAttribute('data-ouia-id', 'confirm');
    });

    it('should render cancel button with correct props', () => {
      render(<ConfirmationDialog onClose={mockOnClose} />);

      const cancelButton = screen.getByTestId('button-cancel');
      expect(cancelButton).toHaveAttribute('data-variant', 'link');
      expect(cancelButton).toHaveAttribute('data-ouia-id', 'cancel');
    });
  });

  describe('Custom props', () => {
    it('should render with custom title', () => {
      render(<ConfirmationDialog title="Custom Title" onClose={mockOnClose} />);

      expect(screen.getByTestId('modal-title')).toHaveTextContent(
        'Custom Title',
      );
    });

    it('should render with custom text', () => {
      render(
        <ConfirmationDialog text="Custom text content" onClose={mockOnClose} />,
      );

      expect(screen.getByText('Custom text content')).toBeInTheDocument();
    });

    it('should render with custom confirmText', () => {
      render(
        <ConfirmationDialog confirmText="Delete Now" onClose={mockOnClose} />,
      );

      expect(screen.getByTestId('button-confirm')).toHaveTextContent(
        'Delete Now',
      );
    });

    it('should handle isOpen=false', () => {
      render(<ConfirmationDialog isOpen={false} onClose={mockOnClose} />);

      expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
    });

    it('should handle isOpen=true explicitly', () => {
      render(<ConfirmationDialog isOpen={true} onClose={mockOnClose} />);

      expect(screen.getByTestId('modal')).toBeInTheDocument();
    });
  });

  describe('selectedItems prop', () => {
    it('should enable confirm button when selectedItems has items', () => {
      render(
        <ConfirmationDialog
          selectedItems={['item1', 'item2']}
          onClose={mockOnClose}
        />,
      );

      const confirmButton = screen.getByTestId('button-confirm');
      expect(confirmButton).toBeEnabled();
    });

    it('should disable confirm button when selectedItems is empty array', () => {
      render(<ConfirmationDialog selectedItems={[]} onClose={mockOnClose} />);

      const confirmButton = screen.getByTestId('button-confirm');
      expect(confirmButton).toBeDisabled();
    });

    it('should enable confirm button when selectedItems is undefined', () => {
      render(
        <ConfirmationDialog selectedItems={undefined} onClose={mockOnClose} />,
      );

      const confirmButton = screen.getByTestId('button-confirm');
      expect(confirmButton).toBeEnabled();
    });

    it('should enable confirm button when selectedItems is null', () => {
      render(<ConfirmationDialog selectedItems={null} onClose={mockOnClose} />);

      const confirmButton = screen.getByTestId('button-confirm');
      expect(confirmButton).toBeEnabled();
    });

    it('should handle selectedItems with single item', () => {
      render(
        <ConfirmationDialog
          selectedItems={['single-item']}
          onClose={mockOnClose}
        />,
      );

      const confirmButton = screen.getByTestId('button-confirm');
      expect(confirmButton).toBeEnabled();
    });

    it('should handle selectedItems with multiple items', () => {
      render(
        <ConfirmationDialog
          selectedItems={['item1', 'item2', 'item3']}
          onClose={mockOnClose}
        />,
      );

      const confirmButton = screen.getByTestId('button-confirm');
      expect(confirmButton).toBeEnabled();
    });
  });

  describe('Button interactions', () => {
    it('should call onClose(true) when confirm button is clicked', () => {
      render(
        <ConfirmationDialog selectedItems={['item1']} onClose={mockOnClose} />,
      );

      fireEvent.click(screen.getByTestId('button-confirm'));
      expect(mockOnClose).toHaveBeenCalledWith(true);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should call onClose(false) when cancel button is clicked', () => {
      render(<ConfirmationDialog onClose={mockOnClose} />);

      fireEvent.click(screen.getByTestId('button-cancel'));
      expect(mockOnClose).toHaveBeenCalledWith(false);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should call onClose(false) when modal close is triggered', () => {
      render(<ConfirmationDialog onClose={mockOnClose} />);

      fireEvent.click(screen.getByTestId('modal-close'));
      expect(mockOnClose).toHaveBeenCalledWith(false);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should not call onClose when confirm button is disabled and clicked', () => {
      render(<ConfirmationDialog selectedItems={[]} onClose={mockOnClose} />);

      const confirmButton = screen.getByTestId('button-confirm');
      expect(confirmButton).toBeDisabled();

      // Trying to click disabled button - should not call onClose
      fireEvent.click(confirmButton);
      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  describe('Default function prop', () => {
    it('should handle missing onClose prop gracefully', () => {
      // Should not throw error when onClose is not provided
      expect(() => {
        render(<ConfirmationDialog />);
      }).not.toThrow();

      expect(screen.getByTestId('modal')).toBeInTheDocument();
    });

    it('should call default function when onClose is not provided', () => {
      render(<ConfirmationDialog />);

      // Should not throw error when clicking buttons without onClose
      expect(() => {
        fireEvent.click(screen.getByTestId('button-cancel'));
        fireEvent.click(screen.getByTestId('button-confirm'));
      }).not.toThrow();
    });
  });

  describe('Edge cases', () => {
    it('should handle empty string title', () => {
      render(<ConfirmationDialog title="" onClose={mockOnClose} />);

      expect(screen.getByTestId('modal-title')).toHaveTextContent('');
    });

    it('should handle empty string text', () => {
      render(<ConfirmationDialog text="" onClose={mockOnClose} />);

      expect(
        screen.queryByText('This action cannot be undone'),
      ).not.toBeInTheDocument();
    });

    it('should handle empty string confirmText', () => {
      render(<ConfirmationDialog confirmText="" onClose={mockOnClose} />);

      expect(screen.getByTestId('button-confirm')).toHaveTextContent('');
    });

    it('should handle null props', () => {
      render(
        <ConfirmationDialog
          title={null}
          text={null}
          confirmText={null}
          onClose={mockOnClose}
        />,
      );

      expect(screen.getByTestId('modal-title')).toHaveTextContent('');
      expect(screen.getByTestId('button-confirm')).toHaveTextContent('');
    });

    it('should handle undefined props', () => {
      render(
        <ConfirmationDialog
          title={undefined}
          text={undefined}
          confirmText={undefined}
          onClose={mockOnClose}
        />,
      );

      // Should fall back to default values
      expect(screen.getByTestId('modal-title')).toHaveTextContent(
        'Remove system?',
      );
      expect(
        screen.getByText('This action cannot be undone'),
      ).toBeInTheDocument();
      expect(screen.getByTestId('button-confirm')).toHaveTextContent(
        'Remove system',
      );
    });

    it('should handle selectedItems with mixed data types', () => {
      render(
        <ConfirmationDialog
          selectedItems={['string', 123, null, undefined, {}]}
          onClose={mockOnClose}
        />,
      );

      const confirmButton = screen.getByTestId('button-confirm');
      expect(confirmButton).toBeEnabled();
    });

    it('should handle very long strings', () => {
      const longTitle = 'A'.repeat(1000);
      const longText = 'B'.repeat(1000);
      const longConfirmText = 'C'.repeat(100);

      render(
        <ConfirmationDialog
          title={longTitle}
          text={longText}
          confirmText={longConfirmText}
          onClose={mockOnClose}
        />,
      );

      expect(screen.getByTestId('modal-title')).toHaveTextContent(longTitle);
      expect(screen.getByText(longText)).toBeInTheDocument();
      expect(screen.getByTestId('button-confirm')).toHaveTextContent(
        longConfirmText,
      );
    });

    it('should handle special characters in props', () => {
      const specialTitle = '!@#$%^&*()_+-=[]{}|;":,.<>?';
      const specialText = '<script>alert("test")</script>';
      const specialConfirmText = '测试 🚀 Тест';

      render(
        <ConfirmationDialog
          title={specialTitle}
          text={specialText}
          confirmText={specialConfirmText}
          onClose={mockOnClose}
        />,
      );

      expect(screen.getByTestId('modal-title')).toHaveTextContent(specialTitle);
      expect(screen.getByText(specialText)).toBeInTheDocument();
      expect(screen.getByTestId('button-confirm')).toHaveTextContent(
        specialConfirmText,
      );
    });
  });

  describe('Component structure', () => {
    it('should render content in h2 tag', () => {
      render(<ConfirmationDialog text="Test content" onClose={mockOnClose} />);

      const heading = screen.getByRole('heading', { level: 2 });
      expect(heading).toHaveTextContent('Test content');
    });

    it('should render two action buttons', () => {
      render(<ConfirmationDialog onClose={mockOnClose} />);

      expect(screen.getByTestId('action-0')).toBeInTheDocument();
      expect(screen.getByTestId('action-1')).toBeInTheDocument();
    });

    it('should maintain consistent button order', () => {
      render(<ConfirmationDialog onClose={mockOnClose} />);

      const action0 = screen.getByTestId('action-0');
      const action1 = screen.getByTestId('action-1');

      // Confirm button should be first (action-0)
      expect(action0).toContainElement(screen.getByTestId('button-confirm'));
      // Cancel button should be second (action-1)
      expect(action1).toContainElement(screen.getByTestId('button-cancel'));
    });
  });

  describe('Multiple interactions', () => {
    it('should handle rapid successive clicks', () => {
      render(
        <ConfirmationDialog selectedItems={['item']} onClose={mockOnClose} />,
      );

      const confirmButton = screen.getByTestId('button-confirm');

      fireEvent.click(confirmButton);
      fireEvent.click(confirmButton);
      fireEvent.click(confirmButton);

      // Should call onClose multiple times
      expect(mockOnClose).toHaveBeenCalledTimes(3);
      expect(mockOnClose).toHaveBeenCalledWith(true);
    });

    it('should handle alternating button clicks', () => {
      render(
        <ConfirmationDialog selectedItems={['item']} onClose={mockOnClose} />,
      );

      fireEvent.click(screen.getByTestId('button-confirm'));
      fireEvent.click(screen.getByTestId('button-cancel'));
      fireEvent.click(screen.getByTestId('button-confirm'));

      expect(mockOnClose).toHaveBeenCalledTimes(3);
      expect(mockOnClose).toHaveBeenNthCalledWith(1, true);
      expect(mockOnClose).toHaveBeenNthCalledWith(2, false);
      expect(mockOnClose).toHaveBeenNthCalledWith(3, true);
    });
  });
});
