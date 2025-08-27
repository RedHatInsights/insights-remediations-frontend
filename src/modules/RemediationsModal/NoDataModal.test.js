/* eslint-disable react/prop-types */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import NoDataModal, { NoDataModal as NamedExport } from './NoDataModal';

// Mock useFeatureFlag
jest.mock('../../Utilities/Hooks/useFeatureFlag', () => ({
  useFeatureFlag: jest.fn(),
}));

// Mock PatternFly components
jest.mock('@patternfly/react-core', () => ({
  Button: function MockButton({ children, variant, onClick, ...props }) {
    return (
      <button
        data-testid="modal-button"
        data-variant={variant}
        onClick={onClick}
        {...props}
      >
        {children}
      </button>
    );
  },
  Modal: function MockModal({
    variant,
    title,
    isOpen,
    onClose,
    actions,
    children,
    ...props
  }) {
    if (!isOpen) return null;

    return (
      <div
        data-testid="modal"
        data-variant={variant}
        data-title={title}
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

const { useFeatureFlag } = require('../../Utilities/Hooks/useFeatureFlag');

describe('NoDataModal', () => {
  beforeEach(() => {
    // Default to feature flag disabled
    useFeatureFlag.mockReturnValue(false);
  });
  let mockSetOpen;

  beforeEach(() => {
    mockSetOpen = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Default export', () => {
    it('should render when isOpen is true', () => {
      render(<NoDataModal isOpen={true} setOpen={mockSetOpen} />);

      expect(screen.getByTestId('modal')).toBeInTheDocument();
      expect(screen.getByText('Remediate with Ansible')).toBeInTheDocument();
    });

    it('should not render when isOpen is false', () => {
      render(<NoDataModal isOpen={false} setOpen={mockSetOpen} />);

      expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
    });

    it('should render modal with correct props', () => {
      render(<NoDataModal isOpen={true} setOpen={mockSetOpen} />);

      const modal = screen.getByTestId('modal');
      expect(modal).toBeInTheDocument();

      // Check that the modal contains the expected content
      expect(screen.getByText('Remediate with Ansible')).toBeInTheDocument();
      expect(screen.getByTestId('modal-content')).toBeInTheDocument();
    });

    it('should render default text when patchNoAdvisoryText is not provided', () => {
      render(<NoDataModal isOpen={true} setOpen={mockSetOpen} />);

      expect(
        screen.getByText(
          /None of the selected issues can be remediated with Ansible/,
        ),
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          /To remediate these issues, review the manual remediation steps/,
        ),
      ).toBeInTheDocument();
    });

    it('should render custom text when patchNoAdvisoryText is provided', () => {
      const customText = 'Custom advisory text for this modal';
      render(
        <NoDataModal
          isOpen={true}
          setOpen={mockSetOpen}
          patchNoAdvisoryText={customText}
        />,
      );

      expect(screen.getByText(customText)).toBeInTheDocument();
      expect(
        screen.queryByText(
          'None of the selected issues can be remediated with Ansible.',
        ),
      ).not.toBeInTheDocument();
    });

    it('should render action button with correct props', () => {
      render(<NoDataModal isOpen={true} setOpen={mockSetOpen} />);

      const button = screen.getByTestId('action-0');
      expect(button).toHaveTextContent('Back to Insights');
      expect(button).toHaveAttribute('data-variant', 'primary');
    });

    it('should call setOpen(false) when button is clicked', () => {
      render(<NoDataModal isOpen={true} setOpen={mockSetOpen} />);

      fireEvent.click(screen.getByTestId('action-0'));
      expect(mockSetOpen).toHaveBeenCalledWith(false);
      expect(mockSetOpen).toHaveBeenCalledTimes(1);
    });

    it('should call setOpen(false) when modal is closed', () => {
      render(<NoDataModal isOpen={true} setOpen={mockSetOpen} />);

      fireEvent.click(screen.getByLabelText('Close'));
      expect(mockSetOpen).toHaveBeenCalledWith(false);
      expect(mockSetOpen).toHaveBeenCalledTimes(1);
    });
  });

  describe('Named export', () => {
    it('should be the same as default export', () => {
      expect(NamedExport).toBe(NoDataModal);
    });

    it('should work with named export', () => {
      render(<NamedExport isOpen={true} setOpen={mockSetOpen} />);

      expect(screen.getByTestId('modal')).toBeInTheDocument();
      expect(screen.getByText('Remediate with Ansible')).toBeInTheDocument();
    });
  });

  describe('Edge cases', () => {
    it('should handle undefined props gracefully', () => {
      expect(() => {
        render(<NoDataModal />);
      }).not.toThrow();

      expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
    });

    it('should handle null props gracefully', () => {
      render(
        <NoDataModal isOpen={null} setOpen={null} patchNoAdvisoryText={null} />,
      );

      expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
    });

    it('should handle empty string patchNoAdvisoryText (shows default text)', () => {
      render(
        <NoDataModal
          isOpen={true}
          setOpen={mockSetOpen}
          patchNoAdvisoryText=""
        />,
      );

      // Empty string is falsy, so it shows default text
      expect(
        screen.getByText(
          /None of the selected issues can be remediated with Ansible/,
        ),
      ).toBeInTheDocument();
    });

    it('should handle very long patchNoAdvisoryText', () => {
      const longText = 'A'.repeat(1000);
      render(
        <NoDataModal
          isOpen={true}
          setOpen={mockSetOpen}
          patchNoAdvisoryText={longText}
        />,
      );

      expect(screen.getByText(longText)).toBeInTheDocument();
    });

    it('should handle special characters in patchNoAdvisoryText', () => {
      const specialText =
        '<script>alert("test")</script> & special chars: 测试 🚀';
      render(
        <NoDataModal
          isOpen={true}
          setOpen={mockSetOpen}
          patchNoAdvisoryText={specialText}
        />,
      );

      expect(screen.getByText(specialText)).toBeInTheDocument();
    });

    it('should handle rapid successive button clicks', () => {
      render(<NoDataModal isOpen={true} setOpen={mockSetOpen} />);

      const button = screen.getByTestId('action-0');
      fireEvent.click(button);
      fireEvent.click(button);
      fireEvent.click(button);

      expect(mockSetOpen).toHaveBeenCalledTimes(3);
      expect(mockSetOpen).toHaveBeenCalledWith(false);
    });

    it('should handle both close methods', () => {
      render(<NoDataModal isOpen={true} setOpen={mockSetOpen} />);

      // Click button first
      fireEvent.click(screen.getByTestId('action-0'));
      expect(mockSetOpen).toHaveBeenCalledWith(false);

      // Then click modal close
      fireEvent.click(screen.getByLabelText('Close'));
      expect(mockSetOpen).toHaveBeenCalledTimes(2);
      expect(mockSetOpen).toHaveBeenNthCalledWith(2, false);
    });
  });

  describe('Component structure', () => {
    it('should render one action button', () => {
      render(<NoDataModal isOpen={true} setOpen={mockSetOpen} />);

      expect(screen.getByTestId('action-0')).toBeInTheDocument();
      expect(screen.queryByTestId('action-1')).not.toBeInTheDocument();
    });

    it('should render action button inside actions container', () => {
      render(<NoDataModal isOpen={true} setOpen={mockSetOpen} />);

      const actionButton = screen.getByTestId('action-0');
      expect(actionButton).toBeInTheDocument();
      expect(actionButton).toHaveTextContent('Back to Insights');
    });

    it('should render content in correct container', () => {
      render(<NoDataModal isOpen={true} setOpen={mockSetOpen} />);

      const contentContainer = screen.getByTestId('modal-content');
      expect(contentContainer).toContainElement(
        screen.getByText(
          /None of the selected issues can be remediated with Ansible/,
        ),
      );
    });
  });

  describe('PropTypes validation', () => {
    it('should have correct propTypes defined', () => {
      expect(NoDataModal.propTypes).toBeDefined();
      expect(NoDataModal.propTypes.isOpen).toBeDefined();
      expect(NoDataModal.propTypes.setOpen).toBeDefined();
      expect(NoDataModal.propTypes.patchNoAdvisoryText).toBeDefined();
    });
  });

  describe('Text content variations', () => {
    it('should render line breaks in default text', () => {
      render(<NoDataModal isOpen={true} setOpen={mockSetOpen} />);

      const content = screen.getByTestId('modal-content');
      // The default text includes <br /> elements, so they should be present
      expect(content.innerHTML).toContain('<br>');
    });

    it('should handle numeric patchNoAdvisoryText', () => {
      render(
        <NoDataModal
          isOpen={true}
          setOpen={mockSetOpen}
          patchNoAdvisoryText="12345"
        />,
      );

      expect(screen.getByText('12345')).toBeInTheDocument();
    });
  });

  describe('Accessibility and semantics', () => {
    it('should render modal with proper title', () => {
      render(<NoDataModal isOpen={true} setOpen={mockSetOpen} />);

      expect(screen.getByText('Remediate with Ansible')).toBeInTheDocument();
    });

    it('should render button with descriptive text', () => {
      render(<NoDataModal isOpen={true} setOpen={mockSetOpen} />);

      expect(
        screen.getByRole('button', { name: 'Back to Insights' }),
      ).toBeInTheDocument();
    });
  });

  describe('With feature flag enabled', () => {
    beforeEach(() => {
      useFeatureFlag.mockReturnValue(true);
    });

    it('should render action button with Red Hat Lightspeed text', () => {
      render(<NoDataModal isOpen={true} setOpen={mockSetOpen} />);

      const button = screen.getByTestId('action-0');
      expect(button).toHaveTextContent('Back to Red Hat Lightspeed');
      expect(button).toHaveAttribute('data-variant', 'primary');
    });

    it('should render button with Red Hat Lightspeed descriptive text', () => {
      render(<NoDataModal isOpen={true} setOpen={mockSetOpen} />);

      expect(
        screen.getByRole('button', { name: 'Back to Red Hat Lightspeed' }),
      ).toBeInTheDocument();
    });
  });
});
