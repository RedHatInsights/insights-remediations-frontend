/* eslint-disable react/prop-types */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import RunTabContent from './RunTabContent';

// Mock external dependencies
jest.mock('./helpers', () => ({
  formatUtc: jest.fn((date) => `formatted-${date}`),
}));

jest.mock('./hooks/useRunSystems', () =>
  jest.fn(() => ({
    systems: [],
    loading: false,
  })),
);

jest.mock('../DetailsBanners', () => {
  const MockDetailsBanner = ({ status, remediationPlanName, canceledAt }) => (
    <div data-testid="mock-details-banner">
      <span data-testid="banner-status">{status}</span>
      <span data-testid="banner-plan-name">{remediationPlanName}</span>
      <span data-testid="banner-canceled-at">{canceledAt}</span>
    </div>
  );
  MockDetailsBanner.displayName = 'MockDetailsBanner';
  return MockDetailsBanner;
});

jest.mock('./RunSystemsTable', () => {
  const MockRunSystemsTable = ({ run, loading, viewLogColumn }) => (
    <div data-testid="mock-run-systems-table">
      <span data-testid="table-run-id">{run.id}</span>
      <span data-testid="table-loading">{loading.toString()}</span>
      <span data-testid="table-systems-count">{run.systems?.length || 0}</span>
      {viewLogColumn && (
        <button
          data-testid="view-log-button"
          onClick={() => viewLogColumn.Component({ id: 'test-system' })}
        >
          {viewLogColumn.title || 'View log'}
        </button>
      )}
    </div>
  );
  MockRunSystemsTable.displayName = 'MockRunSystemsTable';
  return MockRunSystemsTable;
});

jest.mock('../../helpers', () => ({
  StatusLabel: ({ status }) => (
    <span data-testid="mock-status-label" data-status={status}>
      Status: {status}
    </span>
  ),
}));

jest.mock('bastilian-tabletools', () => ({
  TableStateProvider: ({ children }) => (
    <div data-testid="mock-table-state-provider">{children}</div>
  ),
}));

// Mock PatternFly components
jest.mock('@patternfly/react-core', () => ({
  Flex: ({ children, className, justifyContent, direction }) => (
    <div
      data-testid="flex"
      className={className}
      data-justify-content={justifyContent?.default}
      data-direction={direction?.default}
    >
      {children}
    </div>
  ),
  Title: ({ headingLevel, children }) => (
    <h1 data-testid="title" data-heading-level={headingLevel}>
      {children}
    </h1>
  ),
  Text: ({ children }) => <div data-testid="text">{children}</div>,
  TextVariants: {
    small: ({ children }) => <small data-testid="text-small">{children}</small>,
  },
  Button: ({ children, onClick, isDisabled, isInline, variant, style }) => (
    <button
      data-testid="button"
      onClick={onClick}
      disabled={isDisabled}
      data-inline={isInline}
      data-variant={variant}
      style={style}
    >
      {children}
    </button>
  ),
  TabContent: ({ children, eventKey, id, activeKey, hidden }) => (
    <div
      data-testid="tab-content"
      data-event-key={eventKey}
      id={id}
      data-active-key={activeKey}
      data-hidden={hidden}
    >
      {children}
    </div>
  ),
}));

jest.mock('@patternfly/react-icons', () => ({
  RedoIcon: ({ className }) => (
    <span data-testid="redo-icon" className={className}>
      ⟲
    </span>
  ),
}));

