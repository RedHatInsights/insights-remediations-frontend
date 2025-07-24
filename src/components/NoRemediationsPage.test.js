import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import NoRemediationsPage from './NoRemediationsPage';

jest.mock('@redhat-cloud-services/frontend-components/useChrome', () => () => ({
  quickStarts: {
    activateQuickstart: jest.fn(),
  },
}));

describe('NoRemediationsPage', () => {
  it('renders the empty state and handles quick start button', async () => {
    render(<NoRemediationsPage />);
    expect(screen.getByText('No remediation plans')).toBeInTheDocument();
    expect(
      screen.getByText(
        /Create remediation plans to address Advisor recommendations/,
      ),
    ).toBeInTheDocument();
    const button = screen.getByRole('button', { name: /launch quick start/i });
    expect(button).toBeInTheDocument();
    await userEvent.click(button);
    expect(button).toBeEnabled();
  });
});
