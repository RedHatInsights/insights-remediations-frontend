/* eslint-disable react/prop-types */
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ExecutionHistoryContent from './ExecutionHistoryContent';

// Mock external dependencies to avoid complex integration issues
jest.mock('react-router-dom', () => ({
  useParams: () => ({ id: 'test-remediation-id' }),
}));

jest.mock('./LogCards', () => {
  const MockLogCards = () => <div data-testid="mock-log-cards">LogCards</div>;
  MockLogCards.displayName = 'MockLogCards';
  return MockLogCards;
});

jest.mock('./RunTabContent', () => {
  const MockRunTabContent = () => (
    <div data-testid="mock-run-tab-content">RunTabContent</div>
  );
  MockRunTabContent.displayName = 'MockRunTabContent';
  return MockRunTabContent;
});

jest.mock('./NoExections', () => {
  const MockNoExecutions = () => (
    <div data-testid="mock-no-executions">No executions</div>
  );
  MockNoExecutions.displayName = 'MockNoExecutions';
  return MockNoExecutions;
});

jest.mock('./helpers', () => ({
  formatUtc: jest.fn(() => 'formatted-date'),
}));

jest.mock('../../api', () => ({
  getPlaybookLogs: jest.fn(),
  getRemediationPlaybookSystemsList: jest.fn(),
}));

jest.mock('../../../api/useRemediationsQuery', () =>
  jest.fn(() => ({
    result: null,
    loading: false,
    refetch: jest.fn(),
  })),
);

jest.mock('../../helpers', () => ({
  StatusIcon: () => <span data-testid="mock-status-icon">status</span>,
}));

// Mock all PatternFly components as simple divs
jest.mock('@patternfly/react-core', () => ({
  Button: ({ children }) => <button>{children}</button>,
  Checkbox: ({ children }) => <div>{children}</div>,
  Modal: ({ isOpen, children }) =>
    isOpen ? <div data-testid="modal">{children}</div> : null,
  ModalBoxFooter: ({ children }) => <div>{children}</div>,
  Sidebar: ({ children }) => <div data-testid="sidebar">{children}</div>,
  SidebarContent: ({ children }) => <div>{children}</div>,
  SidebarPanel: ({ children }) => <div>{children}</div>,
  Spinner: () => <div data-testid="spinner">Loading...</div>,
  Tab: ({ children }) => <div>{children}</div>,
  Tabs: ({ children }) => <div data-testid="tabs">{children}</div>,
  TabTitleText: ({ children }) => <span>{children}</span>,
  Toolbar: ({ children }) => <div>{children}</div>,
  ToolbarContent: ({ children }) => <div>{children}</div>,
  ToolbarItem: ({ children }) => <div>{children}</div>,
}));

jest.mock('@patternfly/react-log-viewer', () => ({
  LogViewer: () => <div data-testid="log-viewer">Log viewer</div>,
  LogViewerSearch: () => <input data-testid="log-search" />,
}));

describe('ExecutionHistoryContent', () => {
  const mockRuns = [
    {
      id: 'run-1',
      status: 'success',
      updated_at: '2023-01-01T12:00:00Z',
      created_by: { username: 'test-user' },
      systems: [],
    },
  ];

  const defaultProps = {
    remediationPlaybookRuns: { data: mockRuns },
    isPlaybookRunsLoading: false,
    refetchRemediationPlaybookRuns: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic rendering', () => {
    it('should render without crashing', () => {
      render(<ExecutionHistoryContent {...defaultProps} />);
      expect(screen.getByTestId('sidebar')).toBeInTheDocument();
    });

    it('should show sidebar when runs are available', () => {
      render(<ExecutionHistoryContent {...defaultProps} />);
      expect(screen.getByTestId('sidebar')).toBeInTheDocument();
    });

    it('should show spinner when loading with no runs', () => {
      render(
        <ExecutionHistoryContent
          {...defaultProps}
          remediationPlaybookRuns={{ data: [] }}
          isPlaybookRunsLoading={true}
        />,
      );
      expect(screen.getByTestId('spinner')).toBeInTheDocument();
    });

    it('should show no executions when no runs available', () => {
      render(
        <ExecutionHistoryContent
          {...defaultProps}
          remediationPlaybookRuns={{ data: [] }}
          isPlaybookRunsLoading={false}
        />,
      );
      expect(screen.getByTestId('mock-no-executions')).toBeInTheDocument();
    });

    it('should render tabs component when runs exist', () => {
      render(<ExecutionHistoryContent {...defaultProps} />);
      expect(screen.getByTestId('tabs')).toBeInTheDocument();
    });
  });

  describe('Edge cases', () => {
    it('should handle empty remediationPlaybookRuns data', () => {
      render(
        <ExecutionHistoryContent
          {...defaultProps}
          remediationPlaybookRuns={{}}
          isPlaybookRunsLoading={false}
        />,
      );
      expect(screen.getByTestId('mock-no-executions')).toBeInTheDocument();
    });

    it('should handle undefined refetchRemediationPlaybookRuns', () => {
      render(
        <ExecutionHistoryContent
          {...defaultProps}
          refetchRemediationPlaybookRuns={undefined}
        />,
      );
      expect(screen.getByTestId('sidebar')).toBeInTheDocument();
    });

    it('should handle runs with different statuses', () => {
      const runsWithDifferentStatuses = [
        {
          id: 'run-1',
          status: 'success',
          updated_at: '2023-01-01T12:00:00Z',
          systems: [],
        },
        {
          id: 'run-2',
          status: 'failed',
          updated_at: '2023-01-02T12:00:00Z',
          systems: [],
        },
        {
          id: 'run-3',
          status: 'running',
          updated_at: '2023-01-03T12:00:00Z',
          systems: [],
        },
      ];

      render(
        <ExecutionHistoryContent
          {...defaultProps}
          remediationPlaybookRuns={{ data: runsWithDifferentStatuses }}
        />,
      );
      expect(screen.getByTestId('sidebar')).toBeInTheDocument();
    });
  });

  describe('PropTypes validation', () => {
    it('should render with required props', () => {
      const consoleSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      render(
        <ExecutionHistoryContent
          remediationPlaybookRuns={{ data: mockRuns }}
          isPlaybookRunsLoading={false}
          refetchRemediationPlaybookRuns={jest.fn()}
        />,
      );

      expect(consoleSpy).not.toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('Component integration', () => {
    it('should handle component updates when props change', () => {
      const { rerender } = render(
        <ExecutionHistoryContent {...defaultProps} />,
      );

      const newRuns = [
        {
          id: 'run-new',
          status: 'failed',
          updated_at: '2023-01-05T12:00:00Z',
          systems: [],
        },
      ];

      rerender(
        <ExecutionHistoryContent
          {...defaultProps}
          remediationPlaybookRuns={{ data: newRuns }}
        />,
      );

      expect(screen.getByTestId('sidebar')).toBeInTheDocument();
    });

    it('should handle loading state changes', () => {
      const { rerender } = render(
        <ExecutionHistoryContent
          {...defaultProps}
          isPlaybookRunsLoading={true}
          remediationPlaybookRuns={{ data: [] }}
        />,
      );

      expect(screen.getByTestId('spinner')).toBeInTheDocument();

      rerender(
        <ExecutionHistoryContent
          {...defaultProps}
          isPlaybookRunsLoading={false}
          remediationPlaybookRuns={{ data: [] }}
        />,
      );

      expect(screen.getByTestId('mock-no-executions')).toBeInTheDocument();
    });
  });
});