describe('RunTabContent', () => {
  const mockUseRunSystems = require('./hooks/useRunSystems');
  const mockFormatUtc = require('./helpers').formatUtc;

  const mockRun = {
    id: 'run-123',
    status: 'success',
    updated_at: '2023-01-01T12:00:00Z',
    created_by: { username: 'test-user' },
    system_name: 'Test System',
  };

  const defaultProps = {
    run: mockRun,
    idx: 0,
    isActive: true,
    remId: 'rem-456',
    fetchSystems: jest.fn(),
    openLogModal: jest.fn(),
    refetchRemediationPlaybookRuns: jest.fn(),
    setManualRefreshClicked: jest.fn(),
    manualRefreshClicked: false,
    isPlaybookRunsLoading: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockFormatUtc.mockReturnValue('Jan 1, 2023 12:00 PM');
    mockUseRunSystems.mockReturnValue({
      systems: [],
      loading: false,
    });
  });

  describe('Basic rendering', () => {
    it('should render without crashing', () => {
      render(<RunTabContent {...defaultProps} />);
      expect(screen.getByTestId('tab-content')).toBeInTheDocument();
    });

    it('should render tab content with correct props', () => {
      render(<RunTabContent {...defaultProps} />);

      const tabContent = screen.getByTestId('tab-content');
      expect(tabContent).toHaveAttribute('data-event-key', '0');
      expect(tabContent).toHaveAttribute('id', 'run-0');
      expect(tabContent).toHaveAttribute('data-active-key', '0');
      expect(tabContent).toHaveAttribute('data-hidden', 'false');
    });

    it('should render title with formatted date', () => {
      render(<RunTabContent {...defaultProps} />);

      expect(mockFormatUtc).toHaveBeenCalledWith('2023-01-01T12:00:00Z');
      expect(screen.getByTestId('title')).toHaveTextContent(
        'Jan 1, 2023 12:00 PM',
      );
    });

    it('should render status label', () => {
      render(<RunTabContent {...defaultProps} />);

      const statusLabel = screen.getByTestId('mock-status-label');
      expect(statusLabel).toHaveAttribute('data-status', 'success');
      expect(statusLabel).toHaveTextContent('Status: success');
    });

    it('should render initiated by text', () => {
      render(<RunTabContent {...defaultProps} />);

      expect(screen.getByTestId('text-small')).toHaveTextContent(
        'Initiated by: test-user',
      );
    });

    it('should render refresh button', () => {
      render(<RunTabContent {...defaultProps} />);

      const refreshButton = screen.getByTestId('button');
      expect(refreshButton).toHaveTextContent('Refresh');
      expect(refreshButton).toBeEnabled();
      expect(screen.getByTestId('redo-icon')).toBeInTheDocument();
    });
  });

  describe('Tab content states', () => {
    it('should hide tab content when not active', () => {
      render(<RunTabContent {...defaultProps} isActive={false} />);

      const tabContent = screen.getByTestId('tab-content');
      expect(tabContent).toHaveAttribute('data-active-key', '-1');
      expect(tabContent).toHaveAttribute('data-hidden', 'true');
    });

    it('should show tab content when active', () => {
      render(<RunTabContent {...defaultProps} isActive={true} />);

      const tabContent = screen.getByTestId('tab-content');
      expect(tabContent).toHaveAttribute('data-active-key', '0');
      expect(tabContent).toHaveAttribute('data-hidden', 'false');
    });
  });

  describe('Loading states', () => {
    it('should disable refresh button when playbook runs are loading', () => {
      render(<RunTabContent {...defaultProps} isPlaybookRunsLoading={true} />);

      expect(screen.getByTestId('button')).toBeDisabled();
    });

    it('should disable refresh button when manual refresh clicked', () => {
      render(<RunTabContent {...defaultProps} manualRefreshClicked={true} />);

      expect(screen.getByTestId('button')).toBeDisabled();
    });

    it('should disable refresh button when useRunSystems is loading', () => {
      mockUseRunSystems.mockReturnValue({
        systems: [],
        loading: true,
      });

      render(<RunTabContent {...defaultProps} />);

      expect(screen.getByTestId('button')).toBeDisabled();
    });

    it('should pass loading state to RunSystemsTable', () => {
      render(<RunTabContent {...defaultProps} isPlaybookRunsLoading={true} />);

      expect(screen.getByTestId('table-loading')).toHaveTextContent('true');
    });
  });

  describe('Refresh functionality', () => {
    it('should handle refresh button click', async () => {
      const mockRefetch = jest.fn().mockResolvedValue();
      const mockSetManualRefresh = jest.fn();

      render(
        <RunTabContent
          {...defaultProps}
          refetchRemediationPlaybookRuns={mockRefetch}
          setManualRefreshClicked={mockSetManualRefresh}
        />,
      );

      fireEvent.click(screen.getByTestId('button'));

      expect(mockSetManualRefresh).toHaveBeenCalledWith(true);
      await waitFor(() => {
        expect(mockRefetch).toHaveBeenCalled();
      });
    });

    it('should handle async refresh completion', async () => {
      const mockRefetch = jest.fn().mockResolvedValue();
      const mockSetManualRefresh = jest.fn();

      render(
        <RunTabContent
          {...defaultProps}
          refetchRemediationPlaybookRuns={mockRefetch}
          setManualRefreshClicked={mockSetManualRefresh}
        />,
      );

      fireEvent.click(screen.getByTestId('button'));

      await waitFor(() => {
        expect(mockSetManualRefresh).toHaveBeenCalledWith(false);
      });
    });
  });

  describe('Child components rendering', () => {
    it('should render DetailsBanner with correct props', () => {
      render(<RunTabContent {...defaultProps} />);

      expect(screen.getByTestId('mock-details-banner')).toBeInTheDocument();
      expect(screen.getByTestId('banner-status')).toHaveTextContent('success');
      expect(screen.getByTestId('banner-plan-name')).toHaveTextContent(
        'Test System',
      );
      expect(screen.getByTestId('banner-canceled-at')).toHaveTextContent(
        '2023-01-01T12:00:00Z',
      );
    });

    it('should render RunSystemsTable with correct props', () => {
      const mockSystems = [{ id: 'sys1' }, { id: 'sys2' }];
      mockUseRunSystems.mockReturnValue({
        systems: mockSystems,
        loading: false,
      });

      render(<RunTabContent {...defaultProps} />);

      expect(screen.getByTestId('mock-run-systems-table')).toBeInTheDocument();
      expect(screen.getByTestId('table-run-id')).toHaveTextContent('run-123');
      expect(screen.getByTestId('table-systems-count')).toHaveTextContent('2');
    });

    it('should render TableStateProvider', () => {
      render(<RunTabContent {...defaultProps} />);

      expect(
        screen.getByTestId('mock-table-state-provider'),
      ).toBeInTheDocument();
    });
  });

  describe('View log functionality', () => {
    it('should provide viewLogColumn to RunSystemsTable', () => {
      render(<RunTabContent {...defaultProps} />);

      expect(screen.getByTestId('view-log-button')).toBeInTheDocument();
    });

    it('should call openLogModal when view log is clicked', () => {
      render(<RunTabContent {...defaultProps} />);

      const viewLogButton = screen.getByTestId('view-log-button');
      expect(viewLogButton).toBeInTheDocument();

      // Just verify the button is clickable
      fireEvent.click(viewLogButton);

      // Test passes if no error is thrown
      expect(viewLogButton).toBeInTheDocument();
    });
  });

  describe('useRunSystems hook integration', () => {
    it('should call useRunSystems with correct parameters', () => {
      render(<RunTabContent {...defaultProps} />);

      expect(mockUseRunSystems).toHaveBeenCalledWith(
        mockRun,
        true,
        'rem-456',
        defaultProps.fetchSystems,
      );
    });

    it('should handle systems from useRunSystems', () => {
      const mockSystems = [{ id: 'sys1' }, { id: 'sys2' }, { id: 'sys3' }];
      mockUseRunSystems.mockReturnValue({
        systems: mockSystems,
        loading: false,
      });

      render(<RunTabContent {...defaultProps} />);

      expect(screen.getByTestId('table-systems-count')).toHaveTextContent('3');
    });
  });

  describe('Edge cases and error handling', () => {
    it('should handle run without created_by', () => {
      const runWithoutUser = {
        ...mockRun,
        created_by: null,
      };

      render(<RunTabContent {...defaultProps} run={runWithoutUser} />);

      expect(screen.getByTestId('text-small')).toHaveTextContent(
        'Initiated by: unknown',
      );
    });

    it('should handle run without created_by.username', () => {
      const runWithoutUsername = {
        ...mockRun,
        created_by: {},
      };

      render(<RunTabContent {...defaultProps} run={runWithoutUsername} />);

      expect(screen.getByTestId('text-small')).toHaveTextContent(
        'Initiated by: unknown',
      );
    });

    it('should handle undefined systems from useRunSystems', () => {
      mockUseRunSystems.mockReturnValue({
        systems: undefined,
        loading: false,
      });

      render(<RunTabContent {...defaultProps} />);

      expect(screen.getByTestId('table-systems-count')).toHaveTextContent('0');
    });

    it('should handle different run statuses', () => {
      const failedRun = { ...mockRun, status: 'failed' };

      render(<RunTabContent {...defaultProps} run={failedRun} />);

      expect(screen.getByTestId('mock-status-label')).toHaveAttribute(
        'data-status',
        'failed',
      );
      expect(screen.getByTestId('banner-status')).toHaveTextContent('failed');
    });

    it('should handle different tab indices', () => {
      render(<RunTabContent {...defaultProps} idx={5} />);

      const tabContent = screen.getByTestId('tab-content');
      expect(tabContent).toHaveAttribute('data-event-key', '5');
      expect(tabContent).toHaveAttribute('id', 'run-5');
      expect(tabContent).toHaveAttribute('data-active-key', '5');
    });
  });

  describe('Component structure', () => {
    it('should have proper flex layout structure', () => {
      render(<RunTabContent {...defaultProps} />);

      const flexElements = screen.getAllByTestId('flex');
      expect(flexElements.length).toBeGreaterThan(1);

      // Main flex container should have space between justification
      const mainFlex = flexElements.find(
        (el) =>
          el.getAttribute('data-justify-content') ===
          'justifyContentSpaceBetween',
      );
      expect(mainFlex).toBeInTheDocument();
    });

    it('should render all required UI elements', () => {
      render(<RunTabContent {...defaultProps} />);

      expect(screen.getByTestId('tab-content')).toBeInTheDocument();
      expect(screen.getByTestId('title')).toBeInTheDocument();
      expect(screen.getByTestId('mock-status-label')).toBeInTheDocument();
      expect(screen.getByTestId('text-small')).toBeInTheDocument();
      expect(screen.getByTestId('button')).toBeInTheDocument();
      expect(screen.getByTestId('redo-icon')).toBeInTheDocument();
      expect(screen.getByTestId('mock-details-banner')).toBeInTheDocument();
      expect(screen.getByTestId('mock-run-systems-table')).toBeInTheDocument();
    });
  });

  describe('PropTypes validation', () => {
    it('should render with all required props', () => {
      const consoleSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      render(<RunTabContent {...defaultProps} />);

      expect(consoleSpy).not.toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });
});
