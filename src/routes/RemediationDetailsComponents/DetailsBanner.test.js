import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import DetailsBanner from './DetailsBanners';

describe('DetailsBanner', () => {
  it('renders running status', () => {
    render(<DetailsBanner status="running" />);
    expect(
      screen.getByText('The execution of the remediation plan is in progress'),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /To view the progress, check the execution log file for each system/,
      ),
    ).toBeInTheDocument();
  });

  it('renders success status', () => {
    render(<DetailsBanner status="success" />);
    expect(
      screen.getByText('The execution of the remediation plan was successful'),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /To check the resolution status for each issue in the remediation plan/,
      ),
    ).toBeInTheDocument();
  });

  it('renders failure status', () => {
    render(<DetailsBanner status="failure" />);
    expect(
      screen.getByText('The execution of the remediation plan failed'),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /To learn why, check the log files for the affected systems/,
      ),
    ).toBeInTheDocument();
  });

  it('renders canceled status with plan name and date', () => {
    render(
      <DetailsBanner
        status="canceled"
        remediationPlanName="Plan A"
        canceledAt="2024-06-01"
      />,
    );
    expect(
      screen.getByText('The execution of the remediation plan was canceled'),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /The execution of the “Plan A” was canceled on 2024-06-01\./,
      ),
    ).toBeInTheDocument();
  });

  it('renders canceled status with fallback values', () => {
    render(<DetailsBanner status="canceled" />);
    expect(
      screen.getByText(/The execution of the “-” was canceled on -\./),
    ).toBeInTheDocument();
  });

  it('closes when close button is clicked', async () => {
    render(<DetailsBanner status="running" />);
    const closeBtn = screen.getByTitle('Close alert');
    await userEvent.click(closeBtn);
    expect(
      screen.queryByText(
        'The execution of the remediation plan is in progress',
      ),
    ).not.toBeInTheDocument();
  });

  it('renders nothing for unknown status', () => {
    const { container } = render(<DetailsBanner status="unknown" />);
    expect(container).toBeEmptyDOMElement();
  });
});
