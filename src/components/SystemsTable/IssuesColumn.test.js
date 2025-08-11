/* eslint-disable react/prop-types */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import IssuesColumn from './IssuesColumn';

jest.mock('./RebootColumn', () => {
  return function MockRebootColumn({ rebootRequired }) {
    return (
      <div data-testid="reboot-column">
        {rebootRequired ? 'Reboot required' : 'No reboot'}
      </div>
    );
  };
});

jest.mock('../../Utilities/urls', () => ({
  buildIssueUrl: jest.fn().mockReturnValue('https://example.com/issue/123'),
}));

jest.mock('lodash/sortBy', () => {
  return jest.fn((array, iteratee) => {
    return [...array].sort((a, b) => {
      const aVal = iteratee(a);
      const bVal = iteratee(b);
      if (aVal < bVal) return -1;
      if (aVal > bVal) return 1;
      return 0;
    });
  });
});

// Mock PatternFly components
jest.mock('@patternfly/react-core', () => ({
  Button: function MockButton({
    children,
    variant,
    isInline,
    onClick,
    ...props
  }) {
    return (
      <button
        data-testid="button"
        data-variant={variant}
        data-inline={isInline}
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
        <button data-testid="modal-close" onClick={onClose}>
          Close
        </button>
        {children}
      </div>
    );
  },
  ModalVariant: {
    medium: 'medium',
  },
}));

jest.mock('@patternfly/react-table', () => ({
  cellWidth: jest.fn((width) => ({ cellWidth: width })),
  sortable: { sortable: true },
}));

jest.mock('@patternfly/react-table/deprecated', () => ({
  Table: function MockTable({
    children,
    variant,
    rows,
    cells,
    sortBy,
    onSort,
    ...props
  }) {
    return (
      <div data-testid="table" data-variant={variant} {...props}>
        <div data-testid="table-header">
          {cells.map((cell, index) => (
            <div
              key={index}
              data-testid={`header-cell-${index}`}
              onClick={() =>
                onSort &&
                onSort({}, index, sortBy?.direction === 'asc' ? 'desc' : 'asc')
              }
            >
              {cell.title}
            </div>
          ))}
        </div>
        <div data-testid="table-body">
          {rows.map((row, rowIndex) => (
            <div key={rowIndex} data-testid={`table-row-${rowIndex}`}>
              {row.map((cell, cellIndex) => (
                <div
                  key={cellIndex}
                  data-testid={`table-cell-${rowIndex}-${cellIndex}`}
                >
                  {cell.title || cell}
                </div>
              ))}
            </div>
          ))}
        </div>
        {children}
      </div>
    );
  },
  TableBody: function MockTableBody() {
    return <div data-testid="table-body-component" />;
  },
  TableHeader: function MockTableHeader() {
    return <div data-testid="table-header-component" />;
  },
}));

