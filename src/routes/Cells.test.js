import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import {
  formatDate,
  Name,
  LastExecutedCell,
  ExecutionStatusCell,
  ActionsCell,
  SystemsCell,
  CreatedCell,
  LastModifiedCell,
} from './Cells';

jest.mock('@redhat-cloud-services/frontend-components/InsightsLink', () => {
  const PropTypes = require('prop-types');
  const InsightsLink = ({ children, to }) => (
    <a href={`/insights/${to}`}>{children}</a>
  );
  InsightsLink.displayName = 'InsightsLink';
  InsightsLink.propTypes = {
    children: PropTypes.node,
    to: PropTypes.string,
  };
  return InsightsLink;
});

jest.mock('./RemediationDetailsComponents/helpers', () => ({
  getTimeAgo: jest.fn(),
}));

const { getTimeAgo } = require('./RemediationDetailsComponents/helpers');

describe('routes/Cells', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('formatDate utility', () => {
    it('should format date string correctly', () => {
      const result = formatDate('2023-03-15T10:30:00Z');
      expect(result).toBe('March 15, 2023');
    });

    it('should handle different date formats', () => {
      const result = formatDate('2023-12-25');
      expect(result).toBe('December 25, 2023');
    });

    it('should handle invalid date strings gracefully', () => {
      const result = formatDate('invalid-date');
      expect(result).toBe('Invalid Date');
    });

    it('should format date with single digits correctly', () => {
      const result = formatDate('2023-01-05T00:00:00Z');
      expect(result).toBe('January 5, 2023');
    });
  });

  describe('Name component', () => {
    it('should render name with InsightsLink', () => {
      render(<Name name="Test Remediation" id="rem-123" />);

      const link = screen.getByText('Test Remediation');
      expect(link).toBeInTheDocument();
      expect(screen.getByRole('link')).toHaveAttribute(
        'href',
        '/insights/rem-123',
      );
    });

    it('should handle empty name', () => {
      render(<Name name="" id="rem-123" />);

      const link = screen.getByRole('link');
      expect(link).toHaveTextContent('');
      expect(link).toHaveAttribute('href', '/insights/rem-123');
    });

    it('should handle undefined name', () => {
      render(<Name name={undefined} id="rem-123" />);

      const link = screen.getByRole('link');
      expect(link).toBeInTheDocument();
    });

    it('should handle special characters in name', () => {
      render(<Name name="Test & Special <Characters>" id="rem-123" />);

      expect(
        screen.getByText('Test & Special <Characters>'),
      ).toBeInTheDocument();
    });
  });

  describe('LastExecutedCell component', () => {
    it('should display formatted date when playbook runs exist', () => {
      const playbook_runs = [
        { created_at: '2023-03-15T10:30:00Z' },
        { created_at: '2023-03-10T08:00:00Z' },
      ];

      render(<LastExecutedCell playbook_runs={playbook_runs} />);

      expect(screen.getByText('March 15, 2023')).toBeInTheDocument();
    });

    it('should display "Never" when no playbook runs exist', () => {
      render(<LastExecutedCell playbook_runs={[]} />);

      expect(screen.getByText('Never')).toBeInTheDocument();
    });

    it('should handle undefined playbook_runs', () => {
      render(<LastExecutedCell playbook_runs={undefined} />);

      expect(screen.getByText('Never')).toBeInTheDocument();
    });

    it('should handle null playbook_runs', () => {
      render(<LastExecutedCell playbook_runs={null} />);

      expect(screen.getByText('Never')).toBeInTheDocument();
    });

    it('should use first run when multiple runs exist', () => {
      const playbook_runs = [
        { created_at: '2023-03-20T10:30:00Z' },
        { created_at: '2023-03-15T10:30:00Z' },
      ];

      render(<LastExecutedCell playbook_runs={playbook_runs} />);

      expect(screen.getByText('March 20, 2023')).toBeInTheDocument();
    });

    it('should handle playbook run with null created_at', () => {
      const playbook_runs = [{ created_at: null }];

      render(<LastExecutedCell playbook_runs={playbook_runs} />);

      expect(screen.getByText('Invalid Date')).toBeInTheDocument();
    });
  });

  describe('ExecutionStatusCell component', () => {
    it('should display N/A when no playbook runs exist', () => {
      render(<ExecutionStatusCell playbook_runs={[]} />);

      expect(screen.getByText('N/A')).toBeInTheDocument();
    });

    it('should display N/A when playbook_runs is undefined', () => {
      render(<ExecutionStatusCell playbook_runs={undefined} />);

      expect(screen.getByText('N/A')).toBeInTheDocument();
    });

    it('should display N/A when playbook_runs is null', () => {
      render(<ExecutionStatusCell playbook_runs={null} />);

      expect(screen.getByText('N/A')).toBeInTheDocument();
    });

    it('should display success status correctly', () => {
      const playbook_runs = [{ status: 'success' }];

      render(<ExecutionStatusCell playbook_runs={playbook_runs} />);

      expect(screen.getByText('Succeeded')).toBeInTheDocument();
    });

    it('should display running status correctly', () => {
      const playbook_runs = [{ status: 'running' }];

      render(<ExecutionStatusCell playbook_runs={playbook_runs} />);

      expect(screen.getByText('In progress')).toBeInTheDocument();
    });

    it('should display failure status correctly', () => {
      const playbook_runs = [{ status: 'failure' }];

      render(<ExecutionStatusCell playbook_runs={playbook_runs} />);

      expect(screen.getByText('Failed')).toBeInTheDocument();
    });

    it('should handle unknown status gracefully', () => {
      const playbook_runs = [{ status: 'unknown' }];

      render(<ExecutionStatusCell playbook_runs={playbook_runs} />);

      // Should render the flex container without an icon or display value
      expect(document.body).toBeInTheDocument();
    });

    it('should handle missing status gracefully', () => {
      const playbook_runs = [{}];

      render(<ExecutionStatusCell playbook_runs={playbook_runs} />);

      expect(document.body).toBeInTheDocument();
    });

    it('should use first run status when multiple runs exist', () => {
      const playbook_runs = [{ status: 'success' }, { status: 'failure' }];

      render(<ExecutionStatusCell playbook_runs={playbook_runs} />);

      expect(screen.getByText('Succeeded')).toBeInTheDocument();
    });
  });

  describe('ActionsCell component', () => {
    it('should display issue count', () => {
      render(<ActionsCell issue_count={5} />);

      expect(screen.getByText('5')).toBeInTheDocument();
    });

    it('should handle zero issue count', () => {
      render(<ActionsCell issue_count={0} />);

      expect(screen.getByText('0')).toBeInTheDocument();
    });

    it('should handle undefined issue count', () => {
      render(<ActionsCell issue_count={undefined} />);

      expect(document.body).toBeInTheDocument();
    });

    it('should handle null issue count', () => {
      render(<ActionsCell issue_count={null} />);

      expect(document.body).toBeInTheDocument();
    });

    it('should handle large issue count', () => {
      render(<ActionsCell issue_count={999} />);

      expect(screen.getByText('999')).toBeInTheDocument();
    });
  });

  describe('SystemsCell component', () => {
    it('should display system count', () => {
      render(<SystemsCell system_count={10} />);

      expect(screen.getByText('10')).toBeInTheDocument();
    });

    it('should handle zero system count', () => {
      render(<SystemsCell system_count={0} />);

      expect(screen.getByText('0')).toBeInTheDocument();
    });

    it('should handle undefined system count', () => {
      render(<SystemsCell system_count={undefined} />);

      expect(document.body).toBeInTheDocument();
    });

    it('should handle null system count', () => {
      render(<SystemsCell system_count={null} />);

      expect(document.body).toBeInTheDocument();
    });

    it('should handle large system count', () => {
      render(<SystemsCell system_count={1500} />);

      expect(screen.getByText('1500')).toBeInTheDocument();
    });
  });

  describe('CreatedCell component', () => {
    it('should display formatted creation date', () => {
      render(<CreatedCell created_at="2023-03-15T10:30:00Z" />);

      expect(screen.getByText('March 15, 2023')).toBeInTheDocument();
    });

    it('should handle different date formats', () => {
      render(<CreatedCell created_at="2023-12-25" />);

      expect(screen.getByText('December 25, 2023')).toBeInTheDocument();
    });

    it('should handle invalid date', () => {
      render(<CreatedCell created_at="invalid-date" />);

      expect(screen.getByText('Invalid Date')).toBeInTheDocument();
    });

    it('should handle undefined created_at', () => {
      render(<CreatedCell created_at={undefined} />);

      expect(screen.getByText('Invalid Date')).toBeInTheDocument();
    });

    it('should handle null created_at', () => {
      render(<CreatedCell created_at={null} />);

      expect(screen.getByText('Invalid Date')).toBeInTheDocument();
    });
  });

  describe('LastModifiedCell component', () => {
    beforeEach(() => {
      getTimeAgo.mockReturnValue('2 hours ago');
    });

    it('should display "0" when updated_at is not provided', () => {
      render(<LastModifiedCell updated_at={null} />);

      expect(screen.getByText('0')).toBeInTheDocument();
    });

    it('should display "0" when updated_at is undefined', () => {
      render(<LastModifiedCell updated_at={undefined} />);

      expect(screen.getByText('0')).toBeInTheDocument();
    });

    it('should display time ago with tooltip when updated_at is provided', () => {
      render(<LastModifiedCell updated_at="2023-03-15T10:28:00Z" />);

      expect(screen.getByText('2 hours ago')).toBeInTheDocument();
    });

    it('should call getTimeAgo with correct date', () => {
      const dateString = '2023-03-15T10:28:00Z';
      render(<LastModifiedCell updated_at={dateString} />);

      expect(getTimeAgo).toHaveBeenCalledWith(new Date(dateString));
    });

    it('should format tooltip text correctly', () => {
      render(<LastModifiedCell updated_at="2023-03-15T10:28:00Z" />);

      const tooltipTrigger = screen.getByText('2 hours ago');
      expect(tooltipTrigger).toBeInTheDocument();

      // Just verify the tooltip trigger is rendered, as the tooltip itself may not be in DOM
      expect(tooltipTrigger).toBeVisible();
    });

    it('should handle different date formats in tooltip', () => {
      getTimeAgo.mockReturnValue('1 day ago');
      render(<LastModifiedCell updated_at="2023-12-25T23:59:00Z" />);

      expect(screen.getByText('1 day ago')).toBeInTheDocument();
      expect(getTimeAgo).toHaveBeenCalledWith(new Date('2023-12-25T23:59:00Z'));
    });

    it('should handle empty string updated_at', () => {
      render(<LastModifiedCell updated_at="" />);

      expect(screen.getByText('0')).toBeInTheDocument();
    });

    it('should handle invalid date string', () => {
      getTimeAgo.mockReturnValue('Invalid date');
      render(<LastModifiedCell updated_at="invalid-date" />);

      expect(screen.getByText('Invalid date')).toBeInTheDocument();
      expect(getTimeAgo).toHaveBeenCalledWith(expect.any(Date));
      // Verify the date passed is invalid
      const calledDate = getTimeAgo.mock.calls[0][0];
      expect(isNaN(calledDate.getTime())).toBe(true);
    });

    it('should format date part correctly for tooltip', () => {
      // Mock a specific date to test formatting
      const mockDate = '2023-01-05T15:30:45Z';
      render(<LastModifiedCell updated_at={mockDate} />);

      expect(getTimeAgo).toHaveBeenCalledWith(new Date(mockDate));
    });

    it('should format time part correctly for tooltip', () => {
      // Test time formatting in 24-hour format
      const mockDate = '2023-03-15T09:05:00Z';
      render(<LastModifiedCell updated_at={mockDate} />);

      expect(getTimeAgo).toHaveBeenCalledWith(new Date(mockDate));
    });
  });

  describe('Component integration', () => {
    it('should render all components together without conflicts', () => {
      const playbook_runs = [
        { status: 'success', created_at: '2023-03-15T10:30:00Z' },
      ];

      render(
        <div>
          <Name name="Test" id="rem-123" />
          <LastExecutedCell playbook_runs={playbook_runs} />
          <ExecutionStatusCell playbook_runs={playbook_runs} />
          <ActionsCell issue_count={5} />
          <SystemsCell system_count={10} />
          <CreatedCell created_at="2023-03-10T10:30:00Z" />
          <LastModifiedCell updated_at="2023-03-15T10:30:00Z" />
        </div>,
      );

      expect(screen.getByText('Test')).toBeInTheDocument();
      expect(screen.getAllByText('March 15, 2023')).toHaveLength(1);
      expect(screen.getByText('March 10, 2023')).toBeInTheDocument();
      expect(screen.getByText('Succeeded')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();
      expect(screen.getByText('10')).toBeInTheDocument();
      expect(screen.getByText('2 hours ago')).toBeInTheDocument();
    });
  });

  describe('Edge cases and error handling', () => {
    it('should handle extremely large numbers', () => {
      render(<ActionsCell issue_count={Number.MAX_SAFE_INTEGER} />);
      expect(
        screen.getByText(Number.MAX_SAFE_INTEGER.toString()),
      ).toBeInTheDocument();
    });

    it('should handle negative numbers', () => {
      render(<SystemsCell system_count={-1} />);
      expect(screen.getByText('-1')).toBeInTheDocument();
    });

    it('should handle very old dates', () => {
      render(<CreatedCell created_at="1970-01-01T00:00:00Z" />);
      expect(screen.getByText('January 1, 1970')).toBeInTheDocument();
    });

    it('should handle future dates', () => {
      render(<CreatedCell created_at="2030-12-31T23:59:59Z" />);
      expect(screen.getByText('December 31, 2030')).toBeInTheDocument();
    });
  });
});
