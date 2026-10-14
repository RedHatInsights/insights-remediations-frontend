import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import PlannedRemediationsContent from './PlannedRemediationsContent';

jest.mock('../../components/RemediationWizard/PlanSummaryCharts', () => ({
  PlanSummaryCharts: function MockPlanSummaryCharts() {
    return <div>PlanSummaryCharts</div>;
  },
}));

jest.mock('./ActionsContent/ActionsContent', () => {
  return function MockActionsContent() {
    return <div>ActionsContent</div>;
  };
});

jest.mock('../../components/SystemsTable/SystemsTable', () => {
  return function MockSystemsTable() {
    return <div>SystemsTable</div>;
  };
});

describe('PlannedRemediationsContent', () => {
  const defaultProps = {
    remediationDetailsSummary: {
      id: 'rem-123',
      issue_count_details: {},
      issue_count: 2,
      system_count: 10,
    },
    remediationStatus: {
      connectedData: [],
      areDetailsLoading: false,
    },
    refetchRemediationDetails: jest.fn(),
    refetchConnectionStatus: jest.fn(),
    detailsLoading: false,
    remediationId: 'rem-123',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('navigates via parent callback when systems tab is selected', async () => {
    const onNavigateToTab = jest.fn();

    render(
      <PlannedRemediationsContent
        {...defaultProps}
        onNavigateToTab={onNavigateToTab}
      />,
    );

    fireEvent.click(screen.getByRole('tab', { name: 'SystemsTab' }));

    await waitFor(() => {
      expect(onNavigateToTab).toHaveBeenCalledWith(
        expect.anything(),
        'plannedRemediations:systems',
      );
    });
    expect(screen.getByText('SystemsTable')).toBeInTheDocument();
  });

  it('syncs the active nested tab from props', async () => {
    const { rerender } = render(
      <PlannedRemediationsContent
        {...defaultProps}
        initialNestedTab="actions"
      />,
    );

    expect(screen.getByText('ActionsContent')).toBeInTheDocument();

    rerender(
      <PlannedRemediationsContent
        {...defaultProps}
        initialNestedTab="systems"
      />,
    );

    await waitFor(() => {
      expect(screen.getByText('SystemsTable')).toBeInTheDocument();
    });
  });
});
