import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import ActivityCard from './ActivityCard';
import useRemediations from '../../Utilities/Hooks/api/useRemediations';
import { getOrgConfig } from '../api';
import { formatDate } from '../Cells';

jest.mock('../../Utilities/Hooks/api/useRemediations');

describe('ActivityCard', () => {
  const NOW = '2026-07-08T12:00:00Z';
  const defaultOrgConfig = {
    plan_warning_days: 30,
    plan_retention_days: 90,
  };

  const createDetails = (overrides = {}) => ({
    created_at: '2026-06-01T00:00:00Z',
    updated_at: '2026-07-01T00:00:00Z',
    expires_at: '2026-07-28T00:00:00Z',
    ...overrides,
  });

  const createPlaybookRun = (overrides = {}) => ({
    status: 'success',
    updated_at: '2026-07-07T12:00:00Z',
    ...overrides,
  });

  const renderComponent = (
    {
      details = createDetails(),
      lastRemediationPlaybookRun = createPlaybookRun(),
      isPlaybookRunsLoading = false,
      onNavigateToTab = jest.fn(),
      retentionPolicyRefreshNonce = 0,
    } = {},
    orgConfigResponse = {
      result: defaultOrgConfig,
      error: undefined,
      refetch: jest.fn(),
    },
  ) => {
    useRemediations.mockReturnValue(orgConfigResponse);

    const view = render(
      <ActivityCard
        details={details}
        lastRemediationPlaybookRun={lastRemediationPlaybookRun}
        isPlaybookRunsLoading={isPlaybookRunsLoading}
        onNavigateToTab={onNavigateToTab}
        retentionPolicyRefreshNonce={retentionPolicyRefreshNonce}
      />,
    );

    return { onNavigateToTab, ...view };
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    jest.setSystemTime(Date.parse(NOW));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('rendering', () => {
    it('shows a loading spinner while playbook runs are loading', () => {
      renderComponent({ isPlaybookRunsLoading: true });

      expect(
        screen.getByRole('heading', { name: 'Activity' }),
      ).toBeInTheDocument();
      expect(screen.getAllByRole('progressbar')).toHaveLength(2);
      expect(
        screen.getByText(formatDate(createDetails().created_at)),
      ).toBeInTheDocument();
      expect(useRemediations).toHaveBeenCalledWith(getOrgConfig);
    });

    it('renders activity details and opens execution history from the latest status link', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      const { onNavigateToTab } = renderComponent();

      const latestStatusButton = screen.getByRole('button', {
        name: /Succeeded 1 day ago/i,
      });

      expect(latestStatusButton).toBeInTheDocument();
      expect(
        screen.getByText(formatDate(createDetails().created_at)),
      ).toBeInTheDocument();
      expect(
        screen.getByText(formatDate(createDetails().updated_at)),
      ).toBeInTheDocument();
      expect(
        screen.getByText(formatDate(createPlaybookRun().updated_at)),
      ).toBeInTheDocument();

      await user.click(latestStatusButton);

      expect(onNavigateToTab).toHaveBeenCalledWith(null, 'executionHistory');
    });

    it('refetches organization config after a retention policy update', () => {
      const refetchOrgConfig = jest.fn();
      const props = {
        details: createDetails(),
        lastRemediationPlaybookRun: createPlaybookRun(),
        isPlaybookRunsLoading: false,
        onNavigateToTab: jest.fn(),
      };

      const { rerender } = renderComponent(
        {
          ...props,
          retentionPolicyRefreshNonce: 0,
        },
        {
          result: defaultOrgConfig,
          error: undefined,
          refetch: refetchOrgConfig,
        },
      );

      expect(refetchOrgConfig).not.toHaveBeenCalled();

      rerender(<ActivityCard {...props} retentionPolicyRefreshNonce={1} />);

      expect(refetchOrgConfig).toHaveBeenCalledTimes(1);
    });

    it('toggles the expandable card state', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

      renderComponent();

      const toggle = screen.getByRole('button', {
        name: /toggle activity card/i,
      });
      expect(toggle).toHaveAttribute('aria-expanded', 'true');

      await user.click(toggle);

      expect(toggle).toHaveAttribute('aria-expanded', 'false');
    });
  });

  describe('expiration states', () => {
    it('shows an expiration warning and retention policy details when the plan is close to expiring', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

      renderComponent();

      expect(screen.getByText('Expires in 20 days')).toBeInTheDocument();
      expect(screen.getByText('20 days remaining')).toBeInTheDocument();

      await user.click(
        screen.getByRole('button', { name: /retention policy help/i }),
      );

      expect(
        await screen.findByText(
          /automatically deleted after 3 months of inactivity/i,
        ),
      ).toBeInTheDocument();
    });

    it('shows month-based expiration text without a warning when outside the warning window', () => {
      renderComponent({
        details: createDetails({ expires_at: '2026-09-15T00:00:00Z' }),
      });

      expect(screen.queryByText(/Expires in/i)).not.toBeInTheDocument();
      expect(screen.getByText('3 months remaining')).toBeInTheDocument();
    });

    it('falls back to an unknown expiration date and never-executed state when date data is missing', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

      renderComponent(
        {
          details: createDetails({ expires_at: null }),
          lastRemediationPlaybookRun: {},
        },
        {
          result: {
            plan_warning_days: 30,
            plan_retention_days: null,
          },
          error: undefined,
        },
      );

      expect(screen.getAllByText('Expiration date unknown')).toHaveLength(2);
      expect(screen.getByRole('button', { name: 'N/A' })).toBeInTheDocument();
      expect(screen.getByText('Never')).toBeInTheDocument();

      await user.click(
        screen.getByRole('button', { name: /retention policy help/i }),
      );

      expect(
        await screen.findByText(
          /automatically deleted after an unknown period of inactivity/i,
        ),
      ).toBeInTheDocument();
    });

    it('shows an expired warning when the known expiration date is already in the past', () => {
      renderComponent(
        {
          details: createDetails({ expires_at: '2026-07-01T00:00:00Z' }),
        },
        {
          result: defaultOrgConfig,
          error: new Error('Failed to load organization configuration'),
        },
      );

      expect(screen.getAllByText('Expired')).toHaveLength(2);
      expect(
        screen.queryByText('Expiration date unknown'),
      ).not.toBeInTheDocument();
    });

    it('shows an expired state when the expiration timestamp passed earlier today', () => {
      renderComponent(
        {
          details: createDetails({ expires_at: '2026-07-08T00:00:00Z' }),
        },
        {
          result: defaultOrgConfig,
          error: new Error('Failed to load organization configuration'),
        },
      );

      expect(screen.getAllByText('Expired')).toHaveLength(2);
      expect(screen.queryByText(/remaining/i)).not.toBeInTheDocument();
    });

    it('suppresses the expiration warning when organization configuration cannot be loaded', () => {
      renderComponent(
        {
          details: createDetails({ expires_at: '2026-07-28T00:00:00Z' }),
        },
        {
          result: defaultOrgConfig,
          error: new Error('Failed to load organization configuration'),
        },
      );

      expect(screen.queryByText('Expires in 20 days')).not.toBeInTheDocument();
      expect(screen.getByText('20 days remaining')).toBeInTheDocument();
    });
  });
});
