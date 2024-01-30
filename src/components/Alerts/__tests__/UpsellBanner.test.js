import React from 'react';
import UpsellBanner from '../UpsellBanner';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';

describe('UpsellBanner component', () => {
  it('should render', () => {
    render(<UpsellBanner />);
    expect(screen.getByText('Put Insights into action')).toBeVisible();
    expect(
      screen.getByText(
        'Enable push-button remediation across your hybrid cloud environment with Red Hat Satellite.'
      )
    ).toBeVisible();
  });

  it('should click close', async () => {
    const mockCallBack = jest.fn();
    render(<UpsellBanner onClose={mockCallBack} />);
    await userEvent.click(screen.getByTestId('upselBanner-close'));
    expect(mockCallBack.mock.calls.length).toEqual(1);
  });
});