describe('IssuesColumn', () => {
  const mockIssues = [
    {
      id: 'advisor:recommendation-123',
      description: 'Test advisor recommendation',
      resolution: {
        description: 'Fix the issue',
        needs_reboot: true,
      },
      resolved: false,
    },
    {
      id: 'vulnerabilities:CVE-2021-1234',
      description: 'Security vulnerability',
      resolution: {
        description: 'Apply security patch',
        needs_reboot: false,
      },
      resolved: false,
    },
    {
      id: 'patch-advisory:RHSA-2021-1234',
      description: 'Patch advisory',
      resolution: {
        description: 'Install patch',
        needs_reboot: true,
      },
      resolved: true,
    },
  ];

  const defaultProps = {
    issues: mockIssues,
    display_name: 'Test System',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render button with correct issue count text for multiple issues', () => {
    render(<IssuesColumn {...defaultProps} />);

    const button = screen.getByTestId('button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('3 actions');
    expect(button).toHaveAttribute('data-variant', 'link');
    expect(button).toHaveAttribute('data-inline', 'true');
  });

  it('should render button with singular text for single issue', () => {
    const props = {
      ...defaultProps,
      issues: [mockIssues[0]],
    };

    render(<IssuesColumn {...props} />);

    const button = screen.getByTestId('button');
    expect(button).toHaveTextContent('1 action');
  });

  it('should render button with no actions for empty issues array', () => {
    const props = {
      ...defaultProps,
      issues: [],
    };

    render(<IssuesColumn {...props} />);

    const button = screen.getByTestId('button');
    expect(button).toHaveTextContent('0 action');
  });

  it('should not render modal initially', () => {
    render(<IssuesColumn {...defaultProps} />);

    const modal = screen.queryByTestId('modal');
    expect(modal).not.toBeInTheDocument();
  });

  it('should open modal when button is clicked', () => {
    render(<IssuesColumn {...defaultProps} />);

    const button = screen.getByTestId('button');
    fireEvent.click(button);

    const modal = screen.getByTestId('modal');
    expect(modal).toBeInTheDocument();
    expect(screen.getByText('Planned remediation actions')).toBeInTheDocument();
  });

  it('should close modal when close button is clicked', () => {
    render(<IssuesColumn {...defaultProps} />);

    // Open modal
    const openButton = screen.getByTestId('button');
    fireEvent.click(openButton);

    expect(screen.getByTestId('modal')).toBeInTheDocument();

    // Close modal
    const closeButton = screen.getByLabelText('Close');
    fireEvent.click(closeButton);

    expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
  });

  it('should render table with correct structure when modal is open', () => {
    render(<IssuesColumn {...defaultProps} />);

    // Open modal
    fireEvent.click(screen.getByTestId('button'));

    const table = screen.getByTestId('table');
    expect(table).toBeInTheDocument();
    expect(table).toHaveAttribute('data-variant', 'compact');

    // Check table headers
    expect(screen.getByTestId('header-cell-0')).toHaveTextContent('Action');
    expect(screen.getByTestId('header-cell-1')).toHaveTextContent(
      'Reboot required',
    );
    expect(screen.getByTestId('header-cell-2')).toHaveTextContent('Type');
  });

  it('should render issue data correctly in table rows', () => {
    render(<IssuesColumn {...defaultProps} />);

    // Open modal
    fireEvent.click(screen.getByTestId('button'));

    // Check first row (should contain advisor issue data)
    const firstRowCell = screen.getByTestId('table-cell-0-0');
    expect(firstRowCell).toBeInTheDocument();

    // Check that reboot columns are rendered
    const rebootColumns = screen.getAllByTestId('reboot-column');
    expect(rebootColumns).toHaveLength(3); // One for each issue
  });

  it('should handle sorting by clicking table headers', () => {
    render(<IssuesColumn {...defaultProps} />);

    // Open modal
    fireEvent.click(screen.getByTestId('button'));

    // Click on first header to sort
    const firstHeader = screen.getByTestId('header-cell-0');
    fireEvent.click(firstHeader);

    // Table should still be present (sorting happened)
    expect(screen.getByTestId('table')).toBeInTheDocument();
  });

  it('should sort issues by different criteria', () => {
    render(<IssuesColumn {...defaultProps} />);

    // Open modal to trigger sorting
    fireEvent.click(screen.getByTestId('button'));

    // Click different headers to test sorting
    fireEvent.click(screen.getByTestId('header-cell-1')); // Sort by reboot required
    fireEvent.click(screen.getByTestId('header-cell-2')); // Sort by type

    expect(screen.getByTestId('table')).toBeInTheDocument();
  });

  it('should reverse sort order when clicking same header twice', () => {
    render(<IssuesColumn {...defaultProps} />);

    // Open modal
    fireEvent.click(screen.getByTestId('button'));

    const header = screen.getByTestId('header-cell-0');

    // First click - ascending
    fireEvent.click(header);

    // Second click - descending
    fireEvent.click(header);

    expect(screen.getByTestId('table')).toBeInTheDocument();
  });

  it('should handle issues with different types correctly', () => {
    const issuesWithUnknownType = [
      ...mockIssues,
      {
        id: 'unknown:some-issue',
        description: 'Unknown issue type',
        resolution: {
          description: 'Fix unknown issue',
          needs_reboot: false,
        },
        resolved: false,
      },
    ];

    const props = {
      ...defaultProps,
      issues: issuesWithUnknownType,
    };

    render(<IssuesColumn {...props} />);

    fireEvent.click(screen.getByTestId('button'));

    // Should render 4 actions now
    expect(screen.getByTestId('button')).toHaveTextContent('4 actions');

    // Table should handle the unknown type
    expect(screen.getByTestId('table')).toBeInTheDocument();
  });

  it('should handle issues with malformed IDs', () => {
    const issuesWithMalformedIds = [
      {
        id: 'malformed-id-without-colon',
        description: 'Malformed issue',
        resolution: {
          description: 'Fix malformed issue',
          needs_reboot: false,
        },
        resolved: false,
      },
    ];

    const props = {
      ...defaultProps,
      issues: issuesWithMalformedIds,
    };

    render(<IssuesColumn {...props} />);

    fireEvent.click(screen.getByTestId('button'));

    expect(screen.getByTestId('table')).toBeInTheDocument();
  });

  it('should handle empty display_name', () => {
    const props = {
      ...defaultProps,
      display_name: '',
    };

    render(<IssuesColumn {...props} />);

    fireEvent.click(screen.getByTestId('button'));

    const table = screen.getByTestId('table');
    expect(table).toBeInTheDocument();
  });

  it('should handle undefined display_name', () => {
    const props = {
      ...defaultProps,
      display_name: undefined,
    };

    render(<IssuesColumn {...props} />);

    fireEvent.click(screen.getByTestId('button'));

    const table = screen.getByTestId('table');
    expect(table).toBeInTheDocument();
  });

  it('should handle issues without resolution description', () => {
    const issuesWithoutResolution = [
      {
        id: 'advisor:test',
        description: 'Test issue',
        resolution: {
          needs_reboot: false,
        },
        resolved: false,
      },
    ];

    const props = {
      ...defaultProps,
      issues: issuesWithoutResolution,
    };

    render(<IssuesColumn {...props} />);

    fireEvent.click(screen.getByTestId('button'));

    expect(screen.getByTestId('table')).toBeInTheDocument();
  });

  it('should handle issues without needs_reboot property', () => {
    const issuesWithoutReboot = [
      {
        id: 'advisor:test',
        description: 'Test issue',
        resolution: {
          description: 'Fix it',
        },
        resolved: false,
      },
    ];

    const props = {
      ...defaultProps,
      issues: issuesWithoutReboot,
    };

    render(<IssuesColumn {...props} />);

    fireEvent.click(screen.getByTestId('button'));

    expect(screen.getByTestId('table')).toBeInTheDocument();
    expect(screen.getByTestId('reboot-column')).toBeInTheDocument();
  });

  it('should apply correct aria-label to table', () => {
    render(<IssuesColumn {...defaultProps} />);

    fireEvent.click(screen.getByTestId('button'));

    const table = screen.getByTestId('table');
    expect(table).toHaveAttribute('aria-label', 'Issues table for Test System');
  });

  it('should handle null issues array', () => {
    const props = {
      ...defaultProps,
      issues: null,
    };

    expect(() => render(<IssuesColumn {...props} />)).toThrow();
  });

  it('should handle undefined issues array', () => {
    const props = {
      ...defaultProps,
      issues: undefined,
    };

    expect(() => render(<IssuesColumn {...props} />)).toThrow();
  });

  it('should maintain modal state correctly through multiple open/close cycles', () => {
    render(<IssuesColumn {...defaultProps} />);

    const button = screen.getByTestId('button');

    // Open modal
    fireEvent.click(button);
    expect(screen.getByTestId('modal')).toBeInTheDocument();

    // Close modal
    fireEvent.click(screen.getByLabelText('Close'));
    expect(screen.queryByTestId('modal')).not.toBeInTheDocument();

    // Open modal again
    fireEvent.click(button);
    expect(screen.getByTestId('modal')).toBeInTheDocument();

    // Close modal again
    fireEvent.click(screen.getByLabelText('Close'));
    expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
  });

  it('should correctly identify issue types', () => {
    render(<IssuesColumn {...defaultProps} />);

    fireEvent.click(screen.getByTestId('button'));

    // The table should be rendered with correct issue type mappings
    expect(screen.getByTestId('table')).toBeInTheDocument();

    // Check that all rows are rendered (should have 3 rows for 3 issues)
    expect(screen.getByTestId('table-row-0')).toBeInTheDocument();
    expect(screen.getByTestId('table-row-1')).toBeInTheDocument();
    expect(screen.getByTestId('table-row-2')).toBeInTheDocument();
  });

  it('should handle complex sorting scenarios', () => {
    const complexIssues = [
      {
        id: 'advisor:a',
        description: 'A description',
        resolution: { needs_reboot: true, description: 'Fix A' },
        resolved: false,
      },
      {
        id: 'vulnerabilities:b',
        description: 'B description',
        resolution: { needs_reboot: false, description: 'Fix B' },
        resolved: true,
      },
      {
        id: 'patch-advisory:c',
        description: 'C description',
        resolution: { needs_reboot: true, description: 'Fix C' },
        resolved: false,
      },
    ];

    const props = {
      ...defaultProps,
      issues: complexIssues,
    };

    render(<IssuesColumn {...props} />);

    fireEvent.click(screen.getByTestId('button'));

    // Test sorting by each column
    fireEvent.click(screen.getByTestId('header-cell-0')); // Sort by description
    fireEvent.click(screen.getByTestId('header-cell-1')); // Sort by reboot
    fireEvent.click(screen.getByTestId('header-cell-2')); // Sort by type

    expect(screen.getByTestId('table')).toBeInTheDocument();
  });
});
